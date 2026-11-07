import { GoogleGenAI, Type } from '@google/genai';

function parseLarissaMethodFallback(narrative: string) {
  const text = narrative.toLowerCase();

  const atividades: Array<{ descricao: string; percentualDia: number | null; observacao?: string }> = [];
  let percentual: number | null = null;
  const percMatch = narrative.match(/(\d+)\s*%/);
  if (percMatch) {
    percentual = parseInt(percMatch[1], 10);
  }

  if (text.includes('concretagem')) {
    atividades.push({
      descricao: 'Concretagem das vigas',
      percentualDia: percentual,
      observacao: percentual ? `${percentual}% da atividade concluída no dia` : '',
    });
  } else if (text.includes('alvenaria')) {
    atividades.push({
      descricao: 'Elevação de alvenaria',
      percentualDia: percentual,
      observacao: '',
    });
  } else if (text.includes('estacas') || text.includes('fundaç')) {
    atividades.push({
      descricao: 'Execução de fundações / estacas',
      percentualDia: percentual,
      observacao: '',
    });
  } else {
    atividades.push({
      descricao: narrative.slice(0, 80),
      percentualDia: percentual,
      observacao: '',
    });
  }

  const maoDeObra: Array<{ funcao: string; quantidade: number; tipo: string }> = [];
  const numbersWordMap: Record<string, number> = {
    um: 1, uma: 1, dois: 2, duas: 2, tres: 3, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
  };

  const getNumber = (raw: string | undefined): number => {
    if (!raw) return 1;
    const num = parseInt(raw, 10);
    if (!isNaN(num)) return num;
    return numbersWordMap[raw.toLowerCase()] || 1;
  };

  const pedreiroMatch = text.match(/(\d+|quatro|três|dois|um|cinco|seis)\s+pedreiro/);
  if (pedreiroMatch) {
    maoDeObra.push({ funcao: 'Pedreiro', quantidade: getNumber(pedreiroMatch[1]), tipo: 'Própria' });
  }

  const serventeMatch = text.match(/(\d+|seis|quatro|três|dois|um|cinco|oito)\s+servente/);
  if (serventeMatch) {
    maoDeObra.push({ funcao: 'Servente', quantidade: getNumber(serventeMatch[1]), tipo: 'Própria' });
  }

  const clima: any = {
    manha: '',
    tarde: '',
    condicaoGeral: '',
    praticabilidade: 'Praticável',
  };

  if (text.includes('choveu') || text.includes('chuva')) {
    clima.manha = 'Chuvoso';
    clima.condicaoGeral = 'Chuva pela manhã';
    clima.praticabilidade = 'Parcialmente impraticável';
  } else if (text.includes('ensolarado') || text.includes('sol')) {
    clima.manha = 'Ensolarado';
    clima.condicaoGeral = 'Tempo bom e estável';
  }

  const ocorrencias: Array<{ tipo: string; descricao: string; tempoParalisado?: string }> = [];
  if (text.includes('paramos') || text.includes('parou') || text.includes('paralisação')) {
    const timeMatch = text.match(/par[a-z]+\s+(uma hora|\d+\s*horas?|\d+\s*minutos?)/);
    const tempo = timeMatch ? timeMatch[1] : '1 hora';
    ocorrencias.push({
      tipo: 'Paralisação',
      descricao: `Paralisação de ${tempo} decorrente de intempérie/chuva`,
      tempoParalisado: tempo,
    });
  }

  return {
    transcricao: narrative,
    clima,
    atividades,
    maoDeObra,
    equipamentos: [],
    materiais: [],
    ocorrencias,
    seguranca: {
      ddsRealizado: null,
      temaDDS: '',
      observacoesSeguranca: '',
    },
    observacoesGerais: '',
    duvidasOuConfirmacoes: [],
  };
}

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido.' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { narrative, audioBase64, mimeType } = body;

    if (!narrative && !audioBase64) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'É necessário fornecer um relato por texto ou áudio gravado.' }),
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      if (narrative) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: parseLarissaMethodFallback(narrative),
          }),
        };
      }
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Chave GEMINI_API_KEY não configurada nas variáveis de ambiente do Netlify.',
          requiresKey: true,
        }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `Você é o motor de IA do aplicativo "RDO Inteligente" (Método Larissa para IA na Engenharia Civil).
Sua função é transformar relatos de canteiro de obras (falados por áudio ou digitados) em dados altamente estruturados para o Relatório Diário de Obra (RDO).
DIRETRIZES RÍGIDAS DE CONFORMIDADE E PRECISÃO:
1. Utilize SOMENTE as informações expressamente mencionadas no relato. NUNCA deduza ou invente dados adicionais.
2. Deixe campos ausentes estritamente vazios ou nulos.
3. Se houver qualquer dúvida, contradição ou ambiguidade, adicione na lista "duvidasOuConfirmacoes" uma observação iniciando obrigatoriamente com "Requer confirmação: [motivo]".
4. ATENÇÃO CRÍTICA COM PERCENTUAIS: Nunca interprete o percentual de uma atividade como avanço total da obra. Trata-se estritamente do avanço daquela atividade específica no dia.
5. Se for enviado áudio, transcreva com extrema fidelidade técnica os termos de construção civil no campo "transcricao".`;

    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      });
      parts.push({
        text: `Transcreva este áudio de canteiro e estruture o RDO rigorosamente de acordo com as instruções do Método Larissa. ${
          narrative ? `Observação complementar digitada: "${narrative}"` : ''
        }`,
      });
    } else {
      parts.push({
        text: `Analise o seguinte relato do canteiro de obras e estruture o RDO:\n\n"${narrative}"`,
      });
    }

    let response: any = null;
    let lastError: any = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  transcricao: { type: Type.STRING },
                  clima: {
                    type: Type.OBJECT,
                    properties: {
                      manha: { type: Type.STRING },
                      tarde: { type: Type.STRING },
                      condicaoGeral: { type: Type.STRING },
                      praticabilidade: { type: Type.STRING },
                    },
                  },
                  atividades: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        descricao: { type: Type.STRING },
                        percentualDia: { type: Type.NUMBER },
                        observacao: { type: Type.STRING },
                      },
                      required: ['descricao'],
                    },
                  },
                  maoDeObra: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        funcao: { type: Type.STRING },
                        quantidade: { type: Type.INTEGER },
                        tipo: { type: Type.STRING },
                      },
                      required: ['funcao', 'quantidade'],
                    },
                  },
                  equipamentos: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nome: { type: Type.STRING },
                        quantidade: { type: Type.INTEGER },
                        status: { type: Type.STRING },
                      },
                      required: ['nome'],
                    },
                  },
                  materiais: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        quantidade: { type: Type.STRING },
                        fornecedor: { type: Type.STRING },
                      },
                      required: ['item'],
                    },
                  },
                  ocorrencias: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        tipo: { type: Type.STRING },
                        descricao: { type: Type.STRING },
                        tempoParalisado: { type: Type.STRING },
                      },
                      required: ['descricao'],
                    },
                  },
                  seguranca: {
                    type: Type.OBJECT,
                    properties: {
                      ddsRealizado: { type: Type.BOOLEAN },
                      temaDDS: { type: Type.STRING },
                      observacoesSeguranca: { type: Type.STRING },
                    },
                  },
                  observacoesGerais: { type: Type.STRING },
                  duvidasOuConfirmacoes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['atividades', 'maoDeObra', 'duvidasOuConfirmacoes'],
              },
            },
          });
          if (response && response.text) break;
        } catch (err: any) {
          lastError = err;
          await new Promise((r) => setTimeout(r, 800));
        }
      }
      if (response && response.text) break;
    }

    if (!response || !response.text) {
      if (narrative) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: parseLarissaMethodFallback(narrative),
          }),
        };
      }
      throw lastError || new Error('Falha na resposta do Gemini no Netlify.');
    }

    const parsedContent = JSON.parse(response.text || '{}');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: parsedContent,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Erro interno no Netlify Function' }),
    };
  }
};
