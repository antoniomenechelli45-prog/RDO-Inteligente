import React, { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, getObras, getNextRDOSequence, getObraById } from './services/storage';
import { checkConfigStatus } from './services/gemini';
import { User, Obra, RDO } from './types/rdo';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ObrasView } from './components/ObrasView';
import { RDOListView } from './components/RDOListView';
import { RDOEditor } from './components/RDOEditor';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { ConfigModal } from './components/ConfigModal';
import { downloadRDOPdf } from './services/pdfGenerator';
import { Plus, X, Building2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [currentMenu, setCurrentMenu] = useState<'obras' | 'rdos'>('obras');
  const [editingRdo, setEditingRdo] = useState<RDO | null>(null);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);

  // PDF Preview state
  const [pdfModalData, setPdfModalData] = useState<{
    isOpen: boolean;
    rdo: RDO | null;
    obra: Obra | null;
  }>({
    isOpen: false,
    rdo: null,
    obra: null,
  });

  // Config modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [geminiActive, setGeminiActive] = useState(false);
  const [firebaseActive, setFirebaseActive] = useState(false);

  // Filter state when navigating from an Obra card to RDO list
  const [filteredObraId, setFilteredObraId] = useState<string | undefined>(undefined);

  // Modal to pick obra when clicking global "Novo RDO"
  const [showPickObraModal, setShowPickObraModal] = useState(false);

  // Check integration status
  useEffect(() => {
    checkConfigStatus().then((status) => {
      setGeminiActive(status.geminiConfigured);
      setFirebaseActive(status.firebaseConfigured);
    });
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setEditingRdo(null);
    setEditingObra(null);
  };

  const handleSelectObraForNewRDO = (obra: Obra) => {
    const nextSeq = getNextRDOSequence(obra.id);
    const newRDO: RDO = {
      id: `rdo-${Date.now()}`,
      obraId: obra.id,
      numeroSequencial: nextSeq,
      data: new Date().toISOString().split('T')[0],
      responsavel: currentUser?.name || obra.responsavelTecnico,
      status: 'Rascunho',
      clima: {
        manha: '',
        tarde: '',
        condicaoGeral: '',
        praticabilidade: '',
      },
      atividades: [],
      maoDeObra: [],
      equipamentos: [],
      materiais: [],
      ocorrencias: [],
      seguranca: {
        ddsRealizado: null,
        temaDDS: '',
        observacoesSeguranca: '',
      },
      observacoesGerais: '',
      fotos: [],
      duvidasConfirmacoes: [],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    setEditingObra(obra);
    setEditingRdo(newRDO);
  };

  const handleGlobalNewRDO = (preferredObraId?: string) => {
    const obras = getObras();
    if (obras.length === 0) {
      alert('Cadastre pelo menos uma obra antes de criar um RDO.');
      setCurrentMenu('obras');
      return;
    }

    if (preferredObraId) {
      const obra = obras.find((o) => o.id === preferredObraId);
      if (obra) {
        handleSelectObraForNewRDO(obra);
        return;
      }
    }

    if (obras.length === 1) {
      handleSelectObraForNewRDO(obras[0]);
    } else {
      setShowPickObraModal(true);
    }
  };

  const handleViewRdosOfObra = (obraId: string) => {
    setFilteredObraId(obraId);
    setCurrentMenu('rdos');
    setEditingRdo(null);
  };

  const handleEditRdo = (rdo: RDO) => {
    const obra = getObraById(rdo.obraId);
    if (!obra) {
      alert('Obra vinculada a este RDO não encontrada.');
      return;
    }
    setEditingObra(obra);
    setEditingRdo(rdo);
  };

  const handleOpenPDFPreview = (rdo: RDO, obra: Obra) => {
    setPdfModalData({
      isOpen: true,
      rdo,
      obra,
    });
  };

  const handleDownloadPDFDirect = (rdo: RDO, obra: Obra) => {
    downloadRDOPdf(rdo, obra);
  };

  // If user is not authenticated, show directly the Login Screen per PDF:
  // "Não crie landing page. Abra diretamente uma tela simples de login. Após a autenticação, apresente as obras cadastradas e o botão “Novo RDO”."
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setCurrentMenu('obras');
          }}
          onOpenConfig={() => setIsConfigOpen(true)}
        />
        <ConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          geminiActive={geminiActive}
          firebaseConfigured={firebaseActive}
        />
      </>
    );
  }

  const obrasList = getObras();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header with Menus: Obras | RDOs */}
      <Header
        user={currentUser}
        currentMenu={currentMenu}
        onNavigate={(menu) => {
          setEditingRdo(null);
          setEditingObra(null);
          setCurrentMenu(menu);
        }}
        onLogout={handleLogout}
        onOpenConfig={() => setIsConfigOpen(true)}
        geminiActive={geminiActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {editingRdo && editingObra ? (
          /* Editor View (3 Tabs: Dados | Registro do dia | Fotos e revisão) */
          <RDOEditor
            initialRdo={editingRdo}
            obra={editingObra}
            currentUser={currentUser}
            onBack={() => {
              setEditingRdo(null);
              setEditingObra(null);
            }}
            onOpenPDFPreview={handleOpenPDFPreview}
            geminiActive={geminiActive}
            onOpenConfig={() => setIsConfigOpen(true)}
          />
        ) : currentMenu === 'obras' ? (
          /* Obras View */
          <ObrasView
            currentUser={currentUser}
            onSelectObraForNewRDO={handleSelectObraForNewRDO}
            onViewRdosOfObra={handleViewRdosOfObra}
          />
        ) : (
          /* RDOs List View */
          <RDOListView
            initialObraId={filteredObraId}
            onEditRDO={handleEditRdo}
            onNewRDO={handleGlobalNewRDO}
            onViewPDF={handleOpenPDFPreview}
            onDownloadPDF={handleDownloadPDFDirect}
          />
        )}
      </main>

      {/* Pick Obra Modal for Global New RDO */}
      {showPickObraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Selecione a Obra para o RDO</h3>
              <button
                onClick={() => setShowPickObraModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4">
              Cada RDO possui numeração sequencial exclusiva por obra (#001, #002...).
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {obrasList.map((obra) => (
                <button
                  key={obra.id}
                  onClick={() => {
                    setShowPickObraModal(false);
                    handleSelectObraForNewRDO(obra);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      {obra.nome}
                    </h4>
                    <p className="text-xs text-slate-500">{obra.cliente}</p>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition">
                    Criar →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official PDF Preview Modal */}
      {pdfModalData.isOpen && pdfModalData.rdo && pdfModalData.obra && (
        <PDFPreviewModal
          isOpen={pdfModalData.isOpen}
          onClose={() => setPdfModalData({ isOpen: false, rdo: null, obra: null })}
          rdo={pdfModalData.rdo}
          obra={pdfModalData.obra}
        />
      )}

      {/* Configuration & Architecture Transparency Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        geminiActive={geminiActive}
        firebaseConfigured={firebaseActive}
      />
    </div>
  );
}
