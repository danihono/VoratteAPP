// DISC — runtime data + scoring engine (buyer profiling)
// Browser-runnable port of disc-questions.ts + disc-engine.ts.
// The .ts files stay at the repo root as canonical source/reference;
// this file is what actually loads in the no-bundler architecture.
// Exposes globals: DISC_QUESTIONS, BUYER_PROFILES, BUYER_TYPE_TABLE, calculateDisc.

// ===== BANCO DE QUESTÕES — 24 questões, 4 adjetivos cada =====
const DISC_QUESTIONS = [
  { id: 1,  options: [{ word: 'Decidido', dimension: 'D' }, { word: 'Entusiasmado', dimension: 'I' }, { word: 'Paciente', dimension: 'S' }, { word: 'Analítico', dimension: 'C' }] },
  { id: 2,  options: [{ word: 'Direto', dimension: 'D' }, { word: 'Comunicativo', dimension: 'I' }, { word: 'Calmo', dimension: 'S' }, { word: 'Cuidadoso', dimension: 'C' }] },
  { id: 3,  options: [{ word: 'Competitivo', dimension: 'D' }, { word: 'Persuasivo', dimension: 'I' }, { word: 'Leal', dimension: 'S' }, { word: 'Preciso', dimension: 'C' }] },
  { id: 4,  options: [{ word: 'Determinado', dimension: 'D' }, { word: 'Otimista', dimension: 'I' }, { word: 'Estável', dimension: 'S' }, { word: 'Lógico', dimension: 'C' }] },
  { id: 5,  options: [{ word: 'Ousado', dimension: 'D' }, { word: 'Sociável', dimension: 'I' }, { word: 'Cooperativo', dimension: 'S' }, { word: 'Detalhista', dimension: 'C' }] },
  { id: 6,  options: [{ word: 'Exigente', dimension: 'D' }, { word: 'Animado', dimension: 'I' }, { word: 'Confiável', dimension: 'S' }, { word: 'Disciplinado', dimension: 'C' }] },
  { id: 7,  options: [{ word: 'Independente', dimension: 'D' }, { word: 'Espontâneo', dimension: 'I' }, { word: 'Tranquilo', dimension: 'S' }, { word: 'Sistemático', dimension: 'C' }] },
  { id: 8,  options: [{ word: 'Objetivo', dimension: 'D' }, { word: 'Carismático', dimension: 'I' }, { word: 'Gentil', dimension: 'S' }, { word: 'Rigoroso', dimension: 'C' }] },
  { id: 9,  options: [{ word: 'Confiante', dimension: 'D' }, { word: 'Expressivo', dimension: 'I' }, { word: 'Compreensivo', dimension: 'S' }, { word: 'Cauteloso', dimension: 'C' }] },
  { id: 10, options: [{ word: 'Assertivo', dimension: 'D' }, { word: 'Inspirador', dimension: 'I' }, { word: 'Acolhedor', dimension: 'S' }, { word: 'Metódico', dimension: 'C' }] },
  { id: 11, options: [{ word: 'Resoluto', dimension: 'D' }, { word: 'Brincalhão', dimension: 'I' }, { word: 'Prestativo', dimension: 'S' }, { word: 'Organizado', dimension: 'C' }] },
  { id: 12, options: [{ word: 'Ambicioso', dimension: 'D' }, { word: 'Extrovertido', dimension: 'I' }, { word: 'Harmonioso', dimension: 'S' }, { word: 'Reservado', dimension: 'C' }] },
  { id: 13, options: [{ word: 'Enérgico', dimension: 'D' }, { word: 'Convincente', dimension: 'I' }, { word: 'Sereno', dimension: 'S' }, { word: 'Crítico', dimension: 'C' }] },
  { id: 14, options: [{ word: 'Firme', dimension: 'D' }, { word: 'Empolgado', dimension: 'I' }, { word: 'Atencioso', dimension: 'S' }, { word: 'Conservador', dimension: 'C' }] },
  { id: 15, options: [{ word: 'Pragmático', dimension: 'D' }, { word: 'Amigável', dimension: 'I' }, { word: 'Modesto', dimension: 'S' }, { word: 'Perfeccionista', dimension: 'C' }] },
  { id: 16, options: [{ word: 'Líder', dimension: 'D' }, { word: 'Aberto', dimension: 'I' }, { word: 'Diplomático', dimension: 'S' }, { word: 'Investigativo', dimension: 'C' }] },
  { id: 17, options: [{ word: 'Audacioso', dimension: 'D' }, { word: 'Caloroso', dimension: 'I' }, { word: 'Solidário', dimension: 'S' }, { word: 'Diligente', dimension: 'C' }] },
  { id: 18, options: [{ word: 'Veloz', dimension: 'D' }, { word: 'Encantador', dimension: 'I' }, { word: 'Constante', dimension: 'S' }, { word: 'Reflexivo', dimension: 'C' }] },
  { id: 19, options: [{ word: 'Inquieto', dimension: 'D' }, { word: 'Falante', dimension: 'I' }, { word: 'Equilibrado', dimension: 'S' }, { word: 'Formal', dimension: 'C' }] },
  { id: 20, options: [{ word: 'Impetuoso', dimension: 'D' }, { word: 'Magnético', dimension: 'I' }, { word: 'Discreto', dimension: 'S' }, { word: 'Racional', dimension: 'C' }] },
  { id: 21, options: [{ word: 'Corajoso', dimension: 'D' }, { word: 'Divertido', dimension: 'I' }, { word: 'Receptivo', dimension: 'S' }, { word: 'Estruturado', dimension: 'C' }] },
  { id: 22, options: [{ word: 'Insistente', dimension: 'D' }, { word: 'Popular', dimension: 'I' }, { word: 'Cordial', dimension: 'S' }, { word: 'Padronizado', dimension: 'C' }] },
  { id: 23, options: [{ word: 'Forte', dimension: 'D' }, { word: 'Vibrante', dimension: 'I' }, { word: 'Bondoso', dimension: 'S' }, { word: 'Exato', dimension: 'C' }] },
  { id: 24, options: [{ word: 'Imediato', dimension: 'D' }, { word: 'Expansivo', dimension: 'I' }, { word: 'Sensível', dimension: 'S' }, { word: 'Minucioso', dimension: 'C' }] },
];

