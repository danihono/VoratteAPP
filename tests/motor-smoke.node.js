// Espelho Node (headless) do tests/motor-smoke.html — Motor Vorätte 4.0.
// Valida o motor sem navegador (CI-friendly).
//   node tests/motor-smoke.node.js   -> sai 0 se ALL PASS, 1 se houver falha.
// As fontes src/motor-data.jsx / src/motor-engine.jsx são JS puro (sem JSX),
// então rodam direto sob Node com um shim de window.

const fs = require('fs');
const path = require('path');

global.window = {};

const root = path.resolve(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(root, 'src', 'motor-data.jsx'), 'utf8');
const engineSrc = fs.readFileSync(path.join(root, 'src', 'motor-engine.jsx'), 'utf8');

// eslint-disable-next-line no-eval
eval(dataSrc);
// eslint-disable-next-line no-eval
eval(engineSrc);

var pass = 0, fail = 0, fails = [];
function assert(label, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(label + (detail ? '\n     ' + detail : '')); }
}
function assertEq(label, actual, expected) {
  var ok = actual === expected;
  assert(label, ok, ok ? '' : 'esperado: ' + JSON.stringify(expected) + ' | obtido: ' + JSON.stringify(actual));
}
function isNonEmptyStr(v) { return typeof v === 'string' && v.trim().length > 0; }
function camposCheios(r) {
  return isNonEmptyStr(r.diagnostico) && isNonEmptyStr(r.risco) && isNonEmptyStr(r.estrategia) &&
    isNonEmptyStr(r.alavanca) && isNonEmptyStr(r.frase) && isNonEmptyStr(r.proximaAcao) &&
    isNonEmptyStr(r.origem) &&
    r.reforco && isNonEmptyStr(r.reforco.estrategia) && isNonEmptyStr(r.reforco.proximaAcao);
}

var MOTOR_OBJECOES = window.MOTOR_OBJECOES;
var MOTOR_OBJECOES_BY_ID = window.MOTOR_OBJECOES_BY_ID;
var MOTOR_RESPOSTAS = window.MOTOR_RESPOSTAS;
var MOTOR_KRALJIC = window.MOTOR_KRALJIC;
var MOTOR_OBJETIVOS = window.MOTOR_OBJETIVOS;
var MOTOR_REGRAS = window.MOTOR_REGRAS;
var MOTOR_FRASES = window.MOTOR_FRASES;
var resolver = window.resolverNegociacao;
var QUADS = ['alavancagem', 'estrategico', 'gargalo', 'nao_criticos'];
var PERFIS = ['D', 'I', 'S', 'C'];

// ===== A. Integridade da base =====
assert('motor-data + engine no window', !!MOTOR_REGRAS && !!resolver);
assertEq('21 objeções', MOTOR_OBJECOES.length, 21);
var idsSeen = {}, idFmtOk = true, idsOk = true;
MOTOR_OBJECOES.forEach(function (o) {
  if (!/^OBJ_\d\d$/.test(o.id)) idFmtOk = false;
  if (idsSeen[o.id]) idsOk = false;
  idsSeen[o.id] = true;
});
assert('IDs OBJ_dd', idFmtOk);
assert('IDs únicos', idsOk);

// MOTOR_RESPOSTAS continua VIVO (Relatório §06 + PDF §07 exibem OBJ_01/OBJ_03).
var respKeys = Object.keys(MOTOR_RESPOSTAS);
assertEq('21 chaves de resposta (vivas p/ PDF/Relatório)', respKeys.length, 21);
var resp84Ok = true;
respKeys.forEach(function (k) { PERFIS.forEach(function (p) { if (!isNonEmptyStr(MOTOR_RESPOSTAS[k][p])) resp84Ok = false; }); });
assert('84 respostas não-vazias', resp84Ok);

// MOTOR_KRALJIC.usoDISC continua VIVO (Kraljic/Relatório/PDF).
var krOk = QUADS.every(function (q) { var k = MOTOR_KRALJIC[q]; return k && k.usoDISC && k.usoDISC.D && k.usoDISC.I && k.usoDISC.S && k.usoDISC.C && isNonEmptyStr(k.label); });
assert('Kraljic usoDISC + label completos', krOk);

