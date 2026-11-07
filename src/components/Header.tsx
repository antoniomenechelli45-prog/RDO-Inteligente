import React from 'react';
import { HardHat, LogOut, FileText, Building2, User as UserIcon, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { User } from '../types/rdo';

interface HeaderProps {
  user: User;
  currentMenu: 'obras' | 'rdos';
  onNavigate: (menu: 'obras' | 'rdos') => void;
  onLogout: () => void;
  onOpenConfig: () => void;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentMenu,
  onNavigate,
  onLogout,
  onOpenConfig,
  geminiActive,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('obras')}>
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">RDO Inteligente</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Método Larissa
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">IA na Engenharia Civil • CONFEA / CREA-SP</p>
            </div>
          </div>

          {/* Menus Obras | RDOs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('obras')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                currentMenu === 'obras'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Obras</span>
            </button>

            <button
              onClick={() => onNavigate('rdos')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                currentMenu === 'rdos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>RDOs</span>
            </button>
          </nav>

          {/* User info, Config Status & Sair */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Status indicator button */}
            <button
              onClick={onOpenConfig}
              title="Informações de configuração de IA e Firebase"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Sparkles className={`w-3.5 h-3.5 ${geminiActive ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">{geminiActive ? 'Gemini Ativo' : 'Status Config'}</span>
            </button>

            {/* User details */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</span>
              <span className="text-[11px] text-slate-400 leading-tight">
                {user.creaCau ? `CREA/CAU: ${user.creaCau}` : user.email}
              </span>
            </div>

            {/* Sair button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition"
              title="Sair do aplicativo"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
