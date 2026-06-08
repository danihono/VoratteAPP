// Motor de Negociação Vorätte 4.0 — base estática de conhecimento (dados)
// Porta browser-runnable da base canônica docs/motor-ia-voratte-v4.0.md.
// Motor de REGRAS determinístico: o OBJETIVO é DERIVADO de objeção × quadrante
// (matriz de inferência) e diagnóstico/risco/estratégia/alavanca/próxima-ação +
// frase vêm do OBJETIVO. Nunca gera texto novo, nunca inventa dados.
// Perspectiva SEMPRE do comprador.
//
// Expõe: window.MOTOR_DISC, MOTOR_KRALJIC, MOTOR_OBJECOES,
// MOTOR_OBJECOES_BY_ID, MOTOR_OBJECOES_BY_TEXT, MOTOR_RESPOSTAS,
// MOTOR_OBJETIVOS (enriquecidos), MOTOR_REGRAS (matriz de inferência),
// MOTOR_FRASES (frases DISC por objetivo), motorNormalizeText.
//
// Carrega ANTES de src/motor-engine.jsx.

// ===== Helper de normalização (compartilhado com o engine) =====
function motorNormalizeText(s) {
  var str = String(s == null ? '' : s).toLowerCase().normalize('NFD');
  var out = '';
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    if (code >= 0x300 && code <= 0x36f) continue; // remove marcas diacríticas combinantes
    out += str.charAt(i);
  }
  return out.replace(/\s+/g, ' ').trim();
}

// ===== §4–8 + §13 — Perfis DISC =====
const MOTOR_DISC = {
  D: {
    id: 'D',
    nome: 'Dominante',
    essencia: 'Resultado, velocidade e assertividade',
    motivadores: ['Ganho', 'controle', 'vantagem', 'ROI'],
    riscos: ['Confronto', 'pressão', 'disputa de poder'],
    estrategiaComprador: 'Ser direto e objetivo, usar dados objetivos, apresentar opções claras, mostrar consequências, evitar rodeios e confronto pessoal.',
    gatilhos: ['ROI', 'resultado', 'velocidade', 'consequência', 'exclusividade', 'vantagem'],
  },
  I: {
    id: 'I',
    nome: 'Influente',
    essencia: 'Relacionamento, entusiasmo e conexão',
    motivadores: ['Reconhecimento', 'parceria', 'reputação'],
    riscos: ['Superficialidade', 'promessas vagas', 'emoção excessiva'],
    estrategiaComprador: 'Reconhecer a parceria, manter tom positivo, trazer estrutura, formalizar compromissos e traduzir boa vontade em próximos passos objetivos.',
    gatilhos: ['relacionamento', 'reconhecimento', 'influência', 'visibilidade', 'parceria', 'reputação'],
  },
  S: {
    id: 'S',
    nome: 'Estável',
    essencia: 'Segurança, continuidade e previsibilidade',
    motivadores: ['Estabilidade', 'confiança', 'baixo risco'],
    riscos: ['Postergação', 'resistência passiva', 'aversão a mudança'],
    estrategiaComprador: 'Criar ambiente seguro, explicar passo a passo, dar previsibilidade, reduzir incerteza, evitar pressão excessiva e conduzir com calma e estrutura.',
    gatilhos: ['segurança', 'continuidade', 'previsibilidade', 'estabilidade', 'confiança', 'redução de risco'],
  },
  C: {
    id: 'C',
    nome: 'Conforme',
    essencia: 'Dados, método e precisão',
    motivadores: ['Evidência', 'compliance', 'benchmark'],
    riscos: ['Excesso de análise', 'rigidez', 'impasse técnico'],
    estrategiaComprador: 'Preparar dados, usar TCO, apresentar benchmark, explicar premissas, antecipar objeções técnicas e formalizar critérios.',
    gatilhos: ['dados', 'benchmark', 'evidência', 'compliance', 'método', 'auditoria', 'processo'],
  },
};

// ===== §15 — Matriz de Kraljic (4 quadrantes + Uso do DISC) =====
// IDs canônicos reusados de src/kraljic-data.jsx.
const MOTOR_KRALJIC = {
  alavancagem: {
    quadrante: 'alavancagem',
    label: 'Alavancagem',
    objetivoComprador: 'Capturar valor econômico.',
    estrategia: 'Competição entre fornecedores, negociação de preço, TCO, volume e condições comerciais.',
    riscoPrincipal: 'Focar apenas em preço e comprometer qualidade, SLA ou relacionamento futuro.',
    estiloNegociacao: 'Assertivo, competitivo e objetivo.',
    usoDISC: {
      D: 'falar em resultado, volume e consequência.',
      I: 'preservar relação, mas ancorar em comparativos.',
      S: 'mostrar previsibilidade e baixo risco da mudança.',
      C: 'usar dados, TCO e benchmark.',
    },
  },
  estrategico: {
    quadrante: 'estrategico',
    label: 'Estratégico',
    objetivoComprador: 'Garantir continuidade, performance, inovação e proteção da relação sem perder critério.',
    estrategia: 'Parceria estruturada de longo prazo, governança, desenvolvimento conjunto e gestão de risco.',
    riscoPrincipal: 'Tratar fornecedor estratégico como commodity ou perder poder de controle por excesso de dependência.',
    estiloNegociacao: 'Colaborativo, estruturado e orientado a longo prazo.',
    usoDISC: {
      D: 'mostrar impacto estratégico e ganho competitivo.',
      I: 'reforçar parceria, reputação e visibilidade.',
      S: 'enfatizar continuidade, segurança e previsibilidade.',
      C: 'apresentar governança, dados, risco e critérios.',
    },
  },
  gargalo: {
    quadrante: 'gargalo',
    label: 'Gargalo',
    objetivoComprador: 'Garantir abastecimento e reduzir exposição ao risco.',
    estrategia: 'Segurança de suprimento, plano de contingência, desenvolvimento de alternativas e previsibilidade.',
    riscoPrincipal: 'Subestimar uma categoria de baixo valor financeiro, mas altamente crítica para a operação.',
    estiloNegociacao: 'Preventivo, cauteloso e orientado a continuidade.',
    usoDISC: {
      D: 'mostrar consequência operacional da ruptura.',
      I: 'construir colaboração e compromisso.',
      S: 'reforçar segurança, estabilidade e planejamento.',
      C: 'detalhar riscos, documentação e plano técnico.',
    },
  },
  nao_criticos: {
    quadrante: 'nao_criticos',
    label: 'Não Crítico',
    objetivoComprador: 'Reduzir esforço operacional e custo transacional.',
    estrategia: 'Automação, catálogo, padronização e eficiência processual.',
    riscoPrincipal: 'Gastar energia excessiva em uma categoria que não justifica negociação sofisticada.',
    estiloNegociacao: 'Simples, transacional e padronizado.',
    usoDISC: {
      D: 'resolver rápido e com objetividade.',
      I: 'manter cordialidade, mas sem alongar discussão.',
      S: 'garantir clareza de processo.',
      C: 'formalizar padrão, catálogo e regras.',
    },
  },
};

