// Espelho Node (headless) do tests/motor-smoke.html — mesmas asserções.
// Permite validar o motor sem navegador (CI-friendly).
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
         isNonEmptyStr(r.frase) && isNonEmptyStr(r.proximaAcao) && isNonEmptyStr(r.origem) && isNonEmptyStr(r.confianca);
}

var MOTOR_CASOS = window.MOTOR_CASOS;
var MOTOR_OBJECOES = window.MOTOR_OBJECOES;
var MOTOR_OBJECOES_BY_ID = window.MOTOR_OBJECOES_BY_ID;
var MOTOR_RESPOSTAS = window.MOTOR_RESPOSTAS;
var MOTOR_KRALJIC = window.MOTOR_KRALJIC;
var MOTOR_OBJETIVOS = window.MOTOR_OBJETIVOS;
var resolver = window.resolverNegociacao;
var inferir = window.inferirPerfilDISC;
var QUADS = ['alavancagem', 'estrategico', 'gargalo', 'nao_criticos'];

// A. Integridade
assert('motor-data + engine no window', !!MOTOR_CASOS && !!resolver);
assertEq('21 objeções', MOTOR_OBJECOES.length, 21);
var idsSeen = {}, idsOk = true, idFmtOk = true;
MOTOR_OBJECOES.forEach(function (o) {
  if (!/^OBJ_\d\d$/.test(o.id)) idFmtOk = false;
  if (idsSeen[o.id]) idsOk = false;
  idsSeen[o.id] = true;
});
assert('IDs OBJ_dd', idFmtOk);
assert('IDs únicos', idsOk);
var respKeys = Object.keys(MOTOR_RESPOSTAS);
assertEq('21 chaves de resposta', respKeys.length, 21);
var resp84Ok = true;
respKeys.forEach(function (k) { ['D', 'I', 'S', 'C'].forEach(function (p) { if (!isNonEmptyStr(MOTOR_RESPOSTAS[k][p])) resp84Ok = false; }); });
assert('84 respostas não-vazias', resp84Ok);
assertEq('20 casos', MOTOR_CASOS.length, 20);
var perfilCount = { D: 0, I: 0, S: 0, C: 0 };
MOTOR_CASOS.forEach(function (c) { perfilCount[c.perfil]++; });
assert('5 casos por perfil', perfilCount.D === 5 && perfilCount.I === 5 && perfilCount.S === 5 && perfilCount.C === 5, JSON.stringify(perfilCount));
var refsOk = true;
MOTOR_CASOS.forEach(function (c) {
  if (QUADS.indexOf(c.quadrante) === -1) refsOk = false;
  if (!MOTOR_OBJECOES_BY_ID[c.objecaoId]) refsOk = false;
  if (!MOTOR_OBJETIVOS.slugs[c.objetivo]) refsOk = false;
});
assert('refs de casos válidas', refsOk);
var krOk = QUADS.every(function (q) { var k = MOTOR_KRALJIC[q]; return k && k.usoDISC && k.usoDISC.D && k.usoDISC.I && k.usoDISC.S && k.usoDISC.C; });
assert('Kraljic usoDISC completo', krOk);
var slugKeys = Object.keys(MOTOR_OBJETIVOS.slugs);
assertEq('20 slugs de objetivo', slugKeys.length, 20);
assert('todo slug tem família', slugKeys.every(function (s) { return isNonEmptyStr(MOTOR_OBJETIVOS.familias[s]); }));

// B. Headline — 20/20 caso-exato
MOTOR_CASOS.forEach(function (c) {
  var r = resolver({ perfilDISC: c.perfil, objecaoId: c.objecaoId, quadranteKraljic: c.quadrante, objetivoComprador: c.objetivo });
  var ok = r.origem === 'caso-exato' && r.diagnostico === c.diagnostico && r.risco === c.risco &&
    r.estrategia === c.estrategia && r.frase === c.frase && r.proximaAcao === c.proximaAcao;
  assert(c.id + ' caso-exato fiel', ok, ok ? '' : 'origem=' + r.origem + ' casoId=' + r.casoId);
});