// TB_OBJETIVOS (20) enriquecidos.
var objKeys = Object.keys(MOTOR_OBJETIVOS);
assertEq('20 objetivos', objKeys.length, 20);
var objCamposOk = true, objCodeOk = true;
objKeys.forEach(function (code) {
  var o = MOTOR_OBJETIVOS[code];
  if (o.codigo !== code) objCodeOk = false;
  if (!/^OBJ\d\d$/.test(code)) objCodeOk = false;
  if (!(isNonEmptyStr(o.nome) && isNonEmptyStr(o.categoria) && isNonEmptyStr(o.diagnostico) &&
        isNonEmptyStr(o.risco) && isNonEmptyStr(o.estrategia) && isNonEmptyStr(o.alavancaPrincipal) &&
        isNonEmptyStr(o.proximaAcao))) objCamposOk = false;
});
assert('objetivo.codigo === chave (OBJdd)', objCodeOk);
assert('objetivos com 8 campos não-vazios', objCamposOk);

// TB_REGRAS_INFERENCIA (84) — cobertura total 21×4 + apontamentos válidos.
var regraKeys = Object.keys(MOTOR_REGRAS);
assertEq('84 regras de inferência', regraKeys.length, 84);
var coberturaOk = true, regraRefOk = true;
MOTOR_OBJECOES.forEach(function (o) {
  QUADS.forEach(function (q) {
    var key = o.id + '|' + q;
    var rule = MOTOR_REGRAS[key];
    if (!rule) { coberturaOk = false; return; }
    if (!MOTOR_OBJETIVOS[rule.primario] || !MOTOR_OBJETIVOS[rule.secundario]) regraRefOk = false;
  });
});
assert('cobertura 21 objeções × 4 quadrantes', coberturaOk);
assert('regras apontam para objetivos válidos', regraRefOk);

// TB_FRASES_DISC (80) — 20 objetivos × 4 perfis.
assertEq('80 frases DISC', Object.keys(MOTOR_FRASES).length, 80);
var frasesOk = true;
objKeys.forEach(function (code) {
  PERFIS.forEach(function (p) { if (!isNonEmptyStr(MOTOR_FRASES[code + '|' + p])) frasesOk = false; });
});
assert('todas as 80 frases não-vazias', frasesOk);

// ===== B. NÚCLEO — 84 regras × 4 perfis = 336 saídas completas =====
var n336 = 0, derivadoOk = true, cheiosOk = true, fraseOk = true, objMapOk = true, campoObjOk = true;
regraKeys.forEach(function (key) {
  var parts = key.split('|');
  var objId = parts[0], quad = parts[1];
  var rule = MOTOR_REGRAS[key];
  PERFIS.forEach(function (p) {
    n336++;
    var r = resolver({ perfilDISC: p, objecaoId: objId, quadranteKraljic: quad });
    if (r.origem !== 'derivado') derivadoOk = false;
    if (!camposCheios(r)) cheiosOk = false;
    if (!r.objetivoPrimario || r.objetivoPrimario.codigo !== rule.primario) objMapOk = false;
    if (!r.objetivoSecundario || r.objetivoSecundario.codigo !== rule.secundario) objMapOk = false;
    if (r.frase !== MOTOR_FRASES[rule.primario + '|' + p]) fraseOk = false;
    var obP = MOTOR_OBJETIVOS[rule.primario];
    if (r.diagnostico !== obP.diagnostico || r.risco !== obP.risco || r.estrategia !== obP.estrategia ||
        r.alavanca !== obP.alavancaPrincipal || r.proximaAcao !== obP.proximaAcao) campoObjOk = false;
  });
});
assertEq('336 combinações avaliadas', n336, 336);
assert('336 · origem = derivado', derivadoOk);
assert('336 · todos os campos cheios (inclui alavanca + reforço)', cheiosOk);
assert('336 · objetivo primário/secundário batem com a matriz', objMapOk);
assert('336 · frase = FRASES[primário|perfil]', fraseOk);
assert('336 · diag/risco/estratégia/alavanca/próxima = objetivo primário', campoObjOk);