// ===== §16 + §18 — Biblioteca Mestra de Objeções (21) =====
const MOTOR_OBJECOES = [
  {
    id: 'OBJ_01', grupo: 'Preço', texto: 'Já estamos no limite de preço',
    diagnostico: 'O vendedor está tentando encerrar a negociação de preço ou testar o limite do comprador.',
    intencoes: ['Proteger margem', 'Evitar nova concessão', 'Forçar contrapartida', 'Testar pressão competitiva'],
    riscoComprador: 'Aceitar a afirmação sem explorar alternativas comerciais, contrapartidas ou composição de valor.',
    oQueNaoFazer: ['Insistir apenas em desconto', 'Entrar em confronto direto', 'Aceitar sem validar mercado'],
    proximaAcao: 'Solicitar proposta revisada com alternativas de contrapartida.',
  },
  {
    id: 'OBJ_02', grupo: 'Valor', texto: 'A concorrência não entrega o mesmo nível de qualidade',
    diagnostico: 'O vendedor desloca a discussão de preço para valor percebido e diferenciação.',
    intencoes: ['Justificar prêmio de preço', 'Evitar comparação direta', 'Reforçar superioridade técnica'],
    riscoComprador: 'Pagar prêmio sem validar se a diferença de qualidade é real, mensurável e necessária.',
    oQueNaoFazer: ['Desconsiderar qualidade', 'Comparar apenas preço', 'Aceitar argumento sem evidência'],
    proximaAcao: 'Solicitar evidências objetivas de qualidade e comparar TCO.',
  },
  {
    id: 'OBJ_03', grupo: 'Custos', texto: 'Nossos custos aumentaram',
    diagnostico: 'O vendedor usa aumento de custos como justificativa para preço ou resistência a desconto.',
    intencoes: ['Repassar inflação', 'Preservar margem', 'Evitar abertura detalhada'],
    riscoComprador: 'Aceitar repasse integral sem validar índice, período, base e impacto real.',
    oQueNaoFazer: ['Aceitar aumento genérico', 'Rejeitar sem análise', 'Discutir sem base de cálculo'],
    proximaAcao: 'Solicitar composição resumida do aumento, índice de referência e proposta alternativa.',
  },
  {
    id: 'OBJ_04', grupo: 'Capacidade', texto: 'O volume é muito pequeno',
    diagnostico: 'O vendedor questiona atratividade comercial do negócio.',
    intencoes: ['Justificar preço maior', 'Evitar personalização', 'Pedir volume mínimo ou contrapartida'],
    riscoComprador: 'Aceitar condição ruim sem explorar consolidação, recorrência ou potencial futuro.',
    oQueNaoFazer: ['Prometer volume inexistente', 'Pressionar sem contrapartida', 'Ignorar custo operacional do fornecedor'],
    proximaAcao: 'Avaliar consolidação de demanda, contrato guarda-chuva ou volume recorrente.',
  },
  {
    id: 'OBJ_05', grupo: 'Contrato e Governança', texto: 'O prazo de pagamento é muito longo',
    diagnostico: 'O vendedor demonstra preocupação com fluxo de caixa e custo financeiro.',
    intencoes: ['Reduzir prazo', 'Embutir custo financeiro no preço', 'Condicionar desconto a pagamento antecipado'],
    riscoComprador: 'Perder valor total por olhar apenas prazo ou apenas preço.',
    oQueNaoFazer: ['Impor prazo sem avaliar impacto', 'Ignorar custo financeiro', 'Negociar preço e pagamento separadamente'],
    proximaAcao: 'Rodar simulação de preço versus prazo de pagamento.',
  },
  {
    id: 'OBJ_06', grupo: 'Capacidade', texto: 'Temos fila de clientes',
    diagnostico: 'O vendedor usa escassez de capacidade como argumento de poder.',
    intencoes: ['Reduzir concessões', 'Pressionar decisão rápida', 'Valorizar capacidade limitada'],
    riscoComprador: 'Aceitar condições desfavoráveis por medo de perder disponibilidade.',
    oQueNaoFazer: ['Ceder por urgência sem validar capacidade', 'Entrar em disputa de importância', 'Ignorar risco de abastecimento'],
    proximaAcao: 'Solicitar confirmação formal de capacidade, lead time e plano de atendimento.',
  },
  {
    id: 'OBJ_07', grupo: 'Custos', texto: 'Não podemos abrir nossa estrutura de custos',
    diagnostico: 'O vendedor resiste à transparência de custos.',
    intencoes: ['Proteger margem', 'Evitar exposição comercial', 'Manter assimetria de informação'],
    riscoComprador: 'Ficar sem base para validar preço, reajuste ou pedido de aumento.',
    oQueNaoFazer: ['Exigir abertura total sem alternativa', 'Tratar como má-fé automaticamente', 'Aceitar ausência total de evidência'],
    proximaAcao: 'Propor modelo de transparência parcial com dados agregados.',
  },
  {
    id: 'OBJ_08', grupo: 'Preço', texto: 'Esse é o nosso preço padrão',
    diagnostico: 'O vendedor tenta encerrar a negociação com uma política comercial genérica.',
    intencoes: ['Evitar customização', 'Proteger tabela', 'Reduzir esforço de negociação'],
    riscoComprador: 'Aceitar tabela sem considerar volume, recorrência, risco, SLA ou potencial de parceria.',
    oQueNaoFazer: ['Aceitar padrão como imutável', 'Desqualificar a política do fornecedor', 'Negociar sem contrapartida'],
    proximaAcao: 'Solicitar cenário alternativo com contrapartida comercial.',
  },
  {
    id: 'OBJ_09', grupo: 'Preço', texto: 'Precisamos preservar nossa margem',
    diagnostico: 'O vendedor desloca a discussão para sustentabilidade econômica da proposta.',
    intencoes: ['Resistir a desconto', 'Buscar contrapartidas', 'Evitar erosão de margem'],
    riscoComprador: 'Aceitar margem do fornecedor como limite sem analisar alternativas de valor.',
    oQueNaoFazer: ['Tratar margem como problema exclusivo do fornecedor', 'Forçar desconto inviável', 'Ignorar sustentabilidade da entrega'],
    proximaAcao: 'Mapear alavancas comerciais além do preço unitário.',
  },
  {
    id: 'OBJ_10', grupo: 'Capacidade', texto: 'Não conseguimos atender esse SLA',
    diagnostico: 'O vendedor indica limitação operacional, técnica ou de capacidade.',
    intencoes: ['Reduzir obrigação contratual', 'Evitar penalidade', 'Ajustar expectativa de performance'],
    riscoComprador: 'Aceitar SLA insuficiente para a criticidade da categoria.',
    oQueNaoFazer: ['Impor SLA sem avaliar capacidade real', 'Aceitar SLA baixo sem plano de mitigação', 'Ignorar impacto operacional'],
    proximaAcao: 'Criar matriz de SLA mínimo, desejável e plano de evolução.',
  },
  {
    id: 'OBJ_11', grupo: 'Capacidade', texto: 'Não consigo entregar nesse prazo',
    diagnostico: 'O vendedor sinaliza restrição de lead time, capacidade, logística ou prioridade.',
    intencoes: ['Evitar compromisso arriscado', 'Ganhar prazo', 'Reorganizar prioridade'],
    riscoComprador: 'Aceitar atraso sem plano de contingência ou pressionar entrega inviável.',
    oQueNaoFazer: ['Pressionar sem entender causa', 'Aceitar prazo sem consequência', 'Ignorar alternativa de mitigação'],
    proximaAcao: 'Solicitar cronograma alternativo com entregas parciais e riscos.',
  },
  {
    id: 'OBJ_12', grupo: 'Contrato e Governança', texto: 'Preciso de aprovação interna',
    diagnostico: 'O vendedor posterga decisão ou depende de autoridade superior.',
    intencoes: ['Ganhar tempo', 'Evitar decisão individual', 'Validar concessão', 'Criar barreira interna'],
    riscoComprador: 'Perder momentum ou deixar a negociação voltar sem clareza.',
    oQueNaoFazer: ['Encerrar sem combinar próximo passo', 'Não perguntar critérios de aprovação', 'Aceitar indefinição'],
    proximaAcao: 'Definir responsável, critérios de aprovação e prazo de retorno.',
  },
  {
    id: 'OBJ_13', grupo: 'Contrato e Governança', texto: 'Essa cláusula é difícil para nós',
    diagnostico: 'O vendedor resiste a obrigação contratual, risco jurídico ou compromisso operacional.',
    intencoes: ['Reduzir exposição', 'Flexibilizar obrigação', 'Remover penalidade'],
    riscoComprador: 'Aceitar contrato frágil ou cláusula sem proteção adequada.',
    oQueNaoFazer: ['Impor redação sem entender o risco', 'Aceitar remoção sem alternativa', 'Transformar discussão jurídica em conflito comercial'],
    proximaAcao: 'Solicitar contraproposta de redação mantendo proteção equivalente.',
  },
  {
    id: 'OBJ_14', grupo: 'Preço', texto: 'Não consigo reduzir mais',
    diagnostico: 'O vendedor tenta encerrar negociação econômica.',
    intencoes: ['Fixar âncora final', 'Preservar margem', 'Forçar decisão'],
    riscoComprador: 'Aceitar preço sem explorar variáveis alternativas.',
    oQueNaoFazer: ['Repetir pedido de desconto sem nova lógica', 'Ignorar contrapartidas', 'Pressionar até inviabilizar fornecedor estratégico'],
    proximaAcao: 'Abrir negociação de contrapartidas não-preço.',
  },
  {
    id: 'OBJ_15', grupo: 'Contrato e Governança', texto: 'Vocês compram apenas pelo menor preço',
    diagnostico: 'O vendedor tenta reposicionar a conversa para valor e questiona maturidade do comprador.',
    intencoes: ['Defender preço premium', 'Evitar concorrência puramente econômica', 'Reforçar diferenciais'],
    riscoComprador: 'Ficar defensivo ou abandonar critérios econômicos relevantes.',
    oQueNaoFazer: ['Responder de forma defensiva', 'Confirmar que preço é único critério', 'Ignorar valor técnico'],
    proximaAcao: 'Apresentar matriz de avaliação multicritério.',
  },
  {
    id: 'OBJ_16', grupo: 'Contrato e Governança', texto: 'Não podemos assumir esse risco',
    diagnostico: 'O vendedor identifica exposição operacional, jurídica, financeira ou técnica.',
    intencoes: ['Reduzir responsabilidade', 'Alterar cláusula', 'Reprecificar risco'],
    riscoComprador: 'Assumir risco indevido ou não alocar responsabilidade corretamente.',
    oQueNaoFazer: ['Ignorar risco real', 'Transferir risco impossível', 'Aceitar exclusão total de responsabilidade'],
    proximaAcao: 'Criar matriz de risco e proposta de mitigação.',
  },
  {
    id: 'OBJ_17', grupo: 'Valor', texto: 'Somos líderes do mercado',
    diagnostico: 'O vendedor usa autoridade de mercado para justificar preço, condição ou menor flexibilidade.',
    intencoes: ['Defender prêmio de valor', 'Reduzir comparabilidade', 'Criar assimetria de poder'],
    riscoComprador: 'Aceitar argumento de reputação sem comprovação de valor incremental.',
    oQueNaoFazer: ['Desvalorizar a liderança', 'Aceitar liderança como justificativa suficiente', 'Ignorar métricas reais'],
    proximaAcao: 'Solicitar evidências objetivas da liderança e impacto operacional.',
  },
  {
    id: 'OBJ_18', grupo: 'Valor', texto: 'Temos tecnologia exclusiva',
    diagnostico: 'O vendedor usa diferenciação técnica para justificar menor flexibilidade comercial.',
    intencoes: ['Defender preço premium', 'Reduzir comparabilidade', 'Criar dependência percebida'],
    riscoComprador: 'Aceitar exclusividade sem medir valor real, risco de dependência ou substituibilidade.',
    oQueNaoFazer: ['Ignorar inovação', 'Aceitar exclusividade sem prova', 'Criar dependência sem plano de mitigação'],
    proximaAcao: 'Solicitar demonstração técnica, comparativo funcional e análise de dependência.',
  },
  {
    id: 'OBJ_19', grupo: 'Valor', texto: 'Não temos concorrentes equivalentes',
    diagnostico: 'O vendedor reforça posição monopolística ou altamente diferenciada.',
    intencoes: ['Reduzir poder de barganha do comprador', 'Justificar preço alto', 'Evitar comparação competitiva'],
    riscoComprador: 'Aumentar dependência e aceitar condições desfavoráveis.',
    oQueNaoFazer: ['Aceitar inexistência de alternativas sem validação', 'Transformar gargalo em dependência permanente', 'Ignorar plano de segunda fonte'],
    proximaAcao: 'Criar análise de dependência e plano de mitigação.',
  },
  {
    id: 'OBJ_20', grupo: 'Contrato e Governança', texto: 'Essa condição só vale até amanhã',
    diagnostico: 'O vendedor usa urgência para acelerar decisão.',
    intencoes: ['Pressionar fechamento', 'Evitar comparação', 'Forçar concessão rápida'],
    riscoComprador: 'Tomar decisão apressada sem análise, aprovação ou comparação adequada.',
    oQueNaoFazer: ['Ceder à pressão temporal sem validar motivo', 'Aceitar urgência artificial', 'Pular governança interna'],
    proximaAcao: 'Solicitar proposta formal, justificativa da urgência e prazo mínimo para análise.',
  },
  {
    id: 'OBJ_21', grupo: 'Preço', texto: 'Se reduzirmos mais, não vale a pena fazer o negócio',
    diagnostico: 'O vendedor indica possível ponto de ruptura econômica.',
    intencoes: ['Proteger margem mínima', 'Encerrar pressão por desconto', 'Solicitar contrapartida'],
    riscoComprador: 'Forçar condição insustentável ou aceitar sem explorar alternativas de valor.',
    oQueNaoFazer: ['Pressionar até inviabilizar entrega', 'Ignorar sustentabilidade', 'Aceitar preço sem contrapartidas'],
    proximaAcao: 'Reabrir negociação por alavancas de valor e sustentabilidade.',
  },
];