// C. Composição off-grid
var offgrid = [
  { perfilDISC: 'S', objecaoId: 'OBJ_01', quadranteKraljic: 'nao_criticos', objetivoComprador: 'viabilizar_compra_baixo_esforco' },
  { perfilDISC: 'C', objecaoId: 'OBJ_06', quadranteKraljic: 'gargalo', objetivoComprador: 'reduzir_risco_suprimento' },
  { perfilDISC: 'I', objecaoId: 'OBJ_14', quadranteKraljic: 'alavancagem', objetivoComprador: 'capturar_saving' },
  { perfilDISC: 'D', objecaoId: 'OBJ_05', quadranteKraljic: 'alavancagem', objetivoComprador: 'capturar_saving' },
  { perfilDISC: 'S', objecaoId: 'OBJ_21', quadranteKraljic: 'estrategico', objetivoComprador: 'preservar_parceria' },
  { perfilDISC: 'C', objecaoId: 'OBJ_02', quadranteKraljic: 'estrategico', objetivoComprador: 'validar_diferenciacao' }
];
offgrid.forEach(function (inp) {
  var r = resolver(inp);
  var tag = inp.perfilDISC + '/' + inp.objecaoId;
  assert(tag + ' composto', r.origem === 'composto', 'origem=' + r.origem);
  assert(tag + ' campos cheios', camposCheios(r));
  assertEq(tag + ' frase=resposta-perfil', r.frase, MOTOR_RESPOSTAS[inp.objecaoId][inp.perfilDISC]);
  assertEq(tag + ' diag=objeção', r.diagnostico, MOTOR_OBJECOES_BY_ID[inp.objecaoId].diagnostico);
  assertEq(tag + ' próxima=objeção', r.proximaAcao, MOTOR_OBJECOES_BY_ID[inp.objecaoId].proximaAcao);
});

// D. Parcial
var rp = resolver({ perfilDISC: 'D', objecaoId: 'OBJ_01', quadranteKraljic: 'estrategico', objetivoComprador: 'validar_valor_real' });
assert('parcial caso-base', rp.origem === 'caso-base', 'origem=' + rp.origem);
assertEq('parcial usa CASE_D_01', rp.casoId, 'CASE_D_01');
assert('parcial campos cheios', camposCheios(rp));

// E. Inferência
var e1 = inferir(['Pediu benchmark']);
assertEq('1 sinal dominante C', e1.dominante, 'C');
assertEq('1 sinal Baixa', e1.confianca, 'Baixa');
var e3 = inferir(['benchmark', 'metodologia', 'planilha']);
assertEq('3 sinais dominante C', e3.dominante, 'C');
assertEq('3 sinais Média', e3.confianca, 'Média');
var e4 = inferir(['Pediu benchmark', 'Questionou metodologia', 'Solicitou planilha', 'Pediu base de cálculo']);
assertEq('4 sinais dominante C', e4.dominante, 'C');
assertEq('4 sinais Alta', e4.confianca, 'Alta');
assertEq('distribuição soma 100', e4.distribuicao.D + e4.distribuicao.I + e4.distribuicao.S + e4.distribuicao.C, 100);
var threw = false, e0 = null;
try { e0 = inferir([]); } catch (err) { threw = true; }
assert('vazio não lança', !threw);
if (e0) { assertEq('vazio dominante null', e0.dominante, null); assertEq('vazio Baixa', e0.confianca, 'Baixa'); }

// F. Robustez / ética / determinismo
var todas = MOTOR_CASOS.map(function (c) { return resolver({ perfilDISC: c.perfil, objecaoId: c.objecaoId, quadranteKraljic: c.quadrante, objetivoComprador: c.objetivo }); }).concat(offgrid.map(resolver)).concat([rp]);
assert('nenhum campo vazio em qualquer saída', todas.every(camposCheios));
var invalidos = [{}, { perfilDISC: 'X' }, { perfilDISC: 'D', objecaoId: 'OBJ_999' }, { objecaoId: 'OBJ_01' }];
var erroThrew = false, todosErro = true;
invalidos.forEach(function (inp) {
  var r;
  try { r = resolver(inp); } catch (err) { erroThrew = true; return; }
  if (r.origem !== 'erro') todosErro = false;
  if (!isNonEmptyStr(r.diagnostico) || !isNonEmptyStr(r.risco) || !isNonEmptyStr(r.estrategia) || !isNonEmptyStr(r.frase) || !isNonEmptyStr(r.proximaAcao)) todosErro = false;
});
assert('inválidos não lançam', !erroThrew);
assert('inválidos → origem erro com campos', todosErro);
assertEq('determinismo da composição', JSON.stringify(resolver(offgrid[0])), JSON.stringify(resolver(offgrid[0])));

// G. Normalização + integração
var rTexto = resolver({ perfilDISC: 'd', objecaoId: 'Já estamos no limite de preço', quadranteKraljic: 'Alavancagem', objetivoComprador: 'Capturar saving' });
assertEq('texto/label/verboso → CASE_D_01', rTexto.casoId, 'CASE_D_01');
assertEq('… caso-exato', rTexto.origem, 'caso-exato');
var rInf = resolver({ sinais: ['Pediu benchmark', 'Questionou metodologia', 'Solicitou planilha', 'Pediu base de cálculo'], objecaoId: 'OBJ_07', quadranteKraljic: 'alavancagem', objetivoComprador: 'validar_competitividade' });
assertEq('perfil inferido C + tupla → CASE_C_01', rInf.casoId, 'CASE_C_01');

// Resumo
var total = pass + fail;
if (fail === 0) {
  console.log('ALL PASS (' + pass + '/' + total + ')');
  process.exit(0);
} else {
  console.log('FAILED: ' + fail + ' de ' + total + ' (passaram ' + pass + ')');
  fails.forEach(function (f) { console.log('  FAIL ' + f); });
  process.exit(1);
}
