// Kraljic — runtime data + engine (posiciona o comprador na matriz a partir do DISC)
// Porta browser-runnable de kraljic-engine.ts. O .ts permanece como fonte
// canônica/referência; este arquivo é o que roda na arquitetura sem bundler.
// Exposto: window.KRALJIC_PROFILES, window.calculateKraljic.

// Mapeamento DISC → Kraljic (regra Vorätte):
// D = Alavancagem | I = Estratégico | S = Gargalo | C = Não-críticos
const DIMENSION_TO_QUADRANT = {
  D: 'alavancagem',
  I: 'estrategico',
  S: 'gargalo',
  C: 'nao_criticos',
};

// Centro de cada quadrante no plano (Y = impacto financeiro, X = risco de suprimento)
const QUADRANT_CENTER = {
  alavancagem:  { impactoFinanceiro: 75, riscoSuprimento: 25 }, // alto impacto, baixo risco
  estrategico:  { impactoFinanceiro: 75, riscoSuprimento: 75 }, // alto impacto, alto risco
  gargalo:      { impactoFinanceiro: 25, riscoSuprimento: 75 }, // baixo impacto, alto risco
  nao_criticos: { impactoFinanceiro: 25, riscoSuprimento: 25 }, // baixo impacto, baixo risco
};

const KRALJIC_PROFILES = {
  alavancagem: {
    quadrant: 'alavancagem',
    label: 'Alavancagem',
    discDimension: 'D',
    buyerPosture:
      'Trata o fornecedor como commodity substituível. Tem poder de barganha alto e usa isso.',
    whatHeWants: [
      'Melhor preço do mercado',
      'Múltiplos fornecedores concorrendo',
      'Volume e desconto progressivo',
      'Negociação rápida e direta',
    ],
    whatToAvoid: [
      "Tentar criar dependência emocional",
      "Posicionar como 'parceria de longo prazo' sem dado",
      'Demorar para apresentar proposta final',
    ],
    negotiationLeverage:
      'Poder está com o comprador — ele tem alternativas e sabe disso',
    proposalFocus:
      'ROI direto, comparativo com concorrência, condições agressivas de volume',
    contractStyle:
      'Contratos curtos, com SLA mensurável e cláusulas de saída fáceis',
    riskForVendor:
      'Margem apertada e relação transacional — comprador troca por 5% de diferença',
  },
  estrategico: {
    quadrant: 'estrategico',
    label: 'Estratégico',
    discDimension: 'I',
    buyerPosture:
      'Vê o fornecedor como parceiro de crescimento. Investe na relação porque depende dela.',
    whatHeWants: [
      'Co-criação e inovação conjunta',
      'Roadmap compartilhado',
      'Acesso a executivos do fornecedor',
      'Cases e visibilidade conjunta no mercado',
    ],
    whatToAvoid: [
      'Tratar como cliente comum',
      'Vender só pelo preço',
      'Não envolver liderança nas reuniões',
    ],
    negotiationLeverage:
      'Poder equilibrado — ambos dependem da relação',
    proposalFocus:
      'Plano plurianual, governança da parceria, projetos conjuntos, exclusividade',
    contractStyle:
      'Contratos longos, com QBRs, metas conjuntas e cláusulas de inovação',
    riskForVendor:
      'Investimento alto de relacionamento; perda do cliente é dolorosa',
  },
  gargalo: {
    quadrant: 'gargalo',
    label: 'Gargalo',
    discDimension: 'S',
    buyerPosture:
      'Depende do fornecedor mesmo sem grande volume. Tem medo de ruptura.',
    whatHeWants: [
      'Garantia de fornecimento contínuo',
      'Estoque de segurança',
      'Previsibilidade total',
      'Suporte humano disponível',
    ],
    whatToAvoid: [
      'Pressionar por aumento de volume rápido',
      'Mudar contato/atendente sem aviso',
      'Apresentar mudanças bruscas no produto',
    ],
    negotiationLeverage:
      'Poder está com o fornecedor — comprador não quer (ou não pode) trocar',
    proposalFocus:
      'Garantias, SLA forte, suporte premium, plano de continuidade',
    contractStyle:
      'Contratos com cláusulas de continuidade, redundância e suporte 24/7',
    riskForVendor:
      'Cliente pode ser cobrado caro mas exige altíssimo nível de serviço',
  },
  nao_criticos: {
    quadrant: 'nao_criticos',
    label: 'Não-críticos',
    discDimension: 'C',
    buyerPosture:
      'Trata a compra como processo. Quer eficiência, conformidade e zero atrito.',
    whatHeWants: [
      'Processo de compra automatizado',
      'Catálogo claro e previsível',
      'Documentação técnica completa',
      'Faturamento e entrega sem erros',
    ],
    whatToAvoid: [
      'Tentar criar relação pessoal forçada',
      'Vender storytelling sem dado',
      'Burocratizar o processo dele',
    ],
    negotiationLeverage:
      'Baixo de ambos os lados — decisão é por eficiência operacional',
    proposalFocus:
      'Padronização, automação de pedidos, contrato guarda-chuva, e-procurement',
    contractStyle:
      'Contratos padronizados, catálogo digital, integração com ERP',
    riskForVendor:
      'Margens baixas mas volume previsível; risco de virar commodity invisível',
  },
};

