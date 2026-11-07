import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Calendar,
  CloudSun,
  Users,
  Wrench,
  Package,
  AlertTriangle,
  ShieldAlert,
  Camera,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  Check,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { RDO, Obra, User, AtividadeRDO, MaoDeObraItem, EquipamentoItem, MaterialItem, OcorrenciaItem, FotoRDO, AIParsedRDO } from '../types/rdo';
import { saveRDO } from '../services/storage';
import { formatRdoNumber, formatDateBR } from '../services/pdfGenerator';
import { AIRecordModal } from './AIRecordModal';

interface RDOEditorProps {
  initialRdo: RDO;
  obra: Obra;
  currentUser: User;
  onBack: () => void;
  onOpenPDFPreview: (rdo: RDO, obra: Obra) => void;
  geminiActive: boolean;
  onOpenConfig: () => void;
}

export const RDOEditor: React.FC<RDOEditorProps> = ({
  initialRdo,
  obra,
  currentUser,
  onBack,
  onOpenPDFPreview,
  geminiActive,
  onOpenConfig,
}) => {
  const [rdo, setRdo] = useState<RDO>(initialRdo);
  const [activeTab, setActiveTab] = useState<'dados' | 'registro' | 'fotos'>('dados');
  const [showAIModal, setShowAIModal] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Auto-dismiss save feedback
  const triggerSaveNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleSaveDraft = () => {
    const updated = saveRDO({ ...rdo, status: 'Rascunho' });
    setRdo(updated);
    triggerSaveNotification('Rascunho salvo com sucesso no dispositivo!');
  };

  const handleFinalize = () => {
    if (rdo.atividades.length === 0) {
      if (!window.confirm('Nenhuma atividade foi informada. Deseja finalizar o RDO mesmo assim?')) {
        return;
      }
    }
    const updated = saveRDO({
      ...rdo,
      status: 'Finalizado',
      finalizadoEm: new Date().toISOString(),
    });
    setRdo(updated);
    triggerSaveNotification('RDO Finalizado com sucesso! Agora você pode emitir o PDF oficial.');
  };

  // Applying parsed data from AI (with strict compliance to Larissa Method)
  const handleApplyAIData = (parsed: AIParsedRDO, mode: 'merge' | 'replace') => {
    setRdo((prev) => {
      const next = { ...prev };

      // Clima
      if (parsed.clima) {
        next.clima = {
          manha: parsed.clima.manha || (mode === 'replace' ? '' : prev.clima.manha),
          tarde: parsed.clima.tarde || (mode === 'replace' ? '' : prev.clima.tarde),
          condicaoGeral: parsed.clima.condicaoGeral || (mode === 'replace' ? '' : prev.clima.condicaoGeral),
          praticabilidade:
            (parsed.clima.praticabilidade as any) || (mode === 'replace' ? 'Praticável' : prev.clima.praticabilidade),
        };
      }

      // Atividades
      if (parsed.atividades && parsed.atividades.length > 0) {
        const newAtvs: AtividadeRDO[] = parsed.atividades.map((a) => ({
          id: `atv-${Date.now()}-${Math.random()}`,
          descricao: a.descricao,
          percentualDia: a.percentualDia,
          observacao: a.observacao || '',
        }));
        next.atividades = mode === 'replace' ? newAtvs : [...prev.atividades, ...newAtvs];
      }

      // Mão de Obra
      if (parsed.maoDeObra && parsed.maoDeObra.length > 0) {
        const newMO: MaoDeObraItem[] = parsed.maoDeObra.map((m) => ({
          id: `mo-${Date.now()}-${Math.random()}`,
          funcao: m.funcao,
          quantidade: m.quantidade,
          tipo: (m.tipo as any) || 'Própria',
        }));
        next.maoDeObra = mode === 'replace' ? newMO : [...prev.maoDeObra, ...newMO];
      }

      // Equipamentos
      if (parsed.equipamentos && parsed.equipamentos.length > 0) {
        const newEq: EquipamentoItem[] = parsed.equipamentos.map((e) => ({
          id: `eq-${Date.now()}-${Math.random()}`,
          nome: e.nome,
          quantidade: e.quantidade || 1,
          status: e.status || 'Em operação',
        }));
        next.equipamentos = mode === 'replace' ? newEq : [...prev.equipamentos, ...newEq];
      }

      // Materiais
      if (parsed.materiais && parsed.materiais.length > 0) {
        const newMat: MaterialItem[] = parsed.materiais.map((m) => ({
          id: `mat-${Date.now()}-${Math.random()}`,
          item: m.item,
          quantidade: m.quantidade || '',
          fornecedor: m.fornecedor || '',
        }));
        next.materiais = mode === 'replace' ? newMat : [...prev.materiais, ...newMat];
      }

      // Ocorrências
      if (parsed.ocorrencias && parsed.ocorrencias.length > 0) {
        const newOc: OcorrenciaItem[] = parsed.ocorrencias.map((o) => ({
          id: `oc-${Date.now()}-${Math.random()}`,
          tipo: o.tipo,
          descricao: o.descricao,
          tempoParalisado: o.tempoParalisado || '',
        }));
        next.ocorrencias = mode === 'replace' ? newOc : [...prev.ocorrencias, ...newOc];
      }

      // Segurança
      if (parsed.seguranca) {
        next.seguranca = {
          ddsRealizado: parsed.seguranca.ddsRealizado ?? (mode === 'replace' ? null : prev.seguranca.ddsRealizado),
          temaDDS: parsed.seguranca.temaDDS || (mode === 'replace' ? '' : prev.seguranca.temaDDS),
          observacoesSeguranca:
            parsed.seguranca.observacoesSeguranca || (mode === 'replace' ? '' : prev.seguranca.observacoesSeguranca),
        };
      }

      // Observações
      if (parsed.observacoesGerais) {
        next.observacoesGerais =
          mode === 'replace' || !prev.observacoesGerais
            ? parsed.observacoesGerais
            : `${prev.observacoesGerais}\n${parsed.observacoesGerais}`;
      }

      // Dúvidas / Confirmações
      if (parsed.duvidasOuConfirmacoes && parsed.duvidasOuConfirmacoes.length > 0) {
        next.duvidasConfirmacoes = parsed.duvidasOuConfirmacoes;
      }

      saveRDO(next);
      return next;
    });

    triggerSaveNotification('Dados da IA incorporados com sucesso ao RDO!');
    setActiveTab('registro');
  };

  // Handlers for manual form manipulation
  const addAtividade = () => {
    setRdo((prev) => ({
      ...prev,
      atividades: [
        ...prev.atividades,
        {
          id: `atv-${Date.now()}`,
          descricao: '',
          percentualDia: null,
          observacao: '',
        },
      ],
    }));
  };

  const removeAtividade = (id: string) => {
    setRdo((prev) => ({
      ...prev,
      atividades: prev.atividades.filter((a) => a.id !== id),
    }));
  };

  const updateAtividade = (id: string, field: keyof AtividadeRDO, value: any) => {
    setRdo((prev) => ({
      ...prev,
      atividades: prev.atividades.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  };

  const addMaoDeObra = (funcao = 'Pedreiro', tipo: 'Própria' | 'Terceirizada' = 'Própria') => {
    setRdo((prev) => ({
      ...prev,
      maoDeObra: [
        ...prev.maoDeObra,
        {
          id: `mo-${Date.now()}-${Math.random()}`,
          funcao,
          quantidade: 1,
          tipo,
        },
      ],
    }));
  };

  const removeMaoDeObra = (id: string) => {
    setRdo((prev) => ({
      ...prev,
      maoDeObra: prev.maoDeObra.filter((m) => m.id !== id),
    }));
  };

  const updateMaoDeObra = (id: string, field: keyof MaoDeObraItem, value: any) => {
    setRdo((prev) => ({
      ...prev,
      maoDeObra: prev.maoDeObra.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const addEquipamento = () => {
    setRdo((prev) => ({
      ...prev,
      equipamentos: [
        ...prev.equipamentos,
        {
          id: `eq-${Date.now()}`,
          nome: '',
          quantidade: 1,
          status: 'Em operação',
        },
      ],
    }));
  };

  const removeEquipamento = (id: string) => {
    setRdo((prev) => ({
      ...prev,
      equipamentos: prev.equipamentos.filter((e) => e.id !== id),
    }));
  };

  const addMaterial = () => {
    setRdo((prev) => ({
      ...prev,
      materiais: [
        ...prev.materiais,
        {
          id: `mat-${Date.now()}`,
          item: '',
          quantidade: '',
          fornecedor: '',
        },
      ],
    }));
  };

  const removeMaterial = (id: string) => {
    setRdo((prev) => ({
      ...prev,
      materiais: prev.materiais.filter((m) => m.id !== id),
    }));
  };

  const addOcorrencia = () => {
    setRdo((prev) => ({
      ...prev,
      ocorrencias: [
        ...prev.ocorrencias,
        {
          id: `oc-${Date.now()}`,
          tipo: 'Paralisação',
          descricao: '',
          tempoParalisado: '',
        },
      ],
    }));
  };

  const removeOcorrencia = (id: string) => {
    setRdo((prev) => ({
      ...prev,
      ocorrencias: prev.ocorrencias.filter((o) => o.id !== id),
    }));
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newPhoto: FotoRDO = {
          id: `foto-${Date.now()}-${Math.random()}`,
          url: base64,
          legenda: '',
          dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setRdo((prev) => ({
          ...prev,
          fotos: [...prev.fotos, newPhoto],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addSamplePhoto = () => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const newPhoto: FotoRDO = {
      id: `foto-${Date.now()}`,
      url: randomUrl,
      legenda: 'Registro fotográfico das fôrmas e concretagem',
      dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setRdo((prev) => ({
      ...prev,
      fotos: [...prev.fotos, newPhoto],
    }));
  };

  const removeFoto = (id: string) => {
    setRdo((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((f) => f.id !== id),
    }));
  };

  const updateFotoLegenda = (id: string, legenda: string) => {
    setRdo((prev) => ({
      ...prev,
      fotos: prev.fotos.map((f) => (f.id === id ? { ...f, legenda } : f)),
    }));
  };

  const totalOperarios = rdo.maoDeObra.reduce((sum, item) => sum + (item.quantidade || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
            title="Voltar para a lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base sm:text-lg font-black text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                RDO {formatRdoNumber(rdo.numeroSequencial)}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  rdo.status === 'Finalizado'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                {rdo.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
              {obra.nome}
            </h2>
          </div>
        </div>

        {/* Action Buttons (Save, Finalize, PDF) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* PROMINENT AI BUTTON (PER PDF: "Destaque o botão 'Gravar RDO com IA'") */}
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 animate-pulse" />
            <span>Gravar RDO com IA</span>
          </button>

          {/* Salvar Rascunho */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            title="Salvar rascunho para continuar depois"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Salvar Rascunho</span>
          </button>

          {/* Finalizar */}
          {rdo.status !== 'Finalizado' && (
            <button
              type="button"
              onClick={handleFinalize}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar</span>
            </button>
          )}

          {/* Gerar PDF */}
          <button
            type="button"
            onClick={() => onOpenPDFPreview(rdo, obra)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* THREE TABS (MANDATORY PER PDF: "Organize o RDO em três abas: Dados | Registro do dia | Fotos e revisão") */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'dados'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Dados da Obra</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registro')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'registro'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Registro do Dia</span>
            {rdo.atividades.length > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                {rdo.atividades.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'fotos'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>3. Fotos e Revisão</span>
            {rdo.fotos.length > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full">
                {rdo.fotos.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: DADOS */}
        {activeTab === 'dados' && (
          <div className="p-6 space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Número Sequencial do RDO
                </label>
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-extrabold text-blue-700 text-sm">
                  {formatRdoNumber(rdo.numeroSequencial)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data do Relatório *
                </label>
                <input
                  type="date"
                  value={rdo.data}
                  onChange={(e) => setRdo({ ...rdo, data: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status do Relatório
                </label>
                <select
                  value={rdo.status}
                  onChange={(e) => setRdo({ ...rdo, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Rascunho">Rascunho (Salvar e continuar depois)</option>
                  <option value="Finalizado">Finalizado (Liberado para PDF)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Obra / Empreendimento
                </label>
                <input
                  type="text"
                  value={obra.nome}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cliente / Contratante
                </label>
                <input
                  type="text"
                  value={obra.cliente}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Endereço da Obra
                </label>
                <input
                  type="text"
                  value={obra.endereco}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CREA / CAU do Responsável
                </label>
                <input
                  type="text"
                  value={obra.creaCau}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Responsável Técnico da Obra
                </label>
                <input
                  type="text"
                  value={obra.responsavelTecnico}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Responsável pelo Preenchimento deste RDO
                </label>
                <input
                  type="text"
                  value={rdo.responsavel}
                  onChange={(e) => setRdo({ ...rdo, responsavel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <span className="text-slate-400">
                Pressione &quot;Salvar Rascunho&quot; a qualquer momento para continuar depois.
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('registro')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Avançar para Registro do Dia →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRO DO DIA */}
        {activeTab === 'registro' && (
          <div className="p-6 space-y-6 text-xs">
            {/* Quick AI Callout Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs text-amber-900 font-medium">
                  Prefere falar ao invés de digitar? Use o botão <strong className="text-amber-950">&quot;Gravar RDO com IA&quot;</strong> para preencher serviços, clima e equipe por voz!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs whitespace-nowrap shadow-xs transition"
              >
                Abrir Gravador IA
              </button>
            </div>

            {/* SEÇÃO CLIMA */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <CloudSun className="w-4 h-4 text-blue-600" />
                <span>Condições Climáticas e Praticabilidade</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Manhã
                  </label>
                  <input
                    type="text"
                    value={rdo.clima.manha}
                    onChange={(e) =>
                      setRdo({ ...rdo, clima: { ...rdo.clima, manha: e.target.value } })
                    }
                    placeholder="ex: Chuvoso / Ensolarado"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tarde
                  </label>
                  <input
                    type="text"
                    value={rdo.clima.tarde}
                    onChange={(e) =>
                      setRdo({ ...rdo, clima: { ...rdo.clima, tarde: e.target.value } })
                    }
                    placeholder="ex: Nublado"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Praticabilidade
                  </label>
                  <select
                    value={rdo.clima.praticabilidade}
                    onChange={(e) =>
                      setRdo({ ...rdo, clima: { ...rdo.clima, praticabilidade: e.target.value as any } })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="Praticável">Praticável</option>
                    <option value="Parcialmente impraticável">Parcialmente impraticável</option>
                    <option value="Impraticável">Impraticável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Condição Geral
                  </label>
                  <input
                    type="text"
                    value={rdo.clima.condicaoGeral}
                    onChange={(e) =>
                      setRdo({ ...rdo, clima: { ...rdo.clima, condicaoGeral: e.target.value } })
                    }
                    placeholder="ex: Chuva forte na primeira hora"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO ATIVIDADES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    Atividades e Serviços Desenvolvidos
                  </span>
                  <span className="text-[11px] text-slate-500">
                    O percentual refere-se estritamente à execução daquela atividade no dia (Regra do Método Larissa).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addAtividade}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Atividade</span>
                </button>
              </div>

              {rdo.atividades.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                  Nenhuma atividade inserida ainda. Clique em &quot;Adicionar Atividade&quot; ou use a gravação por IA.
                </div>
              ) : (
                <div className="space-y-2">
                  {rdo.atividades.map((atv, i) => (
                    <div
                      key={atv.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      <span className="font-bold text-slate-400 w-6 text-center">{i + 1}</span>

                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={atv.descricao}
                          onChange={(e) => updateAtividade(atv.id, 'descricao', e.target.value)}
                          placeholder="Descrição da atividade (ex: Concretagem das vigas)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="w-full sm:w-32 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={atv.percentualDia ?? ''}
                          onChange={(e) =>
                            updateAtividade(
                              atv.id,
                              'percentualDia',
                              e.target.value === '' ? null : Number(e.target.value)
                            )
                          }
                          placeholder="% dia"
                          className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs text-center font-bold text-blue-600"
                        />
                        <span className="font-bold text-slate-400">%</span>
                      </div>

                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={atv.observacao || ''}
                          onChange={(e) => updateAtividade(atv.id, 'observacao', e.target.value)}
                          placeholder="Observação (ex: Setor norte liberado)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAtividade(atv.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO MÃO DE OBRA */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Efetivo de Mão de Obra</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Total em campo: <strong className="text-slate-800">{totalOperarios} trabalhadores</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Rápido:</span>
                  <button
                    type="button"
                    onClick={() => addMaoDeObra('Pedreiro')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                  >
                    + Pedreiro
                  </button>
                  <button
                    type="button"
                    onClick={() => addMaoDeObra('Servente')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                  >
                    + Servente
                  </button>
                  <button
                    type="button"
                    onClick={() => addMaoDeObra('Armador')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                  >
                    + Armador
                  </button>
                  <button
                    type="button"
                    onClick={() => addMaoDeObra('', 'Própria')}
                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold border border-blue-200"
                  >
                    + Outra Função
                  </button>
                </div>
              </div>

              {rdo.maoDeObra.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                  Nenhum efetivo cadastrado para o dia.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {rdo.maoDeObra.map((mo) => (
                    <div
                      key={mo.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={mo.funcao}
                          onChange={(e) => updateMaoDeObra(mo.id, 'funcao', e.target.value)}
                          placeholder="Função (ex: Pedreiro)"
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-semibold"
                        />
                        <select
                          value={mo.tipo}
                          onChange={(e) => updateMaoDeObra(mo.id, 'tipo', e.target.value)}
                          className="mt-1 w-full text-[10px] text-slate-500 bg-transparent border-0 p-0"
                        >
                          <option value="Própria">Própria</option>
                          <option value="Terceirizada">Terceirizada</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          value={mo.quantidade}
                          onChange={(e) =>
                            updateMaoDeObra(mo.id, 'quantidade', Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-14 px-2 py-1 rounded border border-slate-200 text-xs text-center font-bold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeMaoDeObra(mo.id)}
                          className="p-1 text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO EQUIPAMENTOS & MATERIAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              {/* Equipamentos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>Equipamentos</span>
                  </span>
                  <button
                    type="button"
                    onClick={addEquipamento}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + Adicionar
                  </button>
                </div>
                {rdo.equipamentos.length === 0 ? (
                  <p className="text-slate-400 italic">Nenhum equipamento reportado.</p>
                ) : (
                  <div className="space-y-1.5">
                    {rdo.equipamentos.map((eq) => (
                      <div key={eq.id} className="p-2 border border-slate-200 rounded-lg flex gap-2">
                        <input
                          type="text"
                          value={eq.nome}
                          onChange={(e) =>
                            setRdo({
                              ...rdo,
                              equipamentos: rdo.equipamentos.map((x) =>
                                x.id === eq.id ? { ...x, nome: e.target.value } : x
                              ),
                            })
                          }
                          placeholder="Equipamento"
                          className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                        <input
                          type="number"
                          value={eq.quantidade}
                          onChange={(e) =>
                            setRdo({
                              ...rdo,
                              equipamentos: rdo.equipamentos.map((x) =>
                                x.id === eq.id ? { ...x, quantidade: Number(e.target.value) } : x
                              ),
                            })
                          }
                          className="w-12 px-1 py-1 border border-slate-200 rounded text-xs text-center"
                        />
                        <button
                          type="button"
                          onClick={() => removeEquipamento(eq.id)}
                          className="text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Materiais */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>Materiais Recebidos</span>
                  </span>
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + Adicionar
                  </button>
                </div>
                {rdo.materiais.length === 0 ? (
                  <p className="text-slate-400 italic">Nenhum material recebido.</p>
                ) : (
                  <div className="space-y-1.5">
                    {rdo.materiais.map((mat) => (
                      <div key={mat.id} className="p-2 border border-slate-200 rounded-lg flex gap-2">
                        <input
                          type="text"
                          value={mat.item}
                          onChange={(e) =>
                            setRdo({
                              ...rdo,
                              materiais: rdo.materiais.map((x) =>
                                x.id === mat.id ? { ...x, item: e.target.value } : x
                              ),
                            })
                          }
                          placeholder="Material"
                          className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={mat.quantidade}
                          onChange={(e) =>
                            setRdo({
                              ...rdo,
                              materiais: rdo.materiais.map((x) =>
                                x.id === mat.id ? { ...x, quantidade: e.target.value } : x
                              ),
                            })
                          }
                          placeholder="Qtd (ex: 8m³)"
                          className="w-20 px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeMaterial(mat.id)}
                          className="text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO OCORRÊNCIAS & SEGURANÇA */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Ocorrências & Paralisações</span>
                </span>
                <button
                  type="button"
                  onClick={addOcorrencia}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  + Adicionar Ocorrência
                </button>
              </div>

              {rdo.ocorrencias.length > 0 && (
                <div className="space-y-2">
                  {rdo.ocorrencias.map((oc) => (
                    <div key={oc.id} className="p-3 border border-rose-200 bg-rose-50/40 rounded-xl flex gap-2 items-center">
                      <input
                        type="text"
                        value={oc.tipo}
                        onChange={(e) =>
                          setRdo({
                            ...rdo,
                            ocorrencias: rdo.ocorrencias.map((x) =>
                              x.id === oc.id ? { ...x, tipo: e.target.value } : x
                            ),
                          })
                        }
                        placeholder="Tipo (ex: Paralisação)"
                        className="w-32 px-2 py-1 border border-slate-200 rounded text-xs bg-white font-semibold"
                      />
                      <input
                        type="text"
                        value={oc.descricao}
                        onChange={(e) =>
                          setRdo({
                            ...rdo,
                            ocorrencias: rdo.ocorrencias.map((x) =>
                              x.id === oc.id ? { ...x, descricao: e.target.value } : x
                            ),
                          })
                        }
                        placeholder="Detalhes da ocorrência"
                        className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={oc.tempoParalisado || ''}
                        onChange={(e) =>
                          setRdo({
                            ...rdo,
                            ocorrencias: rdo.ocorrencias.map((x) =>
                              x.id === oc.id ? { ...x, tempoParalisado: e.target.value } : x
                            ),
                          })
                        }
                        placeholder="Tempo (ex: 1h)"
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-xs bg-white text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeOcorrencia(oc.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Segurança e DDS */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>Segurança do Trabalho & DDS</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DDS Realizado no Início do Turno?
                    </label>
                    <select
                      value={
                        rdo.seguranca.ddsRealizado === true
                          ? 'sim'
                          : rdo.seguranca.ddsRealizado === false
                          ? 'nao'
                          : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setRdo({
                          ...rdo,
                          seguranca: {
                            ...rdo.seguranca,
                            ddsRealizado: val === 'sim' ? true : val === 'nao' ? false : null,
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    >
                      <option value="">Não informado</option>
                      <option value="sim">Sim, realizado</option>
                      <option value="nao">Não realizado</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tema do Diálogo Diário de Segurança (DDS)
                    </label>
                    <input
                      type="text"
                      value={rdo.seguranca.temaDDS || ''}
                      onChange={(e) =>
                        setRdo({
                          ...rdo,
                          seguranca: { ...rdo.seguranca, temaDDS: e.target.value },
                        })
                      }
                      placeholder="ex: Trabalho em altura e uso obrigatório de talabarte duplo"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Observações Gerais */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Gerais do Canteiro
                </label>
                <textarea
                  rows={3}
                  value={rdo.observacoesGerais}
                  onChange={(e) => setRdo({ ...rdo, observacoesGerais: e.target.value })}
                  placeholder="Informações adicionais, visitas de fiscalização, reuniões de alinhamento..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('dados')}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                ← Voltar para Dados
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fotos')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Avançar para Fotos e Revisão →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FOTOS E REVISÃO */}
        {activeTab === 'fotos' && (
          <div className="p-6 space-y-6 text-xs">
            {/* Foto Upload Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Registro Fotográfico da Obra</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Capture fotos pelo celular ou anexe imagens com legenda (serão impressas no PDF).
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition">
                    <UploadCloud className="w-4 h-4" />
                    <span>Tirar / Enviar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={addSamplePhoto}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition"
                  >
                    + Foto de Demonstração
                  </button>
                </div>
              </div>

              {rdo.fotos.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center bg-slate-50/50">
                  <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-semibold">Nenhuma foto adicionada ainda</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Adicione fotos do avanço físico, armaduras, concretagem e inspeções para enriquecer o relatório.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {rdo.fotos.map((foto, i) => (
                    <div
                      key={foto.id}
                      className="p-2.5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2 group"
                    >
                      <div className="h-44 rounded-xl bg-slate-100 overflow-hidden relative">
                        <img
                          src={foto.url}
                          alt="Foto da obra"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFoto(foto.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition shadow-sm"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md font-mono">
                          Foto {i + 1} • {foto.dataHora}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                          Legenda da Foto *
                        </label>
                        <input
                          type="text"
                          value={foto.legenda}
                          onChange={(e) => updateFotoLegenda(foto.id, e.target.value)}
                          placeholder="ex: Concretagem das vigas setor norte"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO DE REVISÃO GERAL DO RDO (MANDATORY PER PDF: "Exija revisão antes de incorporar os dados") */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 text-sm block">
                Revisão Final dos Dados Preenchidos
              </span>

              {/* Dúvidas / Confirmações da IA */}
              {rdo.duvidasConfirmacoes && rdo.duvidasConfirmacoes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Lembretes de Revisão (Método Larissa):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {rdo.duvidasConfirmacoes.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Obra</span>
                    <strong className="text-slate-800 truncate block">{obra.nome}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Data</span>
                    <strong className="text-slate-800 block">{formatDateBR(rdo.data)}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Atividades</span>
                    <strong className="text-blue-600 block">{rdo.atividades.length} registradas</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Efetivo</span>
                    <strong className="text-amber-600 block">{totalOperarios} trabalhadores</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('registro')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  ← Voltar para Registro do Dia
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Salvar Rascunho
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalize}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalizar RDO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPDFPreview(rdo, obra)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Visualizar e Baixar PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Recording & Structuring Modal */}
      <AIRecordModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyParsedData={handleApplyAIData}
        geminiActive={geminiActive}
        onOpenConfig={onOpenConfig}
      />
    </div>
  );
};
