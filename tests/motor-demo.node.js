// Demo headless (Motor 4.0): imprime saídas REAIS do motor — objetivo derivado.
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

// 1) Derivação — D + "Esse é o nosso preço padrão" (OBJ_08) + Alavancagem
dump('1) DERIVADO  (input: D | OBJ_08 | alavancagem)  → esperado primário OBJ01',
  window.resolverNegociacao({ perfilDISC: 'D', objecaoId: 'OBJ_08', quadranteKraljic: 'alavancagem' }));

// 2) Derivação — C + "Temos tecnologia exclusiva" (OBJ_18) + Estratégico
dump('2) DERIVADO  (input: C | OBJ_18 | estrategico)  → esperado primário OBJ10',
  window.resolverNegociacao({ perfilDISC: 'C', objecaoId: 'OBJ_18', quadranteKraljic: 'estrategico' }));

// 3) Normalização — texto da objeção + label do quadrante + perfil minúsculo
dump('3) NORMALIZADO  (input: "s" | "Não consigo entregar nesse prazo" | "Gargalo")',
  window.resolverNegociacao({ perfilDISC: 's', objecaoId: 'Não consigo entregar nesse prazo', quadranteKraljic: 'Gargalo' }));

// 4) Erro — entrada incompleta (sem quadrante): saída completa, sem lançar
dump('4) ERRO  (input: D | OBJ_01 | <sem quadrante>)',
  window.resolverNegociacao({ perfilDISC: 'D', objecaoId: 'OBJ_01' }));
