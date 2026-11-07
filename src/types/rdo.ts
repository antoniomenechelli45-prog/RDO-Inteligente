export interface User {
  id: string;
  name: string;
  email: string;
  creaCau: string;
  cargo: string;
}

export type ObraStatus = 'Em andamento' | 'Concluída' | 'Pausada';

export interface Obra {
  id: string;
  nome: string;
  cliente: string;
  endereco: string;
  responsavelTecnico: string;
  creaCau: string;
  status: ObraStatus;
  dataInicio: string;
  previsaoTermino?: string;
  numeroContrato?: string;
}

export interface ClimaInfo {
  manha: string;
  tarde: string;
  condicaoGeral: string;
  praticabilidade: 'Praticável' | 'Parcialmente impraticável' | 'Impraticável' | '';
}

export interface AtividadeRDO {
  id: string;
  descricao: string;
  percentualDia: number | null;
  observacao?: string;
}

export interface MaoDeObraItem {
  id: string;
  funcao: string;
  quantidade: number;
  tipo: 'Própria' | 'Terceirizada';
}

export interface EquipamentoItem {
  id: string;
  nome: string;
  quantidade: number;
  status: 'Em operação' | 'Parado' | 'Em manutenção';
}

export interface MaterialItem {
  id: string;
  item: string;
  quantidade: string;
  fornecedor?: string;
}

export interface OcorrenciaItem {
  id: string;
  tipo: string;
  descricao: string;
  tempoParalisado?: string;
}

export interface SegurancaInfo {
  ddsRealizado: boolean | null;
  temaDDS?: string;
  observacoesSeguranca?: string;
}

export interface FotoRDO {
  id: string;
  url: string;
  legenda: string;
  dataHora: string;
}

export type RDOStatus = 'Rascunho' | 'Finalizado';

export interface RDO {
  id: string;
  obraId: string;
  numeroSequencial: number;
  data: string; // YYYY-MM-DD
  responsavel: string;
  status: RDOStatus;
  clima: ClimaInfo;
  atividades: AtividadeRDO[];
  maoDeObra: MaoDeObraItem[];
  equipamentos: EquipamentoItem[];
  materiais: MaterialItem[];
  ocorrencias: OcorrenciaItem[];
  seguranca: SegurancaInfo;
  observacoesGerais: string;
  fotos: FotoRDO[];
  duvidasConfirmacoes?: string[];
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm?: string;
}

export interface AIParsedRDO {
  transcricao?: string;
  clima?: Partial<ClimaInfo>;
  atividades?: Array<{
    descricao: string;
    percentualDia: number | null;
    observacao?: string;
  }>;
  maoDeObra?: Array<{
    funcao: string;
    quantidade: number;
    tipo: 'Própria' | 'Terceirizada';
  }>;
  equipamentos?: Array<{
    nome: string;
    quantidade: number;
    status: 'Em operação' | 'Parado' | 'Em manutenção';
  }>;
  materiais?: Array<{
    item: string;
    quantidade: string;
    fornecedor?: string;
  }>;
  ocorrencias?: Array<{
    tipo: string;
    descricao: string;
    tempoParalisado?: string;
  }>;
  seguranca?: Partial<SegurancaInfo>;
  observacoesGerais?: string;
  duvidasOuConfirmacoes?: string[];
}