// ===== §18 — Respostas por perfil DISC (84 = 21 objeções × 4 perfis) =====
// Mantidas vivas: o Relatório (§06) e o PDF (§07) exibem estas frases por
// objeção+perfil (OBJ_01/OBJ_03). NÃO são a frase derivada do motor 4.0.
const MOTOR_RESPOSTAS = {
  OBJ_01: {
    D: 'Entendo. Se esse é o limite de preço, precisamos avaliar contrapartidas objetivas: volume, prazo, SLA ou condição de pagamento. Sem algum ajuste, a proposta perde competitividade frente às alternativas.',
    I: 'Entendo sua posição e quero preservar nossa parceria. Vamos buscar uma alternativa que mantenha valor para vocês, mas também seja defensável internamente para nós.',
    S: 'Entendo. Podemos olhar com calma quais condições dariam mais previsibilidade para os dois lados sem gerar risco para sua operação.',
    C: 'Vamos validar tecnicamente esse limite abrindo os principais componentes da proposta, comparando com benchmark e avaliando onde existe espaço de ajuste.',
  },
  OBJ_02: {
    D: 'Se a qualidade é superior, precisamos traduzir isso em resultado objetivo: menor falha, menor retrabalho, maior produtividade ou redução de risco. Vamos comparar impacto real.',
    I: 'Reconheço o valor da relação e da qualidade entregue. Para sustentar internamente essa escolha, precisamos mostrar de forma clara o diferencial de vocês.',
    S: 'Entendo. Vamos avaliar como essa qualidade reduz risco e aumenta estabilidade para a operação ao longo do contrato.',
    C: 'Vamos comparar os critérios técnicos, indicadores de performance, histórico de falhas, SLA e custo total para validar a diferença de qualidade.',
  },
  OBJ_03: {
    D: 'Entendo o aumento, mas precisamos separar impacto real de repasse integral. Vamos avaliar o que é justificável e qual contrapartida mantém a proposta competitiva.',
    I: 'Entendo que o cenário de custos pressiona vocês. Vamos construir uma solução equilibrada que preserve a parceria e seja justificável para ambos.',
    S: 'Podemos revisar os custos de forma estruturada, evitando mudanças bruscas e criando previsibilidade para os próximos ciclos.',
    C: 'Vamos analisar índices, período de referência, componentes impactados e memória de cálculo para validar tecnicamente o reajuste.',
  },
  OBJ_04: {
    D: 'Se o volume atual é pequeno, vamos discutir potencial total, recorrência e contrapartidas. O ponto é tornar o negócio atrativo sem perder competitividade.',
    I: 'Entendo. Podemos olhar essa oportunidade como porta de entrada para ampliar a parceria se a primeira entrega funcionar bem.',
    S: 'Podemos estruturar um modelo gradual, começando com menor volume e criando previsibilidade para evolução futura.',
    C: 'Vamos calcular o impacto do volume mínimo, custo operacional, lote econômico e alternativas de consolidação.',
  },
  OBJ_05: {
    D: 'Podemos avaliar uma troca objetiva: prazo menor contra preço melhor, ou prazo atual com condição comercial ajustada. Precisamos otimizar o ganho total.',
    I: 'Entendo o impacto no caixa de vocês. Vamos buscar uma composição que preserve a parceria e seja sustentável para os dois lados.',
    S: 'Podemos simular alternativas de pagamento para trazer previsibilidade e evitar pressão financeira desnecessária.',
    C: 'Vamos comparar o custo financeiro implícito em cada prazo e calcular o impacto no TCO da proposta.',
  },
  OBJ_06: {
    D: 'Se há restrição de capacidade, precisamos garantir prioridade com critérios objetivos: volume, prazo, SLA e compromisso formal. Sem isso, o risco operacional permanece.',
    I: 'Entendo que vocês têm alta demanda. Justamente por valorizarmos a parceria, precisamos alinhar como garantir espaço para nossa operação.',
    S: 'Vamos construir um planejamento de capacidade que dê segurança para os dois lados e evite rupturas.',
    C: 'Precisamos entender capacidade disponível, lead time, janelas de produção e critérios de priorização para avaliar o risco real.',
  },
  OBJ_07: {
    D: 'Não precisamos abrir todos os detalhes sensíveis, mas precisamos de elementos suficientes para justificar competitividade. Podemos trabalhar com faixas, índices e premissas.',
    I: 'Entendo que há informações sensíveis. Podemos encontrar um formato confortável para vocês e suficiente para manter confiança no processo.',
    S: 'Podemos usar uma abertura parcial ou indicadores de referência para dar segurança aos dois lados sem expor informações estratégicas.',
    C: 'Podemos substituir a abertura completa por memória de cálculo resumida, índices verificáveis, premissas e benchmark independente.',
  },
  OBJ_08: {
    D: 'Entendo que esse é o padrão. Mas nosso cenário tem volume, recorrência e potencial. Precisamos discutir uma condição proporcional ao valor total da oportunidade.',
    I: 'Entendo a política de vocês. Podemos construir uma exceção bem justificada que fortaleça a relação e seja defensável para ambos.',
    S: 'Podemos avaliar uma condição gradual, mantendo segurança para vocês e previsibilidade para nós.',
    C: 'Vamos comparar a condição padrão com o perfil da demanda, volume, SLA, prazo e benchmark para avaliar se ela é tecnicamente adequada.',
  },
  OBJ_09: {
    D: 'Entendo a necessidade de margem. Então vamos discutir quais contrapartidas permitem melhorar a condição sem inviabilizar o negócio: volume, prazo, mix ou SLA.',
    I: 'Queremos uma relação sustentável. Vamos encontrar um ponto que preserve a parceria e atenda aos critérios internos de compra.',
    S: 'Podemos buscar uma solução equilibrada, sem mudanças bruscas, que preserve a continuidade do fornecimento.',
    C: 'Vamos analisar quais componentes impactam margem e quais alavancas comerciais podem otimizar o custo total sem comprometer viabilidade.',
  },
  OBJ_10: {
    D: 'Se esse SLA não é viável, precisamos decidir entre ajustar escopo, criar contrapartidas ou avaliar alternativas que protejam a operação.',
    I: 'Vamos trabalhar juntos em um SLA que seja possível para vocês e aceitável para nossas áreas internas.',
    S: 'Podemos estruturar uma evolução gradual do SLA, com marcos de melhoria e segurança operacional.',
    C: 'Vamos entender os limites técnicos, histórico de performance, capacidade e riscos antes de definir o SLA final.',
  },
  OBJ_11: {
    D: 'Se esse prazo não for viável, precisamos decidir rapidamente entre ajustar escopo, criar entrega parcial ou considerar fonte alternativa.',
    I: 'Vamos construir juntos uma alternativa que preserve a relação e evite desgaste com as áreas envolvidas.',
    S: 'Podemos estruturar uma transição por etapas, com prazos realistas e menor risco de ruptura.',
    C: 'Preciso entender tecnicamente quais etapas limitam o prazo. Vamos revisar cronograma, capacidade e dependências.',
  },
  OBJ_12: {
    D: 'Perfeito. Para não perdermos a janela de decisão, sugiro levar duas opções objetivas: condição atual e condição ajustada com contrapartida.',
    I: 'Claro. Posso te ajudar a estruturar a mensagem para que sua aprovação interna seja mais fluida e bem recebida.',
    S: 'Sem problema. Vamos organizar os pontos de forma clara para que todos tenham segurança na decisão.',
    C: 'Vou preparar os dados, premissas, comparativos e justificativas para facilitar a análise interna.',
  },
  OBJ_13: {
    D: 'Entendo. A cláusula existe para proteger a operação. Podemos discutir alternativa, desde que preserve o mesmo nível de segurança para o comprador.',
    I: 'Entendo sua preocupação. Vamos buscar uma redação que preserve a confiança e mantenha o equilíbrio da relação.',
    S: 'Podemos revisar o texto com calma e deixar mais claro o que será exigido, reduzindo insegurança para os dois lados.',
    C: 'Vamos analisar o risco específico, comparar com contratos similares e ajustar a redação com base técnica.',
  },
  OBJ_14: {
    D: 'Então precisamos avaliar contrapartidas: volume, prazo, SLA ou condição de pagamento. Sem ajuste, a proposta perde competitividade.',
    I: 'Entendo. Vamos olhar alternativas que mantenham a parceria forte e criem valor para ambos.',
    S: 'Podemos buscar uma solução gradual, com revisão programada ou ganho vinculado à estabilidade do contrato.',
    C: 'Vamos verificar tecnicamente quais componentes de custo são fixos e quais podem ser otimizados.',
  },
  OBJ_15: {
    D: 'Não compramos apenas preço. Compramos resultado total: custo, performance, risco e entrega. Se o valor de vocês é superior, precisamos demonstrar isso objetivamente.',
    I: 'A parceria importa muito para nós. Justamente por isso precisamos equilibrar relacionamento, valor entregue e critérios internos.',
    S: 'Nosso objetivo é uma decisão segura e sustentável, considerando preço, risco, continuidade e estabilidade da entrega.',
    C: 'A avaliação considera TCO, SLA, risco, qualidade, compliance e aderência técnica. Vamos comparar por esses critérios.',
  },
  OBJ_16: {
    D: 'Entendo. Então precisamos definir qual risco vocês assumem, qual contrapartida oferecem e como protegemos a operação caso esse risco se materialize.',
    I: 'Vamos buscar uma solução equilibrada, que preserve a relação e distribua responsabilidades de forma justa.',
    S: 'Podemos criar um modelo de transição, limites claros e plano de contingência para reduzir insegurança.',
    C: 'Vamos mapear o risco, probabilidade, impacto, controles possíveis e alternativa contratual tecnicamente defensável.',
  },
  OBJ_17: {
    D: 'Reconheço a posição de vocês. Agora precisamos traduzir essa liderança em resultado mensurável para nossa operação.',
    I: 'Reconhecemos a relevância de vocês no mercado. Queremos que essa liderança apareça também na qualidade da parceria e na proposta final.',
    S: 'A liderança de vocês pode trazer segurança. Precisamos entender como isso reduz risco e aumenta continuidade para nós.',
    C: 'Vamos validar essa liderança com indicadores: market share, performance, SLA, qualidade, histórico e benchmarks.',
  },
  OBJ_18: {
    D: 'Se a tecnologia é exclusiva, precisamos medir o impacto: ganho, velocidade, redução de custo ou vantagem operacional.',
    I: 'A tecnologia de vocês pode fortalecer muito a parceria. Vamos mostrar internamente como esse diferencial gera valor concreto.',
    S: 'Precisamos entender como essa tecnologia melhora segurança, continuidade e estabilidade da operação.',
    C: 'Vamos comparar especificações, performance, riscos, propriedade intelectual, dependência e alternativas técnicas.',
  },
  OBJ_19: {
    D: 'Se não há equivalente direto, precisamos discutir valor total, compromisso de entrega e contrapartidas proporcionais à criticidade.',
    I: 'Entendo o diferencial de vocês. Isso aumenta a importância da parceria, mas também exige alinhamento claro de condições e responsabilidades.',
    S: 'Se vocês são uma fonte crítica, precisamos criar previsibilidade, continuidade e segurança para os dois lados.',
    C: 'Vamos validar tecnicamente a equivalência, mapear substitutos parciais, riscos de dependência e critérios de homologação.',
  },
  OBJ_20: {
    D: 'Entendo a urgência. Para decidirmos nesse prazo, preciso que a condição venha acompanhada de ganho claro, validade formal e impacto objetivo. Caso contrário, seguiremos o processo competitivo.',
    I: 'Quero preservar o avanço da conversa, mas preciso garantir que a decisão seja bem alinhada internamente e sustentável para a parceria.',
    S: 'Antes de decidir, precisamos de segurança sobre condição, prazo, impacto e riscos. Podemos alinhar uma validade que permita decisão responsável.',
    C: 'Preciso entender a razão objetiva da validade até amanhã e receber a proposta formal com premissas, escopo e condições completas.',
  },
  OBJ_21: {
    D: 'Se esse é o ponto de ruptura, vamos discutir o que torna o negócio viável: volume, prazo, mix, pagamento ou escopo. Precisamos encontrar a melhor equação total.',
    I: 'Não queremos construir uma condição que prejudique a parceria. Vamos buscar uma alternativa que mantenha o negócio saudável para ambos.',
    S: 'Podemos estruturar uma solução gradual e previsível, evitando uma condição que gere instabilidade na entrega.',
    C: 'Vamos identificar quais variáveis tornam o negócio inviável e simular alternativas tecnicamente sustentáveis.',
  },
};

