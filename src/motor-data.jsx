// Motor de Negociação Vorätte — base estática de conhecimento (dados)
// Porta browser-runnable da base canônica docs/motor-ia-voratte-v2.1.md (§4–27).
// Motor de REGRAS determinístico: a resposta vem de lookup + composição de
// fragmentos JÁ ESCRITOS no doc. Nunca gera texto novo, nunca inventa dados.
// Perspectiva SEMPRE do comprador.
//
// Expõe: window.MOTOR_DISC, MOTOR_SINAIS, MOTOR_RAIS, MOTOR_KRALJIC,
// MOTOR_OBJECOES, MOTOR_OBJECOES_BY_ID, MOTOR_OBJECOES_BY_TEXT,
// MOTOR_RESPOSTAS, MOTOR_OBJETIVOS, MOTOR_CASOS, MOTOR_CASOS_BY_KEY,
// MOTOR_CASOS_BY_PERFIL_OBJ, MOTOR_ETHICS, motorNormalizeText.
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

// ===== §11 — Sinais comportamentais (para inferência de perfil) =====
// palavrasChave = vocabulário canônico do doc (§4 linguagem típica, §11, §13).
const MOTOR_SINAIS = {
  D: {
    perfil: 'D',
    sinais: ['Fala direta', 'Pressiona por decisão', 'Pergunta sobre resultado', 'Testa limite de preço, prazo ou condição', 'Demonstra impaciência com explicações longas'],
    perguntasTipicas: ['Qual o ganho?', 'Quanto economiza?', 'Por que não decidir agora?', 'Qual a melhor condição?'],
    palavrasChave: ['resultado', 'ganho', 'prioridade', 'exclusividade', 'volume', 'velocidade', 'performance', 'roi', 'rápido', 'agora', 'economiza', 'economia', 'consequência', 'vantagem', 'decidir'],
  },
  I: {
    perfil: 'I',
    sinais: ['Busca conexão', 'Usa linguagem relacional', 'Valoriza parceria', 'Demonstra entusiasmo', 'Prefere conversa fluida'],
    perguntasTipicas: ['Como isso fortalece nossa parceria?', 'Quem mais está envolvido?', 'Como isso será percebido?', 'Podemos construir isso juntos?'],
    palavrasChave: ['parceria', 'relacionamento', 'juntos', 'conexão', 'visibilidade', 'reputação', 'reconhecimento', 'percebido', 'envolvido', 'entusiasmo', 'relacional'],
  },
  S: {
    perfil: 'S',
    sinais: ['Busca segurança', 'Evita conflito', 'Pede tempo', 'Valoriza continuidade', 'Demonstra cautela com mudança'],
    perguntasTipicas: ['Como será a transição?', 'Isso muda muito o processo atual?', 'Qual o risco?', 'Teremos previsibilidade?'],
    palavrasChave: ['segurança', 'continuidade', 'estabilidade', 'previsibilidade', 'confiança', 'transição', 'calma', 'gradual', 'estável', 'cautela', 'tempo'],
  },
  C: {
    perfil: 'C',
    sinais: ['Pede dados', 'Questiona premissas', 'Solicita documentação', 'Compara alternativas', 'Analisa riscos e critérios técnicos'],
    perguntasTipicas: ['Qual a base de cálculo?', 'Existe benchmark?', 'Tem estudo ou histórico?', 'Como isso se sustenta tecnicamente?'],
    palavrasChave: ['dados', 'benchmark', 'evidência', 'compliance', 'método', 'metodologia', 'auditoria', 'premissa', 'premissas', 'documentação', 'planilha', 'base de cálculo', 'histórico', 'técnico', 'critério', 'estudo'],
  },
};

