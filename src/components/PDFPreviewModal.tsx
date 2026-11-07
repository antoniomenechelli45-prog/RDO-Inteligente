import React from 'react';
import { X, Download, Printer, CheckCircle, HardHat, FileText, Calendar, Building2, UserCheck, Shield } from 'lucide-react';
import { RDO, Obra } from '../types/rdo';
import { formatRdoNumber, formatDateBR, downloadRDOPdf } from '../services/pdfGenerator';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rdo: RDO;
  obra: Obra;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  rdo,
  obra,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    downloadRDOPdf(rdo, obra);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalOperarios = rdo.maoDeObra.reduce((sum, item) => sum + (item.quantidade || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full my-4 shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/80 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Visualizador de RDO Oficial</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {formatRdoNumber(rdo.numeroSequencial)}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {obra.nome} • {formatDateBR(rdo.data)} • Padrão ABNT / CREA-SP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition cursor-pointer"
              title="Imprimir ou Salvar via Navegador"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
              title="Baixar arquivo PDF no dispositivo"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable document preview (Formatted exactly like the civil engineering document) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-800/40 flex-1">
          <div className="bg-white text-slate-900 rounded-xl shadow-xl max-w-3xl mx-auto p-6 sm:p-10 border border-slate-200 text-xs font-sans print:shadow-none print:border-none print:m-0 print:p-0">
            {/* Engineering Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 font-black text-xl shrink-0">
                  <HardHat className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                    RELATÓRIO DIÁRIO DE OBRA (RDO)
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Método Larissa • Engenharia de Prompts e IA na Engenharia Civil
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-xl sm:text-2xl font-black font-mono text-blue-700 block">
                  {formatRdoNumber(rdo.numeroSequencial)}
                </span>
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    rdo.status === 'Finalizado'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  Status: {rdo.status}
                </span>
              </div>
            </div>

            {/* 1. DADOS DA OBRA */}
            <div className="mb-4">
              <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                1. Identificação da Obra e do Relatório
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Obra:</span>
                  <span className="font-semibold text-slate-900">{obra.nome}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Data do Relatório:</span>
                  <span className="font-semibold text-slate-900">{formatDateBR(rdo.data)}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente / Contratante:</span>
                  <span className="font-semibold text-slate-900">{obra.cliente}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Contrato / ART:</span>
                  <span className="font-semibold text-slate-900">{obra.numeroContrato || 'ART Emitida'}</span>
                </div>
                <div className="col-span-2 p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Endereço da Obra:</span>
                  <span className="text-slate-800">{obra.endereco || 'Não informado'}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Responsável Técnico:</span>
                  <span className="font-semibold text-slate-900">{obra.responsavelTecnico}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">CREA / CAU:</span>
                  <span className="font-semibold text-slate-900">{obra.creaCau}</span>
                </div>
              </div>
            </div>

            {/* 2. CLIMA */}
            <div className="mb-4">
              <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                2. Condições Climáticas & Praticabilidade
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Período Manhã:</span>
                  <span className="font-semibold text-slate-800">{rdo.clima.manha || '-'}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Período Tarde:</span>
                  <span className="font-semibold text-slate-800">{rdo.clima.tarde || '-'}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Praticabilidade:</span>
                  <span className="font-semibold text-blue-700">{rdo.clima.praticabilidade || '-'}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Condição Geral:</span>
                  <span className="text-slate-800">{rdo.clima.condicaoGeral || '-'}</span>
                </div>
              </div>
            </div>

            {/* 3. ATIVIDADES DO DIA */}
            <div className="mb-4">
              <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                3. Atividades Executadas no Dia & Avanço Físico
              </div>
              {rdo.atividades.length === 0 ? (
                <p className="text-slate-400 italic py-2">Nenhuma atividade registrada.</p>
              ) : (
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 w-12 text-center">Item</th>
                        <th className="p-2">Descrição dos Serviços Realizados</th>
                        <th className="p-2 w-28 text-center">% no Dia</th>
                        <th className="p-2">Observações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rdo.atividades.map((atv, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-2 text-center font-bold text-slate-500">{i + 1}</td>
                          <td className="p-2 font-medium text-slate-900">{atv.descricao}</td>
                          <td className="p-2 text-center font-bold text-blue-600">
                            {atv.percentualDia !== null ? `${atv.percentualDia}%` : '-'}
                          </td>
                          <td className="p-2 text-slate-600">{atv.observacao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. MÃO DE OBRA */}
            <div className="mb-4">
              <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2 flex justify-between items-center">
                <span>4. Efetivo e Mão de Obra</span>
                <span className="text-[10px] text-blue-700 font-bold">Total: {totalOperarios} trabalhadores</span>
              </div>
              {rdo.maoDeObra.length === 0 ? (
                <p className="text-slate-400 italic py-1">Nenhum efetivo registrado.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {rdo.maoDeObra.map((mo, i) => (
                    <div key={i} className="p-2 border border-slate-200 rounded flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-800 block">{mo.funcao}</span>
                        <span className="text-[10px] text-slate-500">{mo.tipo}</span>
                      </div>
                      <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {mo.quantidade}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. EQUIPAMENTOS E MATERIAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                  5. Equipamentos no Canteiro
                </div>
                {rdo.equipamentos.length === 0 ? (
                  <p className="text-slate-400 italic py-1">Nenhum equipamento registrado.</p>
                ) : (
                  <ul className="space-y-1">
                    {rdo.equipamentos.map((eq, i) => (
                      <li key={i} className="p-1.5 border border-slate-200 rounded flex justify-between text-xs">
                        <span className="text-slate-800 font-medium">{eq.nome}</span>
                        <span className="text-slate-500">{eq.quantidade}x ({eq.status})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                  6. Materiais Recebidos
                </div>
                {rdo.materiais.length === 0 ? (
                  <p className="text-slate-400 italic py-1">Nenhum material recebido no dia.</p>
                ) : (
                  <ul className="space-y-1">
                    {rdo.materiais.map((mat, i) => (
                      <li key={i} className="p-1.5 border border-slate-200 rounded flex justify-between text-xs">
                        <span className="text-slate-800 font-medium">{mat.item}</span>
                        <span className="text-slate-600 font-semibold">{mat.quantidade} {mat.fornecedor ? `(${mat.fornecedor})` : ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 7. OCORRÊNCIAS & SEGURANÇA */}
            <div className="mb-4">
              <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                7. Ocorrências, Paralisações e Segurança (DDS)
              </div>
              <div className="space-y-2">
                <div className="p-2 border border-slate-200 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Ocorrências / Paralisações:</span>
                  {rdo.ocorrencias.length === 0 ? (
                    <span className="text-slate-600">Sem ocorrências anormais ou paralisações de canteiro.</span>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {rdo.ocorrencias.map((oc, i) => (
                        <li key={i} className="text-xs text-slate-800">
                          <strong className="text-rose-700">[{oc.tipo}]</strong> {oc.descricao}
                          {oc.tempoParalisado && <span className="text-rose-600 ml-1">(Tempo: {oc.tempoParalisado})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">DDS (Diálogo Diário de Segurança):</span>
                    <span className="font-semibold text-slate-800">
                      {rdo.seguranca.ddsRealizado === true
                        ? `Realizado • Tema: ${rdo.seguranca.temaDDS || 'Normas Gerais'}`
                        : rdo.seguranca.ddsRealizado === false
                        ? 'Não realizado'
                        : 'Não informado'}
                    </span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Observações de Segurança:</span>
                    <span className="text-slate-800">{rdo.seguranca.observacoesSeguranca || 'Sem não conformidades de EPI.'}</span>
                  </div>
                </div>

                {rdo.observacoesGerais && (
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Observações Gerais:</span>
                    <span className="text-slate-800">{rdo.observacoesGerais}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 8. FOTOS */}
            {rdo.fotos.length > 0 && (
              <div className="mb-6">
                <div className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider border-l-4 border-blue-600 mb-2">
                  8. Registro Fotográfico do Canteiro
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rdo.fotos.map((foto, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                      <div className="h-44 bg-slate-200 rounded overflow-hidden flex items-center justify-center">
                        <img
                          src={foto.url}
                          alt={foto.legenda || 'Foto da Obra'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-700 font-medium">
                        Foto {i + 1}: {foto.legenda || 'Sem legenda'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. ASSINATURAS OBRIGATÓRIAS (Per PDF requirements: "campos de assinatura") */}
            <div className="mt-8 pt-4 border-t-2 border-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center pt-8">
                {/* Assinatura Resp Técnico */}
                <div>
                  <div className="border-t border-slate-900 w-3/4 mx-auto mb-1.5"></div>
                  <strong className="text-xs text-slate-900 block">{obra.responsavelTecnico}</strong>
                  <span className="text-[11px] text-slate-500 block">
                    Responsável Técnico pela Obra • CREA/CAU: {obra.creaCau}
                  </span>
                </div>

                {/* Assinatura Fiscal / Contratante */}
                <div>
                  <div className="border-t border-slate-900 w-3/4 mx-auto mb-1.5"></div>
                  <strong className="text-xs text-slate-900 block">{obra.cliente}</strong>
                  <span className="text-[11px] text-slate-500 block">
                    Fiscalização / Contratante (Visto de Recebimento)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] text-slate-400">
              Documento gerado eletronicamente pelo sistema RDO Inteligente • Método Larissa • {new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
