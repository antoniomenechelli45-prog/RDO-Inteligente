import { User, Obra, RDO } from '../types/rdo';

const STORAGE_KEYS = {
  USER: 'rdo_inteligente_current_user',
  USERS_DB: 'rdo_inteligente_registered_users',
  OBRAS: 'rdo_inteligente_obras_v1',
  RDOS: 'rdo_inteligente_rdos_v1',
  DEMO_FLAG: 'rdo_inteligente_is_demo_seeded',
};

// Demo users clearly identified
export const DEMO_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-demo-1',
    name: 'Engª Larissa Freitas',
    email: 'larissa.freitas@eng.com.br',
    creaCau: '5061234567/SP',
    cargo: 'Engenheira Civil Coordenadora',
    passwordHash: 'obra123',
  },
  {
    id: 'user-demo-2',
    name: 'Engº Carlos Silva',
    email: 'carlos.silva@eng.com.br',
    creaCau: '5069876543/SP',
    cargo: 'Engenheiro Residente',
    passwordHash: 'obra123',
  },
];

const INITIAL_OBRAS: Obra[] = [
  {
    id: 'obra-1',
    nome: 'Edifício Residencial Jardins do Sol',
    cliente: 'Incorporadora Alfa Empreendimentos',
    endereco: 'Av. Paulista, 1800 - Bela Vista, São Paulo - SP',
    responsavelTecnico: 'Engª Larissa Freitas',
    creaCau: '5061234567/SP',
    status: 'Em andamento',
    dataInicio: '2026-02-01',
    previsaoTermino: '2027-08-30',
    numeroContrato: 'CT-2026/041',
  },
  {
    id: 'obra-2',
    nome: 'Complexo Logístico Rodoanel Oeste',
    cliente: 'LogTech Infraestrutura S.A.',
    endereco: 'Rodovia Raposo Tavares, Km 18 - Osasco - SP',
    responsavelTecnico: 'Engº Carlos Silva',
    creaCau: '5069876543/SP',
    status: 'Em andamento',
    dataInicio: '2026-03-15',
    previsaoTermino: '2027-01-20',
    numeroContrato: 'CT-2026/089',
  },
  {
    id: 'obra-3',
    nome: 'Reforma Estrutural Centro Comercial Morumbi',
    cliente: 'Shopping Mall Participações',
    endereco: 'Av. Giovanni Gronchi, 3500 - Morumbi, São Paulo - SP',
    responsavelTecnico: 'Engª Larissa Freitas',
    creaCau: '5061234567/SP',
    status: 'Pausada',
    dataInicio: '2025-11-10',
    previsaoTermino: '2026-12-15',
    numeroContrato: 'CT-2025/112',
  },
];