// ===== §4 (4.0) — Tabela Mestra de Objetivos (20) =====
// No 4.0, diagnóstico/risco/estratégia/alavanca/próxima-ação vêm do OBJETIVO.
// Chaveado pelo código da spec (OBJ01..OBJ20; sem underscore — distinto dos
// IDs de objeção OBJ_01).
const MOTOR_OBJETIVOS = {
  OBJ01: { codigo: 'OBJ01', nome: 'Capturar Saving', categoria: 'Econômico',
    diagnostico: 'O vendedor está protegendo preço, margem ou política comercial.',
    risco: 'Aceitar condições econômicas sem explorar oportunidades de redução.',
    estrategia: 'Utilizar concorrência, benchmark, volume, consolidação de demanda e TCO.',
    alavancaPrincipal: 'Preço',
    proximaAcao: 'Solicitar proposta alternativa com contrapartidas comerciais.' },
  OBJ02: { codigo: 'OBJ02', nome: 'Validar Competitividade', categoria: 'Econômico',
    diagnostico: 'Existe dúvida se a proposta apresentada está alinhada ao mercado.',
    risco: 'Assumir competitividade sem evidência objetiva.',
    estrategia: 'Comparar preço, escopo, SLA, TCO e alternativas disponíveis.',
    alavancaPrincipal: 'Benchmark',
    proximaAcao: 'Montar comparativo técnico-comercial.' },
  OBJ03: { codigo: 'OBJ03', nome: 'Encontrar Alavancas Técnicas de Redução', categoria: 'Econômico',
    diagnostico: 'O vendedor demonstra limite para redução direta de preço.',
    risco: 'Travar a negociação exclusivamente em desconto.',
    estrategia: 'Atuar em escopo, frequência, especificação, SLA, lote, logística ou prazo.',
    alavancaPrincipal: 'Escopo',
    proximaAcao: 'Abrir decomposição técnica da proposta.' },
  OBJ04: { codigo: 'OBJ04', nome: 'Validar Valor Real', categoria: 'Econômico',
    diagnostico: 'O vendedor utiliza diferenciação, liderança ou qualidade para justificar preço.',
    risco: 'Pagar prêmio sem comprovação objetiva de valor.',
    estrategia: 'Converter diferenciação em indicadores mensuráveis.',
    alavancaPrincipal: 'Valor',
    proximaAcao: 'Solicitar evidências concretas de resultado.' },
  OBJ05: { codigo: 'OBJ05', nome: 'Validar Diferenciação sem Perder Relacionamento', categoria: 'Estratégico',
    diagnostico: 'O vendedor usa relacionamento ou reputação para sustentar posição comercial.',
    risco: 'Aceitar argumentos subjetivos ou desgastar a relação.',
    estrategia: 'Reconhecer valor percebido e solicitar comprovação objetiva.',
    alavancaPrincipal: 'Qualidade',
    proximaAcao: 'Solicitar indicadores comparativos.' },
  OBJ06: { codigo: 'OBJ06', nome: 'Reposicionar a Conversa para Valor Total', categoria: 'Estratégico',
    diagnostico: 'O vendedor tenta deslocar a negociação de preço para valor.',
    risco: 'Entrar em postura defensiva ou abandonar critérios econômicos.',
    estrategia: 'Reforçar avaliação por TCO, risco, qualidade e performance.',
    alavancaPrincipal: 'TCO',
    proximaAcao: 'Apresentar matriz multicritério.' },
  OBJ07: { codigo: 'OBJ07', nome: 'Garantir Capacidade', categoria: 'Estratégico',
    diagnostico: 'O fornecedor indica limitação de atendimento ou produção.',
    risco: 'Perder prioridade operacional.',
    estrategia: 'Formalizar capacidade, reserva de volume e prioridade.',
    alavancaPrincipal: 'Capacidade',
    proximaAcao: 'Solicitar plano formal de capacidade.' },
  OBJ08: { codigo: 'OBJ08', nome: 'Garantir Abastecimento', categoria: 'Estratégico',
    diagnostico: 'Existe ameaça à continuidade de fornecimento.',
    risco: 'Ruptura operacional.',
    estrategia: 'Priorizar abastecimento, continuidade e contingência.',
    alavancaPrincipal: 'Continuidade',
    proximaAcao: 'Definir plano de abastecimento.' },
  OBJ09: { codigo: 'OBJ09', nome: 'Reduzir Dependência', categoria: 'Risco',
    diagnostico: 'O vendedor reforça exclusividade ou baixa substituibilidade.',
    risco: 'Dependência excessiva.',
    estrategia: 'Buscar segunda fonte, alternativas ou substituição parcial.',
    alavancaPrincipal: 'Dependência',
    proximaAcao: 'Construir plano de mitigação.' },
  OBJ10: { codigo: 'OBJ10', nome: 'Validar Valor e Evitar Dependência', categoria: 'Risco',
    diagnostico: 'O fornecedor sustenta diferencial tecnológico ou exclusivo.',
    risco: 'Criar lock-in sem avaliar benefícios.',
    estrategia: 'Mensurar valor entregue versus dependência criada.',
    alavancaPrincipal: 'Tecnologia',
    proximaAcao: 'Executar análise de dependência.' },
  OBJ11: { codigo: 'OBJ11', nome: 'Reduzir Risco de Suprimento', categoria: 'Risco',
    diagnostico: 'A objeção revela risco operacional, jurídico ou logístico.',
    risco: 'Transferência inadequada de risco para o comprador.',
    estrategia: 'Mapear riscos e controles.',
    alavancaPrincipal: 'Risco',
    proximaAcao: 'Criar matriz de risco.' },
  OBJ12: { codigo: 'OBJ12', nome: 'Controlar Reajuste com Previsibilidade', categoria: 'Econômico',
    diagnostico: 'O fornecedor busca reajuste recorrente ou estrutural.',
    risco: 'Perda de previsibilidade financeira.',
    estrategia: 'Estabelecer índices, gatilhos e critérios claros.',
    alavancaPrincipal: 'Índice',
    proximaAcao: 'Formalizar política de reajuste.' },
  OBJ13: { codigo: 'OBJ13', nome: 'Validar Reajuste', categoria: 'Econômico',
    diagnostico: 'Existe pedido de aumento baseado em custos.',
    risco: 'Aceitar reajuste sem fundamento.',
    estrategia: 'Validar premissas, índices e memória de cálculo.',
    alavancaPrincipal: 'Custo',
    proximaAcao: 'Auditar composição do reajuste.' },
  OBJ14: { codigo: 'OBJ14', nome: 'Preservar Parceria e Capturar Valor', categoria: 'Estratégico',
    diagnostico: 'O fornecedor possui relevância estratégica.',
    risco: 'Deteriorar relacionamento ou capturar pouco valor.',
    estrategia: 'Combinar parceria, governança e geração de valor.',
    alavancaPrincipal: 'Relacionamento',
    proximaAcao: 'Construir modelo ganha-ganha.' },
  OBJ15: { codigo: 'OBJ15', nome: 'Melhorar Performance sem Romper Relação', categoria: 'Estratégico',
    diagnostico: 'O fornecedor resiste a metas de prazo, SLA ou qualidade.',
    risco: 'Aceitar performance inadequada ou gerar ruptura.',
    estrategia: 'Implementar melhoria gradual.',
    alavancaPrincipal: 'Performance',
    proximaAcao: 'Criar plano evolutivo.' },
  OBJ16: { codigo: 'OBJ16', nome: 'Evitar Pressão Artificial', categoria: 'Governança',
    diagnostico: 'O vendedor utiliza urgência para acelerar decisão.',
    risco: 'Tomar decisão sem análise adequada.',
    estrategia: 'Validar urgência e preservar governança.',
    alavancaPrincipal: 'Prazo',
    proximaAcao: 'Solicitar formalização da condição.' },
  OBJ17: { codigo: 'OBJ17', nome: 'Manter Avanço sem Alongar Negociação', categoria: 'Governança',
    diagnostico: 'O vendedor utiliza aprovação interna como barreira.',
    risco: 'Perder velocidade de negociação.',
    estrategia: 'Apoiar aprovação e controlar prazo.',
    alavancaPrincipal: 'Follow-up',
    proximaAcao: 'Definir data de retorno.' },
  OBJ18: { codigo: 'OBJ18', nome: 'Viabilizar Compra com Baixo Esforço', categoria: 'Operacional',
    diagnostico: 'A categoria não justifica processo complexo.',
    risco: 'Desperdício de tempo e energia.',
    estrategia: 'Simplificar.',
    alavancaPrincipal: 'Eficiência',
    proximaAcao: 'Padronizar processo.' },
  OBJ19: { codigo: 'OBJ19', nome: 'Padronizar e Reduzir Esforço', categoria: 'Operacional',
    diagnostico: 'O processo possui excesso de customização.',
    risco: 'Custo transacional elevado.',
    estrategia: 'Automação e padronização.',
    alavancaPrincipal: 'Padronização',
    proximaAcao: 'Migrar para fluxo padrão.' },
  OBJ20: { codigo: 'OBJ20', nome: 'Proteger Contrato sem Travar Negociação', categoria: 'Contratual',
    diagnostico: 'Existe resistência contratual relevante.',
    risco: 'Perder proteção jurídica ou travar o negócio.',
    estrategia: 'Buscar equivalência de proteção.',
    alavancaPrincipal: 'Contrato',
    proximaAcao: 'Solicitar contraproposta jurídica.' },
};

