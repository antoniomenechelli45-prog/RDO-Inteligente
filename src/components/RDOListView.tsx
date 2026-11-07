import React, { useState } from 'react';
import { FileText, Plus, Calendar, Building2, Filter, Eye, Edit, Trash2, Download, Printer, CheckCircle, Clock } from 'lucide-react';
import { RDO, Obra } from '../types/rdo';
import { getRDOs, deleteRDO, getObras } from '../services/storage';
import { formatRdoNumber, formatDateBR } from '../services/pdfGenerator';

interface RDOListViewProps {
  initialObraId?: string;
  onEditRDO: (rdo: RDO) => void;
  onNewRDO: (obraId?: string) => void;
  onViewPDF: (rdo: RDO, obra: Obra) => void;
  onDownloadPDF: (rdo: RDO, obra: Obra) => void;
}

export const RDOListView: React.FC<RDOListViewProps> = ({
  initialObraId,
  onEditRDO,
  onNewRDO,
  onViewPDF,
  onDownloadPDF,
}) => {
  const [rdos, setRdos] = useState<RDO[]>(() => getRDOs());
  const obras = getObras();

  const [selectedObraFilter, setSelectedObraFilter] = useState<string>(initialObraId || 'todas');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');

  const refreshRdos = () => {
    setRdos(getRDOs());
  };

  const handleDelete = (id: string, seq: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Excluir permanentemente o RDO ${formatRdoNumber(seq)}?`)) {
      deleteRDO(id);
      refreshRdos();
    }
  };

  const filteredRdos = rdos.filter((rdo) => {
    if (selectedObraFilter !== 'todas' && rdo.obraId !== selectedObraFilter) {
      return false;
    }
    if (selectedDateFilter && rdo.data !== selectedDateFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'todos' && rdo.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  const getObraForRdo = (obraId: string): Obra | undefined => {
    return obras.find((o) => o.id === obraId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header and New RDO CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Relatórios Diários de Obra (RDO)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulte por obra e data, edite rascunhos, finalize e gere PDFs oficiais.
          </p>
        </div>

        <button
          onClick={() => onNewRDO(selectedObraFilter !== 'todas' ? selectedObraFilter : undefined)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Novo RDO</span>
        </button>
      </div>

      {/* Filter Toolbar (By Obra, By Date, By Status) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filtros de Consulta (Obra e Data)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Obra Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filtrar por Obra
            </label>
            <select
              value={selectedObraFilter}
              onChange={(e) => setSelectedObraFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as Obras ({obras.length})</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filtrar por Data do Relatório
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter('')}
                  className="absolute right-8 top-2 text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status do Relatório
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="Rascunho">Somente Rascunhos (Em edição)</option>
              <option value="Finalizado">Somente Finalizados</option>
            </select>
          </div>
        </div>
      </div>

      {/* RDOs List */}
      {filteredRdos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum RDO encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedObraFilter !== 'todas' || selectedDateFilter || selectedStatusFilter !== 'todos'
              ? 'Nenhum relatório corresponde aos filtros selecionados. Tente ajustar a busca.'
              : 'Nenhum RDO foi registrado ainda. Crie o primeiro relatório com o auxílio de IA.'}
          </p>
          <button
            onClick={() => onNewRDO(selectedObraFilter !== 'todas' ? selectedObraFilter : undefined)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" /> Criar Novo RDO Agora
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredRdos.map((rdo) => {
            const obra = getObraForRdo(rdo.obraId);
            const isFinalizado = rdo.status === 'Finalizado';
            const totalEfetivo = rdo.maoDeObra.reduce((sum, m) => sum + (m.quantidade || 0), 0);

            return (
              <div
                key={rdo.id}
                onClick={() => onEditRDO(rdo)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg text-xs">
                      RDO {formatRdoNumber(rdo.numeroSequencial)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isFinalizado
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isFinalizado ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Finalizado
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Rascunho
                        </>
                      )}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateBR(rdo.data)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {obra ? obra.nome : 'Obra Desconhecida'}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>Resp.: <strong className="text-slate-700">{rdo.responsavel}</strong></span>
                    <span>•</span>
                    <span>{rdo.atividades.length} {rdo.atividades.length === 1 ? 'atividade' : 'atividades'}</span>
                    <span>•</span>
                    <span>{totalEfetivo} operários</span>
                    {rdo.fotos.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">{rdo.fotos.length} fotos</span>
                      </>
                    )}
                  </div>

                  {/* Highlights from activities */}
                  {rdo.atividades.length > 0 && (
                    <p className="text-xs text-slate-600 line-clamp-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      &quot;{rdo.atividades[0].descricao}
                      {rdo.atividades[0].percentualDia !== null ? ` (${rdo.atividades[0].percentualDia}% executado)` : ''}&quot;
                    </p>
                  )}
                </div>

                {/* Right actions */}
                <div
                  className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Edit / Open */}
                  <button
                    onClick={() => onEditRDO(rdo)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title={isFinalizado ? 'Visualizar dados' : 'Editar rascunho'}
                  >
                    {isFinalizado ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <Edit className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{isFinalizado ? 'Visualizar' : 'Editar'}</span>
                  </button>

                  {/* Preview PDF */}
                  {obra && (
                    <button
                      onClick={() => onViewPDF(rdo, obra)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition"
                      title="Visualizar PDF Oficial com layout CREA"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ver PDF</span>
                    </button>
                  )}

                  {/* Download PDF */}
                  {obra && (
                    <button
                      onClick={() => onDownloadPDF(rdo, obra)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                      title="Baixar arquivo .PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Baixar</span>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(rdo.id, rdo.numeroSequencial, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Excluir RDO"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