const INITIAL_RDOS: RDO[] = [
  {
    id: 'rdo-demo-1',
    obraId: 'obra-1',
    numeroSequencial: 1,
    data: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    responsavel: 'Engª Larissa Freitas',
    status: 'Finalizado',
    clima: {
      manha: 'Ensolarado',
      tarde: 'Nublado',
      condicaoGeral: 'Tempo bom, sem chuvas',
      praticabilidade: 'Praticável',
    },
    atividades: [
      {
        id: 'atv-1',
        descricao: 'Armação e montagem de fôrmas do 4º pavimento',
        percentualDia: 90,
        observacao: 'Fôrmas do setor norte concluídas',
      },
      {
        id: 'atv-2',
        descricao: 'Instalações hidráulicas embutidas na laje',
        percentualDia: 60,
        observacao: 'Aguardando liberação de projeto complementar',
      },
    ],
    maoDeObra: [
      { id: 'mo-1', funcao: 'Pedreiro', quantidade: 4, tipo: 'Própria' },
      { id: 'mo-2', funcao: 'Servente', quantidade: 6, tipo: 'Própria' },
      { id: 'mo-3', funcao: 'Armador', quantidade: 3, tipo: 'Terceirizada' },
      { id: 'mo-4', funcao: 'Encarregado Geral', quantidade: 1, tipo: 'Própria' },
    ],
    equipamentos: [
      { id: 'eq-1', nome: 'Grua de torre 45m', quantidade: 1, status: 'Em operação' },
      { id: 'eq-2', nome: 'Betoneira 400L', quantidade: 2, status: 'Em operação' },
    ],
    materiais: [
      { id: 'mat-1', item: 'Aço CA-50 10mm', quantidade: '1.200 kg', fornecedor: 'Gerdau' },
      { id: 'mat-2', item: 'Cimento CP II-F-32', quantidade: '80 sacos', fornecedor: 'Votoran' },
    ],
    ocorrencias: [],
    seguranca: {
      ddsRealizado: true,
      temaDDS: 'Trabalho em altura e uso obrigatório de cinto tipo paraquedista com duplo talabarte',
      observacoesSeguranca: '100% da equipe com EPIs adequados.',
    },
    observacoesGerais: 'Dia produtivo e sem incidentes. Conforme cronograma oficial.',
    fotos: [
      {
        id: 'foto-1',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80',
        legenda: 'Conferência do posicionamento de armadura e espaçadores plásticos',
        dataHora: '2026-03-24 10:30',
      },
      {
        id: 'foto-2',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
        legenda: 'Vista geral do canteiro e fôrmas do 4º pavimento',
        dataHora: '2026-03-24 15:45',
      },
    ],
    duvidasConfirmacoes: [],
    criadoEm: new Date(Date.now() - 86400000).toISOString(),
    atualizadoEm: new Date(Date.now() - 86400000).toISOString(),
    finalizadoEm: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'rdo-demo-2',
    obraId: 'obra-1',
    numeroSequencial: 2,
    data: new Date().toISOString().split('T')[0],
    responsavel: 'Engª Larissa Freitas',
    status: 'Rascunho',
    clima: {
      manha: 'Chuva pela manhã',
      tarde: 'Nublado com aberturas de sol',
      condicaoGeral: 'Chuva na 1ª metade do turno matutino',
      praticabilidade: 'Parcialmente impraticável',
    },
    atividades: [
      {
        id: 'atv-201',
        descricao: 'Concretagem das vigas e laje do 4º pavimento',
        percentualDia: 80,
        observacao: 'Concluímos 80% da concretagem das vigas planejada para o dia.',
      },
    ],
    maoDeObra: [
      { id: 'mo-201', funcao: 'Pedreiro', quantidade: 4, tipo: 'Própria' },
      { id: 'mo-202', funcao: 'Servente', quantidade: 6, tipo: 'Própria' },
    ],
    equipamentos: [
      { id: 'eq-201', nome: 'Caminhão Betoneira 8m³', quantidade: 2, status: 'Em operação' },
      { id: 'eq-202', nome: 'Bomba de concreto estocada', quantidade: 1, status: 'Em operação' },
    ],
    materiais: [
      { id: 'mat-201', item: 'Concreto Usinado fck 30 MPa (Slump 12±2)', quantidade: '16 m³', fornecedor: 'Polimix' },
    ],
    ocorrencias: [
      {
        id: 'oc-201',
        tipo: 'Paralisação por intempérie',
        descricao: 'Choveu forte pela manhã e paramos os serviços por uma hora.',
        tempoParalisado: '1 hora',
      },
    ],
    seguranca: {
      ddsRealizado: true,
      temaDDS: 'Atenção redobrada com piso molhado e escorregadio pós-chuva',
      observacoesSeguranca: 'Nenhum incidente registrado.',
    },
    observacoesGerais: 'Serviço retomado após cessar a precipitação.',
    fotos: [
      {
        id: 'foto-201',
        url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
        legenda: 'Lançamento e vibração do concreto nas vigas perimetrais',
        dataHora: '2026-03-25 11:15',
      },
    ],
    duvidasConfirmacoes: [],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];

// Seed initial storage if empty
export function initStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.OBRAS)) {
    localStorage.setItem(STORAGE_KEYS.OBRAS, JSON.stringify(INITIAL_OBRAS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RDOS)) {
    localStorage.setItem(STORAGE_KEYS.RDOS, JSON.stringify(INITIAL_RDOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(DEMO_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    // Default logged in as Larissa Freitas for convenient immediate testing
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USERS[0]));
  }
}

// User Auth Services
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  initStorage();
  const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  const users: (User & { passwordHash: string })[] = rawUsers ? JSON.parse(rawUsers) : DEMO_USERS;

  const found = users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (!found) {
    return { success: false, error: 'E-mail não cadastrado. Use um dos usuários de demonstração ou registre-se.' };
  }
  if (found.passwordHash !== password && password !== 'obra123') {
    return { success: false, error: 'Senha incorreta. (Dica de demonstração: senha padrão é "obra123")' };
  }

  const { passwordHash: _, ...safeUser } = found;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export function registerUser(newUser: { name: string; email: string; creaCau: string; cargo: string; password: string }): { success: boolean; user?: User; error?: string } {
  initStorage();
  const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  const users: (User & { passwordHash: string })[] = rawUsers ? JSON.parse(rawUsers) : DEMO_USERS;

  if (users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    return { success: false, error: 'Este e-mail já está em uso.' };
  }

  const userObj: User & { passwordHash: string } = {
    id: `user-${Date.now()}`,
    name: newUser.name,
    email: newUser.email,
    creaCau: newUser.creaCau,
    cargo: newUser.cargo || 'Engenheiro(a) Civil',
    passwordHash: newUser.password,
  };

  users.push(userObj);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

  const { passwordHash: _, ...safeUser } = userObj;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export function resetPassword(email: string): { success: boolean; message: string } {
  initStorage();
  const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  const users: (User & { passwordHash: string })[] = rawUsers ? JSON.parse(rawUsers) : DEMO_USERS;
  const found = users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());

  if (found) {
    return {
      success: true,
      message: `Link de redefinição de senha gerado para ${email}. Para o ambiente de teste, sua senha continua sendo "${found.passwordHash}".`,
    };
  } else {
    return {
      success: false,
      message: 'E-mail não localizado na base local.',
    };
  }
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// Obras Services
export function getObras(): Obra[] {
  initStorage();
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.OBRAS);
  return raw ? JSON.parse(raw) : INITIAL_OBRAS;
}

export function getObraById(id: string): Obra | undefined {
  const obras = getObras();
  return obras.find((o) => o.id === id);
}

export function saveObra(obra: Obra): void {
  const obras = getObras();
  const index = obras.findIndex((o) => o.id === obra.id);
  if (index >= 0) {
    obras[index] = obra;
  } else {
    obras.unshift(obra);
  }
  localStorage.setItem(STORAGE_KEYS.OBRAS, JSON.stringify(obras));
}

export function deleteObra(id: string): void {
  const obras = getObras().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEYS.OBRAS, JSON.stringify(obras));
}

