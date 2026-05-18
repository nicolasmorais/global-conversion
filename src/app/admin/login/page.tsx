"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("");

  const router = useRouter();

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const question = `${num1} + ${num2} = ?`;
    setCaptchaQuestion(question);
    return num1 + num2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Conta bloqueada. Tente novamente em ${remainingTime} segundos.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          captcha: showCaptcha ? captchaValue : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFailedAttempts(prev => prev + 1);

        if (failedAttempts >= 1) {
          setShowCaptcha(true);
          generateCaptcha();
        }

        if (failedAttempts >= 4) {
          const lockoutTime = Date.now() + 5 * 60 * 1000;
          setLockoutUntil(lockoutTime);
          setError("Muitas tentativas falhadas. Conta bloqueada por 5 minutos.");
        } else {
          const delay = Math.min(1000 * Math.pow(2, failedAttempts), 10000);
          const shortLockout = Date.now() + delay;
          setLockoutUntil(shortLockout);
          setError(data.error || `Erro ao fazer login. Aguarde ${delay / 1000} segundos.`);
        }

        return;
      }

      setFailedAttempts(0);
      setLockoutUntil(null);
      setShowCaptcha(false);
      setCaptchaValue("");

      router.push("/admin/orders");
    } catch {
      setError("Erro de conexão");
      setFailedAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const refreshCaptcha = () => {
    generateCaptcha();
    setCaptchaValue("");
  };

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);
  const isLocked = !!(lockoutUntil && now < lockoutUntil);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#111111] flex items-center justify-center p-8 font-['Space_Grotesk',sans-serif]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body {
          background: #ffffff;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s ease 0.1s forwards;
        }
      `}</style>

      <div className="w-full max-w-[380px] text-center opacity-0 animate-fade-up">
        <div className="mb-10">
          <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] text-[#111111] mb-2 leading-tight">
            Entrar
          </h1>
          <p className="text-[0.8rem] text-[#6b7280]">
            Insira sua senha para continuar.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border border-red-200 bg-red-50 rounded-lg text-[0.75rem] text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-left">
          <div className="mb-6">
            <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#9ca3af] mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="w-full py-[0.85rem] px-0 bg-transparent border-0 border-b border-[#e5e7eb] outline-none text-[0.9rem] text-[#111111] transition-colors focus:border-b-[#111111] placeholder-[#d1d5db]"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              disabled={isLocked}
            />
          </div>

          {showCaptcha && !isLocked && (
            <div className="mb-6 p-4 border border-[#e5e7eb] bg-[#f9fafb] rounded-lg">
              <p className="text-[0.65rem] uppercase tracking-wider text-[#9ca3af] text-center mb-3 font-semibold">
                Verificação de segurança
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#111111]">{captchaQuestion}</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={captchaValue}
                    onChange={(e) => setCaptchaValue(e.target.value)}
                    placeholder="?"
                    className="w-16 bg-white border border-[#e5e7eb] rounded text-center focus:border-[#111111] outline-none text-sm py-1.5"
                  />
                  <button type="button" onClick={refreshCaptcha} className="text-[#9ca3af] hover:text-[#111111] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.005 8.005 0 01-14.542 4.087m7.731-8.087A8.005 8.005 0 0112 4.582V4m0 0h8a8.008 8.008 0 018 8v8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-[14px] h-[14px] border border-[#e5e7eb] rounded flex items-center justify-center transition-all group-hover:border-[#111111]">
                  <div className="w-[6px] h-[3px] border-l-[1.5px] border-b-[1.5px] border-white -rotate-45 -translate-y-[1px] opacity-0"></div>
                </div>
              </div>
              <span className="text-[0.75rem] text-[#6b7280] group-hover:text-[#111111] transition-colors">Lembrar-me</span>
            </label>
            <a href="#" className="text-[0.75rem] text-[#6b7280] hover:text-[#111111] transition-colors">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading || !password || isLocked}
            className="group relative w-full py-[0.9rem] bg-[#111111] hover:bg-[#000000] text-white text-[0.8rem] font-semibold uppercase tracking-[0.1em] transition-all duration-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Entrar"
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
