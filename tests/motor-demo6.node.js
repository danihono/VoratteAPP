// Demo (Motor 4.0): 6 saídas derivadas de tuplas variadas (revisão de qualidade).
//   node tests/motor-demo6.node.js
const fs = require('fs');
const path = require('path');
global.window = {};
const root = path.resolve(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'src', 'motor-data.jsx'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'src', 'motor-engine.jsx'), 'utf8'));

var TUPLAS = [
  { perfilDISC: 'D', objecaoId: 'OBJ_08', quadranteKraljic: 'nao_criticos' },
  { perfilDISC: 'I', objecaoId: 'OBJ_11', quadranteKraljic: 'gargalo' },
  { perfilDISC: 'S', objecaoId: 'OBJ_01', quadranteKraljic: 'alavancagem' },
  { perfilDISC: 'C', objecaoId: 'OBJ_18', quadranteKraljic: 'estrategico' },
  { perfilDISC: 'D', objecaoId: 'OBJ_16', quadranteKraljic: 'gargalo' },
  { perfilDISC: 'I', objecaoId: 'OBJ_21', quadranteKraljic: 'alavancagem' }
];

TUPLAS.forEach(function (t, i) {
  var obj = window.MOTOR_OBJECOES_BY_ID[t.objecaoId];
  var quad = window.MOTOR_KRALJIC[t.quadranteKraljic];
  var r = window.resolverNegociacao(t);
  console.log('\n============================================================');
  console.log((i + 1) + ') ' + t.perfilDISC + ' (' + window.MOTOR_DISC[t.perfilDISC].nome + ')  |  ' +
    quad.label + '  |  objeção: "' + obj.texto + '"');
  console.log('   origem: ' + r.origem +
    '  ·  objetivo primário: ' + r.objetivoPrimario.codigo + ' (' + r.objetivoPrimario.nome + ')' +
    '  ·  secundário: ' + r.objetivoSecundario.codigo + ' (' + r.objetivoSecundario.nome + ')');
  console.log('------------------------------------------------------------');
  console.log('DIAGNÓSTICO:  ' + r.diagnostico);
  console.log('RISCO:        ' + r.risco);
  console.log('ESTRATÉGIA:   ' + r.estrategia);
  console.log('ALAVANCA:     ' + r.alavanca);
  console.log('FRASE:        ' + r.frase);
  console.log('PRÓXIMA AÇÃO: ' + r.proximaAcao);
  console.log('REFORÇO (' + r.reforco.codigo + '): ' + r.reforco.estrategia + '  |  ' + r.reforco.proximaAcao);
});
