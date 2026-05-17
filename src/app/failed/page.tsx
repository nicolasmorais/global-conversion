"use client";

export default function FailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-slide-up">
        {/* Ícone de erro */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <div className="glass-card p-8 glow-violet">
          <h1 className="text-3xl font-bold text-white mb-3">
            Pagamento não processado
          </h1>
          <p className="text-slate-400 mb-8">
            Houve um problema ao processar seu pagamento. Nenhum valor foi cobrado. Por favor, tente novamente.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 
                text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
                active:scale-[0.98] shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Tentar Novamente
            </button>

            <p className="text-xs text-slate-500 mt-4">
              Motivos comuns: cartão recusado, saldo insuficiente, ou dados incorretos.
            </p>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-2">Dicas:</h3>
            <ul className="text-xs text-slate-400 space-y-1.5 text-left">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                Verifique se o cartão tem limite suficiente
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                Confirme os dados do cartão
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                Tente outro método de pagamento
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-600">
          Precisa de ajuda? Entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
}
