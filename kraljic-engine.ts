import { Dimension, DiscScores } from "./disc-engine";

export type KraljicQuadrant =
  | "alavancagem"
  | "estrategico"
  | "gargalo"
  | "nao_criticos";

export interface KraljicAxis {
  impactoFinanceiro: number; // 0-100 (eixo Y)
  riscoSuprimento: number;   // 0-100 (eixo X)
}

export interface KraljicProfile {
  quadrant: KraljicQuadrant;
  label: string;
  axis: KraljicAxis;
  buyerPosture: string;          // como o comprador se posiciona
  whatHeWants: string[];         // o que ele quer do fornecedor
  whatToAvoid: string[];         // o que NUNCA fazer com ele
  negotiationLeverage: string;   // onde está o poder na negociação
  proposalFocus: string;         // foco da proposta comercial
  contractStyle: string;         // estilo de contrato/relação
  riskForVendor: string;         // risco do lado do vendedor
}

// Mapeamento DISC → Kraljic conforme regra Vorätte:
// D = Alavancagem | I = Estratégico | S = Gargalo | C = Não-críticos
const DIMENSION_TO_QUADRANT: Record<Dimension, KraljicQuadrant> = {
  D: "alavancagem",
  I: "estrategico",
  S: "gargalo",
  C: "nao_criticos",
};

// Posição no plano cartesiano da matriz (impacto x risco)
// Eixo Y = impacto financeiro | Eixo X = risco de suprimento
const QUADRANT_CENTER: Record<KraljicQuadrant, KraljicAxis> = {
  alavancagem:  { impactoFinanceiro: 75, riscoSuprimento: 25 }, // alto impacto, baixo risco
  estrategico:  { impactoFinanceiro: 75, riscoSuprimento: 75 }, // alto impacto, alto risco
  gargalo:      { impactoFinanceiro: 25, riscoSuprimento: 75 }, // baixo impacto, alto risco
  nao_criticos: { impactoFinanceiro: 25, riscoSuprimento: 25 }, // baixo impacto, baixo risco
};

export const KRALJIC_PROFILES: Record<KraljicQuadrant, Omit<KraljicProfile, "axis">> = {
  alavancagem: {
    quadrant: "alavancagem",
    label: "Alavancagem",
    buyerPosture:
      "Trata o fornecedor como commodity substituível. Tem poder de barganha alto e usa isso.",
    whatHeWants: [
      "Melhor preço do mercado",
      "Múltiplos fornecedores concorrendo",
      "Volume e desconto progressivo",
      "Negociação rápida e direta",
    ],
    whatToAvoid: [
      "Tentar criar dependência emocional",
      "Posicionar como 'parceria de longo prazo' sem dado",
      "Demorar para apresentar proposta final",
    ],
    negotiationLeverage:
      "Poder está com o comprador — ele tem alternativas e sabe disso",
    proposalFocus:
      "ROI direto, comparativo com concorrência, condições agressivas de volume",
    contractStyle:
      "Contratos curtos, com SLA mensurável e cláusulas de saída fáceis",
    riskForVendor:
      "Margem apertada e relação transacional — comprador troca por 5% de diferença",
  },
  estrategico: {
    quadrant: "estrategico",
    label: "Estratégico",
    buyerPosture:
      "Vê o fornecedor como parceiro de crescimento. Investe na relação porque depende dela.",
    whatHeWants: [
      "Co-criação e inovação conjunta",
      "Roadmap compartilhado",
      "Acesso a executivos do fornecedor",
      "Cases e visibilidade conjunta no mercado",
    ],
    whatToAvoid: [
      "Tratar como cliente comum",
      "Vender só pelo preço",
      "Não envolver liderança nas reuniões",
    ],
    negotiationLeverage:
      "Poder equilibrado — ambos dependem da relação",
    proposalFocus:
      "Plano plurianual, governança da parceria, projetos conjuntos, exclusividade",
    contractStyle:
      "Contratos longos, com QBRs, metas conjuntas e cláusulas de inovação",
    riskForVendor:
      "Investimento alto de relacionamento; perda do cliente é dolorosa",
  },
  gargalo: {
    quadrant: "gargalo",
    label: "Gargalo",
    buyerPosture:
      "Depende do fornecedor mesmo sem grande volume. Tem medo de ruptura.",
    whatHeWants: [
      "Garantia de fornecimento contínuo",
      "Estoque de segurança",
      "Previsibilidade total",
      "Suporte humano disponível",
    ],
    whatToAvoid: [
      "Pressionar por aumento de volume rápido",
      "Mudar contato/atendente sem aviso",
      "Apresentar mudanças bruscas no produto",
    ],
    negotiationLeverage:
      "Poder está com o fornecedor — comprador não quer (ou não pode) trocar",
    proposalFocus:
      "Garantias, SLA forte, suporte premium, plano de continuidade",
    contractStyle:
      "Contratos com cláusulas de continuidade, redundância e suporte 24/7",
    riskForVendor:
      "Cliente pode ser cobrado caro mas exige altíssimo nível de serviço",
  },
  nao_criticos: {
    quadrant: "Não-críticos",
    label: "Não-críticos",
    buyerPosture:
      "Trata a compra como processo. Quer eficiência, conformidade e zero atrito.",
    whatHeWants: [
      "Processo de compra automatizado",
      "Catálogo claro e previsível",
      "Documentação técnica completa",
      "Faturamento e entrega sem erros",
    ],
    whatToAvoid: [
      "Tentar criar relação pessoal forçada",
      "Vender storytelling sem dado",
      "Burocratizar o processo dele",
    ],
    negotiationLeverage:
      "Baixo de ambos os lados — decisão é por eficiência operacional",
    proposalFocus:
      "Padronização, automação de pedidos, contrato guarda-chuva, e-procurement",
    contractStyle:
      "Contratos padronizados, catálogo digital, integração com ERP",
    riskForVendor:
      "Margens baixas mas volume previsível; risco de virar commodity invisível",
  },
};

