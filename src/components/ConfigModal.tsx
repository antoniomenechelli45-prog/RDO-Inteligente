import React from 'react';
import { X, Sparkles, Database, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiActive: boolean;
  firebaseConfigured: boolean;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  geminiActive,
  firebaseConfigured,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Status das Integrações & Configuração</h3>
              <p className="text-xs text-slate-400">Método Larissa • Conformidade de Sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Gemini AI Status */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Motor Gemini IA (Backend Seguro)
              </span>
              {geminiActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-800 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Chave Ausente
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O backend roda via Express em <code className="text-blue-300 bg-slate-900 px-1 rounded">server.ts</code> utilizando o modelo <strong className="text-white">gemini-3.8-flash</strong>. As chaves de API nunca são expostas ao navegador.
            </p>
            {!geminiActive && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs">
                Para habilitar chamadas de IA por áudio e texto, certifique-se de que a variável de ambiente <code className="font-mono font-bold">GEMINI_API_KEY</code> esteja definida no ambiente ou no painel de Segredos.
              </div>
            )}
          </div>

          {/* Firebase Status */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Firebase (Firestore & Auth)
              </span>
              {firebaseConfigured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-950/70 border border-sky-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Modo Local + Demonstração
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O aplicativo opera com persistência estruturada local (LocalStorage sincronizado com dados padrão da oficina). O esquema de dados já é 100% compatível com as coleções <code className="text-blue-300 bg-slate-900 px-1 rounded">obras</code> e <code className="text-blue-300 bg-slate-900 px-1 rounded">rdos</code> do Firestore.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Em produção com Firebase ativado, o aplicativo autentica via Firebase Authentication e armazena fotos no Firebase Storage com regras de segurança por obra e engenheiro responsável.
            </p>
          </div>

          {/* Data Disclaimer per PDF */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
            <span className="font-bold text-white block mb-1">Identificação de Dados de Demonstração:</span>
            As obras (Edifício Jardins do Sol, Complexo Logístico Rodoanel, etc.) e os RDOs predefinidos (#001 e #002) são dados ilustrativos criados para validação do fluxo do Método Larissa.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
