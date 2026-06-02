// Camada de APRESENTAÇÃO (ótica do comprador) sobre o perfil DISC.
// disc-data.jsx segue CONGELADO — aqui só reformulamos os campos seller-framed
// (closingStrategy / objectionHandling) para autoconhecimento em 1ª pessoa, e
// reaproveitamos pitchTone como "o tom que funciona com você".
//
// Fonte única reaproveitada por report-export (PDF) + AnaliseScreen + RelatorioScreen.
// Expõe: window.voratteEstiloComprador(primary) -> { tom, ritmo, objecao }.
//
// ⚠️ Deriva da letra PRIMÁRIA (D/I/S/C). Carrega DEPOIS de src/disc-data.jsx.

var VORATTE_ESTILO_OVERRIDE = {
  D: { ritmo: 'Você decide rápido — muitas vezes fecha já na primeira reunião.', objecao: 'Você quer resposta com dado direto e objetivo, sem justificativa longa.' },
  I: { ritmo: 'Você fecha no calor da relação, em clima de parceria e com follow-up próximo.', objecao: 'Você quer que acolham o lado relacional antes de trazer o dado.' },
  S: { ritmo: 'Você fecha com segurança — preferindo teste, garantia ou implementação gradual.', objecao: 'Você quer que validem sua preocupação, com exemplos de transição segura.' },
  C: { ritmo: 'Você fecha após análise — com proposta detalhada e tempo para avaliar.', objecao: 'Você quer dado verificável e nada de improviso.' },
};

function voratteEstiloComprador(primary) {
  var p = String(primary || 'D').toUpperCase().charAt(0);
  var prof = (window.BUYER_PROFILES && window.BUYER_PROFILES[p]) || {};
  var ovr = VORATTE_ESTILO_OVERRIDE[p] || { ritmo: '', objecao: '' };
  return {
    tom: prof.pitchTone || '',   // verbatim — "O tom que funciona com você"
    ritmo: ovr.ritmo,            // reformulado de closingStrategy
    objecao: ovr.objecao,        // reformulado de objectionHandling
  };
}

window.voratteEstiloComprador = voratteEstiloComprador;

// Override KAVOID (ótica-comprador) para itens de whatToAvoid do Kraljic que são
// conduta/abordagem do vendedor e não invertem só com rótulo. As chaves são únicas
// entre os quadrantes, então um mapa plano basta.
// ⚠️ DÍVIDA: precisam bater LETRA A LETRA com whatToAvoid em kraljic-data.jsx (congelado).
// (screen-kraljic.jsx e report-export.jsx ainda têm cópias locais — consolidar aqui depois.)
var VORATTE_KAVOID = {
  'Não envolver liderança nas reuniões': 'Deixar a liderança do fornecedor fora das reuniões',
  'Vender só pelo preço': 'Reduzir a parceria estratégica a uma disputa de preço',
  'Burocratizar o processo dele': 'Burocratizar o seu processo de compra',
};

function voratteKavoid(item) { return VORATTE_KAVOID[item] || item; }

window.voratteKavoid = voratteKavoid;
