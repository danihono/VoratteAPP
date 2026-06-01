// Motor de Negociação Vorätte — engine de regras (determinístico)
// Consome a base estática (window.MOTOR_*) de src/motor-data.jsx.
// NÃO gera texto: faz lookup de caso exato → caso parcial → composição de
// fragmentos já escritos no doc (§24). Perspectiva SEMPRE do comprador.
//
// Expõe: window.resolverNegociacao(input), window.inferirPerfilDISC(sinais).
//
// Carrega DEPOIS de src/motor-data.jsx.

// Regra Vorätte DISC → quadrante (default quando o quadrante não é informado).
var MOTOR_DIMENSION_TO_QUADRANT = { D: 'alavancagem', I: 'estrategico', S: 'gargalo', C: 'nao_criticos' };
var MOTOR_NIVEIS_CONFIANCA = ['Baixa', 'Média', 'Alta'];

function motorDemoteConfianca(conf) {
  var idx = MOTOR_NIVEIS_CONFIANCA.indexOf(conf);
  if (idx <= 0) return 'Baixa';
  return MOTOR_NIVEIS_CONFIANCA[idx - 1];
}

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

function motorResolveObjetivoSlug(o) {
  if (!o) return null;
  var raw = String(o).trim();
  if (window.MOTOR_OBJETIVOS.slugs[raw]) return raw;
  var mapped = window.MOTOR_OBJETIVOS.mapaCasos[window.motorNormalizeText(raw)];
  return mapped || null;
}

// ----- Inferência de perfil DISC a partir de sinais observados (§9, §11) -----
function motorSplitSignals(sinais) {
  var arr;
  if (Array.isArray(sinais)) arr = sinais;
  else arr = String(sinais == null ? '' : sinais).split(/[\n;,.·|]+/);
  var out = [];
  arr.forEach(function (x) {
    var n = window.motorNormalizeText(x);
    if (n) out.push(n);
  });
  return out;
}

function motorSignalMatches(normSignal, phrase) {
  var p = window.motorNormalizeText(phrase);
  if (!p) return false;
  return normSignal.indexOf(p) !== -1;
}

function motorAjustarPara100(dist, score) {
  var soma = dist.D + dist.I + dist.S + dist.C;
  var diff = 100 - soma;
  if (diff === 0) return;
  var order = ['D', 'I', 'S', 'C'];
  var best = order[0];
  order.forEach(function (k) { if (score[k] > score[best]) best = k; });
  dist[best] += diff;
}

function inferirPerfilDISC(sinais) {
  // Conta SINAIS distintos por perfil (§9.1 mede quantidade de sinais coerentes,
  // não de palavras). Cada sinal de entrada vota no máximo uma vez por perfil —
  // evita inflar a contagem quando uma palavra-chave é substring de outra.
  var signals = motorSplitSignals(sinais);
  var score = { D: 0, I: 0, S: 0, C: 0 };
  var matched = { D: 0, I: 0, S: 0, C: 0 };

  ['D', 'I', 'S', 'C'].forEach(function (p) {
    var def = window.MOTOR_SINAIS[p];
    signals.forEach(function (sig) {
      var phraseHit = false, kwHit = false;
      for (var i = 0; i < def.sinais.length; i++) {
        if (motorSignalMatches(sig, def.sinais[i])) { phraseHit = true; break; }
      }
      if (!phraseHit) {
        for (var j = 0; j < def.palavrasChave.length; j++) {
          if (motorSignalMatches(sig, def.palavrasChave[j])) { kwHit = true; break; }
        }
      }
      if (phraseHit || kwHit) {
        matched[p] += 1;            // 1 sinal coerente a mais para esse perfil
        score[p] += phraseHit ? 2 : 1; // sinal-frase (§11) pesa mais que palavra-chave
      }
    });
  });

  var total = score.D + score.I + score.S + score.C;
  if (total === 0) {
    return {
      distribuicao: { D: 25, I: 25, S: 25, C: 25 },
      dominante: null,
      secundario: null,
      confianca: 'Baixa',
      sinaisDetectados: 0,
      score: score,
    };
  }

  var dist = {};
  ['D', 'I', 'S', 'C'].forEach(function (p) { dist[p] = Math.round(100 * score[p] / total); });
  motorAjustarPara100(dist, score);

  // Ordena por score (desempate estável D > I > S > C pela ordem do array)
  var sorted = ['D', 'I', 'S', 'C']
    .map(function (k) { return [k, score[k]]; })
    .sort(function (a, b) { return b[1] - a[1]; });

  var dominante = sorted[0][1] > 0 ? sorted[0][0] : null;
  var secundario = sorted[1][1] > 0 ? sorted[1][0] : null;

  // Confiança pela QUANTIDADE de sinais coerentes do dominante (§9.1):
  // 1 → Baixa · 2–3 → Média · 4+ → Alta
  var n = dominante ? matched[dominante] : 0;
  var confianca = n >= 4 ? 'Alta' : n >= 2 ? 'Média' : 'Baixa';

  return {
    distribuicao: dist,
    dominante: dominante,
    secundario: secundario,
    confianca: confianca,
    sinaisDetectados: n,
    score: score,
  };
}