// Calcula a posição do comprador na matriz Kraljic a partir dos scores DISC
// (idealmente o changeGraph — perfil real). Usa média ponderada das coordenadas
// dos centros dos quadrantes para posicionar o ponto com nuance.
function calculateKraljic(scores) {
  scores = scores || { D: 0, I: 0, S: 0, C: 0 };
  const normalized = {
    D: Math.max(0, scores.D || 0),
    I: Math.max(0, scores.I || 0),
    S: Math.max(0, scores.S || 0),
    C: Math.max(0, scores.C || 0),
  };
  const total = (normalized.D + normalized.I + normalized.S + normalized.C) || 1;

  const impactoFinanceiro =
    (normalized.D * QUADRANT_CENTER.alavancagem.impactoFinanceiro +
      normalized.I * QUADRANT_CENTER.estrategico.impactoFinanceiro +
      normalized.S * QUADRANT_CENTER.gargalo.impactoFinanceiro +
      normalized.C * QUADRANT_CENTER.nao_criticos.impactoFinanceiro) / total;

  const riscoSuprimento =
    (normalized.D * QUADRANT_CENTER.alavancagem.riscoSuprimento +
      normalized.I * QUADRANT_CENTER.estrategico.riscoSuprimento +
      normalized.S * QUADRANT_CENTER.gargalo.riscoSuprimento +
      normalized.C * QUADRANT_CENTER.nao_criticos.riscoSuprimento) / total;

  // Ordena dimensões por força → quadrante dominante e secundário
  const sorted = ['D', 'I', 'S', 'C']
    .map(function (k) { return [k, normalized[k]]; })
    .sort(function (a, b) { return b[1] - a[1]; });

  const dominantQuadrant = DIMENSION_TO_QUADRANT[sorted[0][0]];
  // Secundário é relevante se tiver pelo menos 40% da força do dominante
  const hasSecondary = sorted[1][1] > 0 && sorted[0][1] > 0 &&
    sorted[1][1] >= sorted[0][1] * 0.4;
  const secondaryQuadrant = hasSecondary ? DIMENSION_TO_QUADRANT[sorted[1][0]] : null;

  const base = KRALJIC_PROFILES[dominantQuadrant];
  const positionLabel = secondaryQuadrant
    ? base.label + ', com puxada para ' + KRALJIC_PROFILES[secondaryQuadrant].label
    : base.label;

  return Object.assign({}, base, {
    axis: {
      impactoFinanceiro: Math.round(impactoFinanceiro),
      riscoSuprimento: Math.round(riscoSuprimento),
    },
    dominantQuadrant: dominantQuadrant,
    secondaryQuadrant: secondaryQuadrant,
    positionLabel: positionLabel,
  });
}

window.KRALJIC_PROFILES = KRALJIC_PROFILES;
window.calculateKraljic = calculateKraljic;