// ===== §14 — Biblioteca R.A.I.S. (referência; 5 cenários por perfil) =====
const MOTOR_RAIS = {
  D: [
    { id: 'D-RAIS-01', tema: 'Redução de preço', razao: 'Com essa condição, conseguimos reduzir o custo total da categoria em 12%.', autoridade: 'Esse patamar está alinhado ao benchmark dos principais compradores do setor.', interesse: 'Ao fechar agora, você garante prioridade no volume previsto para este ciclo.', social: 'Outros fornecedores que aceitaram esse modelo ampliaram participação em compras futuras.' },
    { id: 'D-RAIS-02', tema: 'Contrato de longo prazo', razao: 'Um contrato de 24 meses reduz volatilidade e melhora previsibilidade de demanda.', autoridade: 'Esse modelo é utilizado por grandes grupos em categorias de alto impacto.', interesse: 'Você passa a ter maior previsibilidade de receita e planejamento comercial.', social: 'Três parceiros estratégicos já operam conosco neste formato.' },
    { id: 'D-RAIS-03', tema: 'SLA mais agressivo', razao: 'O novo SLA reduz falhas operacionais e melhora o nível de serviço.', autoridade: 'Esse indicador segue práticas de performance adotadas em contratos líderes.', interesse: 'Cumprindo esse SLA, você se posiciona como fornecedor prioritário.', social: 'Fornecedores que atingiram esse nível ganharam mais recorrência conosco.' },
    { id: 'D-RAIS-04', tema: 'Exclusividade', razao: 'A concentração de volume gera ganho de escala e melhora a eficiência comercial.', autoridade: 'Esse tipo de consolidação é comum em categorias com alto potencial de alavancagem.', interesse: 'Você ganha acesso preferencial às oportunidades futuras desta categoria.', social: 'Fornecedores que aceitaram exclusividade com contrapartidas claras cresceram em volume conosco.' },
    { id: 'D-RAIS-05', tema: 'Performance', razao: 'Melhorar performance agora reduz retrabalho, penalidades e risco de substituição.', autoridade: 'Indicadores de performance são critério padrão em programas estratégicos de fornecedores.', interesse: 'Você fortalece sua posição como fornecedor prioritário para novos projetos.', social: 'Parceiros com performance superior passaram a receber maior recorrência e previsibilidade de demanda.' },
  ],
  I: [
    { id: 'I-RAIS-01', tema: 'Fortalecimento de parceria', razao: 'Esse modelo reduz ruídos e melhora a fluidez entre nossas equipes.', autoridade: 'É uma prática comum em relações comerciais maduras e colaborativas.', interesse: 'Você ganha mais visibilidade como parceiro estratégico para nossa operação.', social: 'Outros parceiros que adotaram esse formato melhoraram o relacionamento com nossas áreas internas.' },
    { id: 'I-RAIS-02', tema: 'Novo modelo de governança', razao: 'A governança mensal evita desalinhamentos e melhora a comunicação.', autoridade: 'Esse modelo é utilizado por empresas com alto índice de colaboração fornecedor-cliente.', interesse: 'Você terá mais espaço para mostrar resultados e fortalecer a relação.', social: 'Parceiros que participam desse fórum têm maior proximidade com nossas lideranças.' },
    { id: 'I-RAIS-03', tema: 'Ajuste de proposta', razao: 'Se ajustarmos esse ponto, conseguimos avançar sem comprometer a qualidade da parceria.', autoridade: 'É uma solução já praticada em acordos colaborativos de longo prazo.', interesse: 'Isso preserva a confiança entre as equipes e evita desgaste desnecessário.', social: 'Outros fornecedores resolveram situações parecidas por esse caminho.' },
    { id: 'I-RAIS-04', tema: 'Reconhecimento como parceiro', razao: 'Uma proposta mais equilibrada permite ampliar a participação de vocês sem gerar atrito interno.', autoridade: 'Programas de parceria madura valorizam fornecedores que demonstram flexibilidade construtiva.', interesse: 'Você reforça sua imagem como parceiro confiável e colaborativo.', social: 'Fornecedores que atuaram dessa forma passaram a ser mais lembrados em novas demandas.' },
    { id: 'I-RAIS-05', tema: 'Construção conjunta', razao: 'Construindo uma solução conjunta, reduzimos retrabalho e aumentamos aderência ao que as áreas precisam.', autoridade: 'Modelos colaborativos costumam gerar maior adesão e menor resistência interna.', interesse: 'Você participa da solução, ganha influência e fortalece a relação com nossas áreas.', social: 'Outros parceiros que cocriaram propostas conosco tiveram maior aceitação interna.' },
  ],
  S: [
    { id: 'S-RAIS-01', tema: 'Contrato com previsibilidade', razao: 'Esse contrato estabiliza o fluxo de pedidos e reduz oscilações.', autoridade: 'É um modelo amplamente usado em cadeias maduras de fornecimento.', interesse: 'Você ganha segurança para planejar equipe, produção e capacidade.', social: 'Fornecedores semelhantes reduziram riscos operacionais com esse formato.' },
    { id: 'S-RAIS-02', tema: 'Mudança gradual de escopo', razao: 'A transição em fases reduz risco e evita ruptura operacional.', autoridade: 'Esse tipo de migração gradual é recomendado em processos críticos.', interesse: 'Você terá tempo para se adaptar sem comprometer sua operação.', social: 'Parceiros que seguiram esse modelo tiveram implantação mais tranquila.' },
    { id: 'S-RAIS-03', tema: 'Redução de risco', razao: 'O plano proposto reduz incertezas de prazo, volume e atendimento.', autoridade: 'Essa abordagem é aderente a boas práticas de gestão de risco em suprimentos.', interesse: 'Você terá clareza sobre próximos passos e responsabilidades.', social: 'Outros fornecedores usaram esse plano para manter estabilidade durante mudanças.' },
    { id: 'S-RAIS-04', tema: 'Planejamento antecipado', razao: 'Planejar com antecedência reduz urgências e melhora a alocação de recursos.', autoridade: 'Cadeias de suprimento maduras priorizam previsibilidade e planejamento compartilhado.', interesse: 'Você consegue organizar capacidade, equipe e entrega com menor pressão.', social: 'Fornecedores que adotaram planejamento antecipado reduziram retrabalho e atrasos.' },
    { id: 'S-RAIS-05', tema: 'Continuidade de fornecimento', razao: 'A estrutura proposta protege a continuidade de fornecimento e reduz rupturas.', autoridade: 'Planos de continuidade são prática recomendada para categorias com risco operacional.', interesse: 'Você terá mais segurança para manter a operação sem sobressaltos.', social: 'Parceiros em cenários semelhantes estabilizaram entregas após adotar esse modelo.' },
  ],
  C: [
    { id: 'C-RAIS-01', tema: 'TCO', razao: 'O TCO aponta redução de 8,7% no custo total em 12 meses.', autoridade: 'A metodologia considera histórico de consumo, custo logístico, SLA e risco.', interesse: 'Isso reduz exposição a desvios e melhora a previsibilidade técnica do contrato.', social: 'Benchmarks da categoria mostram resultados semelhantes em operações comparáveis.' },
    { id: 'C-RAIS-02', tema: 'Compliance contratual', razao: 'A cláusula reduz risco operacional e jurídico para ambas as partes.', autoridade: 'Esse padrão é adotado em contratos com maior criticidade regulatória.', interesse: 'Você ganha mais clareza sobre responsabilidades e limites de exposição.', social: 'Outros fornecedores já aceitaram essa redação em contratos equivalentes.' },
    { id: 'C-RAIS-03', tema: 'Benchmark técnico', razao: 'Os dados mostram que a proposta está acima do intervalo competitivo da categoria.', autoridade: 'A análise foi construída com base em benchmark, histórico e comparação técnica.', interesse: 'A adequação melhora sua competitividade sem comprometer margem de forma desestruturada.', social: 'Fornecedores semelhantes ajustaram a proposta com base nesse mesmo critério.' },
    { id: 'C-RAIS-04', tema: 'Redução de risco documental', razao: 'A documentação proposta reduz ambiguidades e evita divergências futuras.', autoridade: 'Contratos bem estruturados utilizam critérios objetivos para reduzir disputas.', interesse: 'Você ganha segurança sobre escopo, obrigação, prazo e responsabilidade.', social: 'Outros fornecedores aceitaram esse modelo após revisão técnica conjunta.' },
    { id: 'C-RAIS-05', tema: 'Critério de avaliação', razao: 'A decisão será baseada em critérios objetivos: TCO, SLA, risco e aderência técnica.', autoridade: 'Essa metodologia é compatível com boas práticas de compras estratégicas.', interesse: 'Você tem clareza sobre como será avaliado e pode ajustar a proposta com precisão.', social: 'Fornecedores que entenderam os critérios conseguiram melhorar competitividade sem perder controle técnico.' },
  ],
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

// ===== Objetivos do comprador — lista fechada (20 slugs) + famílias (11) =====
const MOTOR_OBJETIVOS = {
  slugs: {
    capturar_saving: 'Capturar saving',
    validar_competitividade: 'Validar competitividade',
    encontrar_alavancas_reducao: 'Encontrar alavancas técnicas de redução',
    validar_valor_real: 'Validar valor real',
    validar_diferenciacao: 'Validar diferenciação sem perder relacionamento',
    reposicionar_valor_total: 'Reposicionar a conversa para valor total',
    garantir_capacidade: 'Garantir capacidade',
    garantir_abastecimento: 'Garantir abastecimento',
    reduzir_dependencia: 'Reduzir dependência',
    validar_valor_evitar_dependencia: 'Validar valor e evitar dependência',
    reduzir_risco_suprimento: 'Reduzir risco de suprimento',
    controlar_reajuste: 'Controlar reajuste com previsibilidade',
    validar_reajuste: 'Validar reajuste',
    preservar_parceria: 'Preservar parceria e capturar valor',
    melhorar_performance: 'Melhorar performance sem romper relação',
    evitar_pressao_artificial: 'Evitar pressão artificial',
    manter_avanco: 'Manter avanço sem alongar negociação',
    viabilizar_compra_baixo_esforco: 'Viabilizar compra com baixo esforço',
    padronizar_reduzir_esforco: 'Padronizar e reduzir esforço',
    proteger_contrato: 'Proteger contrato sem travar negociação',
  },
  familias: {
    capturar_saving: 'capturar_valor_economico',
    validar_competitividade: 'capturar_valor_economico',
    encontrar_alavancas_reducao: 'capturar_valor_economico',
    validar_valor_real: 'reposicionar_valor',
    validar_diferenciacao: 'reposicionar_valor',
    reposicionar_valor_total: 'reposicionar_valor',
    garantir_capacidade: 'garantir_suprimento',
    garantir_abastecimento: 'garantir_suprimento',
    reduzir_dependencia: 'reduzir_dependencia',
    validar_valor_evitar_dependencia: 'reduzir_dependencia',
    reduzir_risco_suprimento: 'reduzir_risco',
    controlar_reajuste: 'controlar_reajuste',
    validar_reajuste: 'controlar_reajuste',
    preservar_parceria: 'preservar_parceria',
    melhorar_performance: 'gerir_performance',
    evitar_pressao_artificial: 'gerir_processo_negociacao',
    manter_avanco: 'gerir_processo_negociacao',
    viabilizar_compra_baixo_esforco: 'reduzir_esforco',
    padronizar_reduzir_esforco: 'reduzir_esforco',
    proteger_contrato: 'proteger_contrato',
  },
  // mapaCasos (texto normalizado -> slug) é montado abaixo via forEach.
  mapaCasos: {},
};

// ===== §20–23 — Casos de Decisão (20; chave de lookup principal) =====
const MOTOR_CASOS = [
  {
    id: 'CASE_D_01', perfil: 'D', objecaoId: 'OBJ_01', quadrante: 'alavancagem', objetivo: 'capturar_saving',
    diagnostico: 'O vendedor está usando uma afirmação de limite para encerrar a discussão econômica e testar a pressão do comprador.',
    risco: 'Aceitar a condição sem explorar contrapartidas ou alternativas competitivas.',
    estrategia: 'Responder com objetividade, consequência e alternativas de negociação.',
    frase: 'Entendo. Se esse é o limite de preço, precisamos avaliar contrapartidas objetivas: volume, prazo, SLA ou condição de pagamento. Sem algum ajuste, a proposta perde competitividade frente às alternativas.',
    proximaAcao: 'Solicitar proposta revisada com contrapartidas claras e comparar com benchmark.',
  },
  {
    id: 'CASE_D_02', perfil: 'D', objecaoId: 'OBJ_06', quadrante: 'estrategico', objetivo: 'garantir_capacidade',
    diagnostico: 'O vendedor está usando escassez de capacidade como elemento de poder e pressão.',
    risco: 'Aceitar condições desfavoráveis sem garantia formal de atendimento.',
    estrategia: 'Transformar escassez em compromisso objetivo de capacidade, SLA e prioridade.',
    frase: 'Se há restrição de capacidade, precisamos garantir prioridade com critérios objetivos: volume, prazo, SLA e compromisso formal. Sem isso, o risco operacional permanece.',
    proximaAcao: 'Solicitar plano formal de capacidade e compromisso de atendimento.',
  },
  {
    id: 'CASE_D_03', perfil: 'D', objecaoId: 'OBJ_20', quadrante: 'alavancagem', objetivo: 'evitar_pressao_artificial',
    diagnostico: 'O vendedor está usando urgência como mecanismo de fechamento.',
    risco: 'Decidir sem governança, comparação ou validação interna.',
    estrategia: 'Validar a urgência, exigir formalização e preservar o processo competitivo.',
    frase: 'Entendo a urgência. Para decidirmos nesse prazo, preciso que a condição venha acompanhada de ganho claro, validade formal e impacto objetivo. Caso contrário, seguiremos o processo competitivo.',
    proximaAcao: 'Solicitar proposta formal e justificativa objetiva da validade.',
  },
  {
    id: 'CASE_D_04', perfil: 'D', objecaoId: 'OBJ_17', quadrante: 'estrategico', objetivo: 'validar_valor_real',
    diagnostico: 'O vendedor usa autoridade de mercado para sustentar posição comercial.',
    risco: 'Pagar prêmio por reputação sem comprovar impacto real.',
    estrategia: 'Reconhecer liderança, mas exigir tradução em indicadores concretos.',
    frase: 'Reconheço a posição de vocês. Agora precisamos traduzir essa liderança em resultado mensurável para nossa operação: performance, risco, SLA e impacto no custo total.',
    proximaAcao: 'Solicitar indicadores de performance, cases e dados comparativos.',
  },
  {
    id: 'CASE_D_05', perfil: 'D', objecaoId: 'OBJ_19', quadrante: 'gargalo', objetivo: 'reduzir_dependencia',
    diagnostico: 'O vendedor reforça uma posição de baixa substituibilidade para aumentar poder de barganha.',
    risco: 'Aumentar dependência sem garantias, plano de contingência ou compromisso de continuidade.',
    estrategia: 'Tratar a criticidade com contrapartidas formais e plano de mitigação.',
    frase: 'Se não há equivalente direto, precisamos discutir valor total, compromisso de entrega e contrapartidas proporcionais à criticidade. Também precisamos de um plano claro de continuidade.',
    proximaAcao: 'Mapear dependência, alternativas parciais e plano de contingência.',
  },
  {
    id: 'CASE_I_01', perfil: 'I', objecaoId: 'OBJ_02', quadrante: 'estrategico', objetivo: 'validar_diferenciacao',
    diagnostico: 'O vendedor está tentando sustentar valor por reputação e percepção de qualidade.',
    risco: 'Aceitar argumento relacional ou reputacional sem evidência objetiva.',
    estrategia: 'Reconhecer a qualidade percebida e pedir evidências aplicáveis à operação.',
    frase: 'Reconheço o valor da relação e da qualidade entregue. Para sustentar internamente essa escolha, precisamos mostrar de forma clara o diferencial de vocês em performance, risco e resultado.',
    proximaAcao: 'Solicitar indicadores de qualidade, histórico e comparação com alternativas.',
  },
  {
    id: 'CASE_I_02', perfil: 'I', objecaoId: 'OBJ_15', quadrante: 'alavancagem', objetivo: 'reposicionar_valor_total',
    diagnostico: 'O vendedor está usando uma objeção emocional para tentar retirar a negociação do campo econômico.',
    risco: 'Ficar defensivo ou abandonar critérios objetivos.',
    estrategia: 'Validar a parceria e explicar critérios de valor total.',
    frase: 'A parceria importa muito para nós. Justamente por isso avaliamos mais do que preço: consideramos TCO, qualidade, SLA, risco e sustentabilidade da relação.',
    proximaAcao: 'Apresentar matriz de avaliação multicritério.',
  },
  {
    id: 'CASE_I_03', perfil: 'I', objecaoId: 'OBJ_09', quadrante: 'estrategico', objetivo: 'preservar_parceria',
    diagnostico: 'O vendedor busca proteger margem usando linguagem de sustentabilidade da relação.',
    risco: 'Ceder sem contrapartida por receio de prejudicar a parceria.',
    estrategia: 'Reforçar parceria, mas abrir alavancas de valor.',
    frase: 'Queremos uma relação sustentável. Vamos encontrar um ponto que preserve a parceria e atenda aos critérios internos de compra, olhando preço, volume, prazo, escopo e previsibilidade.',
    proximaAcao: 'Construir cenário com alternativas comerciais e contrapartidas.',
  },
  {
    id: 'CASE_I_04', perfil: 'I', objecaoId: 'OBJ_18', quadrante: 'estrategico', objetivo: 'validar_valor_evitar_dependencia',
    diagnostico: 'O vendedor usa diferenciação tecnológica como argumento de valor e prestígio.',
    risco: 'Aceitar dependência sem comprovar impacto operacional.',
    estrategia: 'Reconhecer o diferencial e pedir demonstração do impacto concreto.',
    frase: 'A tecnologia de vocês pode fortalecer muito a parceria. Vamos mostrar internamente como esse diferencial gera valor concreto em desempenho, risco, eficiência ou continuidade.',
    proximaAcao: 'Solicitar demonstração, comparativo funcional e avaliação de dependência.',
  },
  {
    id: 'CASE_I_05', perfil: 'I', objecaoId: 'OBJ_12', quadrante: 'nao_criticos', objetivo: 'manter_avanco',
    diagnostico: 'O vendedor precisa alinhar internamente ou está usando aprovação como adiamento.',
    risco: 'A negociação se alongar em uma categoria que deveria ser simples.',
    estrategia: 'Apoiar a aprovação, mas fixar prazo e próximos passos.',
    frase: 'Claro. Posso te ajudar a estruturar a mensagem para que sua aprovação interna seja mais fluida. Para mantermos o avanço, combinamos um retorno até amanhã com as duas opções fechadas?',
    proximaAcao: 'Definir prazo de retorno e condições objetivas para aprovação.',
  },
  {
    id: 'CASE_S_01', perfil: 'S', objecaoId: 'OBJ_11', quadrante: 'gargalo', objetivo: 'garantir_abastecimento',
    diagnostico: 'O vendedor demonstra preocupação real ou percebida com estabilidade operacional.',
    risco: 'Pressionar prazo inviável ou aceitar atraso sem mitigação.',
    estrategia: 'Construir plano faseado, previsível e com contingência.',
    frase: 'Podemos estruturar uma transição por etapas, com prazos realistas e menor risco de ruptura. O importante é garantir segurança para sua operação e continuidade para a nossa.',
    proximaAcao: 'Solicitar cronograma por fases e plano de contingência.',
  },
  {
    id: 'CASE_S_02', perfil: 'S', objecaoId: 'OBJ_10', quadrante: 'estrategico', objetivo: 'melhorar_performance',
    diagnostico: 'O vendedor evita assumir obrigação que percebe como arriscada.',
    risco: 'Aceitar SLA abaixo do necessário ou criar pressão excessiva.',
    estrategia: 'Propor evolução gradual com marcos e segurança operacional.',
    frase: 'Podemos estruturar uma evolução gradual do SLA, com marcos de melhoria e segurança operacional. Assim evitamos ruptura e construímos performance de forma sustentável.',
    proximaAcao: 'Definir SLA mínimo, SLA-alvo e plano de evolução.',
  },
  {
    id: 'CASE_S_03', perfil: 'S', objecaoId: 'OBJ_03', quadrante: 'estrategico', objetivo: 'controlar_reajuste',
    diagnostico: 'O vendedor busca repassar custos, mas pode estar sensível a estabilidade e continuidade.',
    risco: 'Aceitar aumento integral sem estrutura ou romper estabilidade da relação.',
    estrategia: 'Revisar custos com calma, usar índices e propor previsibilidade futura.',
    frase: 'Podemos revisar os custos de forma estruturada, evitando mudanças bruscas e criando previsibilidade para os próximos ciclos. Vamos separar o impacto real do que pode ser compensado por eficiência.',
    proximaAcao: 'Solicitar índice, período de referência e proposta com vigência definida.',
  },
  {
    id: 'CASE_S_04', perfil: 'S', objecaoId: 'OBJ_16', quadrante: 'gargalo', objetivo: 'reduzir_risco_suprimento',
    diagnostico: 'O vendedor está avesso a exposição e precisa de clareza sobre limites de responsabilidade.',
    risco: 'Assumir risco demais ou deixar risco sem dono.',
    estrategia: 'Construir matriz de risco, limites e mitigadores.',
    frase: 'Podemos criar um modelo de transição, limites claros e plano de contingência para reduzir insegurança. O objetivo é que o risco fique claro e controlado para os dois lados.',
    proximaAcao: 'Criar matriz de risco com responsabilidades e plano de mitigação.',
  },
  {
    id: 'CASE_S_05', perfil: 'S', objecaoId: 'OBJ_04', quadrante: 'nao_criticos', objetivo: 'viabilizar_compra_baixo_esforco',
    diagnostico: 'O vendedor teme baixa atratividade e possível ineficiência operacional.',
    risco: 'Gastar energia excessiva em categoria simples ou aceitar sobrepreço desnecessário.',
    estrategia: 'Propor padronização, recorrência ou consolidação simples.',
    frase: 'Podemos estruturar um modelo gradual, começando com menor volume e criando previsibilidade para evolução futura, sem tornar o processo mais complexo do que precisa ser.',
    proximaAcao: 'Avaliar catálogo, pedido mínimo, recorrência ou consolidação com outros itens.',
  },
  {
    id: 'CASE_C_01', perfil: 'C', objecaoId: 'OBJ_07', quadrante: 'alavancagem', objetivo: 'validar_competitividade',
    diagnostico: 'O vendedor resiste à transparência, possivelmente por proteção de margem ou política interna.',
    risco: 'Ficar sem base técnica para validar preço ou reajuste.',
    estrategia: 'Substituir abertura total por evidência parcial, benchmark e premissas.',
    frase: 'Podemos substituir a abertura completa por memória de cálculo resumida, índices verificáveis, premissas e benchmark independente. O objetivo é validar competitividade sem expor informações sensíveis.',
    proximaAcao: 'Solicitar dados agregados, índice de referência e benchmark comparativo.',
  },
  {
    id: 'CASE_C_02', perfil: 'C', objecaoId: 'OBJ_08', quadrante: 'nao_criticos', objetivo: 'padronizar_reduzir_esforco',
    diagnostico: 'O vendedor usa política comercial como barreira a negociação.',
    risco: 'Discutir demais uma categoria de baixa criticidade ou aceitar preço sem lógica.',
    estrategia: 'Validar se o preço padrão é adequado ao volume, escopo e processo.',
    frase: 'Vamos comparar a condição padrão com o perfil da demanda, volume, SLA, prazo e benchmark para avaliar se ela é tecnicamente adequada.',
    proximaAcao: 'Comparar preço padrão com catálogo, benchmark e custo transacional.',
  },
  {
    id: 'CASE_C_03', perfil: 'C', objecaoId: 'OBJ_13', quadrante: 'estrategico', objetivo: 'proteger_contrato',
    diagnostico: 'O vendedor identifica risco contratual e precisa de base técnica para aceitar alternativa.',
    risco: 'Abrir mão de proteção crítica ou criar impasse jurídico.',
    estrategia: 'Analisar risco específico e propor redação equivalente.',
    frase: 'Vamos analisar o risco específico, comparar com contratos similares e ajustar a redação com base técnica, desde que a proteção operacional seja preservada.',
    proximaAcao: 'Solicitar contraproposta jurídica com matriz de risco.',
  },
  {
    id: 'CASE_C_04', perfil: 'C', objecaoId: 'OBJ_03', quadrante: 'alavancagem', objetivo: 'validar_reajuste',
    diagnostico: 'O vendedor apresenta justificativa econômica que exige validação objetiva.',
    risco: 'Aceitar aumento sem índice, base de cálculo ou comparação de mercado.',
    estrategia: 'Exigir memória de cálculo, índice, período e impacto real.',
    frase: 'Vamos analisar índices, período de referência, componentes impactados e memória de cálculo para validar tecnicamente o reajuste.',
    proximaAcao: 'Solicitar documentação do reajuste e simular impacto no TCO.',
  },
  {
    id: 'CASE_C_05', perfil: 'C', objecaoId: 'OBJ_14', quadrante: 'alavancagem', objetivo: 'encontrar_alavancas_reducao',
    diagnostico: 'O vendedor indica limite de concessão e precisa discutir variáveis objetivas.',
    risco: 'Repetir pressão por desconto sem alterar variáveis econômicas.',
    estrategia: 'Analisar componentes de custo e alavancas técnicas.',
    frase: 'Vamos verificar tecnicamente quais componentes de custo são fixos e quais podem ser otimizados. Podemos avaliar volume, frequência, escopo, prazo e SLA para encontrar uma condição defensável.',
    proximaAcao: 'Criar análise de sensibilidade com variáveis comerciais e técnicas.',
  },
];

// ===== §26–27 — Regras de qualidade e ética =====
const MOTOR_ETHICS = {
  nuncaRecomendar: ['Mentira', 'Blefe falso', 'Pressão abusiva', 'Manipulação emocional', 'Informação inventada', 'Benchmark fictício', 'Urgência falsa', 'Ameaça indevida'],
  semprePriorizar: ['Ética', 'Transparência', 'Critério técnico', 'Dados verificáveis', 'Preservação da relação', 'Criação de valor', 'Sustentabilidade do acordo'],
  regrasQualidade: [
    'Responder sempre pela ótica do comprador.',
    'Considerar DISC, objeção e Kraljic.',
    'Ser específica e prática.',
    'Sugerir frase aplicável.',
    'Indicar risco e próxima ação.',
    'Evitar generalidades.',
    'Não inventar dados.',
    'Não criar benchmarks fictícios.',
    'Não recomendar blefes falsos.',
    'Não incentivar manipulação emocional.',
  ],
};

// ===== Índices de lookup (montados a partir dos dados acima) =====
const MOTOR_OBJECOES_BY_ID = {};
const MOTOR_OBJECOES_BY_TEXT = {};
MOTOR_OBJECOES.forEach(function (o) {
  MOTOR_OBJECOES_BY_ID[o.id] = o;
  MOTOR_OBJECOES_BY_TEXT[motorNormalizeText(o.texto)] = o.id;
});

// mapaCasos: texto verboso normalizado -> slug, e também slug -> slug (idempotente).
Object.keys(MOTOR_OBJETIVOS.slugs).forEach(function (slug) {
  MOTOR_OBJETIVOS.mapaCasos[motorNormalizeText(MOTOR_OBJETIVOS.slugs[slug])] = slug;
  MOTOR_OBJETIVOS.mapaCasos[slug] = slug;
});

const MOTOR_CASOS_BY_KEY = {};
const MOTOR_CASOS_BY_PERFIL_OBJ = {};
MOTOR_CASOS.forEach(function (c) {
  const key = c.perfil + '|' + c.objecaoId + '|' + c.quadrante + '|' + c.objetivo;
  MOTOR_CASOS_BY_KEY[key] = c;
  const pk = c.perfil + '|' + c.objecaoId;
  if (!MOTOR_CASOS_BY_PERFIL_OBJ[pk]) MOTOR_CASOS_BY_PERFIL_OBJ[pk] = [];
  MOTOR_CASOS_BY_PERFIL_OBJ[pk].push(c);
});
// Garante ordem determinística (por id) dentro de cada bucket parcial.
Object.keys(MOTOR_CASOS_BY_PERFIL_OBJ).forEach(function (pk) {
  MOTOR_CASOS_BY_PERFIL_OBJ[pk].sort(function (a, b) {
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
});

// ===== Exposição global =====
window.motorNormalizeText = motorNormalizeText;
window.MOTOR_DISC = MOTOR_DISC;
window.MOTOR_SINAIS = MOTOR_SINAIS;
window.MOTOR_RAIS = MOTOR_RAIS;
window.MOTOR_KRALJIC = MOTOR_KRALJIC;
window.MOTOR_OBJECOES = MOTOR_OBJECOES;
window.MOTOR_OBJECOES_BY_ID = MOTOR_OBJECOES_BY_ID;
window.MOTOR_OBJECOES_BY_TEXT = MOTOR_OBJECOES_BY_TEXT;
window.MOTOR_RESPOSTAS = MOTOR_RESPOSTAS;
window.MOTOR_OBJETIVOS = MOTOR_OBJETIVOS;
window.MOTOR_CASOS = MOTOR_CASOS;
window.MOTOR_CASOS_BY_KEY = MOTOR_CASOS_BY_KEY;
window.MOTOR_CASOS_BY_PERFIL_OBJ = MOTOR_CASOS_BY_PERFIL_OBJ;
window.MOTOR_ETHICS = MOTOR_ETHICS;
