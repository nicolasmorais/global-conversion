import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD + "_jwt_secret";
const TOKEN_EXPIRY = "24h";

export interface AuthPayload {
  admin: boolean;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded.admin === true;
  } catch {
    return false;
  }
}

export function createToken(): string {
  return jwt.sign(
    { admin: true },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}