// ===== §5 (4.0) — Matriz Oficial de Inferência (84 = 21 objeções × 4 quadrantes) =====
// Chave = objecaoId + '|' + quadrante  →  { primario, secundario } (códigos OBJxx).
// Transcrita da spec §5; o texto da objeção foi convertido para o ID OBJ_xx.
const MOTOR_REGRAS = {
  // GRUPO 1 — Preço e margem
  'OBJ_01|alavancagem': { primario: 'OBJ01', secundario: 'OBJ03' },
  'OBJ_01|estrategico': { primario: 'OBJ14', secundario: 'OBJ04' },
  'OBJ_01|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_01|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_08|alavancagem': { primario: 'OBJ01', secundario: 'OBJ02' },
  'OBJ_08|estrategico': { primario: 'OBJ14', secundario: 'OBJ04' },
  'OBJ_08|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_08|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_14|alavancagem': { primario: 'OBJ03', secundario: 'OBJ01' },
  'OBJ_14|estrategico': { primario: 'OBJ14', secundario: 'OBJ04' },
  'OBJ_14|gargalo': { primario: 'OBJ11', secundario: 'OBJ08' },
  'OBJ_14|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_09|alavancagem': { primario: 'OBJ03', secundario: 'OBJ01' },
  'OBJ_09|estrategico': { primario: 'OBJ14', secundario: 'OBJ04' },
  'OBJ_09|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_09|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_21|alavancagem': { primario: 'OBJ03', secundario: 'OBJ01' },
  'OBJ_21|estrategico': { primario: 'OBJ14', secundario: 'OBJ05' },
  'OBJ_21|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_21|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  // GRUPO 2 — Valor e diferenciação
  'OBJ_17|alavancagem': { primario: 'OBJ04', secundario: 'OBJ02' },
  'OBJ_17|estrategico': { primario: 'OBJ14', secundario: 'OBJ04' },
  'OBJ_17|gargalo': { primario: 'OBJ09', secundario: 'OBJ10' },
  'OBJ_17|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_18|alavancagem': { primario: 'OBJ04', secundario: 'OBJ02' },
  'OBJ_18|estrategico': { primario: 'OBJ10', secundario: 'OBJ14' },
  'OBJ_18|gargalo': { primario: 'OBJ09', secundario: 'OBJ10' },
  'OBJ_18|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_19|alavancagem': { primario: 'OBJ02', secundario: 'OBJ04' },
  'OBJ_19|estrategico': { primario: 'OBJ10', secundario: 'OBJ14' },
  'OBJ_19|gargalo': { primario: 'OBJ09', secundario: 'OBJ10' },
  'OBJ_19|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_02|alavancagem': { primario: 'OBJ04', secundario: 'OBJ02' },
  'OBJ_02|estrategico': { primario: 'OBJ05', secundario: 'OBJ14' },
  'OBJ_02|gargalo': { primario: 'OBJ08', secundario: 'OBJ09' },
  'OBJ_02|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  // GRUPO 3 — Custos e reajustes
  'OBJ_03|alavancagem': { primario: 'OBJ13', secundario: 'OBJ03' },
  'OBJ_03|estrategico': { primario: 'OBJ12', secundario: 'OBJ14' },
  'OBJ_03|gargalo': { primario: 'OBJ12', secundario: 'OBJ11' },
  'OBJ_03|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_07|alavancagem': { primario: 'OBJ02', secundario: 'OBJ13' },
  'OBJ_07|estrategico': { primario: 'OBJ14', secundario: 'OBJ12' },
  'OBJ_07|gargalo': { primario: 'OBJ11', secundario: 'OBJ08' },
  'OBJ_07|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  // GRUPO 4 — Capacidade e atendimento
  'OBJ_04|alavancagem': { primario: 'OBJ01', secundario: 'OBJ03' },
  'OBJ_04|estrategico': { primario: 'OBJ14', secundario: 'OBJ07' },
  'OBJ_04|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_04|nao_criticos': { primario: 'OBJ18', secundario: 'OBJ19' },

  'OBJ_06|alavancagem': { primario: 'OBJ02', secundario: 'OBJ01' },
  'OBJ_06|estrategico': { primario: 'OBJ07', secundario: 'OBJ14' },
  'OBJ_06|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_06|nao_criticos': { primario: 'OBJ18', secundario: 'OBJ19' },

  'OBJ_11|alavancagem': { primario: 'OBJ02', secundario: 'OBJ15' },
  'OBJ_11|estrategico': { primario: 'OBJ15', secundario: 'OBJ14' },
  'OBJ_11|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_11|nao_criticos': { primario: 'OBJ18', secundario: 'OBJ19' },

  'OBJ_10|alavancagem': { primario: 'OBJ15', secundario: 'OBJ02' },
  'OBJ_10|estrategico': { primario: 'OBJ15', secundario: 'OBJ14' },
  'OBJ_10|gargalo': { primario: 'OBJ11', secundario: 'OBJ08' },
  'OBJ_10|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  // GRUPO 5 — Contratual e governança
  'OBJ_05|alavancagem': { primario: 'OBJ01', secundario: 'OBJ03' },
  'OBJ_05|estrategico': { primario: 'OBJ14', secundario: 'OBJ12' },
  'OBJ_05|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_05|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_12|alavancagem': { primario: 'OBJ17', secundario: 'OBJ01' },
  'OBJ_12|estrategico': { primario: 'OBJ14', secundario: 'OBJ17' },
  'OBJ_12|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_12|nao_criticos': { primario: 'OBJ17', secundario: 'OBJ19' },

  'OBJ_13|alavancagem': { primario: 'OBJ20', secundario: 'OBJ03' },
  'OBJ_13|estrategico': { primario: 'OBJ20', secundario: 'OBJ14' },
  'OBJ_13|gargalo': { primario: 'OBJ11', secundario: 'OBJ08' },
  'OBJ_13|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_16|alavancagem': { primario: 'OBJ03', secundario: 'OBJ20' },
  'OBJ_16|estrategico': { primario: 'OBJ20', secundario: 'OBJ14' },
  'OBJ_16|gargalo': { primario: 'OBJ11', secundario: 'OBJ08' },
  'OBJ_16|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_15|alavancagem': { primario: 'OBJ06', secundario: 'OBJ04' },
  'OBJ_15|estrategico': { primario: 'OBJ14', secundario: 'OBJ05' },
  'OBJ_15|gargalo': { primario: 'OBJ08', secundario: 'OBJ09' },
  'OBJ_15|nao_criticos': { primario: 'OBJ19', secundario: 'OBJ18' },

  'OBJ_20|alavancagem': { primario: 'OBJ16', secundario: 'OBJ17' },
  'OBJ_20|estrategico': { primario: 'OBJ14', secundario: 'OBJ16' },
  'OBJ_20|gargalo': { primario: 'OBJ08', secundario: 'OBJ11' },
  'OBJ_20|nao_criticos': { primario: 'OBJ17', secundario: 'OBJ19' },
};

