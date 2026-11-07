import { AIParsedRDO } from '../types/rdo';

export const METODO_LARISSA_EXEMPLO_PADRAO =
  'Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes. Concluímos 80%. Choveu pela manhã e paramos uma hora.';

export const EXEMPLOS_ADICIONAIS = [
  {
    titulo: 'Exemplo do Workshop (Concretagem das Vigas)',
    texto:
      'Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes. Concluímos 80%. Choveu pela manhã e paramos uma hora.',
  },
  {
    titulo: 'Alvenaria e Instalações Hidrossanitárias',
    texto:
      'Iniciamos a elevação da alvenaria do 3º pavimento com 3 pedreiros e 4 serventes, finalizando 45% do pavimento. Recebemos 500 blocos de concreto da Cerâmica Progresso. O encarregado realizou o DDS sobre organização e limpeza. Clima ensolarado o dia todo.',
  },
  {
    titulo: 'Fundações com Paralisação de Equipamento',
    texto:
      'Execução das estacas hélice contínua com 2 operadores e 3 serventes. Executamos 6 estacas das 10 previstas (60%). O perfuratriz hidráulica apresentou vazamento de óleo às 14h e parou por 2 horas para manutenção mecânica. Clima nublado sem chuva.',
  },
];

export async function parseRdoWithAI(params: {
  narrative?: string;
  audioBase64?: string;
  mimeType?: string;
}): Promise<AIParsedRDO> {
  const response = await fetch('/api/gemini/parse-rdo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro na comunicação com a IA (${response.status})`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Resposta inválida do serviço de IA.');
  }

  return result.data as AIParsedRDO;
}

export async function checkConfigStatus(): Promise<{
  geminiConfigured: boolean;
  firebaseConfigured: boolean;
  systemInfo?: any;
}> {
  try {
    const response = await fetch('/api/config-status');
    if (!response.ok) {
      return { geminiConfigured: false, firebaseConfigured: false };
    }
    return await response.json();
  } catch {
    return { geminiConfigured: false, firebaseConfigured: false };
  }
}
