// Demo headless: imprime 3 saídas REAIS do motor (caso-exato, composto, inferência).
//   node tests/motor-demo.node.js
const fs = require('fs');
const path = require('path');
global.window = {};
const root = path.resolve(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'src', 'motor-data.jsx'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'src', 'motor-engine.jsx'), 'utf8'));

function dump(titulo, obj) {
  console.log('\n===== ' + titulo + ' =====');
  console.log(JSON.stringify(obj, null, 2));
}

// 1) CASO-EXATO — tupla mapeada (D + limite de preço + Alavancagem + capturar saving)
dump('1) CASO-EXATO  (input: D | OBJ_01 | alavancagem | capturar_saving)',
  window.resolverNegociacao({
    perfilDISC: 'D', objecaoId: 'OBJ_01', quadranteKraljic: 'alavancagem', objetivoComprador: 'capturar_saving'
  }));

// 2) COMPOSTO — tupla off-grid (C + "fila de clientes" + Gargalo + reduzir risco)
dump('2) COMPOSTO  (input: C | OBJ_06 | gargalo | reduzir_risco_suprimento)',
  window.resolverNegociacao({
    perfilDISC: 'C', objecaoId: 'OBJ_06', quadranteKraljic: 'gargalo', objetivoComprador: 'reduzir_risco_suprimento'
  }));

// 3) INFERÊNCIA por sinais (§9.2) — sem informar o perfil
dump('3a) INFERÊNCIA  (sinais: benchmark, metodologia, planilha, base de cálculo)',
  window.inferirPerfilDISC(['Pediu benchmark', 'Questionou metodologia', 'Solicitou planilha', 'Pediu base de cálculo']));

dump('3b) RESOLUÇÃO usando o perfil inferido + objeção "Não podemos abrir custos"',
  window.resolverNegociacao({
    sinais: ['Pediu benchmark', 'Questionou metodologia', 'Solicitou planilha', 'Pediu base de cálculo'],
    objecaoId: 'OBJ_07', quadranteKraljic: 'alavancagem', objetivoComprador: 'validar_competitividade'
  }));