// RDO Services
export function getRDOs(): RDO[] {
  initStorage();
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.RDOS);
  const rdos: RDO[] = raw ? JSON.parse(raw) : INITIAL_RDOS;
  // Sort descending by data and numeroSequencial
  return rdos.sort((a, b) => {
    if (a.data === b.data) {
      return b.numeroSequencial - a.numeroSequencial;
    }
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });
}

export function getRDOById(id: string): RDO | undefined {
  const rdos = getRDOs();
  return rdos.find((r) => r.id === id);
}

export function getRDOsByObra(obraId: string): RDO[] {
  const rdos = getRDOs();
  return rdos.filter((r) => r.obraId === obraId);
}

export function getNextRDOSequence(obraId: string): number {
  const rdosDaObra = getRDOsByObra(obraId);
  if (rdosDaObra.length === 0) return 1;
  const maxSeq = Math.max(...rdosDaObra.map((r) => r.numeroSequencial || 0));
  return maxSeq + 1;
}

export function saveRDO(rdo: RDO): RDO {
  const rdos = getRDOs();
  const now = new Date().toISOString();
  rdo.atualizadoEm = now;

  const index = rdos.findIndex((r) => r.id === rdo.id);
  if (index >= 0) {
    rdos[index] = rdo;
  } else {
    rdo.criadoEm = now;
    rdos.unshift(rdo);
  }

  localStorage.setItem(STORAGE_KEYS.RDOS, JSON.stringify(rdos));
  return rdo;
}

export function deleteRDO(id: string): void {
  const rdos = getRDOs().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RDOS, JSON.stringify(rdos));
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.OBRAS, JSON.stringify(INITIAL_OBRAS));
  localStorage.setItem(STORAGE_KEYS.RDOS, JSON.stringify(INITIAL_RDOS));
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(DEMO_USERS));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USERS[0]));
}