// ===== §6 (4.0) — Biblioteca DISC de Frases (80 = 20 objetivos × 4 perfis) =====
// Chave = objetivoCodigo + '|' + perfil. A frase é a única parte adaptada ao DISC.
const MOTOR_FRASES = {
  'OBJ01|D': 'Entendo sua posição. Considerando volume, recorrência e potencial da oportunidade, precisamos revisar a condição para garantir competitividade frente às alternativas disponíveis.',
  'OBJ01|I': 'Entendo sua posição e quero preservar uma relação sustentável para ambos. Vamos buscar uma condição que gere valor para vocês e seja defensável internamente para nós.',
  'OBJ01|S': 'Entendo. Podemos avaliar alternativas que tragam previsibilidade e segurança para os dois lados sem comprometer a continuidade da operação.',
  'OBJ01|C': 'Vamos analisar benchmark, TCO e composição da proposta para identificar oportunidades objetivas de redução.',

  'OBJ02|D': 'Preciso entender como sua proposta se posiciona frente ao mercado para justificar uma decisão competitiva.',
  'OBJ02|I': 'Quero garantir que estamos tomando a melhor decisão possível sem perder os benefícios da parceria construída.',
  'OBJ02|S': 'Vamos comparar as opções disponíveis de forma estruturada para reduzir riscos e aumentar segurança na decisão.',
  'OBJ02|C': 'Precisamos comparar preço, escopo, SLA, TCO e critérios técnicos para validar a competitividade da proposta.',

  'OBJ03|D': 'Se o preço já atingiu seu limite, vamos trabalhar outras alavancas que possam melhorar a competitividade da proposta.',
  'OBJ03|I': 'Talvez exista uma forma de gerar valor para ambos sem concentrar toda a negociação exclusivamente em preço.',
  'OBJ03|S': 'Podemos avaliar ajustes graduais em escopo, frequência ou modelo operacional para reduzir impacto para ambos.',
  'OBJ03|C': 'Vamos decompor os fatores que influenciam custo para identificar oportunidades técnicas de otimização.',

  'OBJ04|D': 'Se existe um diferencial relevante, preciso entender qual resultado concreto ele entrega para justificar essa condição.',
  'OBJ04|I': 'Reconheço o valor que vocês afirmam entregar. Vamos traduzir isso em benefícios objetivos para facilitar nossa decisão.',
  'OBJ04|S': 'Gostaria de entender como esse diferencial contribui para estabilidade, segurança e continuidade da operação.',
  'OBJ04|C': 'Precisamos medir esse diferencial por meio de indicadores, evidências e resultados comparáveis.',

  'OBJ05|D': 'Reconheço seu posicionamento. Agora precisamos comprovar objetivamente o valor adicional entregue.',
  'OBJ05|I': 'Valorizamos muito a relação construída. Para avançarmos, precisamos demonstrar internamente o diferencial de vocês.',
  'OBJ05|S': 'Vamos analisar o diferencial apresentado sem comprometer a confiança e a estabilidade da relação.',
  'OBJ05|C': 'Gostaria de avaliar métricas comparativas que sustentem tecnicamente essa diferenciação.',

  'OBJ06|D': 'Preço é apenas uma variável. Precisamos avaliar o resultado total gerado pela solução.',
  'OBJ06|I': 'Nosso objetivo é construir valor para ambos e não apenas discutir preço isoladamente.',
  'OBJ06|S': 'Precisamos avaliar todos os impactos da decisão para garantir uma solução equilibrada e sustentável.',
  'OBJ06|C': 'Vamos analisar TCO, SLA, risco, qualidade e performance para tomar uma decisão completa.',

  'OBJ07|D': 'Precisamos de uma garantia clara de capacidade para sustentar nossa operação.',
  'OBJ07|I': 'Quero construir uma solução que dê previsibilidade para ambos e preserve nossa parceria.',
  'OBJ07|S': 'Vamos estruturar um planejamento que ofereça segurança e estabilidade operacional.',
  'OBJ07|C': 'Preciso validar capacidade produtiva, lead time e critérios de priorização para reduzir riscos.',

  'OBJ08|D': 'O ponto principal é assegurar continuidade de fornecimento sem risco para nossa operação.',
  'OBJ08|I': 'Precisamos encontrar uma solução que preserve a parceria e garanta atendimento contínuo.',
  'OBJ08|S': 'Vamos construir um plano de abastecimento previsível e seguro para ambos.',
  'OBJ08|C': 'Gostaria de validar plano de continuidade, lead time e contingências disponíveis.',

  'OBJ09|D': 'Precisamos reduzir riscos associados à concentração excessiva em uma única alternativa.',
  'OBJ09|I': 'Quero preservar a relação, mas também construir um modelo sustentável para o longo prazo.',
  'OBJ09|S': 'Precisamos garantir segurança operacional mesmo em cenários de mudança.',
  'OBJ09|C': 'Vamos avaliar objetivamente o grau de dependência e os riscos associados.',

  'OBJ10|D': 'Se a tecnologia gera valor superior, precisamos medir esse ganho frente ao risco de dependência.',
  'OBJ10|I': 'Reconheço o diferencial da solução. Vamos avaliar como maximizar valor sem criar vulnerabilidades futuras.',
  'OBJ10|S': 'Precisamos garantir que a adoção dessa tecnologia preserve estabilidade e continuidade.',
  'OBJ10|C': 'Gostaria de comparar benefícios, riscos, substituibilidade e impacto operacional.',

  'OBJ11|D': 'Precisamos reduzir a exposição ao risco antes de avançar. Quero entender quais garantias existem para assegurar continuidade e minimizar impactos na operação.',
  'OBJ11|I': 'Quero construir uma solução segura para ambos os lados, preservando a parceria e reduzindo vulnerabilidades futuras.',
  'OBJ11|S': 'Vamos estruturar uma alternativa que aumente previsibilidade e reduza riscos para nossas operações.',
  'OBJ11|C': 'Gostaria de avaliar objetivamente os riscos envolvidos, os controles existentes e os mecanismos de mitigação disponíveis.',

  'OBJ12|D': 'Entendo a necessidade de reajuste, mas precisamos construir uma regra previsível que evite impactos inesperados ao longo do contrato.',
  'OBJ12|I': 'Vamos encontrar um modelo de reajuste que preserve a relação e dê previsibilidade para ambos.',
  'OBJ12|S': 'Precisamos criar uma estrutura estável que reduza incertezas futuras para nossas equipes.',
  'OBJ12|C': 'Gostaria de formalizar critérios objetivos, índices e gatilhos para garantir previsibilidade financeira.',

  'OBJ13|D': 'Antes de aprovar qualquer reajuste, preciso entender claramente os fatores que justificam esse aumento.',
  'OBJ13|I': 'Vamos analisar juntos os fundamentos do reajuste para garantir uma decisão justa para ambos.',
  'OBJ13|S': 'Quero compreender os impactos desse reajuste de forma estruturada para evitar riscos futuros.',
  'OBJ13|C': 'Precisamos validar memória de cálculo, índices utilizados, período de referência e componentes impactados.',

  'OBJ14|D': 'Nosso objetivo é manter uma relação estratégica, mas também garantir geração de valor para ambos os lados.',
  'OBJ14|I': 'Valorizamos muito essa parceria e queremos construir uma solução que fortaleça nossa relação no longo prazo.',
  'OBJ14|S': 'Precisamos encontrar um equilíbrio que preserve estabilidade, continuidade e benefícios mútuos.',
  'OBJ14|C': 'Vamos avaliar a proposta considerando valor total, riscos, performance e perspectivas futuras da parceria.',

  'OBJ15|D': 'Precisamos melhorar os resultados atuais sem comprometer a continuidade da relação.',
  'OBJ15|I': 'Quero encontrar um caminho de evolução que fortaleça a parceria e aumente a performance.',
  'OBJ15|S': 'Vamos construir um plano gradual de melhoria que seja seguro para todos os envolvidos.',
  'OBJ15|C': 'Precisamos definir indicadores claros, metas mensuráveis e um plano estruturado de evolução.',

  'OBJ16|D': 'Entendo a urgência, mas precisamos tomar uma decisão baseada em valor e não apenas em prazo.',
  'OBJ16|I': 'Quero avançar rapidamente, mas também garantir que a decisão seja boa para ambos.',
  'OBJ16|S': 'Precisamos de tempo suficiente para avaliar a proposta sem comprometer a segurança da decisão.',
  'OBJ16|C': 'Gostaria de entender objetivamente o motivo da limitação de prazo e validar os impactos envolvidos.',

  'OBJ17|D': 'Vamos definir claramente os próximos passos para evitar atrasos desnecessários.',
  'OBJ17|I': 'Posso ajudar a acelerar os alinhamentos internos para mantermos o ritmo da negociação.',
  'OBJ17|S': 'Vamos organizar um cronograma simples para garantir continuidade e previsibilidade.',
  'OBJ17|C': 'Precisamos estabelecer responsáveis, critérios de aprovação e datas objetivas para avançar.',

  'OBJ18|D': 'Precisamos encontrar uma solução simples e rápida que resolva a necessidade sem gerar complexidade desnecessária.',
  'OBJ18|I': 'Vamos buscar uma alternativa prática que funcione bem para todos os envolvidos.',
  'OBJ18|S': 'Gostaria de construir um processo simples e previsível para reduzir esforço operacional.',
  'OBJ18|C': 'Vamos simplificar o fluxo mantendo os controles necessários para garantir conformidade.',

  'OBJ19|D': 'Precisamos reduzir complexidade e tornar esse processo mais eficiente.',
  'OBJ19|I': 'Uma solução padronizada pode beneficiar todos os envolvidos e facilitar nossa interação.',
  'OBJ19|S': 'Vamos estruturar um modelo estável que reduza retrabalho e aumente previsibilidade.',
  'OBJ19|C': 'Gostaria de formalizar um padrão operacional que reduza custo transacional e aumente eficiência.',

  'OBJ20|D': 'Precisamos preservar as proteções essenciais do contrato sem impedir o avanço do negócio.',
  'OBJ20|I': 'Quero encontrar uma solução equilibrada que proteja ambos os lados e preserve a relação.',
  'OBJ20|S': 'Vamos construir uma alternativa contratual que gere segurança sem criar barreiras desnecessárias.',
  'OBJ20|C': 'Precisamos analisar tecnicamente a cláusula e buscar uma redação equivalente que preserve a proteção necessária.',
};

// ===== Índices de lookup (montados a partir dos dados acima) =====
const MOTOR_OBJECOES_BY_ID = {};
const MOTOR_OBJECOES_BY_TEXT = {};
MOTOR_OBJECOES.forEach(function (o) {
  MOTOR_OBJECOES_BY_ID[o.id] = o;
  MOTOR_OBJECOES_BY_TEXT[motorNormalizeText(o.texto)] = o.id;
});

// ===== Exposição global =====
window.motorNormalizeText = motorNormalizeText;
window.MOTOR_DISC = MOTOR_DISC;
window.MOTOR_KRALJIC = MOTOR_KRALJIC;
window.MOTOR_OBJECOES = MOTOR_OBJECOES;
window.MOTOR_OBJECOES_BY_ID = MOTOR_OBJECOES_BY_ID;
window.MOTOR_OBJECOES_BY_TEXT = MOTOR_OBJECOES_BY_TEXT;
window.MOTOR_RESPOSTAS = MOTOR_RESPOSTAS;
window.MOTOR_OBJETIVOS = MOTOR_OBJETIVOS;
window.MOTOR_REGRAS = MOTOR_REGRAS;
window.MOTOR_FRASES = MOTOR_FRASES;
