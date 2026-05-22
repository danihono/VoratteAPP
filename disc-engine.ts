import { Dimension, DISC_QUESTIONS } from "./disc-questions";

export interface Answer {
  questionId: number;
  most: Dimension;
  least: Dimension;
}

export interface DiscScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface BuyerProfile {
  primary: Dimension;
  secondary: Dimension | null;
  code: string;              // ex: "DI", "SC", "D"
  label: string;             // nome humanizado
  buyerType: string;         // tipo do comprador
  decisionStyle: string;     // como decide
  motivators: string[];      // o que move a compra
  fears: string[];           // o que trava
  salesApproach: string[];   // como abordar
  pitchTone: string;         // tom do pitch
  closingStrategy: string;   // como fechar
  objectionHandling: string; // como tratar objeções
}

export interface DiscResult {
  mostGraph: DiscScores;     // Máscara (como ele se apresenta ao vendedor)
  leastGraph: DiscScores;    // Pressão (como age sob estresse de compra)
  changeGraph: DiscScores;   // Real (perfil autêntico de decisão)
  profile: BuyerProfile;
}

const emptyScores = (): DiscScores => ({ D: 0, I: 0, S: 0, C: 0 });

export function calculateDisc(answers: Answer[]): DiscResult {
  const most = emptyScores();
  const least = emptyScores();

  answers.forEach((a) => {
    most[a.most] += 1;
    least[a.least] += 1;
  });

  const change: DiscScores = {
    D: most.D - least.D,
    I: most.I - least.I,
    S: most.S - least.S,
    C: most.C - least.C,
  };

  const sorted = (Object.entries(change) as [Dimension, number][])
    .sort((a, b) => b[1] - a[1]);

  const primary = sorted[0][0];
  const secondaryCandidate = sorted[1];
  const secondary =
    secondaryCandidate[1] > 0 && secondaryCandidate[1] >= sorted[0][1] - 4
      ? secondaryCandidate[0]
      : null;

  const code = secondary ? `${primary}${secondary}` : primary;
  const profile = BUYER_PROFILES[code] || BUYER_PROFILES[primary];

  return { mostGraph: most, leastGraph: least, changeGraph: change, profile };
}

