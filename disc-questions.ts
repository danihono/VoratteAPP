// Banco DISC - 24 questões, 4 adjetivos cada
// Balanceado: cada dimensão (D/I/S/C) aparece exatamente 24 vezes no total

export type Dimension = "D" | "I" | "S" | "C";

export interface DiscOption {
  word: string;
  dimension: Dimension;
}

export interface DiscQuestion {
  id: number;
  options: DiscOption[];
}

export const DISC_QUESTIONS: DiscQuestion[] = [
  {
    id: 1,
    options: [
      { word: "Decidido",     dimension: "D" },
      { word: "Entusiasmado", dimension: "I" },
      { word: "Paciente",     dimension: "S" },
      { word: "Analítico",    dimension: "C" },
    ],
  },
  {
    id: 2,
    options: [
      { word: "Direto",       dimension: "D" },
      { word: "Comunicativo", dimension: "I" },
      { word: "Calmo",        dimension: "S" },
      { word: "Cuidadoso",    dimension: "C" },
    ],
  },
  {
    id: 3,
    options: [
      { word: "Competitivo",  dimension: "D" },
      { word: "Persuasivo",   dimension: "I" },
      { word: "Leal",         dimension: "S" },
      { word: "Preciso",      dimension: "C" },
    ],
  },
  {
    id: 4,
    options: [
      { word: "Determinado",  dimension: "D" },
      { word: "Otimista",     dimension: "I" },
      { word: "Estável",      dimension: "S" },
      { word: "Lógico",       dimension: "C" },
    ],
  },
  {
    id: 5,
    options: [
      { word: "Ousado",       dimension: "D" },
      { word: "Sociável",     dimension: "I" },
      { word: "Cooperativo",  dimension: "S" },
      { word: "Detalhista",   dimension: "C" },
    ],
  },
  {
    id: 6,
    options: [
      { word: "Exigente",     dimension: "D" },
      { word: "Animado",      dimension: "I" },
      { word: "Confiável",    dimension: "S" },
      { word: "Disciplinado", dimension: "C" },
    ],
  },
  {
    id: 7,
    options: [
      { word: "Independente", dimension: "D" },
      { word: "Espontâneo",   dimension: "I" },
      { word: "Tranquilo",    dimension: "S" },
      { word: "Sistemático",  dimension: "C" },
    ],
  },
  {
    id: 8,
    options: [
      { word: "Objetivo",     dimension: "D" },
      { word: "Carismático",  dimension: "I" },
      { word: "Gentil",       dimension: "S" },
      { word: "Rigoroso",     dimension: "C" },
    ],
  },
  {
    id: 9,
    options: [
      { word: "Confiante",    dimension: "D" },
      { word: "Expressivo",   dimension: "I" },
      { word: "Compreensivo", dimension: "S" },
      { word: "Cauteloso",    dimension: "C" },
    ],
  },
  {
    id: 10,
    options: [
      { word: "Assertivo",    dimension: "D" },
      { word: "Inspirador",   dimension: "I" },
      { word: "Acolhedor",    dimension: "S" },
      { word: "Metódico",     dimension: "C" },
    ],
  },
  {
    id: 11,
    options: [
      { word: "Resoluto",     dimension: "D" },
      { word: "Brincalhão",   dimension: "I" },
      { word: "Prestativo",   dimension: "S" },
      { word: "Organizado",   dimension: "C" },
    ],
  },
  {
    id: 12,
    options: [
      { word: "Ambicioso",    dimension: "D" },
      { word: "Extrovertido", dimension: "I" },
      { word: "Harmonioso",   dimension: "S" },
      { word: "Reservado",    dimension: "C" },
    ],
  },
  {
    id: 13,
    options: [
      { word: "Enérgico",     dimension: "D" },
      { word: "Convincente",  dimension: "I" },
      { word: "Sereno",       dimension: "S" },
      { word: "Crítico",      dimension: "C" },
    ],
  },
  {
    id: 14,
    options: [
      { word: "Firme",        dimension: "D" },
      { word: "Empolgado",    dimension: "I" },
      { word: "Atencioso",    dimension: "S" },
      { word: "Conservador",  dimension: "C" },
    ],
  },
  {
    id: 15,
    options: [
      { word: "Pragmático",   dimension: "D" },
      { word: "Amigável",     dimension: "I" },
      { word: "Modesto",      dimension: "S" },
      { word: "Perfeccionista", dimension: "C" },
    ],
  },
  {
    id: 16,
    options: [
      { word: "Líder",        dimension: "D" },
      { word: "Aberto",       dimension: "I" },
      { word: "Diplomático",  dimension: "S" },
      { word: "Investigativo", dimension: "C" },
    ],
  },
  {
    id: 17,
    options: [
      { word: "Audacioso",    dimension: "D" },
      { word: "Caloroso",     dimension: "I" },
      { word: "Solidário",    dimension: "S" },
      { word: "Diligente",    dimension: "C" },
    ],
  },
  {
    id: 18,
    options: [
      { word: "Veloz",        dimension: "D" },
      { word: "Encantador",   dimension: "I" },
      { word: "Constante",    dimension: "S" },
      { word: "Reflexivo",    dimension: "C" },
    ],
  },
  {
    id: 19,
    options: [
      { word: "Inquieto",     dimension: "D" },
      { word: "Falante",      dimension: "I" },
      { word: "Equilibrado",  dimension: "S" },
      { word: "Formal",       dimension: "C" },
    ],
  },
  {
    id: 20,
    options: [
      { word: "Impetuoso",    dimension: "D" },
      { word: "Magnético",    dimension: "I" },
      { word: "Discreto",     dimension: "S" },
      { word: "Racional",     dimension: "C" },
    ],
  },
  {
    id: 21,
    options: [
      { word: "Corajoso",     dimension: "D" },
      { word: "Divertido",    dimension: "I" },
      { word: "Receptivo",    dimension: "S" },
      { word: "Estruturado",  dimension: "C" },
    ],
  },
  {
    id: 22,
    options: [
      { word: "Insistente",   dimension: "D" },
      { word: "Popular",      dimension: "I" },
      { word: "Gentileza",    dimension: "S" },
      { word: "Padronizado",  dimension: "C" },
    ],
  },
  {
    id: 23,
    options: [
      { word: "Forte",        dimension: "D" },
      { word: "Vibrante",     dimension: "I" },
      { word: "Bondoso",      dimension: "S" },
      { word: "Exato",        dimension: "C" },
    ],
  },
  {
    id: 24,
    options: [
      { word: "Imediato",     dimension: "D" },
      { word: "Sociável",     dimension: "I" },
      { word: "Sensível",     dimension: "S" },
      { word: "Minucioso",    dimension: "C" },
    ],
  },
];