// ===== PERFIS DE COMPRADOR — foco em comportamento de compra =====
const BUYER_PROFILES = {
  D: {
    primary: 'D', secondary: null, code: 'D',
    label: 'Comprador Executor', shortLabel: 'Executor',
    decisionShort: 'Imediata', toneShort: 'Direto',
    buyerType: 'Decide rápido, quer resultado, odeia perder tempo',
    decisionStyle: 'Decisão imediata baseada em ROI e poder/controle',
    motivators: ['Ganho de tempo e produtividade', 'Vantagem competitiva', 'Resultado mensurável', 'Status e diferenciação'],
    fears: ['Ser enrolado por vendedor', 'Perder controle da negociação', 'Investir em algo lento ou burocrático'],
    salesApproach: ['Vá direto ao ponto, sem rodeio', 'Mostre o resultado antes do processo', 'Apresente 2-3 opções, deixe ele escolher', 'Respeite o tempo dele — reuniões curtas'],
    pitchTone: 'Objetivo, confiante, focado em ROI e velocidade',
    closingStrategy: 'Proponha fechamento na primeira reunião se possível',
    objectionHandling: 'Responda com dado direto, não justifique demais',
  },
  I: {
    primary: 'I', secondary: null, code: 'I',
    label: 'Comprador Relacional', shortLabel: 'Relacional',
    decisionShort: 'Emocional', toneShort: 'Entusiasmado',
    buyerType: 'Compra pela conexão e pela história, não só pelo produto',
    decisionStyle: 'Decisão emocional, influenciada por entusiasmo e reputação',
    motivators: ['Reconhecimento e visibilidade', 'Pertencer a algo inovador', 'Histórias de sucesso de outros', 'Experiência de compra envolvente'],
    fears: ['Ser ignorado ou tratado como número', 'Comprar algo chato ou sem brilho', 'Ficar isolado pós-venda'],
    salesApproach: ['Crie rapport antes de falar do produto', 'Use cases e depoimentos de clientes conhecidos', 'Demonstre energia e empolgação', 'Mostre comunidade, eventos, networking'],
    pitchTone: 'Inspirador, narrativo, com cases e visão de futuro',
    closingStrategy: 'Feche em clima de parceria, com follow-up caloroso',
    objectionHandling: 'Acolha o sentimento antes de responder com dado',
  },
  S: {
    primary: 'S', secondary: null, code: 'S',
    label: 'Comprador Cauteloso', shortLabel: 'Cauteloso',
    decisionShort: 'Ponderada', toneShort: 'Calmo',
    buyerType: 'Compra devagar, prioriza segurança e relacionamento de longo prazo',
    decisionStyle: 'Decisão ponderada, precisa sentir confiança e estabilidade',
    motivators: ['Segurança e baixo risco', 'Suporte contínuo e relacionamento', 'Garantias e estabilidade da empresa fornecedora', 'Aprovação da equipe/família'],
    fears: ['Mudança brusca ou ruptura', 'Pressão para decidir rápido', 'Ser abandonado pós-venda', 'Conflito interno na equipe dele'],
    salesApproach: ['Vá no ritmo dele, sem pressionar', 'Construa confiança em múltiplos contatos', 'Mostre suporte, onboarding e SLA', 'Inclua a equipe dele na conversa'],
    pitchTone: 'Calmo, consultivo, com foco em parceria duradoura',
    closingStrategy: 'Ofereça período de teste, garantia ou implementação gradual',
    objectionHandling: 'Valide a preocupação, mostre cases de transição suave',
  },
  C: {
    primary: 'C', secondary: null, code: 'C',
    label: 'Comprador Analítico', shortLabel: 'Analítico',
    decisionShort: 'Racional', toneShort: 'Técnico',
    buyerType: 'Compra com base em dados, comparativos e especificações',
    decisionStyle: 'Decisão racional após análise profunda e validação técnica',
    motivators: ['Qualidade técnica comprovada', 'Custo-benefício documentado', 'Conformidade e padrões', 'Especificações claras'],
    fears: ['Comprar algo com falha técnica', 'Tomar decisão sem dados suficientes', 'Ser pressionado emocionalmente', 'Erros de processo ou contrato'],
    salesApproach: ['Traga planilhas, comparativos, specs técnicos', 'Aceite o ritmo de análise, não force urgência', 'Documente tudo por escrito', 'Esteja preparado para perguntas profundas'],
    pitchTone: 'Técnico, preciso, fundamentado em dados',
    closingStrategy: 'Forneça proposta detalhada e dê tempo para análise',
    objectionHandling: 'Responda com dado verificável, nunca improvise',
  },
  DI: {
    primary: 'D', secondary: 'I', code: 'DI',
    label: 'Comprador Visionário', shortLabel: 'Visionário',
    decisionShort: 'Rápida', toneShort: 'Ambicioso',
    buyerType: 'Decide rápido mas quer brilho e impacto',
    decisionStyle: 'Rápido, ambicioso, busca soluções inovadoras e de alto impacto',
    motivators: ['Inovação', 'Crescimento agressivo', 'Visibilidade no mercado', 'Ser pioneiro'],
    fears: ['Soluções comuns', 'Lentidão', 'Falta de ambição do fornecedor'],
    salesApproach: ['Mostre escala e ambição da solução', 'Cases de empresas que cresceram rápido', 'Pitch confiante, com visão grande', 'Decisão rápida + experiência marcante'],
    pitchTone: 'Confiante, ambicioso, com narrativa de transformação',
    closingStrategy: 'Feche com proposta de impacto rápido e visível',
    objectionHandling: "Devolva com ambição: 'e se fosse 10x maior?'",
  },
  ID: {
    primary: 'I', secondary: 'D', code: 'ID',
    label: 'Comprador Influenciador', shortLabel: 'Influenciador',
    decisionShort: 'Impulsiva', toneShort: 'Energético',
    buyerType: 'Carismático, decide pelo entusiasmo + senso de oportunidade',
    decisionStyle: 'Emocional-rápido, busca destaque e movimento',
    motivators: ['Reconhecimento público', 'Networking', 'Velocidade com brilho'],
    fears: ['Ser esquecido', 'Perder oportunidade visível'],
    salesApproach: ['Apresentação envolvente e rápida', 'Mostre quem mais comprou (prova social forte)', 'Crie senso de urgência com elegância'],
    pitchTone: 'Energético, com prova social e urgência leve',
    closingStrategy: 'Feche no momento de pico emocional, com FOMO',
    objectionHandling: 'Use cases e histórias, não planilhas',
  },
  IS: {
    primary: 'I', secondary: 'S', code: 'IS',
    label: 'Comprador Acolhedor', shortLabel: 'Acolhedor',
    decisionShort: 'Consensual', toneShort: 'Caloroso',
    buyerType: 'Compra pela relação, valoriza confiança e simpatia',
    decisionStyle: 'Emocional e consultivo, decide em grupo',
    motivators: ['Boas relações', 'Time feliz', 'Soluções harmoniosas'],
    fears: ['Conflito', 'Pressão', 'Quebra de vínculo'],
    salesApproach: ['Tom caloroso e consultivo', 'Mostre como a solução beneficia o time todo', 'Inclua referências de clientes parceiros'],
    pitchTone: 'Caloroso, consultivo, com foco em pessoas',
    closingStrategy: 'Feche em clima de parceria, sem pressão',
    objectionHandling: 'Valide o sentimento, mostre suporte humano',
  },
  SI: {
    primary: 'S', secondary: 'I', code: 'SI',
    label: 'Comprador Colaborativo', shortLabel: 'Colaborativo',
    decisionShort: 'Consensual', toneShort: 'Humano',
    buyerType: 'Quer segurança + boa relação, decide com a equipe',
    decisionStyle: 'Ponderado, busca consenso e confiança mútua',
    motivators: ['Estabilidade', 'Time em sintonia', 'Suporte contínuo'],
    fears: ['Mudança brusca', 'Vendedor frio ou agressivo'],
    salesApproach: ['Construa relação ao longo de várias conversas', 'Mostre estabilidade da sua empresa', 'Envolva o time dele nas reuniões'],
    pitchTone: 'Consultivo, humano, paciente',
    closingStrategy: 'Ofereça implementação gradual com suporte forte',
    objectionHandling: 'Mostre cases de transições tranquilas',
  },
  SC: {
    primary: 'S', secondary: 'C', code: 'SC',
    label: 'Comprador Conservador', shortLabel: 'Conservador',
    decisionShort: 'Lenta', toneShort: 'Sóbrio',
    buyerType: 'Avesso ao risco, quer dados + segurança',
    decisionStyle: 'Lento, metódico, precisa de muita validação',
    motivators: ['Estabilidade comprovada', 'Dados consistentes', 'Garantias formais'],
    fears: ['Decisão precipitada', 'Falhas técnicas', 'Mudança sem teste'],
    salesApproach: ['Documentação técnica completa', 'Período de teste/piloto', 'Cases de longo prazo, não só recentes', 'Múltiplas reuniões de validação'],
    pitchTone: 'Sóbrio, técnico, sem floreio',
    closingStrategy: 'Proposta detalhada + piloto + SLA explícito',
    objectionHandling: 'Responda com dado e tempo para análise',
  },
  CS: {
    primary: 'C', secondary: 'S', code: 'CS',
    label: 'Comprador Auditor', shortLabel: 'Auditor',
    decisionShort: 'Minuciosa', toneShort: 'Formal',
    buyerType: 'Analítico com forte aversão a risco',
    decisionStyle: 'Profundamente racional, verifica tudo antes de decidir',
    motivators: ['Precisão técnica', 'Conformidade', 'Histórico do fornecedor'],
    fears: ['Erros', 'Letra miúda mal explicada', 'Improviso'],
    salesApproach: ['Documente cada afirmação', 'Mostre certificações, auditorias, métricas', "Nunca improvise resposta — diga 'vou verificar' se preciso"],
    pitchTone: 'Técnico, formal, baseado em evidência',
    closingStrategy: 'Proposta escrita extremamente detalhada + revisão de contrato',
    objectionHandling: 'Sempre com dado escrito, nunca opinião',
  },
  CD: {
    primary: 'C', secondary: 'D', code: 'CD',
    label: 'Comprador Estrategista', shortLabel: 'Estrategista',
    decisionShort: 'Analítica', toneShort: 'Objetivo',
    buyerType: 'Analítico mas decidido — pesquisa fundo e fecha rápido',
    decisionStyle: 'Racional e direto, decide após análise rápida e profunda',
    motivators: ['Eficiência baseada em dados', 'Vantagem técnica clara', 'ROI demonstrável'],
    fears: ['Vendedor que enrola', 'Falta de dado concreto'],
    salesApproach: ['Traga dado + benefício direto', 'Comparativos com concorrência', 'Seja preciso e objetivo'],
    pitchTone: 'Técnico-direto, ROI claro',
    closingStrategy: 'Proposta enxuta com dados-chave em destaque',
    objectionHandling: 'Resposta técnica curta e precisa',
  },
  DC: {
    primary: 'D', secondary: 'C', code: 'DC',
    label: 'Comprador Crítico', shortLabel: 'Crítico',
    decisionShort: 'Exigente', toneShort: 'Preciso',
    buyerType: 'Decide rápido mas exige qualidade técnica',
    decisionStyle: 'Rápido, exigente, intolerante a erro',
    motivators: ['Resultado + qualidade', 'Eficiência técnica', 'Excelência'],
    fears: ['Produto medíocre', 'Vendedor despreparado', 'Perda de tempo com detalhe irrelevante'],
    salesApproach: ['Seja extremamente preparado tecnicamente', 'Vá direto ao ponto com dado de qualidade', 'Não desperdice tempo com small talk'],
    pitchTone: 'Direto, técnico, exigente',
    closingStrategy: 'Feche rápido com proposta tecnicamente impecável',
    objectionHandling: 'Resposta firme, técnica e curta',
  },
};