// ===== PERFIS DE COMPRADOR =====
// Mapeamento focado em comportamento de compra, não em RH
export const BUYER_PROFILES: Record<string, BuyerProfile> = {
  D: {
    primary: "D",
    secondary: null,
    code: "D",
    label: "Comprador Executor",
    buyerType: "Decide rápido, quer resultado, odeia perder tempo",
    decisionStyle: "Decisão imediata baseada em ROI e poder/controle",
    motivators: [
      "Ganho de tempo e produtividade",
      "Vantagem competitiva",
      "Resultado mensurável",
      "Status e diferenciação",
    ],
    fears: [
      "Ser enrolado por vendedor",
      "Perder controle da negociação",
      "Investir em algo lento ou burocrático",
    ],
    salesApproach: [
      "Vá direto ao ponto, sem rodeio",
      "Mostre o resultado antes do processo",
      "Apresente 2-3 opções, deixe ele escolher",
      "Respeite o tempo dele — reuniões curtas",
    ],
    pitchTone: "Objetivo, confiante, focado em ROI e velocidade",
    closingStrategy: "Proponha fechamento na primeira reunião se possível",
    objectionHandling: "Responda com dado direto, não justifique demais",
  },
  I: {
    primary: "I",
    secondary: null,
    code: "I",
    label: "Comprador Relacional",
    buyerType: "Compra pela conexão e pela história, não só pelo produto",
    decisionStyle: "Decisão emocional, influenciada por entusiasmo e reputação",
    motivators: [
      "Reconhecimento e visibilidade",
      "Pertencer a algo inovador",
      "Histórias de sucesso de outros",
      "Experiência de compra envolvente",
    ],
    fears: [
      "Ser ignorado ou tratado como número",
      "Comprar algo chato ou sem brilho",
      "Ficar isolado pós-venda",
    ],
    salesApproach: [
      "Crie rapport antes de falar do produto",
      "Use cases e depoimentos de clientes conhecidos",
      "Demonstre energia e empolgação",
      "Mostre comunidade, eventos, networking",
    ],
    pitchTone: "Inspirador, narrativo, com cases e visão de futuro",
    closingStrategy: "Feche em clima de parceria, com follow-up caloroso",
    objectionHandling: "Acolha o sentimento antes de responder com dado",
  },
  S: {
    primary: "S",
    secondary: null,
    code: "S",
    label: "Comprador Cauteloso",
    buyerType: "Compra devagar, prioriza segurança e relacionamento de longo prazo",
    decisionStyle: "Decisão ponderada, precisa sentir confiança e estabilidade",
    motivators: [
      "Segurança e baixo risco",
      "Suporte contínuo e relacionamento",
      "Garantias e estabilidade da empresa fornecedora",
      "Aprovação da equipe/família",
    ],
    fears: [
      "Mudança brusca ou ruptura",
      "Pressão para decidir rápido",
      "Ser abandonado pós-venda",
      "Conflito interno na equipe dele",
    ],
    salesApproach: [
      "Vá no ritmo dele, sem pressionar",
      "Construa confiança em múltiplos contatos",
      "Mostre suporte, onboarding e SLA",
      "Inclua a equipe dele na conversa",
    ],
    pitchTone: "Calmo, consultivo, com foco em parceria duradoura",
    closingStrategy: "Ofereça período de teste, garantia ou implementação gradual",
    objectionHandling: "Valide a preocupação, mostre cases de transição suave",
  },
  C: {
    primary: "C",
    secondary: null,
    code: "C",
    label: "Comprador Analítico",
    buyerType: "Compra com base em dados, comparativos e especificações",
    decisionStyle: "Decisão racional após análise profunda e validação técnica",
    motivators: [
      "Qualidade técnica comprovada",
      "Custo-benefício documentado",
      "Conformidade e padrões",
      "Especificações claras",
    ],
    fears: [
      "Comprar algo com falha técnica",
      "Tomar decisão sem dados suficientes",
      "Ser pressionado emocionalmente",
      "Erros de processo ou contrato",
    ],
    salesApproach: [
      "Traga planilhas, comparativos, specs técnicos",
      "Aceite o ritmo de análise, não force urgência",
      "Documente tudo por escrito",
      "Esteja preparado para perguntas profundas",
    ],
    pitchTone: "Técnico, preciso, fundamentado em dados",
    closingStrategy: "Forneça proposta detalhada e dê tempo para análise",
    objectionHandling: "Responda com dado verificável, nunca improvise",
  },

  // Combinações principais
  DI: {
    primary: "D", secondary: "I", code: "DI",
    label: "Comprador Visionário",
    buyerType: "Decide rápido mas quer brilho e impacto",
    decisionStyle: "Rápido, ambicioso, busca soluções inovadoras e de alto impacto",
    motivators: ["Inovação", "Crescimento agressivo", "Visibilidade no mercado", "Ser pioneiro"],
    fears: ["Soluções comuns", "Lentidão", "Falta de ambição do fornecedor"],
    salesApproach: [
      "Mostre escala e ambição da solução",
      "Cases de empresas que cresceram rápido",
      "Pitch confiante, com visão grande",
      "Decisão rápida + experiência marcante",
    ],
    pitchTone: "Confiante, ambicioso, com narrativa de transformação",
    closingStrategy: "Feche com proposta de impacto rápido e visível",
    objectionHandling: "Devolva com ambição: 'e se fosse 10x maior?'",
  },
  ID: {
    primary: "I", secondary: "D", code: "ID",
    label: "Comprador Influenciador",
    buyerType: "Carismático, decide pelo entusiasmo + senso de oportunidade",
    decisionStyle: "Emocional-rápido, busca destaque e movimento",
    motivators: ["Reconhecimento público", "Networking", "Velocidade com brilho"],
    fears: ["Ser esquecido", "Perder oportunidade visível"],
    salesApproach: [
      "Apresentação envolvente e rápida",
      "Mostre quem mais comprou (prova social forte)",
      "Crie senso de urgência com elegância",
    ],
    pitchTone: "Energético, com prova social e urgência leve",
    closingStrategy: "Feche no momento de pico emocional, com FOMO",
    objectionHandling: "Use cases e histórias, não planilhas",
  },
  IS: {
    primary: "I", secondary: "S", code: "IS",
    label: "Comprador Acolhedor",
    buyerType: "Compra pela relação, valoriza confiança e simpatia",
    decisionStyle: "Emocional e consultivo, decide em grupo",
    motivators: ["Boas relações", "Time feliz", "Soluções harmoniosas"],
    fears: ["Conflito", "Pressão", "Quebra de vínculo"],
    salesApproach: [
      "Tom caloroso e consultivo",
      "Mostre como a solução beneficia o time todo",
      "Inclua referências de clientes parceiros",
    ],
    pitchTone: "Caloroso, consultivo, com foco em pessoas",
    closingStrategy: "Feche em clima de parceria, sem pressão",
    objectionHandling: "Valide o sentimento, mostre suporte humano",
  },
  SI: {
    primary: "S", secondary: "I", code: "SI",
    label: "Comprador Colaborativo",
    buyerType: "Quer segurança + boa relação, decide com a equipe",
    decisionStyle: "Ponderado, busca consenso e confiança mútua",
    motivators: ["Estabilidade", "Time em sintonia", "Suporte contínuo"],
    fears: ["Mudança brusca", "Vendedor frio ou agressivo"],
    salesApproach: [
      "Construa relação ao longo de várias conversas",
      "Mostre estabilidade da sua empresa",
      "Envolva o time dele nas reuniões",
    ],
    pitchTone: "Consultivo, humano, paciente",
    closingStrategy: "Ofereça implementação gradual com suporte forte",
    objectionHandling: "Mostre cases de transições tranquilas",
  },
  SC: {
    primary: "S", secondary: "C", code: "SC",
    label: "Comprador Conservador",
    buyerType: "Avesso ao risco, quer dados + segurança",
    decisionStyle: "Lento, metódico, precisa de muita validação",
    motivators: ["Estabilidade comprovada", "Dados consistentes", "Garantias formais"],
    fears: ["Decisão precipitada", "Falhas técnicas", "Mudança sem teste"],
    salesApproach: [
      "Documentação técnica completa",
      "Período de teste/piloto",
      "Cases de longo prazo, não só recentes",
      "Múltiplas reuniões de validação",
    ],
    pitchTone: "Sóbrio, técnico, sem floreio",
    closingStrategy: "Proposta detalhada + piloto + SLA explícito",
    objectionHandling: "Responda com dado e tempo para análise",
  },
  CS: {
    primary: "C", secondary: "S", code: "CS",
    label: "Comprador Auditor",
    buyerType: "Analítico com forte aversão a risco",
    decisionStyle: "Profundamente racional, verifica tudo antes de decidir",
    motivators: ["Precisão técnica", "Conformidade", "Histórico do fornecedor"],
    fears: ["Erros", "Letra miúda mal explicada", "Improviso"],
    salesApproach: [
      "Documente cada afirmação",
      "Mostre certificações, auditorias, métricas",
      "Nunca improvise resposta — diga 'vou verificar' se preciso",
    ],
    pitchTone: "Técnico, formal, baseado em evidência",
    closingStrategy: "Proposta escrita extremamente detalhada + revisão de contrato",
    objectionHandling: "Sempre com dado escrito, nunca opinião",
  },
  CD: {
    primary: "C", secondary: "D", code: "CD",
    label: "Comprador Estrategista",
    buyerType: "Analítico mas decidido — pesquisa fundo e fecha rápido",
    decisionStyle: "Racional e direto, decide após análise rápida e profunda",
    motivators: ["Eficiência baseada em dados", "Vantagem técnica clara", "ROI demonstrável"],
    fears: ["Vendedor que enrola", "Falta de dado concreto"],
    salesApproach: [
      "Traga dado + benefício direto",
      "Comparativos com concorrência",
      "Seja preciso e objetivo",
    ],
    pitchTone: "Técnico-direto, ROI claro",
    closingStrategy: "Proposta enxuta com dados-chave em destaque",
    objectionHandling: "Resposta técnica curta e precisa",
  },
  DC: {
    primary: "D", secondary: "C", code: "DC",
    label: "Comprador Crítico",
    buyerType: "Decide rápido mas exige qualidade técnica",
    decisionStyle: "Rápido, exigente, intolerante a erro",
    motivators: ["Resultado + qualidade", "Eficiência técnica", "Excelência"],
    fears: ["Produto medíocre", "Vendedor despreparado", "Perda de tempo com detalhe irrelevante"],
    salesApproach: [
      "Seja extremamente preparado tecnicamente",
      "Vá direto ao ponto com dado de qualidade",
      "Não desperdice tempo com small talk",
    ],
    pitchTone: "Direto, técnico, exigente",
    closingStrategy: "Feche rápido com proposta tecnicamente impecável",
    objectionHandling: "Resposta firme, técnica e curta",
  },
};
