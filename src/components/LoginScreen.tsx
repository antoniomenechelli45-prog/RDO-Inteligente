import React, { useState } from 'react';
import { HardHat, LogIn, KeyRound, UserCheck, ShieldCheck, Mail, ArrowRight, UserPlus, Info } from 'lucide-react';
import { loginUser, registerUser, resetPassword, DEMO_USERS } from '../services/storage';
import { User } from '../types/rdo';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onOpenConfig: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenConfig }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [cargo, setCargo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset modal state
  const [resetEmail, setResetEmail] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Preencha seu e-mail e senha.');
      return;
    }

    const res = loginUser(email, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Credenciais inválidas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name || !email || !password) {
      setError('Nome, e-mail e senha são obrigatórios.');
      return;
    }

    const res = registerUser({
      name,
      email,
      creaCau: creaCau || 'Não informado',
      cargo: cargo || 'Engenheiro(a) Civil',
      password,
    });

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Falha ao cadastrar conta.');
    }
  };

  const handleQuickDemoLogin = (demoUser: typeof DEMO_USERS[0]) => {
    setError(null);
    const res = loginUser(demoUser.email, demoUser.passwordHash);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    const res = resetPassword(resetEmail);
    setResetFeedback(res.message);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and App Title */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 border-2 border-amber-400">
            <HardHat className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          RDO Inteligente
        </h1>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-400">
          Oficina Prática: IA na Engenharia Civil • Método Larissa
        </p>

        {/* Demo data disclaimer notice */}
        <div className="mt-4 p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Ambiente Pronto para Canteiro:</span>
            <p className="mt-0.5 text-blue-200/90 leading-relaxed">
              Você pode acessar instantaneamente com os usuários de demonstração abaixo ou cadastrar seu e-mail e CREA/CAU.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700/60 text-red-200 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-900/50 border border-emerald-700/60 text-emerald-200 text-xs leading-relaxed">
              {successMsg}
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail do Engenheiro(a)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: larissa.freitas@eng.com.br"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email || 'larissa.freitas@eng.com.br');
                      setResetFeedback(null);
                      setShowResetModal(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-500 font-semibold shadow-lg shadow-blue-600/30 transition text-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar no Canteiro</span>
              </button>
            </form>
          ) : (
            /* Register Form */
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Engª Larissa Freitas"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engenheiro@obra.com.br"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    CREA / CAU
                  </label>
                  <input
                    type="text"
                    value={creaCau}
                    onChange={(e) => setCreaCau(e.target.value)}
                    placeholder="5061234567/SP"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Engenheiro Fiscal"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-500 font-semibold shadow-lg shadow-blue-600/30 transition text-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Concluir Cadastro</span>
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {isRegistering ? 'Já possui cadastro? Clique para entrar' : 'Não tem conta? Cadastrar novo responsável'}
            </button>
          </div>

          {/* DEMO ACCESS SECTION (Highlighted per PDF requirements) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Acesso Rápido de Demonstração:
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                Dados de Teste
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleQuickDemoLogin(demo)}
                  type="button"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 text-left transition group cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-300">
                      {demo.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      CREA: {demo.creaCau} • {demo.cargo}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info link */}
        <div className="mt-4 text-center">
          <button
            onClick={onOpenConfig}
            className="text-xs text-slate-500 hover:text-slate-400 underline underline-offset-4"
          >
            Ver informações de integração (Firebase & Gemini API)
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Recuperação de Senha</h3>
            <p className="text-xs text-slate-400 mb-4">
              Informe o e-mail cadastrado para redefinir as credenciais de acesso.
            </p>

            {resetFeedback ? (
              <div className="p-3 mb-4 rounded-xl bg-blue-900/40 border border-blue-700/50 text-blue-200 text-xs leading-relaxed">
                {resetFeedback}
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition"
                >
                  Enviar link de recuperação
                </button>
              </form>
            )}

            <button
              onClick={() => setShowResetModal(false)}
              className="mt-4 w-full py-2 text-xs text-slate-400 hover:text-white text-center"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