// ===== TABELA DOS 11 TIPOS — resumo "como cada perfil aparece pra Voratte" =====
const BUYER_TYPE_TABLE = [
  { code: 'D',  type: 'Executor',      comoVender: 'Direto, ROI, fechamento rápido' },
  { code: 'I',  type: 'Relacional',    comoVender: 'Rapport, cases, energia' },
  { code: 'S',  type: 'Cauteloso',     comoVender: 'Suporte, garantia, ritmo dele' },
  { code: 'C',  type: 'Analítico',     comoVender: 'Dados, planilhas, specs' },
  { code: 'DI', type: 'Visionário',    comoVender: 'Inovação, ambição, impacto' },
  { code: 'ID', type: 'Influenciador', comoVender: 'Prova social + urgência leve' },
  { code: 'IS', type: 'Acolhedor',     comoVender: 'Conexão + benefício pro time' },
  { code: 'SI', type: 'Colaborativo',  comoVender: 'Estabilidade + relação humana' },
  { code: 'SC', type: 'Conservador',   comoVender: 'Documentação + piloto' },
  { code: 'CS', type: 'Auditor',       comoVender: 'Tudo escrito, zero improviso' },
  { code: 'CD', type: 'Estrategista',  comoVender: 'Dado + benefício direto' },
  { code: 'DC', type: 'Crítico',       comoVender: 'Técnico, preciso, sem rodeio' },
];