// ===== C. Determinismo =====
var det = { perfilDISC: 'C', objecaoId: 'OBJ_18', quadranteKraljic: 'estrategico' };
assertEq('determinismo (mesma entrada → mesmo JSON)', JSON.stringify(resolver(det)), JSON.stringify(resolver(det)));

// ===== D. Normalização de entrada =====
var rNorm = resolver({ perfilDISC: 'd', objecaoId: 'Esse é o nosso preço padrão', quadranteKraljic: 'Alavancagem' });
assertEq('texto+label+minúsculo → OBJ01 primário', rNorm.objetivoPrimario && rNorm.objetivoPrimario.codigo, 'OBJ01');
assertEq('… secundário OBJ02', rNorm.objetivoSecundario && rNorm.objetivoSecundario.codigo, 'OBJ02');
assertEq('… origem derivado', rNorm.origem, 'derivado');
var rNorm2 = resolver({ perfilDISC: 'S', objecaoId: 'OBJ_18', quadranteKraljic: 'Não Crítico' });
assertEq('label "Não Crítico" normaliza p/ nao_criticos', rNorm2.objetivoPrimario && rNorm2.objetivoPrimario.codigo, 'OBJ19');

// ===== E. Caminho de erro (entrada incompleta; nunca lança) =====
var invalidos = [
  {},
  { perfilDISC: 'X', objecaoId: 'OBJ_01', quadranteKraljic: 'alavancagem' },
  { perfilDISC: 'D', objecaoId: 'OBJ_999', quadranteKraljic: 'alavancagem' },
  { perfilDISC: 'D', objecaoId: 'OBJ_01' }, // sem quadrante
];
var erroThrew = false, todosErro = true;
invalidos.forEach(function (inp) {
  var r;
  try { r = resolver(inp); } catch (e) { erroThrew = true; return; }
  if (r.origem !== 'erro') todosErro = false;
  if (!(isNonEmptyStr(r.diagnostico) && isNonEmptyStr(r.risco) && isNonEmptyStr(r.estrategia) &&
        isNonEmptyStr(r.alavanca) && isNonEmptyStr(r.frase) && isNonEmptyStr(r.proximaAcao))) todosErro = false;
});
assert('inválidos não lançam', !erroThrew);
assert('inválidos → origem erro com campos preenchidos', todosErro);

// ===== F. Anti-transcrição — linhas conhecidas da matriz (spec §5) =====
function regra(objId, quad) { var r = MOTOR_REGRAS[objId + '|' + quad]; return r ? r.primario + '/' + r.secundario : '(faltando)'; }
assertEq('OBJ_08|alavancagem', regra('OBJ_08', 'alavancagem'), 'OBJ01/OBJ02');
assertEq('OBJ_18|estrategico', regra('OBJ_18', 'estrategico'), 'OBJ10/OBJ14');
assertEq('OBJ_01|gargalo', regra('OBJ_01', 'gargalo'), 'OBJ08/OBJ11');
assertEq('OBJ_15|alavancagem', regra('OBJ_15', 'alavancagem'), 'OBJ06/OBJ04');
assertEq('OBJ_20|nao_criticos', regra('OBJ_20', 'nao_criticos'), 'OBJ17/OBJ19');
assertEq('OBJ_14|gargalo', regra('OBJ_14', 'gargalo'), 'OBJ11/OBJ08');

// ===== Resumo =====
var total = pass + fail;
if (fail === 0) {
  console.log('ALL PASS (' + pass + '/' + total + ')');
  process.exit(0);
} else {
  console.log('FAILED: ' + fail + ' de ' + total + ' (passaram ' + pass + ')');
  fails.forEach(function (f) { console.log('  FAIL ' + f); });
  process.exit(1);
}