// ----- Construção das saídas -----
function motorSaidaDeCaso(caso, origem, confianca) {
  return {
    diagnostico: caso.diagnostico,
    risco: caso.risco,
    estrategia: caso.estrategia,
    frase: caso.frase,
    proximaAcao: caso.proximaAcao,
    origem: origem,
    confianca: confianca,
    casoId: caso.id,
  };
}

function motorComporSaida(perfil, objecaoId, quadrante, confiancaBase, quadranteDefaulted) {
  var obj = window.MOTOR_OBJECOES_BY_ID[objecaoId];
  var quad = window.MOTOR_KRALJIC[quadrante];
  var disc = window.MOTOR_DISC[perfil];
  var respostas = window.MOTOR_RESPOSTAS[objecaoId] || {};
  var frase = respostas[perfil] || '';

  // Estratégia = fragmentos do doc (§15) recosturados de modo que o ESTILO do
  // perfil MODULE a estratégia do quadrante (o "Uso do DISC" é o COMO, não uma
  // segunda ordem que possa contradizê-la). Gatilhos limitados aos 3 principais.
  // Nenhum dado é inventado — só conectores estruturais.
  var usoDISC = quad.usoDISC[perfil];
  if (usoDISC.charAt(usoDISC.length - 1) === '.') usoDISC = usoDISC.slice(0, usoDISC.length - 1);
  var topGatilhos = disc.gatilhos.slice(0, 3);
  var estrategia = 'Estratégia do quadrante: ' + quad.estrategia +
    ' Ao conduzir com um vendedor de perfil ' + perfil + ' (' + disc.nome + '): ' +
    usoDISC + ' — apoiando-se em ' + topGatilhos.join(', ') + '.';

  var confianca = confiancaBase || 'Média';
  if (quadranteDefaulted) confianca = motorDemoteConfianca(confianca);

  return {
    diagnostico: obj.diagnostico,
    risco: obj.riscoComprador,
    estrategia: estrategia,
    frase: frase,
    proximaAcao: obj.proximaAcao,
    origem: 'composto',
    confianca: confianca,
    casoId: null,
  };
}

function motorSaidaErro(perfil, objecaoId) {
  var faltas = [];
  if (!perfil) faltas.push('perfil DISC do vendedor não identificado (informe perfilDISC D/I/S/C ou sinais observados)');
  if (!objecaoId) faltas.push('objeção não reconhecida (informe um id OBJ_xx válido ou o texto exato da objeção)');
  var detalhe = 'Não foi possível resolver a recomendação: ' + faltas.join('; ') + '.';
  return {
    diagnostico: detalhe,
    risco: 'Sem entrada suficiente, qualquer recomendação seria inventada — o motor opera apenas sobre a base canônica.',
    estrategia: 'Complete os dados de entrada (perfil e objeção) para o motor fazer o lookup determinístico na base.',
    frase: 'Preciso entender melhor o contexto antes de sugerir uma frase. Qual foi exatamente a objeção do fornecedor?',
    proximaAcao: 'Reenviar a consulta com o perfil DISC (ou sinais observados) e a objeção identificada.',
    origem: 'erro',
    confianca: 'Baixa',
    casoId: null,
  };
}

// ----- Resolução principal -----
// input: { perfilDISC, objecaoId, quadranteKraljic, objetivoComprador, sinais? }
// saída: { diagnostico, risco, estrategia, frase, proximaAcao, origem, confianca, casoId }
function resolverNegociacao(input) {
  input = input || {};

  var perfil = motorNormalizePerfil(input.perfilDISC);
  var confiancaInferida = null;
  if (!perfil && input.sinais != null) {
    var inf = inferirPerfilDISC(input.sinais);
    perfil = inf.dominante;
    confiancaInferida = inf.confianca;
  }

  var objecaoId = motorResolveObjecaoId(input.objecaoId);

  if (!perfil || !objecaoId) {
    return motorSaidaErro(perfil, objecaoId);
  }

  var quadrante = motorNormalizeQuadrante(input.quadranteKraljic);
  var quadranteDefaulted = false;
  if (!quadrante) {
    quadrante = MOTOR_DIMENSION_TO_QUADRANT[perfil];
    quadranteDefaulted = true;
  }

  var objetivo = motorResolveObjetivoSlug(input.objetivoComprador);

  // (1) Caso exato
  var key = perfil + '|' + objecaoId + '|' + quadrante + '|' + objetivo;
  var caso = window.MOTOR_CASOS_BY_KEY[key];
  if (caso) {
    return motorSaidaDeCaso(caso, 'caso-exato', 'Alta');
  }

  // (2) Caso parcial (mesmo perfil + objeção; ignora quadrante/objetivo)
  var lista = window.MOTOR_CASOS_BY_PERFIL_OBJ[perfil + '|' + objecaoId];
  if (lista && lista.length) {
    return motorSaidaDeCaso(lista[0], 'caso-base', 'Média');
  }

  // (3) Composição determinística por blocos
  return motorComporSaida(perfil, objecaoId, quadrante, confiancaInferida, quadranteDefaulted);
}

// ===== Exposição global =====
window.inferirPerfilDISC = inferirPerfilDISC;
window.resolverNegociacao = resolverNegociacao;
