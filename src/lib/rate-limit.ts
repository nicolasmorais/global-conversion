const rateLimit = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // max requests per window
const LOGIN_MAX_REQUESTS = process.env.NODE_ENV === "production" ? 5 : 50; // 50 attempts in dev, 5 in production

export function checkRateLimit(
  ip: string,
  isLogin: boolean = false
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = isLogin ? `login:${ip}` : ip;
  const maxRequests = isLogin ? LOGIN_MAX_REQUESTS : MAX_REQUESTS;

  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= maxRequests) {
    const resetIn = entry.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetTime - now };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimit.entries()) {
    if (now > entry.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000);