// ===== MOTOR DE CÁLCULO =====
// answers: [{ questionId, most: 'D'|'I'|'S'|'C', least: 'D'|'I'|'S'|'C' }]
// Retorna os 3 gráficos do DISC:
//   mostGraph   = Máscara  (como o comprador se apresenta)
//   leastGraph  = Pressão  (como age sob estresse de compra)
//   changeGraph = Real     (perfil autêntico de decisão = most - least)
function calculateDisc(answers) {
  const most  = { D: 0, I: 0, S: 0, C: 0 };
  const least = { D: 0, I: 0, S: 0, C: 0 };

  answers.forEach(function (a) {
    if (a.most  && most[a.most]   !== undefined) most[a.most]   += 1;
    if (a.least && least[a.least] !== undefined) least[a.least] += 1;
  });

  const change = {
    D: most.D - least.D,
    I: most.I - least.I,
    S: most.S - least.S,
    C: most.C - least.C,
  };

  const sorted = Object.keys(change)
    .map(function (k) { return [k, change[k]]; })
    .sort(function (a, b) { return b[1] - a[1]; });

  const primary = sorted[0][0];
  const secondaryCandidate = sorted[1];
  const secondary =
    secondaryCandidate[1] > 0 && secondaryCandidate[1] >= sorted[0][1] - 4
      ? secondaryCandidate[0]
      : null;

  const code = secondary ? primary + secondary : primary;
  const profile = BUYER_PROFILES[code] || BUYER_PROFILES[primary];

  return { mostGraph: most, leastGraph: least, changeGraph: change, code: code, profile: profile };
}

window.DISC_QUESTIONS   = DISC_QUESTIONS;
window.BUYER_PROFILES   = BUYER_PROFILES;
window.BUYER_TYPE_TABLE = BUYER_TYPE_TABLE;
window.calculateDisc    = calculateDisc;
