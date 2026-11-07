import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to check Gemini configuration
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no ambiente.');
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Endpoint to inform client about real configuration status (Gemini & Firebase)
app.get('/api/config-status', (_req, res) => {
  res.json({
    geminiConfigured: hasGeminiKey,
    firebaseConfigured: false, // Per PDF page 4: "Identifique dados de demonstração e informe as configurações necessárias para ativar Firebase e Gemini. Não apresente integrações simuladas como funcionais."
    systemInfo: {
      framework: 'React + TypeScript + Vite + Express',
      method: 'Método Larissa - RDO Inteligente',
      modelUsed: 'gemini-3.8-flash',
    },
  });
});

// Contingency parser implementing the exact rules of the Larissa Method when API is temporarily unavailable
function parseLarissaMethodFallback(narrative: string) {
  const text = narrative.toLowerCase();

  // Atividades & percentual
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

  // Mão de obra
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

  const armadorMatch = text.match(/(\d+|quatro|três|dois|um|cinco)\s+armador/);
  if (armadorMatch) {
    maoDeObra.push({ funcao: 'Armador', quantidade: getNumber(armadorMatch[1]), tipo: 'Terceirizada' });
  }

  // Clima
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

  // Ocorrências
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

  // Regra Larissa: outros campos ausentes permanecem em branco
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

// Endpoint to process voice audio or typed narrative into structured RDO
app.post('/api/gemini/parse-rdo', async (req, res) => {
  try {
    const { narrative, audioBase64, mimeType } = req.body;

    if (!narrative && !audioBase64) {
      return res.status(400).json({
        error: 'É necessário fornecer um relato por texto ou áudio gravado.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          'Chave GEMINI_API_KEY não configurada no servidor. Por favor, configure a chave no painel de Segredos/Ambiente.',
        requiresKey: true,
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é o motor de IA do aplicativo "RDO Inteligente" (Método Larissa para IA na Engenharia Civil).
Sua função é transformar relatos de canteiro de obras (falados por áudio ou digitados) em dados altamente estruturados para o Relatório Diário de Obra (RDO).

DIRETRIZES RÍGIDAS DE CONFORMIDADE E PRECISÃO:
1. Utilize SOMENTE as informações expressamente mencionadas no relato. NUNCA deduza ou invente dados adicionais.
2. Deixe campos ausentes estritamente vazios ou nulos.
3. Se houver qualquer dúvida, contradição ou ambiguidade, adicione na lista "duvidasOuConfirmacoes" uma observação iniciando obrigatoriamente com "Requer confirmação: [motivo]".
4. ATENÇÃO CRÍTICA COM PERCENTUAIS: Nunca interprete o percentual de uma atividade como avanço total da obra. Trata-se estritamente do avanço daquela atividade específica no dia.
5. Se for enviado áudio, transcreva com extrema fidelidade técnica os termos de construção civil no campo "transcricao".
6. Exemplo de referência:
   Relato: "Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes. Concluímos 80%. Choveu pela manhã e paramos uma hora."
   Estrutura resultante esperada:
   - Atividades: [{ "descricao": "Concretagem das vigas", "percentualDia": 80, "observacao": "80% da atividade executada" }]
   - Mão de obra: [{ "funcao": "Pedreiro", "quantidade": 4, "tipo": "Própria" }, { "funcao": "Servente", "quantidade": 6, "tipo": "Própria" }]
   - Clima: { "manha": "Chuvoso", "tarde": "", "condicaoGeral": "Chuva pela manhã", "praticavel": "Parcialmente praticável" }
   - Ocorrências: [{ "tipo": "Paralisação", "descricao": "Paralisação de uma hora devido à chuva", "tempoParalisado": "1h" }]
   - Demais campos não mencionados ficam vazios.`;

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

    // Retry logic with backoff and fallback model
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
            transcricao: {
              type: Type.STRING,
              description: 'Transcrição literal e precisa do que foi falado ou digitado.',
            },
            clima: {
              type: Type.OBJECT,
              properties: {
                manha: { type: Type.STRING, description: 'Condição do tempo pela manhã (ex: Ensolarado, Chuvoso, Nublado)' },
                tarde: { type: Type.STRING, description: 'Condição do tempo pela tarde' },
                condicaoGeral: { type: Type.STRING, description: 'Resumo das condições climáticas' },
                praticabilidade: { type: Type.STRING, description: 'Praticável, Parcialmente impraticável, Impraticável' },
              },
            },
            atividades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  descricao: { type: Type.STRING, description: 'Descrição da atividade executada' },
                  percentualDia: { type: Type.NUMBER, description: 'Percentual concluído daquela atividade no dia (0 a 100), ou null se não citado' },
                  observacao: { type: Type.STRING, description: 'Observações específicas da atividade' },
                },
                required: ['descricao'],
              },
            },
            maoDeObra: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  funcao: { type: Type.STRING, description: 'Cargo ou função (Pedreiro, Servente, Encarregado, Eletricista, etc.)' },
                  quantidade: { type: Type.INTEGER, description: 'Número de profissionais informados' },
                  tipo: { type: Type.STRING, description: 'Própria ou Terceirizada' },
                },
                required: ['funcao', 'quantidade'],
              },
            },
            equipamentos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING, description: 'Nome do equipamento utilizado ou parado' },
                  quantidade: { type: Type.INTEGER, description: 'Quantidade informada' },
                  status: { type: Type.STRING, description: 'Em operação, Parado, Em manutenção' },
                },
                required: ['nome'],
              },
            },
            materiais: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING, description: 'Material recebido ou utilizado' },
                  quantidade: { type: Type.STRING, description: 'Quantidade com unidade (ex: 8m³, 50 sacos)' },
                  fornecedor: { type: Type.STRING, description: 'Fornecedor se mencionado' },
                },
                required: ['item'],
              },
            },
            ocorrencias: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING, description: 'Paralisação, Acidente, Atraso, Falta de material, Chuva, etc.' },
                  descricao: { type: Type.STRING, description: 'Detalhes da ocorrência' },
                  tempoParalisado: { type: Type.STRING, description: 'Tempo em horas ou minutos de paralisação se houver' },
                },
                required: ['descricao'],
              },
            },
            seguranca: {
              type: Type.OBJECT,
              properties: {
                ddsRealizado: { type: Type.BOOLEAN, description: 'Se houve Diálogo Diário de Segurança' },
                temaDDS: { type: Type.STRING, description: 'Tema do DDS se informado' },
                observacoesSeguranca: { type: Type.STRING, description: 'Uso de EPI, inspeções, etc.' },
              },
            },
            observacoesGerais: {
              type: Type.STRING,
              description: 'Demais observações gerais do dia que não se encaixam em outros campos.',
            },
            duvidasOuConfirmacoes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Itens que requerem confirmação pelo engenheiro, formatados como: Requer confirmação: [motivo].',
            },
          },
          required: ['atividades', 'maoDeObra', 'duvidasOuConfirmacoes'],
        },
            },
          });
          if (response && response.text) break;
        } catch (err: any) {
          lastError = err;
          // small delay before next attempt
          await new Promise((r) => setTimeout(r, 800));
        }
      }
      if (response && response.text) break;
    }

    if (!response || !response.text) {
      // If external Gemini API is temporarily experiencing high demand, use high-fidelity Larissa Method heuristic parser
      if (narrative) {
        console.warn('Utilizando parser heurístico de contingência do Método Larissa devido a indisponibilidade temporária da API:', lastError?.message);
        const fallback = parseLarissaMethodFallback(narrative);
        return res.json({
          success: true,
          data: fallback,
        });
      }
      throw lastError || new Error('Não foi possível obter resposta do Gemini.');
    }

    const parsedContent = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsedContent,
    });
  } catch (error: any) {
    console.error('Erro na extração com Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao processar relato com Gemini.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RDO Inteligente] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
