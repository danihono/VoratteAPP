// Motor de Negociação Vorätte 4.0 — engine de regras (determinístico)
// Consome a base estática (window.MOTOR_*) de src/motor-data.jsx.
// NÃO gera texto: deriva o OBJETIVO de objeção × quadrante (MOTOR_REGRAS),
// lê diagnóstico/risco/estratégia/alavanca/próxima-ação do OBJETIVO (MOTOR_OBJETIVOS)
// e a frase de objetivo+perfil (MOTOR_FRASES). Perspectiva SEMPRE do comprador.
//
// Expõe: window.resolverNegociacao(input).
//
// Carrega DEPOIS de src/motor-data.jsx.

// ----- Normalização de entrada -----
function motorNormalizePerfil(p) {
  if (!p) return null;
  var up = String(p).trim().toUpperCase();
  return (up === 'D' || up === 'I' || up === 'S' || up === 'C') ? up : null;
}

function motorNormalizeQuadrante(q) {
  if (!q) return null;
  // aceita id canônico direto
  if (window.MOTOR_KRALJIC[q]) return q;
  var norm = window.motorNormalizeText(q).replace(/[-_]/g, ' ').trim();
  if (norm === 'alavancagem') return 'alavancagem';
  if (norm === 'estrategico') return 'estrategico';
  if (norm === 'gargalo') return 'gargalo';
  if (norm.indexOf('nao critic') === 0) return 'nao_criticos';
  return null;
}

function motorResolveObjecaoId(o) {
  if (!o) return null;
  var raw = String(o).trim();
  if (window.MOTOR_OBJECOES_BY_ID[raw]) return raw;
  var up = raw.toUpperCase();
  if (window.MOTOR_OBJECOES_BY_ID[up]) return up;
  var byText = window.MOTOR_OBJECOES_BY_TEXT[window.motorNormalizeText(raw)];
  return byText || null;
}

// ----- Saída de erro (entrada incompleta; nunca lança) -----
function motorSaidaErro(perfil, objecaoId, quadrante) {
  var faltas = [];
  if (!perfil) faltas.push('perfil DISC do vendedor não identificado (informe perfilDISC D/I/S/C)');
  if (!objecaoId) faltas.push('objeção não reconhecida (informe um id OBJ_xx válido ou o texto exato da objeção)');
  if (!quadrante) faltas.push('quadrante Kraljic não reconhecido (informe alavancagem/estrategico/gargalo/nao_criticos)');
  var detalhe = 'Não foi possível derivar a recomendação: ' + faltas.join('; ') + '.';
  return {
    objetivoPrimario: null,
    objetivoSecundario: null,
    diagnostico: detalhe,
    risco: 'Sem entrada suficiente, qualquer recomendação seria inventada — o motor opera apenas sobre a base canônica.',
    estrategia: 'Complete os dados de entrada (perfil, objeção e quadrante) para o motor derivar o objetivo na matriz de inferência.',
    alavanca: '—',
    frase: 'Preciso entender melhor o contexto antes de sugerir uma frase. Qual foi exatamente a objeção do fornecedor e o quadrante da categoria?',
    proximaAcao: 'Reenviar a consulta com perfil DISC, objeção e quadrante identificados.',
    reforco: null,
    origem: 'erro',
  };
}

// ----- Resolução principal (§7 da spec 4.0) -----
// input: { perfilDISC, objecaoId, quadranteKraljic }
// saída: { objetivoPrimario, objetivoSecundario, diagnostico, risco, estrategia,
//          alavanca, frase, proximaAcao, reforco, origem }
function resolverNegociacao(input) {
  input = input || {};

  var perfil = motorNormalizePerfil(input.perfilDISC);
  var objecaoId = motorResolveObjecaoId(input.objecaoId);
  var quadrante = motorNormalizeQuadrante(input.quadranteKraljic);

  if (!perfil || !objecaoId || !quadrante) {
    return motorSaidaErro(perfil, objecaoId, quadrante);
  }

  // (1) Derivar objetivo primário + secundário da matriz de inferência.
  var regra = window.MOTOR_REGRAS[objecaoId + '|' + quadrante];
  if (!regra) {
    // Toda combinação válida existe na matriz; se faltar, é erro de base.
    return motorSaidaErro(perfil, objecaoId, quadrante);
  }

  var obP = window.MOTOR_OBJETIVOS[regra.primario] || {};
  var obS = window.MOTOR_OBJETIVOS[regra.secundario] || {};

  // (2) Frase = objetivo primário + perfil DISC.
  var frase = window.MOTOR_FRASES[regra.primario + '|' + perfil] || '';

  // (3) Montar saída. O PRIMÁRIO define todos os campos; o SECUNDÁRIO entra
  // como bloco de reforço (complemento, não substituição).
  return {
    objetivoPrimario: { codigo: obP.codigo || regra.primario, nome: obP.nome || '' },
    objetivoSecundario: { codigo: obS.codigo || regra.secundario, nome: obS.nome || '' },
    diagnostico: obP.diagnostico || '',
    risco: obP.risco || '',
    estrategia: obP.estrategia || '',
    alavanca: obP.alavancaPrincipal || '',
    frase: frase,
    proximaAcao: obP.proximaAcao || '',
    reforco: {
      codigo: obS.codigo || regra.secundario,
      nome: obS.nome || '',
      diagnostico: obS.diagnostico || '',
      estrategia: obS.estrategia || '',
      proximaAcao: obS.proximaAcao || '',
    },
    origem: 'derivado',
  };
}

// ===== Exposição global =====
window.resolverNegociacao = resolverNegociacao;
