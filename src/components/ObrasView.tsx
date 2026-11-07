import React, { useState } from 'react';
import { Building2, Plus, MapPin, UserCheck, Briefcase, FileText, ChevronRight, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { Obra, ObraStatus, User } from '../types/rdo';
import { getObras, saveObra, deleteObra, getRDOsByObra } from '../services/storage';

interface ObrasViewProps {
  currentUser: User;
  onSelectObraForNewRDO: (obra: Obra) => void;
  onViewRdosOfObra: (obraId: string) => void;
}

export const ObrasView: React.FC<ObrasViewProps> = ({
  currentUser,
  onSelectObraForNewRDO,
  onViewRdosOfObra,
}) => {
  const [obras, setObras] = useState<Obra[]>(() => getObras());
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [status, setStatus] = useState<ObraStatus>('Em andamento');
  const [formError, setFormError] = useState<string | null>(null);

  const refreshObras = () => {
    setObras(getObras());
  };

  const handleOpenNewObraModal = () => {
    setEditingObra(null);
    setNome('');
    setCliente('');
    setEndereco('');
    setResponsavelTecnico(currentUser.name || '');
    setCreaCau(currentUser.creaCau || '');
    setStatus('Em andamento');
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (obra: Obra, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingObra(obra);
    setNome(obra.nome);
    setCliente(obra.cliente);
    setEndereco(obra.endereco);
    setResponsavelTecnico(obra.responsavelTecnico);
    setCreaCau(obra.creaCau);
    setStatus(obra.status);
    setFormError(null);
    setShowModal(true);
  };

  const handleDeleteObra = (id: string, nomeObra: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir a obra "${nomeObra}" e seus dados?`)) {
      deleteObra(id);
      refreshObras();
    }
  };

  const handleSubmitObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cliente.trim() || !responsavelTecnico.trim()) {
      setFormError('Preencha os campos obrigatórios (Nome da Obra, Cliente e Responsável Técnico).');
      return;
    }

    const obraToSave: Obra = {
      id: editingObra ? editingObra.id : `obra-${Date.now()}`,
      nome: nome.trim(),
      cliente: cliente.trim(),
      endereco: endereco.trim(),
      responsavelTecnico: responsavelTecnico.trim(),
      creaCau: creaCau.trim(),
      status,
      dataInicio: editingObra ? editingObra.dataInicio : new Date().toISOString().split('T')[0],
      numeroContrato: editingObra ? editingObra.numeroContrato : `CT-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    };

    saveObra(obraToSave);
    refreshObras();
    setShowModal(false);
  };

  const filteredObras = obras.filter((o) => {
    if (filterStatus === 'todos') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Obras Cadastradas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Selecione uma obra para emitir ou gerenciar os Relatórios Diários de Obra (RDO).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenNewObraModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Nova Obra</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Filtrar:</span>
        {[
          { id: 'todos', label: 'Todas as Obras' },
          { id: 'Em andamento', label: 'Em Andamento' },
          { id: 'Pausada', label: 'Pausadas' },
          { id: 'Concluída', label: 'Concluídas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Obras Grid */}
      {filteredObras.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma obra encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cadastre sua primeira obra para começar a gerar relatórios diários de obra no canteiro.
          </p>
          <button
            onClick={handleOpenNewObraModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" /> Cadastrar Obra Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredObras.map((obra) => {
            const rdosCount = getRDOsByObra(obra.id).length;
            const statusBg =
              obra.status === 'Em andamento'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : obra.status === 'Pausada'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={obra.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBg}`}
                    >
                      {obra.status}
                    </span>
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleOpenEditModal(obra, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Editar cadastro da obra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteObra(obra.id, obra.nome, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Excluir obra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {obra.nome}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Cliente: <strong className="text-slate-800">{obra.cliente}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{obra.endereco || 'Endereço não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Resp.: {obra.responsavelTecnico} {obra.creaCau ? `(${obra.creaCau})` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1 font-medium">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {rdosCount} {rdosCount === 1 ? 'RDO emitido' : 'RDOs emitidos'}
                    </span>
                    <button
                      onClick={() => onViewRdosOfObra(obra.id)}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      Ver RDOs
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* High visibility Novo RDO button per PDF requirement */}
                  <button
                    onClick={() => onSelectObraForNewRDO(obra)}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Novo RDO para esta Obra</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova / Editar Obra */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingObra ? 'Editar Cadastro da Obra' : 'Cadastrar Nova Obra'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitObra} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Empreendimento / Obra *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="ex: Residencial Vila Madalena - Bloco A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cliente / Contratante *
                </label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="ex: Incorporadora XYZ Ltda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Endereço do Canteiro
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="ex: Rua dos Pinheiros, 400 - São Paulo, SP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Responsável Técnico *
                  </label>
                  <input
                    type="text"
                    value={responsavelTecnico}
                    onChange={(e) => setResponsavelTecnico(e.target.value)}
                    placeholder="ex: Engª Larissa Freitas"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CREA / CAU
                  </label>
                  <input
                    type="text"
                    value={creaCau}
                    onChange={(e) => setCreaCau(e.target.value)}
                    placeholder="ex: 5061234567/SP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status da Obra
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ObraStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Em andamento">Em andamento</option>
                  <option value="Pausada">Pausada</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  {editingObra ? 'Salvar Alterações' : 'Cadastrar Obra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
