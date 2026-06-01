// Demo: 6 saídas COMPOSTAS de tuplas variadas (revisão de qualidade de texto).
//   node tests/motor-demo6.node.js
const fs = require('fs');
const path = require('path');
global.window = {};
const root = path.resolve(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'src', 'motor-data.jsx'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'src', 'motor-engine.jsx'), 'utf8'));

var TUPLAS = [
  { perfilDISC: 'D', objecaoId: 'OBJ_08', quadranteKraljic: 'nao_criticos', objetivoComprador: 'padronizar_reduzir_esforco' },
  { perfilDISC: 'I', objecaoId: 'OBJ_11', quadranteKraljic: 'gargalo', objetivoComprador: 'garantir_abastecimento' },
  { perfilDISC: 'S', objecaoId: 'OBJ_01', quadranteKraljic: 'alavancagem', objetivoComprador: 'capturar_saving' },
  { perfilDISC: 'C', objecaoId: 'OBJ_18', quadranteKraljic: 'estrategico', objetivoComprador: 'validar_valor_evitar_dependencia' },
  { perfilDISC: 'D', objecaoId: 'OBJ_16', quadranteKraljic: 'gargalo', objetivoComprador: 'reduzir_risco_suprimento' },
  { perfilDISC: 'I', objecaoId: 'OBJ_21', quadranteKraljic: 'alavancagem', objetivoComprador: 'preservar_parceria' }
];

TUPLAS.forEach(function (t, i) {
  var obj = window.MOTOR_OBJECOES_BY_ID[t.objecaoId];
  var quad = window.MOTOR_KRALJIC[t.quadranteKraljic];
  var r = window.resolverNegociacao(t);
  console.log('\n============================================================');
  console.log((i + 1) + ') ' + t.perfilDISC + ' (' + window.MOTOR_DISC[t.perfilDISC].nome + ')  |  ' +
    quad.label + '  |  objeção: "' + obj.texto + '"');
  console.log('   origem: ' + r.origem + '  ·  confiança: ' + r.confianca);
  console.log('------------------------------------------------------------');
  console.log('DIAGNÓSTICO:  ' + r.diagnostico);
  console.log('RISCO:        ' + r.risco);
  console.log('ESTRATÉGIA:   ' + r.estrategia);
  console.log('FRASE:        ' + r.frase);
  console.log('PRÓXIMA AÇÃO: ' + r.proximaAcao);
});