/**
 * Calcula a posição do comprador na matriz Kraljic
 * a partir dos scores DISC (changeGraph - perfil real).
 *
 * Em vez de classificar binariamente, usa os scores para posicionar
 * o ponto no plano cartesiano, permitindo nuance (ex: comprador
 * "quase Estratégico mas puxa pra Alavancagem").
 */
export function calculateKraljic(scores: DiscScores): KraljicProfile {
  // Normaliza scores (podem ser negativos pelo changeGraph)
  const normalized = {
    D: Math.max(0, scores.D),
    I: Math.max(0, scores.I),
    S: Math.max(0, scores.S),
    C: Math.max(0, scores.C),
  };

  const total =
    normalized.D + normalized.I + normalized.S + normalized.C || 1;

  // Cada dimensão "puxa" o ponto para o centro do seu quadrante
  // Resultado: posição ponderada no plano
  const impactoFinanceiro =
    (normalized.D * QUADRANT_CENTER.alavancagem.impactoFinanceiro +
      normalized.I * QUADRANT_CENTER.estrategico.impactoFinanceiro +
      normalized.S * QUADRANT_CENTER.gargalo.impactoFinanceiro +
      normalized.C * QUADRANT_CENTER.nao_criticos.impactoFinanceiro) /
    total;

  const riscoSuprimento =
    (normalized.D * QUADRANT_CENTER.alavancagem.riscoSuprimento +
      normalized.I * QUADRANT_CENTER.estrategico.riscoSuprimento +
      normalized.S * QUADRANT_CENTER.gargalo.riscoSuprimento +
      normalized.C * QUADRANT_CENTER.nao_criticos.riscoSuprimento) /
    total;

  // Define o quadrante dominante pela maior dimensão
  const sorted = (Object.entries(normalized) as [Dimension, number][])
    .sort((a, b) => b[1] - a[1]);
  const dominantQuadrant = DIMENSION_TO_QUADRANT[sorted[0][0]];

  return {
    ...KRALJIC_PROFILES[dominantQuadrant],
    axis: {
      impactoFinanceiro: Math.round(impactoFinanceiro),
      riscoSuprimento: Math.round(riscoSuprimento),
    },
  };
}
