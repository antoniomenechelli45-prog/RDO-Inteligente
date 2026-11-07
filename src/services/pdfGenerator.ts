import { jsPDF } from 'jspdf';
import { RDO, Obra } from '../types/rdo';

export function formatRdoNumber(seq: number): string {
  return `#${String(seq).padStart(3, '0')}`;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export async function generateRDOPdf(rdo: RDO, obra: Obra): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawHeader(true);
    }
  };

  const drawHeader = (isContinuation = false) => {
    // Header banner
    doc.setFillColor(24, 43, 73); // Deep navy blue
    doc.rect(margin, y, contentWidth, isContinuation ? 12 : 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isContinuation ? 11 : 14);
    doc.text(
      `RELATÓRIO DIÁRIO DE OBRA (RDO) ${formatRdoNumber(rdo.numeroSequencial)}`,
      margin + 4,
      y + (isContinuation ? 8 : 10)
    );

    if (!isContinuation) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(210, 225, 245);
      doc.text(
        `CONFEA / CREA • Método Larissa de Engenharia • Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
        margin + 4,
        y + 17
      );

      // Status pill
      const statusText = rdo.status.toUpperCase();
      const statusColor = rdo.status === 'Finalizado' ? [16, 185, 129] : [245, 158, 11];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 32, y + 6, 28, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(statusText, pageWidth - margin - 18, y + 11.5, { align: 'center' });
    }

    y += isContinuation ? 16 : 28;
  };

  // Section header helper
  const drawSectionTitle = (title: string) => {
    checkPageBreak(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, 3, 7, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(title.toUpperCase(), margin + 6, y + 5);
    y += 9;
  };

  // Field box helper
  const drawFieldRow = (items: Array<{ label: string; value: string; widthPercent: number }>) => {
    checkPageBreak(12);
    let currentX = margin;
    const rowHeight = 10;

    items.forEach((item) => {
      const itemW = (contentWidth * item.widthPercent) / 100;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.rect(currentX, y, itemW, rowHeight, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.label.toUpperCase(), currentX + 2, y + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const val = doc.splitTextToSize(item.value || '-', itemW - 4);
      doc.text(val[0] || '-', currentX + 2, y + 8);

      currentX += itemW;
    });

    y += rowHeight + 1.5;
  };

  // First page setup
  drawHeader();

  // 1. IDENTIFICAÇÃO DA OBRA E DO RELATÓRIO
  drawSectionTitle('1. Identificação da Obra e do Relatório');
  drawFieldRow([
    { label: 'Obra', value: obra.nome, widthPercent: 50 },
    { label: 'RDO Nº', value: formatRdoNumber(rdo.numeroSequencial), widthPercent: 20 },
    { label: 'Data', value: formatDateBR(rdo.data), widthPercent: 30 },
  ]);
  drawFieldRow([
    { label: 'Cliente / Contratante', value: obra.cliente, widthPercent: 50 },
    { label: 'Responsável Técnico da Obra', value: obra.responsavelTecnico, widthPercent: 30 },
    { label: 'CREA / CAU', value: obra.creaCau, widthPercent: 20 },
  ]);
  drawFieldRow([
    { label: 'Endereço Completo', value: obra.endereco, widthPercent: 70 },
    { label: 'Responsável pelo Preenchimento', value: rdo.responsavel, widthPercent: 30 },
  ]);

  y += 2;

  // 2. CONDIÇÕES CLIMÁTICAS E TRABALHABILIDADE
  drawSectionTitle('2. Condições Climáticas e Praticabilidade');
  drawFieldRow([
    { label: 'Manhã', value: rdo.clima.manha || 'Não informado', widthPercent: 25 },
    { label: 'Tarde', value: rdo.clima.tarde || 'Não informado', widthPercent: 25 },
    { label: 'Praticabilidade', value: rdo.clima.praticabilidade || 'Não informado', widthPercent: 25 },
    { label: 'Condição Geral', value: rdo.clima.condicaoGeral || '-', widthPercent: 25 },
  ]);

  y += 2;

  // 3. ATIVIDADES DESENVOLVIDAS NO DIA
  drawSectionTitle('3. Atividades Desenvolvidas no Dia (Avanço Diário)');
  if (rdo.atividades.length === 0) {
    checkPageBreak(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Nenhuma atividade registrada neste dia.', margin + 2, y + 4);
    y += 7;
  } else {
    // Table Header
    checkPageBreak(8);
    doc.setFillColor(234, 240, 248);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ITEM', margin + 2, y + 4.2);
    doc.text('DESCRIÇÃO DO SERVIÇO / ATIVIDADE', margin + 16, y + 4.2);
    doc.text('EXEC. DIA', margin + contentWidth - 45, y + 4.2);
    doc.text('OBSERVAÇÕES', margin + contentWidth - 25, y + 4.2);
    y += 6.5;

    rdo.atividades.forEach((atv, idx) => {
      checkPageBreak(8);
      const bg = idx % 2 === 0 ? 255 : 248;
      doc.setFillColor(bg, bg, bg);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 7, margin + contentWidth, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(String(idx + 1).padStart(2, '0'), margin + 3, y + 4.8);

      const desc = doc.splitTextToSize(atv.descricao, contentWidth - 75);
      doc.text(desc[0], margin + 16, y + 4.8);

      const percText = atv.percentualDia !== null && atv.percentualDia !== undefined ? `${atv.percentualDia}%` : '-';
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(percText, margin + contentWidth - 42, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const obs = doc.splitTextToSize(atv.observacao || '-', 24);
      doc.text(obs[0], margin + contentWidth - 25, y + 4.8);

      y += 7.5;
    });
  }

  y += 2;

  // 4. MÃO DE OBRA E EFETIVO
  drawSectionTitle('4. Efetivo de Mão de Obra');
  if (rdo.maoDeObra.length === 0) {
    checkPageBreak(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Nenhum efetivo registrado no dia.', margin + 2, y + 4);
    y += 7;
  } else {
    const totalTrabalhadores = rdo.maoDeObra.reduce((sum, item) => sum + (item.quantidade || 0), 0);
    const moText = rdo.maoDeObra.map((m) => `${m.funcao}: ${m.quantidade} (${m.tipo})`).join('  •  ');
    drawFieldRow([
      { label: 'Composição da Equipe em Campo', value: moText, widthPercent: 80 },
      { label: 'Total de Operários', value: `${totalTrabalhadores} pessoas`, widthPercent: 20 },
    ]);
  }

  y += 2;

  // 5. EQUIPAMENTOS E MATERIAIS
  drawSectionTitle('5. Equipamentos & Materiais Recebidos');
  const eqText =
    rdo.equipamentos.length > 0
      ? rdo.equipamentos.map((e) => `${e.nome} (${e.quantidade}x - ${e.status})`).join('; ')
      : 'Nenhum equipamento reportado';
  const matText =
    rdo.materiais.length > 0
      ? rdo.materiais.map((m) => `${m.item}: ${m.quantidade}${m.fornecedor ? ` (${m.fornecedor})` : ''}`).join('; ')
      : 'Nenhum material recebido no dia';

  drawFieldRow([
    { label: 'Equipamentos em Canteiro', value: eqText, widthPercent: 50 },
    { label: 'Materiais Recebidos / Insumos', value: matText, widthPercent: 50 },
  ]);

  y += 2;

  // 6. OCORRÊNCIAS & SEGURANÇA
  drawSectionTitle('6. Ocorrências, Paralisações e Segurança');
  const ocText =
    rdo.ocorrencias.length > 0
      ? rdo.ocorrencias.map((o) => `[${o.tipo}] ${o.descricao}${o.tempoParalisado ? ` (Tempo: ${o.tempoParalisado})` : ''}`).join(' | ')
      : 'Sem ocorrências anormais ou paralisações registradas.';

  const ddsStr =
    rdo.seguranca.ddsRealizado === true
      ? `Realizado. Tema: ${rdo.seguranca.temaDDS || 'Orientações Gerais de Canteiro'}`
      : rdo.seguranca.ddsRealizado === false
      ? 'Não realizado'
      : 'Não informado';

  drawFieldRow([
    { label: 'Ocorrências / Paralisações', value: ocText, widthPercent: 60 },
    { label: 'DDS & Segurança', value: ddsStr, widthPercent: 40 },
  ]);

  if (rdo.observacoesGerais) {
    drawFieldRow([
      { label: 'Observações Gerais', value: rdo.observacoesGerais, widthPercent: 100 },
    ]);
  }

  // 7. REGISTRO FOTOGRÁFICO
  if (rdo.fotos && rdo.fotos.length > 0) {
    y += 2;
    drawSectionTitle('7. Registro Fotográfico da Obra');
    checkPageBreak(50);

    const photoWidth = (contentWidth - 6) / 2;
    const photoHeight = 36;

    for (let i = 0; i < rdo.fotos.length; i += 2) {
      checkPageBreak(photoHeight + 14);

      // Photo 1
      const f1 = rdo.fotos[i];
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, photoWidth, photoHeight, 'FD');

      try {
        if (f1.url.startsWith('data:image')) {
          doc.addImage(f1.url, 'JPEG', margin + 1, y + 1, photoWidth - 2, photoHeight - 2);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`[Foto anexada: ${f1.legenda || 'Foto do Canteiro'}]`, margin + 4, y + photoHeight / 2);
        }
      } catch {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.text('Foto anexada', margin + 4, y + 18);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      const leg1 = doc.splitTextToSize(`Foto ${i + 1}: ${f1.legenda || 'Sem legenda'}`, photoWidth);
      doc.text(leg1[0], margin, y + photoHeight + 3.5);

      // Photo 2 if exists
      if (i + 1 < rdo.fotos.length) {
        const f2 = rdo.fotos[i + 1];
        const x2 = margin + photoWidth + 6;
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(241, 245, 249);
        doc.rect(x2, y, photoWidth, photoHeight, 'FD');

        try {
          if (f2.url.startsWith('data:image')) {
            doc.addImage(f2.url, 'JPEG', x2 + 1, y + 1, photoWidth - 2, photoHeight - 2);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`[Foto anexada: ${f2.legenda || 'Foto do Canteiro'}]`, x2 + 4, y + photoHeight / 2);
          }
        } catch {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.text('Foto anexada', x2 + 4, y + 18);
        }

        const leg2 = doc.splitTextToSize(`Foto ${i + 2}: ${f2.legenda || 'Sem legenda'}`, photoWidth);
        doc.text(leg2[0], x2, y + photoHeight + 3.5);
      }

      y += photoHeight + 8;
    }
  }

  // 8. CAMPOS DE ASSINATURA OBRIGATÓRIOS (Per PDF page 3: "O PDF deve conter identificação da obra, dados do relatório, registros do dia, fotos e campos de assinatura")
  checkPageBreak(38);
  y += 4;
  drawSectionTitle('8. Termo de Encerramento e Assinaturas');

  checkPageBreak(30);
  const sigBoxW = (contentWidth - 8) / 2;
  const sigBoxH = 26;

  // Box 1: Responsável Técnico
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, sigBoxW, sigBoxH, 'FD');
  doc.line(margin + 6, y + 17, margin + sigBoxW - 6, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(obra.responsavelTecnico, margin + sigBoxW / 2, y + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Responsável Técnico • CREA/CAU: ${obra.creaCau}`, margin + sigBoxW / 2, y + 24.5, { align: 'center' });

  // Box 2: Fiscal da Obra / Contratante
  const sigX2 = margin + sigBoxW + 8;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(250, 250, 250);
  doc.rect(sigX2, y, sigBoxW, sigBoxH, 'FD');
  doc.line(sigX2 + 6, y + 17, sigX2 + sigBoxW - 6, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(obra.cliente, sigX2 + sigBoxW / 2, y + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Fiscalização / Contratante (Visto)', sigX2 + sigBoxW / 2, y + 24.5, { align: 'center' });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `RDO Inteligente • Método Larissa • Obra: ${obra.nome} • Página ${p} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadRDOPdf(rdo: RDO, obra: Obra): Promise<void> {
  const doc = await generateRDOPdf(rdo, obra);
  const filename = `RDO_${String(rdo.numeroSequencial).padStart(3, '0')}_${obra.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${rdo.data}.pdf`;
  doc.save(filename);
}
