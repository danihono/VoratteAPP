# ESPECIFICAÇÃO DO MOTOR DE IA VORATTE v2.1
### Base Estática de Conhecimento para Negociação Inteligente em Compras
**DISC + R.A.I.S. + Kraljic + Objeções + Casos de Decisão**

---

## Controle do Documento

- **Versão:** 2.1
- **Status:** Base estática inicial para implementação
- **Objetivo:** Reduzir dependência de consultas online e disponibilizar uma base estruturada para motor de regras, RAG local, agente de IA ou banco de conhecimento interno.
- **Público-alvo:** Produto, Engenharia, IA, Especialistas de Compras, Treinamento e Negociação
- **Perspectiva obrigatória:** Comprador

---

## 1. Propósito da Versão 2.1

A versão 2.1 transforma o material conceitual da Voratte em uma base operacional estática para uso direto por um motor de IA.

Esta versão foi desenhada para:

1. Reduzir ou eliminar consultas online em uma primeira implementação.
2. Padronizar respostas do motor de IA.
3. Consolidar o conhecimento em blocos reutilizáveis.
4. Permitir implementação como banco de dados, JSON, planilha estruturada, prompt system ou camada RAG local.
5. Preservar a ótica do comprador em todas as recomendações.
6. Substituir integralmente qualquer referência anterior a animais pelo modelo DISC puro.

---

## 2. Premissa-Mestra do Motor

> **O usuário da plataforma é sempre o comprador.**

Toda recomendação deve responder à pergunta:

> *Como eu, comprador, devo agir diante deste vendedor, desta objeção, deste contexto de compra e deste risco?*

O motor **não** deve orientar o vendedor. O motor **não** deve ensinar como vender para o comprador. O motor deve orientar o comprador a negociar melhor.

---

## 3. Princípios de Funcionamento

O motor deve sempre combinar quatro dimensões:

1. Perfil DISC provável do vendedor
2. Objeção apresentada pelo vendedor
3. Quadrante Kraljic da categoria ou fornecedor
4. Objetivo do comprador na negociação

A resposta da IA deve conter:

1. Diagnóstico comportamental
2. Risco para o comprador
3. Estratégia recomendada
4. Frase sugerida
5. Próxima melhor ação

---

## 4. Taxonomia DISC Oficial

A partir desta versão, a base utiliza exclusivamente DISC. Não devem existir referências a animais, arquétipos ou metáforas visuais.

| Código | Perfil | Essência | Motivadores | Risco típico |
|--------|--------|----------|-------------|--------------|
| **D** | Dominante | Resultado, velocidade e assertividade | Ganho, controle, vantagem, ROI | Confronto, pressão, disputa de poder |
| **I** | Influente | Relacionamento, entusiasmo e conexão | Reconhecimento, parceria, reputação | Superficialidade, promessas vagas, emoção excessiva |
| **S** | Estável | Segurança, continuidade e previsibilidade | Estabilidade, confiança, baixo risco | Postergação, resistência passiva, aversão a mudança |
| **C** | Conforme | Dados, método e precisão | Evidência, compliance, benchmark | Excesso de análise, rigidez, impasse técnico |

---

## 5. Perfil D — Dominante

### 5.1 Essência
Perfil orientado a resultado, velocidade, decisão e controle.

### 5.2 Como se comporta em negociação
- Vai direto ao ponto.
- Pressiona por decisão.
- Testa limites.
- Valoriza ganho concreto.
- Busca vantagem clara.
- Pode ser impaciente com detalhes excessivos.

### 5.3 Como decide
Decide rapidamente quando percebe:
- ROI claro.
- Vantagem competitiva.
- Ganho financeiro.
- Consequência objetiva.
- Prioridade ou exclusividade.

### 5.4 Linguagem típica
Resultado · Ganho · Prioridade · Exclusividade · Melhor condição · Volume · Velocidade · Performance

### 5.5 Riscos para o comprador
- Ser pressionado a decidir rápido demais.
- Entrar em disputa de ego.
- Ceder por confronto.
- Perder controle do processo.

### 5.6 Estratégia do comprador
- Ser direto.
- Usar dados objetivos.
- Apresentar opções claras.
- Mostrar consequências.
- Evitar rodeios.
- Não entrar em confronto pessoal.

### 5.7 Gatilhos eficazes
ROI · Resultado · Velocidade · Consequência · Exclusividade · Volume · Perda evitada · Ganho competitivo

---

## 6. Perfil I — Influente

### 6.1 Essência
Perfil orientado a relacionamento, conexão, reconhecimento e influência.

### 6.2 Como se comporta em negociação
- Valoriza conversa.
- Busca conexão pessoal.
- Usa linguagem relacional.
- Prefere ambiente positivo.
- Pode prometer mais do que consegue cumprir.
- Pode evitar tensão direta.

### 6.3 Como decide
Decide com base em:
- Confiança.
- Reputação.
- Validação social.
- Impacto relacional.
- Percepção de parceria.

### 6.4 Linguagem típica
Parceria · Confiança · Juntos · Relacionamento · Visibilidade · Reputação · Reconhecimento

### 6.5 Riscos para o comprador
- Ser levado por simpatia.
- Aceitar promessas vagas.
- Perder critério técnico.
- Evitar formalização para preservar relação.

### 6.6 Estratégia do comprador
- Reconhecer a parceria.
- Manter tom positivo.
- Trazer estrutura.
- Formalizar compromissos.
- Traduzir boa vontade em próximos passos objetivos.

### 6.7 Gatilhos eficazes
Relacionamento · Reconhecimento · Influência · Visibilidade · Parceria · Reputação · Prova social

---

## 7. Perfil S — Estável

### 7.1 Essência
Perfil orientado a segurança, previsibilidade, estabilidade e continuidade.

### 7.2 Como se comporta em negociação
- Evita conflito.
- Precisa de tempo.
- Valoriza estabilidade.
- Busca clareza.
- Resiste a mudanças bruscas.
- Pode postergar decisões difíceis.

### 7.3 Como decide
Decide quando percebe:
- Baixo risco.
- Previsibilidade.
- Processo claro.
- Continuidade.
- Segurança operacional.
- Confiança na relação.

### 7.4 Linguagem típica
Segurança · Continuidade · Estabilidade · Processo · Previsibilidade · Transição · Confiança

### 7.5 Riscos para o comprador
- Decisão lenta.
- Resistência passiva.
- Falta de clareza.
- Adiamento de conversas críticas.
- Baixa reação diante de urgência.

### 7.6 Estratégia do comprador
- Criar ambiente seguro.
- Explicar passo a passo.
- Dar previsibilidade.
- Reduzir incerteza.
- Evitar pressão excessiva.
- Conduzir a decisão com calma e estrutura.

### 7.7 Gatilhos eficazes
Segurança · Continuidade · Previsibilidade · Confiança · Estabilidade · Redução de risco · Transição gradual

---

## 8. Perfil C — Conforme

### 8.1 Essência
Perfil orientado a dados, método, precisão, evidência e compliance.

### 8.2 Como se comporta em negociação
- Questiona premissas.
- Solicita dados.
- Pede documentação.
- Analisa riscos.
- Compara alternativas.
- Pode travar se faltar informação.

### 8.3 Como decide
Decide após análise de:
- Dados.
- Benchmarks.
- Documentos.
- Riscos.
- Critérios técnicos.
- Compliance.

### 8.4 Linguagem típica
Dados · Benchmark · Processo · Critério · Evidência · Premissa · Metodologia · Compliance

### 8.5 Riscos para o comprador
- Impasse técnico.
- Excesso de análise.
- Discussão longa sem decisão.
- Rigidez contratual.
- Perda de timing.

### 8.6 Estratégia do comprador
- Preparar dados.
- Usar TCO.
- Apresentar benchmark.
- Explicar premissas.
- Antecipar objeções técnicas.
- Formalizar critérios.

### 8.7 Gatilhos eficazes
Dados · Benchmark · Evidência · Compliance · Método · Auditoria · Processo · Controle de risco

---

## 9. Motor de Identificação DISC

A IA **não** deve afirmar o perfil do vendedor como fato absoluto.

A formulação correta é:
> *O vendedor apresenta indícios de perfil C.*

Ou:
> *O comportamento observado sugere predominância de D, com traços secundários de C.*

### 9.1 Estrutura de score sugerida

| Confiança | Critério |
|-----------|----------|
| Baixa | 1 sinal isolado |
| Média | 2 a 3 sinais coerentes |
| Alta | 4 ou mais sinais coerentes |

### 9.2 Exemplo de inferência

**Evidências observadas:**
- Pediu benchmark.
- Questionou metodologia.
- Solicitou planilha.
- Pediu base de cálculo.

**Score sugerido:**

| Perfil | Probabilidade |
|--------|---------------|
| D | 10% |
| I | 5% |
| S | 20% |
| C | 65% |

**Conclusão:**
- Perfil predominante: **C**
- Confiança: **Alta**
- Estratégia: responder com dados, método, benchmark e documentação.

---

## 10. DISC × Conflito

| Perfil | Tendência no conflito | Risco | Conduta recomendada ao comprador |
|--------|----------------------|-------|----------------------------------|
| **D** | Competitivo | Disputa de poder, confronto e pressão | Usar lógica, consequência e limites claros |
| **I** | Acomodado ou comprometido | Ceder para preservar relação | Manter vínculo, mas formalizar critérios |
| **S** | Evasivo ou acomodado | Evitar tensão e postergar decisão | Criar segurança, previsibilidade e condução passo a passo |
| **C** | Colaborativo ou comprometido | Impasse técnico e excesso de análise | Trazer dados, critérios e método decisório |

---

## 11. Leitura Comportamental do Vendedor

### 11.1 Sinais de D
- Fala direta.
- Pressiona por decisão.
- Pergunta sobre resultado.
- Testa limite de preço, prazo ou condição.
- Demonstra impaciência com explicações longas.

**Perguntas típicas:**
- Qual o ganho?
- Quanto economiza?
- Por que não decidir agora?
- Qual a melhor condição?

### 11.2 Sinais de I
- Busca conexão.
- Usa linguagem relacional.
- Valoriza parceria.
- Demonstra entusiasmo.
- Prefere conversa fluida.

**Perguntas típicas:**
- Como isso fortalece nossa parceria?
- Quem mais está envolvido?
- Como isso será percebido?
- Podemos construir isso juntos?

### 11.3 Sinais de S
- Busca segurança.
- Evita conflito.
- Pede tempo.
- Valoriza continuidade.
- Demonstra cautela com mudança.

**Perguntas típicas:**
- Como será a transição?
- Isso muda muito o processo atual?
- Qual o risco?
- Teremos previsibilidade?

### 11.4 Sinais de C
- Pede dados.
- Questiona premissas.
- Solicita documentação.
- Compara alternativas.
- Analisa riscos e critérios técnicos.

**Perguntas típicas:**
- Qual a base de cálculo?
- Existe benchmark?
- Tem estudo ou histórico?
- Como isso se sustenta tecnicamente?

---

## 12. Framework R.A.I.S.

O R.A.I.S. é o modelo de argumentação usado pelo comprador para persuadir o vendedor conforme seu perfil DISC.

| Letra | Significado | Função |
|-------|-------------|--------|
| **R** | Razão | Apresentar benefício racional concreto |
| **A** | Autoridade | Apoiar a tese com referência externa, padrão de mercado ou benchmark |
| **I** | Interesse | Mostrar ganho específico para a contraparte |
| **S** | Social | Demonstrar prova social, caso semelhante ou adoção por pares |

---

## 13. Gatilhos R.A.I.S. por Perfil DISC

| Perfil | Gatilhos principais |
|--------|---------------------|
| **D** | ROI, resultado, velocidade, consequência, exclusividade, vantagem |
| **I** | relacionamento, reconhecimento, influência, visibilidade, parceria, reputação |
| **S** | segurança, continuidade, previsibilidade, estabilidade, confiança, redução de risco |
| **C** | dados, benchmark, evidência, compliance, método, auditoria, processo |

---

## 14. Biblioteca R.A.I.S. Expandida

### 14.1 R.A.I.S. para Perfil D — Dominante

**Cenário D-RAIS-01 — Redução de preço**
- **R — Razão:** Com essa condição, conseguimos reduzir o custo total da categoria em 12%.
- **A — Autoridade:** Esse patamar está alinhado ao benchmark dos principais compradores do setor.
- **I — Interesse:** Ao fechar agora, você garante prioridade no volume previsto para este ciclo.
- **S — Social:** Outros fornecedores que aceitaram esse modelo ampliaram participação em compras futuras.

**Cenário D-RAIS-02 — Contrato de longo prazo**
- **R — Razão:** Um contrato de 24 meses reduz volatilidade e melhora previsibilidade de demanda.
- **A — Autoridade:** Esse modelo é utilizado por grandes grupos em categorias de alto impacto.
- **I — Interesse:** Você passa a ter maior previsibilidade de receita e planejamento comercial.
- **S — Social:** Três parceiros estratégicos já operam conosco neste formato.

**Cenário D-RAIS-03 — SLA mais agressivo**
- **R — Razão:** O novo SLA reduz falhas operacionais e melhora o nível de serviço.
- **A — Autoridade:** Esse indicador segue práticas de performance adotadas em contratos líderes.
- **I — Interesse:** Cumprindo esse SLA, você se posiciona como fornecedor prioritário.
- **S — Social:** Fornecedores que atingiram esse nível ganharam mais recorrência conosco.

**Cenário D-RAIS-04 — Exclusividade**
- **R — Razão:** A concentração de volume gera ganho de escala e melhora a eficiência comercial.
- **A — Autoridade:** Esse tipo de consolidação é comum em categorias com alto potencial de alavancagem.
- **I — Interesse:** Você ganha acesso preferencial às oportunidades futuras desta categoria.
- **S — Social:** Fornecedores que aceitaram exclusividade com contrapartidas claras cresceram em volume conosco.

**Cenário D-RAIS-05 — Performance**
- **R — Razão:** Melhorar performance agora reduz retrabalho, penalidades e risco de substituição.
- **A — Autoridade:** Indicadores de performance são critério padrão em programas estratégicos de fornecedores.
- **I — Interesse:** Você fortalece sua posição como fornecedor prioritário para novos projetos.
- **S — Social:** Parceiros com performance superior passaram a receber maior recorrência e previsibilidade de demanda.

### 14.2 R.A.I.S. para Perfil I — Influente

**Cenário I-RAIS-01 — Fortalecimento de parceria**
- **R — Razão:** Esse modelo reduz ruídos e melhora a fluidez entre nossas equipes.
- **A — Autoridade:** É uma prática comum em relações comerciais maduras e colaborativas.
- **I — Interesse:** Você ganha mais visibilidade como parceiro estratégico para nossa operação.
- **S — Social:** Outros parceiros que adotaram esse formato melhoraram o relacionamento com nossas áreas internas.

**Cenário I-RAIS-02 — Novo modelo de governança**
- **R — Razão:** A governança mensal evita desalinhamentos e melhora a comunicação.
- **A — Autoridade:** Esse modelo é utilizado por empresas com alto índice de colaboração fornecedor-cliente.
- **I — Interesse:** Você terá mais espaço para mostrar resultados e fortalecer a relação.
- **S — Social:** Parceiros que participam desse fórum têm maior proximidade com nossas lideranças.

**Cenário I-RAIS-03 — Ajuste de proposta**
- **R — Razão:** Se ajustarmos esse ponto, conseguimos avançar sem comprometer a qualidade da parceria.
- **A — Autoridade:** É uma solução já praticada em acordos colaborativos de longo prazo.
- **I — Interesse:** Isso preserva a confiança entre as equipes e evita desgaste desnecessário.
- **S — Social:** Outros fornecedores resolveram situações parecidas por esse caminho.

**Cenário I-RAIS-04 — Reconhecimento como parceiro**
- **R — Razão:** Uma proposta mais equilibrada permite ampliar a participação de vocês sem gerar atrito interno.
- **A — Autoridade:** Programas de parceria madura valorizam fornecedores que demonstram flexibilidade construtiva.
- **I — Interesse:** Você reforça sua imagem como parceiro confiável e colaborativo.
- **S — Social:** Fornecedores que atuaram dessa forma passaram a ser mais lembrados em novas demandas.

**Cenário I-RAIS-05 — Construção conjunta**
- **R — Razão:** Construindo uma solução conjunta, reduzimos retrabalho e aumentamos aderência ao que as áreas precisam.
- **A — Autoridade:** Modelos colaborativos costumam gerar maior adesão e menor resistência interna.
- **I — Interesse:** Você participa da solução, ganha influência e fortalece a relação com nossas áreas.
- **S — Social:** Outros parceiros que cocriaram propostas conosco tiveram maior aceitação interna.

### 14.3 R.A.I.S. para Perfil S — Estável

**Cenário S-RAIS-01 — Contrato com previsibilidade**
- **R — Razão:** Esse contrato estabiliza o fluxo de pedidos e reduz oscilações.
- **A — Autoridade:** É um modelo amplamente usado em cadeias maduras de fornecimento.
- **I — Interesse:** Você ganha segurança para planejar equipe, produção e capacidade.
- **S — Social:** Fornecedores semelhantes reduziram riscos operacionais com esse formato.

**Cenário S-RAIS-02 — Mudança gradual de escopo**
- **R — Razão:** A transição em fases reduz risco e evita ruptura operacional.
- **A — Autoridade:** Esse tipo de migração gradual é recomendado em processos críticos.
- **I — Interesse:** Você terá tempo para se adaptar sem comprometer sua operação.
- **S — Social:** Parceiros que seguiram esse modelo tiveram implantação mais tranquila.

**Cenário S-RAIS-03 — Redução de risco**
- **R — Razão:** O plano proposto reduz incertezas de prazo, volume e atendimento.
- **A — Autoridade:** Essa abordagem é aderente a boas práticas de gestão de risco em suprimentos.
- **I — Interesse:** Você terá clareza sobre próximos passos e responsabilidades.
- **S — Social:** Outros fornecedores usaram esse plano para manter estabilidade durante mudanças.

**Cenário S-RAIS-04 — Planejamento antecipado**
- **R — Razão:** Planejar com antecedência reduz urgências e melhora a alocação de recursos.
- **A — Autoridade:** Cadeias de suprimento maduras priorizam previsibilidade e planejamento compartilhado.
- **I — Interesse:** Você consegue organizar capacidade, equipe e entrega com menor pressão.
- **S — Social:** Fornecedores que adotaram planejamento antecipado reduziram retrabalho e atrasos.

**Cenário S-RAIS-05 — Continuidade de fornecimento**
- **R — Razão:** A estrutura proposta protege a continuidade de fornecimento e reduz rupturas.
- **A — Autoridade:** Planos de continuidade são prática recomendada para categorias com risco operacional.
- **I — Interesse:** Você terá mais segurança para manter a operação sem sobressaltos.
- **S — Social:** Parceiros em cenários semelhantes estabilizaram entregas após adotar esse modelo.

### 14.4 R.A.I.S. para Perfil C — Conforme

**Cenário C-RAIS-01 — TCO**
- **R — Razão:** O TCO aponta redução de 8,7% no custo total em 12 meses.
- **A — Autoridade:** A metodologia considera histórico de consumo, custo logístico, SLA e risco.
- **I — Interesse:** Isso reduz exposição a desvios e melhora a previsibilidade técnica do contrato.
- **S — Social:** Benchmarks da categoria mostram resultados semelhantes em operações comparáveis.

**Cenário C-RAIS-02 — Compliance contratual**
- **R — Razão:** A cláusula reduz risco operacional e jurídico para ambas as partes.
- **A — Autoridade:** Esse padrão é adotado em contratos com maior criticidade regulatória.
- **I — Interesse:** Você ganha mais clareza sobre responsabilidades e limites de exposição.
- **S — Social:** Outros fornecedores já aceitaram essa redação em contratos equivalentes.

**Cenário C-RAIS-03 — Benchmark técnico**
- **R — Razão:** Os dados mostram que a proposta está acima do intervalo competitivo da categoria.
- **A — Autoridade:** A análise foi construída com base em benchmark, histórico e comparação técnica.
- **I — Interesse:** A adequação melhora sua competitividade sem comprometer margem de forma desestruturada.
- **S — Social:** Fornecedores semelhantes ajustaram a proposta com base nesse mesmo critério.

**Cenário C-RAIS-04 — Redução de risco documental**
- **R — Razão:** A documentação proposta reduz ambiguidades e evita divergências futuras.
- **A — Autoridade:** Contratos bem estruturados utilizam critérios objetivos para reduzir disputas.
- **I — Interesse:** Você ganha segurança sobre escopo, obrigação, prazo e responsabilidade.
- **S — Social:** Outros fornecedores aceitaram esse modelo após revisão técnica conjunta.

**Cenário C-RAIS-05 — Critério de avaliação**
- **R — Razão:** A decisão será baseada em critérios objetivos: TCO, SLA, risco e aderência técnica.
- **A — Autoridade:** Essa metodologia é compatível com boas práticas de compras estratégicas.
- **I — Interesse:** Você tem clareza sobre como será avaliado e pode ajustar a proposta com precisão.
- **S — Social:** Fornecedores que entenderam os critérios conseguiram melhorar competitividade sem perder controle técnico.

---

## 15. Matriz de Kraljic Expandida

A Matriz de Kraljic orienta a estratégia de compra conforme dois eixos:
1. Impacto financeiro
2. Risco de suprimento

O quadrante representa a posição do fornecedor ou da categoria para o comprador.

### 15.1 Alavancagem
**Alto impacto financeiro / Baixo risco de suprimento**

- **Posição do fornecedor:** Há alternativas disponíveis e o comprador possui poder de barganha.
- **Objetivo do comprador:** Capturar valor econômico.
- **Estratégia recomendada:** Competição entre fornecedores, negociação de preço, TCO, volume e condições comerciais.
- **Abordagem:**
  - Rodar concorrência estruturada.
  - Comparar propostas.
  - Usar benchmarks.
  - Negociar savings.
  - Evitar dependência desnecessária.
  - Manter contratos com flexibilidade de saída.
- **Indicadores relevantes:** Saving · TCO · Preço unitário · Competitividade · Condição de pagamento · Volume negociado
- **Risco principal:** Focar apenas em preço e comprometer qualidade, SLA ou relacionamento futuro.
- **Estilo de negociação:** Assertivo, competitivo e objetivo.
- **Uso do DISC:**
  - Com D: falar em resultado, volume e consequência.
  - Com I: preservar relação, mas ancorar em comparativos.
  - Com S: mostrar previsibilidade e baixo risco da mudança.
  - Com C: usar dados, TCO e benchmark.

### 15.2 Estratégico
**Alto impacto financeiro / Alto risco de suprimento**

- **Posição do fornecedor:** Parceiro crítico, difícil de substituir, com alto impacto no negócio.
- **Objetivo do comprador:** Garantir continuidade, performance, inovação e proteção da relação sem perder critério.
- **Estratégia recomendada:** Parceria estruturada de longo prazo, governança, desenvolvimento conjunto e gestão de risco.
- **Abordagem:**
  - Criar governança formal.
  - Estabelecer QBRs.
  - Desenvolver roadmap conjunto.
  - Definir SLAs estratégicos.
  - Monitorar riscos.
  - Construir planos de continuidade.
  - Negociar valor total, não apenas preço.
- **Indicadores relevantes:** SLA · Continuidade de fornecimento · Inovação · Risco operacional · Performance · Nível de colaboração · Plano de contingência
- **Risco principal:** Tratar fornecedor estratégico como commodity ou perder poder de controle por excesso de dependência.
- **Estilo de negociação:** Colaborativo, estruturado e orientado a longo prazo.
- **Uso do DISC:**
  - Com D: mostrar impacto estratégico e ganho competitivo.
  - Com I: reforçar parceria, reputação e visibilidade.
  - Com S: enfatizar continuidade, segurança e previsibilidade.
  - Com C: apresentar governança, dados, risco e critérios.

### 15.3 Gargalo
**Baixo impacto financeiro / Alto risco de suprimento**

- **Posição do fornecedor:** Poucas alternativas, risco de ruptura, dependência técnica ou logística.
- **Objetivo do comprador:** Garantir abastecimento e reduzir exposição ao risco.
- **Estratégia recomendada:** Segurança de suprimento, plano de contingência, desenvolvimento de alternativas e previsibilidade.
- **Abordagem:**
  - Mapear dependências.
  - Criar estoque de segurança.
  - Desenvolver segunda fonte.
  - Negociar lead time.
  - Formalizar compromisso de fornecimento.
  - Monitorar risco de ruptura.
  - Reduzir customizações desnecessárias.
- **Indicadores relevantes:** Lead time · Risco de ruptura · Dependência · Estoque de segurança · Capacidade produtiva · Tempo de homologação de alternativa
- **Risco principal:** Subestimar uma categoria de baixo valor financeiro, mas altamente crítica para a operação.
- **Estilo de negociação:** Preventivo, cauteloso e orientado a continuidade.
- **Uso do DISC:**
  - Com D: mostrar consequência operacional da ruptura.
  - Com I: construir colaboração e compromisso.
  - Com S: reforçar segurança, estabilidade e planejamento.
  - Com C: detalhar riscos, documentação e plano técnico.

### 15.4 Não Crítico
**Baixo impacto financeiro / Baixo risco de suprimento**

- **Posição do fornecedor:** Item rotineiro, baixa criticidade, alta disponibilidade.
- **Objetivo do comprador:** Reduzir esforço operacional e custo transacional.
- **Estratégia recomendada:** Automação, catálogo, padronização e eficiência processual.
- **Abordagem:**
  - Automatizar compras recorrentes.
  - Usar catálogo.
  - Padronizar especificações.
  - Reduzir aprovações manuais.
  - Consolidar fornecedores quando fizer sentido.
  - Evitar negociações complexas.
- **Indicadores relevantes:** Tempo de ciclo · Custo transacional · Aderência ao catálogo · Volume de pedidos manuais · Eficiência operacional
- **Risco principal:** Gastar energia excessiva em uma categoria que não justifica negociação sofisticada.
- **Estilo de negociação:** Simples, transacional e padronizado.
- **Uso do DISC:**
  - Com D: resolver rápido e com objetividade.
  - Com I: manter cordialidade, mas sem alongar discussão.
  - Com S: garantir clareza de processo.
  - Com C: formalizar padrão, catálogo e regras.

---

## 16. Biblioteca Mestra de Objeções

### 16.1 Lista oficial de objeções

**Grupo 1 — Preço**
1. Já estamos no limite de preço.
2. Esse é o nosso preço padrão.
3. Não consigo reduzir mais.
4. Precisamos preservar nossa margem.
5. Se reduzirmos mais, não vale a pena fazer o negócio.

**Grupo 2 — Valor**
1. A concorrência não entrega o mesmo nível de qualidade.
2. Somos líderes do mercado.
3. Temos tecnologia exclusiva.
4. Não temos concorrentes equivalentes.

**Grupo 3 — Custos**
1. Nossos custos aumentaram.
2. Não podemos abrir nossa estrutura de custos.

**Grupo 4 — Capacidade**
1. O volume é muito pequeno.
2. Temos fila de clientes.
3. Não conseguimos atender esse SLA.
4. Não consigo entregar nesse prazo.

**Grupo 5 — Contrato e Governança**
1. O prazo de pagamento é muito longo.
2. Preciso de aprovação interna.
3. Essa cláusula é difícil para nós.
4. Não podemos assumir esse risco.
5. Vocês compram apenas pelo menor preço.
6. Essa condição só vale até amanhã.

---

## 17. Estrutura Padrão para Tratamento de Objeções

Para cada objeção, o motor deve gerar:
1. Diagnóstico
2. Intenção provável
3. Risco para o comprador
4. Estratégia recomendada
5. O que não fazer
6. Frase sugerida por perfil DISC
7. Próxima ação

---

## 18. Biblioteca de Objeções — Respostas por Perfil DISC

### 18.1 Objeção 01 — Já estamos no limite de preço
- **Diagnóstico:** O vendedor está tentando encerrar a negociação de preço ou testar o limite do comprador.
- **Intenção provável:** Proteger margem · Evitar nova concessão · Forçar contrapartida · Testar pressão competitiva.
- **Risco para o comprador:** Aceitar a afirmação sem explorar alternativas comerciais, contrapartidas ou composição de valor.
- **O que não fazer:** Insistir apenas em desconto · Entrar em confronto direto · Aceitar sem validar mercado.
- **Resposta para D:** Entendo. Se esse é o limite de preço, precisamos avaliar contrapartidas objetivas: volume, prazo, SLA ou condição de pagamento. Sem algum ajuste, a proposta perde competitividade frente às alternativas.
- **Resposta para I:** Entendo sua posição e quero preservar nossa parceria. Vamos buscar uma alternativa que mantenha valor para vocês, mas também seja defensável internamente para nós.
- **Resposta para S:** Entendo. Podemos olhar com calma quais condições dariam mais previsibilidade para os dois lados sem gerar risco para sua operação.
- **Resposta para C:** Vamos validar tecnicamente esse limite abrindo os principais componentes da proposta, comparando com benchmark e avaliando onde existe espaço de ajuste.
- **Próxima ação:** Solicitar proposta revisada com alternativas de contrapartida.

### 18.2 Objeção 02 — A concorrência não entrega o mesmo nível de qualidade
- **Diagnóstico:** O vendedor desloca a discussão de preço para valor percebido e diferenciação.
- **Intenção provável:** Justificar prêmio de preço · Evitar comparação direta · Reforçar superioridade técnica.
- **Risco para o comprador:** Pagar prêmio sem validar se a diferença de qualidade é real, mensurável e necessária.
- **O que não fazer:** Desconsiderar qualidade · Comparar apenas preço · Aceitar argumento sem evidência.
- **Resposta para D:** Se a qualidade é superior, precisamos traduzir isso em resultado objetivo: menor falha, menor retrabalho, maior produtividade ou redução de risco. Vamos comparar impacto real.
- **Resposta para I:** Reconheço o valor da relação e da qualidade entregue. Para sustentar internamente essa escolha, precisamos mostrar de forma clara o diferencial de vocês.
- **Resposta para S:** Entendo. Vamos avaliar como essa qualidade reduz risco e aumenta estabilidade para a operação ao longo do contrato.
- **Resposta para C:** Vamos comparar os critérios técnicos, indicadores de performance, histórico de falhas, SLA e custo total para validar a diferença de qualidade.
- **Próxima ação:** Solicitar evidências objetivas de qualidade e comparar TCO.

### 18.3 Objeção 03 — Nossos custos aumentaram
- **Diagnóstico:** O vendedor usa aumento de custos como justificativa para preço ou resistência a desconto.
- **Intenção provável:** Repassar inflação · Preservar margem · Evitar abertura detalhada.
- **Risco para o comprador:** Aceitar repasse integral sem validar índice, período, base e impacto real.
- **O que não fazer:** Aceitar aumento genérico · Rejeitar sem análise · Discutir sem base de cálculo.
- **Resposta para D:** Entendo o aumento, mas precisamos separar impacto real de repasse integral. Vamos avaliar o que é justificável e qual contrapartida mantém a proposta competitiva.
- **Resposta para I:** Entendo que o cenário de custos pressiona vocês. Vamos construir uma solução equilibrada que preserve a parceria e seja justificável para ambos.
- **Resposta para S:** Podemos revisar os custos de forma estruturada, evitando mudanças bruscas e criando previsibilidade para os próximos ciclos.
- **Resposta para C:** Vamos analisar índices, período de referência, componentes impactados e memória de cálculo para validar tecnicamente o reajuste.
- **Próxima ação:** Solicitar composição resumida do aumento, índice de referência e proposta alternativa.

### 18.4 Objeção 04 — O volume é muito pequeno
- **Diagnóstico:** O vendedor questiona atratividade comercial do negócio.
- **Intenção provável:** Justificar preço maior · Evitar personalização · Pedir volume mínimo ou contrapartida.
- **Risco para o comprador:** Aceitar condição ruim sem explorar consolidação, recorrência ou potencial futuro.
- **O que não fazer:** Prometer volume inexistente · Pressionar sem contrapartida · Ignorar custo operacional do fornecedor.
- **Resposta para D:** Se o volume atual é pequeno, vamos discutir potencial total, recorrência e contrapartidas. O ponto é tornar o negócio atrativo sem perder competitividade.
- **Resposta para I:** Entendo. Podemos olhar essa oportunidade como porta de entrada para ampliar a parceria se a primeira entrega funcionar bem.
- **Resposta para S:** Podemos estruturar um modelo gradual, começando com menor volume e criando previsibilidade para evolução futura.
- **Resposta para C:** Vamos calcular o impacto do volume mínimo, custo operacional, lote econômico e alternativas de consolidação.
- **Próxima ação:** Avaliar consolidação de demanda, contrato guarda-chuva ou volume recorrente.

### 18.5 Objeção 05 — O prazo de pagamento é muito longo
- **Diagnóstico:** O vendedor demonstra preocupação com fluxo de caixa e custo financeiro.
- **Intenção provável:** Reduzir prazo · Embutir custo financeiro no preço · Condicionar desconto a pagamento antecipado.
- **Risco para o comprador:** Perder valor total por olhar apenas prazo ou apenas preço.
- **O que não fazer:** Impor prazo sem avaliar impacto · Ignorar custo financeiro · Negociar preço e pagamento separadamente.
- **Resposta para D:** Podemos avaliar uma troca objetiva: prazo menor contra preço melhor, ou prazo atual com condição comercial ajustada. Precisamos otimizar o ganho total.
- **Resposta para I:** Entendo o impacto no caixa de vocês. Vamos buscar uma composição que preserve a parceria e seja sustentável para os dois lados.
- **Resposta para S:** Podemos simular alternativas de pagamento para trazer previsibilidade e evitar pressão financeira desnecessária.
- **Resposta para C:** Vamos comparar o custo financeiro implícito em cada prazo e calcular o impacto no TCO da proposta.
- **Próxima ação:** Rodar simulação de preço versus prazo de pagamento.

### 18.6 Objeção 06 — Temos fila de clientes
- **Diagnóstico:** O vendedor usa escassez de capacidade como argumento de poder.
- **Intenção provável:** Reduzir concessões · Pressionar decisão rápida · Valorizar capacidade limitada.
- **Risco para o comprador:** Aceitar condições desfavoráveis por medo de perder disponibilidade.
- **O que não fazer:** Ceder por urgência sem validar capacidade · Entrar em disputa de importância · Ignorar risco de abastecimento.
- **Resposta para D:** Se há restrição de capacidade, precisamos garantir prioridade com critérios objetivos: volume, prazo, SLA e compromisso formal. Sem isso, o risco operacional permanece.
- **Resposta para I:** Entendo que vocês têm alta demanda. Justamente por valorizarmos a parceria, precisamos alinhar como garantir espaço para nossa operação.
- **Resposta para S:** Vamos construir um planejamento de capacidade que dê segurança para os dois lados e evite rupturas.
- **Resposta para C:** Precisamos entender capacidade disponível, lead time, janelas de produção e critérios de priorização para avaliar o risco real.
- **Próxima ação:** Solicitar confirmação formal de capacidade, lead time e plano de atendimento.

### 18.7 Objeção 07 — Não podemos abrir nossa estrutura de custos
- **Diagnóstico:** O vendedor resiste à transparência de custos.
- **Intenção provável:** Proteger margem · Evitar exposição comercial · Manter assimetria de informação.
- **Risco para o comprador:** Ficar sem base para validar preço, reajuste ou pedido de aumento.
- **O que não fazer:** Exigir abertura total sem alternativa · Tratar como má-fé automaticamente · Aceitar ausência total de evidência.
- **Resposta para D:** Não precisamos abrir todos os detalhes sensíveis, mas precisamos de elementos suficientes para justificar competitividade. Podemos trabalhar com faixas, índices e premissas.
- **Resposta para I:** Entendo que há informações sensíveis. Podemos encontrar um formato confortável para vocês e suficiente para manter confiança no processo.
- **Resposta para S:** Podemos usar uma abertura parcial ou indicadores de referência para dar segurança aos dois lados sem expor informações estratégicas.
- **Resposta para C:** Podemos substituir a abertura completa por memória de cálculo resumida, índices verificáveis, premissas e benchmark independente.
- **Próxima ação:** Propor modelo de transparência parcial com dados agregados.

### 18.8 Objeção 08 — Esse é o nosso preço padrão
- **Diagnóstico:** O vendedor tenta encerrar a negociação com uma política comercial genérica.
- **Intenção provável:** Evitar customização · Proteger tabela · Reduzir esforço de negociação.
- **Risco para o comprador:** Aceitar tabela sem considerar volume, recorrência, risco, SLA ou potencial de parceria.
- **O que não fazer:** Aceitar padrão como imutável · Desqualificar a política do fornecedor · Negociar sem contrapartida.
- **Resposta para D:** Entendo que esse é o padrão. Mas nosso cenário tem volume, recorrência e potencial. Precisamos discutir uma condição proporcional ao valor total da oportunidade.
- **Resposta para I:** Entendo a política de vocês. Podemos construir uma exceção bem justificada que fortaleça a relação e seja defensável para ambos.
- **Resposta para S:** Podemos avaliar uma condição gradual, mantendo segurança para vocês e previsibilidade para nós.
- **Resposta para C:** Vamos comparar a condição padrão com o perfil da demanda, volume, SLA, prazo e benchmark para avaliar se ela é tecnicamente adequada.
- **Próxima ação:** Solicitar cenário alternativo com contrapartida comercial.

### 18.9 Objeção 09 — Precisamos preservar nossa margem
- **Diagnóstico:** O vendedor desloca a discussão para sustentabilidade econômica da proposta.
- **Intenção provável:** Resistir a desconto · Buscar contrapartidas · Evitar erosão de margem.
- **Risco para o comprador:** Aceitar margem do fornecedor como limite sem analisar alternativas de valor.
- **O que não fazer:** Tratar margem como problema exclusivo do fornecedor · Forçar desconto inviável · Ignorar sustentabilidade da entrega.
- **Resposta para D:** Entendo a necessidade de margem. Então vamos discutir quais contrapartidas permitem melhorar a condição sem inviabilizar o negócio: volume, prazo, mix ou SLA.
- **Resposta para I:** Queremos uma relação sustentável. Vamos encontrar um ponto que preserve a parceria e atenda aos critérios internos de compra.
- **Resposta para S:** Podemos buscar uma solução equilibrada, sem mudanças bruscas, que preserve a continuidade do fornecimento.
- **Resposta para C:** Vamos analisar quais componentes impactam margem e quais alavancas comerciais podem otimizar o custo total sem comprometer viabilidade.
- **Próxima ação:** Mapear alavancas comerciais além do preço unitário.

### 18.10 Objeção 10 — Não conseguimos atender esse SLA
- **Diagnóstico:** O vendedor indica limitação operacional, técnica ou de capacidade.
- **Intenção provável:** Reduzir obrigação contratual · Evitar penalidade · Ajustar expectativa de performance.
- **Risco para o comprador:** Aceitar SLA insuficiente para a criticidade da categoria.
- **O que não fazer:** Impor SLA sem avaliar capacidade real · Aceitar SLA baixo sem plano de mitigação · Ignorar impacto operacional.
- **Resposta para D:** Se esse SLA não é viável, precisamos decidir entre ajustar escopo, criar contrapartidas ou avaliar alternativas que protejam a operação.
- **Resposta para I:** Vamos trabalhar juntos em um SLA que seja possível para vocês e aceitável para nossas áreas internas.
- **Resposta para S:** Podemos estruturar uma evolução gradual do SLA, com marcos de melhoria e segurança operacional.
- **Resposta para C:** Vamos entender os limites técnicos, histórico de performance, capacidade e riscos antes de definir o SLA final.
- **Próxima ação:** Criar matriz de SLA mínimo, desejável e plano de evolução.

### 18.11 Objeção 11 — Não consigo entregar nesse prazo
- **Diagnóstico:** O vendedor sinaliza restrição de lead time, capacidade, logística ou prioridade.
- **Intenção provável:** Evitar compromisso arriscado · Ganhar prazo · Reorganizar prioridade.
- **Risco para o comprador:** Aceitar atraso sem plano de contingência ou pressionar entrega inviável.
- **O que não fazer:** Pressionar sem entender causa · Aceitar prazo sem consequência · Ignorar alternativa de mitigação.
- **Resposta para D:** Se esse prazo não for viável, precisamos decidir rapidamente entre ajustar escopo, criar entrega parcial ou considerar fonte alternativa.
- **Resposta para I:** Vamos construir juntos uma alternativa que preserve a relação e evite desgaste com as áreas envolvidas.
- **Resposta para S:** Podemos estruturar uma transição por etapas, com prazos realistas e menor risco de ruptura.
- **Resposta para C:** Preciso entender tecnicamente quais etapas limitam o prazo. Vamos revisar cronograma, capacidade e dependências.
- **Próxima ação:** Solicitar cronograma alternativo com entregas parciais e riscos.

### 18.12 Objeção 12 — Preciso de aprovação interna
- **Diagnóstico:** O vendedor posterga decisão ou depende de autoridade superior.
- **Intenção provável:** Ganhar tempo · Evitar decisão individual · Validar concessão · Criar barreira interna.
- **Risco para o comprador:** Perder momentum ou deixar a negociação voltar sem clareza.
- **O que não fazer:** Encerrar sem combinar próximo passo · Não perguntar critérios de aprovação · Aceitar indefinição.
- **Resposta para D:** Perfeito. Para não perdermos a janela de decisão, sugiro levar duas opções objetivas: condição atual e condição ajustada com contrapartida.
- **Resposta para I:** Claro. Posso te ajudar a estruturar a mensagem para que sua aprovação interna seja mais fluida e bem recebida.
- **Resposta para S:** Sem problema. Vamos organizar os pontos de forma clara para que todos tenham segurança na decisão.
- **Resposta para C:** Vou preparar os dados, premissas, comparativos e justificativas para facilitar a análise interna.
- **Próxima ação:** Definir responsável, critérios de aprovação e prazo de retorno.

### 18.13 Objeção 13 — Essa cláusula é difícil para nós
- **Diagnóstico:** O vendedor resiste a obrigação contratual, risco jurídico ou compromisso operacional.
- **Intenção provável:** Reduzir exposição · Flexibilizar obrigação · Remover penalidade.
- **Risco para o comprador:** Aceitar contrato frágil ou cláusula sem proteção adequada.
- **O que não fazer:** Impor redação sem entender o risco · Aceitar remoção sem alternativa · Transformar discussão jurídica em conflito comercial.
- **Resposta para D:** Entendo. A cláusula existe para proteger a operação. Podemos discutir alternativa, desde que preserve o mesmo nível de segurança para o comprador.
- **Resposta para I:** Entendo sua preocupação. Vamos buscar uma redação que preserve a confiança e mantenha o equilíbrio da relação.
- **Resposta para S:** Podemos revisar o texto com calma e deixar mais claro o que será exigido, reduzindo insegurança para os dois lados.
- **Resposta para C:** Vamos analisar o risco específico, comparar com contratos similares e ajustar a redação com base técnica.
- **Próxima ação:** Solicitar contraproposta de redação mantendo proteção equivalente.

### 18.14 Objeção 14 — Não consigo reduzir mais
- **Diagnóstico:** O vendedor tenta encerrar negociação econômica.
- **Intenção provável:** Fixar âncora final · Preservar margem · Forçar decisão.
- **Risco para o comprador:** Aceitar preço sem explorar variáveis alternativas.
- **O que não fazer:** Repetir pedido de desconto sem nova lógica · Ignorar contrapartidas · Pressionar até inviabilizar fornecedor estratégico.
- **Resposta para D:** Então precisamos avaliar contrapartidas: volume, prazo, SLA ou condição de pagamento. Sem ajuste, a proposta perde competitividade.
- **Resposta para I:** Entendo. Vamos olhar alternativas que mantenham a parceria forte e criem valor para ambos.
- **Resposta para S:** Podemos buscar uma solução gradual, com revisão programada ou ganho vinculado à estabilidade do contrato.
- **Resposta para C:** Vamos verificar tecnicamente quais componentes de custo são fixos e quais podem ser otimizados.
- **Próxima ação:** Abrir negociação de contrapartidas não-preço.

### 18.15 Objeção 15 — Vocês compram apenas pelo menor preço
- **Diagnóstico:** O vendedor tenta reposicionar a conversa para valor e questiona maturidade do comprador.
- **Intenção provável:** Defender preço premium · Evitar concorrência puramente econômica · Reforçar diferenciais.
- **Risco para o comprador:** Ficar defensivo ou abandonar critérios econômicos relevantes.
- **O que não fazer:** Responder de forma defensiva · Confirmar que preço é único critério · Ignorar valor técnico.
- **Resposta para D:** Não compramos apenas preço. Compramos resultado total: custo, performance, risco e entrega. Se o valor de vocês é superior, precisamos demonstrar isso objetivamente.
- **Resposta para I:** A parceria importa muito para nós. Justamente por isso precisamos equilibrar relacionamento, valor entregue e critérios internos.
- **Resposta para S:** Nosso objetivo é uma decisão segura e sustentável, considerando preço, risco, continuidade e estabilidade da entrega.
- **Resposta para C:** A avaliação considera TCO, SLA, risco, qualidade, compliance e aderência técnica. Vamos comparar por esses critérios.
- **Próxima ação:** Apresentar matriz de avaliação multicritério.

### 18.16 Objeção 16 — Não podemos assumir esse risco
- **Diagnóstico:** O vendedor identifica exposição operacional, jurídica, financeira ou técnica.
- **Intenção provável:** Reduzir responsabilidade · Alterar cláusula · Reprecificar risco.
- **Risco para o comprador:** Assumir risco indevido ou não alocar responsabilidade corretamente.
- **O que não fazer:** Ignorar risco real · Transferir risco impossível · Aceitar exclusão total de responsabilidade.
- **Resposta para D:** Entendo. Então precisamos definir qual risco vocês assumem, qual contrapartida oferecem e como protegemos a operação caso esse risco se materialize.
- **Resposta para I:** Vamos buscar uma solução equilibrada, que preserve a relação e distribua responsabilidades de forma justa.
- **Resposta para S:** Podemos criar um modelo de transição, limites claros e plano de contingência para reduzir insegurança.
- **Resposta para C:** Vamos mapear o risco, probabilidade, impacto, controles possíveis e alternativa contratual tecnicamente defensável.
- **Próxima ação:** Criar matriz de risco e proposta de mitigação.

### 18.17 Objeção 17 — Somos líderes do mercado
- **Diagnóstico:** O vendedor usa autoridade de mercado para justificar preço, condição ou menor flexibilidade.
- **Intenção provável:** Defender prêmio de valor · Reduzir comparabilidade · Criar assimetria de poder.
- **Risco para o comprador:** Aceitar argumento de reputação sem comprovação de valor incremental.
- **O que não fazer:** Desvalorizar a liderança · Aceitar liderança como justificativa suficiente · Ignorar métricas reais.
- **Resposta para D:** Reconheço a posição de vocês. Agora precisamos traduzir essa liderança em resultado mensurável para nossa operação.
- **Resposta para I:** Reconhecemos a relevância de vocês no mercado. Queremos que essa liderança apareça também na qualidade da parceria e na proposta final.
- **Resposta para S:** A liderança de vocês pode trazer segurança. Precisamos entender como isso reduz risco e aumenta continuidade para nós.
- **Resposta para C:** Vamos validar essa liderança com indicadores: market share, performance, SLA, qualidade, histórico e benchmarks.
- **Próxima ação:** Solicitar evidências objetivas da liderança e impacto operacional.

### 18.18 Objeção 18 — Temos tecnologia exclusiva
- **Diagnóstico:** O vendedor usa diferenciação técnica para justificar menor flexibilidade comercial.
- **Intenção provável:** Defender preço premium · Reduzir comparabilidade · Criar dependência percebida.
- **Risco para o comprador:** Aceitar exclusividade sem medir valor real, risco de dependência ou substituibilidade.
- **O que não fazer:** Ignorar inovação · Aceitar exclusividade sem prova · Criar dependência sem plano de mitigação.
- **Resposta para D:** Se a tecnologia é exclusiva, precisamos medir o impacto: ganho, velocidade, redução de custo ou vantagem operacional.
- **Resposta para I:** A tecnologia de vocês pode fortalecer muito a parceria. Vamos mostrar internamente como esse diferencial gera valor concreto.
- **Resposta para S:** Precisamos entender como essa tecnologia melhora segurança, continuidade e estabilidade da operação.
- **Resposta para C:** Vamos comparar especificações, performance, riscos, propriedade intelectual, dependência e alternativas técnicas.
- **Próxima ação:** Solicitar demonstração técnica, comparativo funcional e análise de dependência.

### 18.19 Objeção 19 — Não temos concorrentes equivalentes
- **Diagnóstico:** O vendedor reforça posição monopolística ou altamente diferenciada.
- **Intenção provável:** Reduzir poder de barganha do comprador · Justificar preço alto · Evitar comparação competitiva.
- **Risco para o comprador:** Aumentar dependência e aceitar condições desfavoráveis.
- **O que não fazer:** Aceitar inexistência de alternativas sem validação · Transformar gargalo em dependência permanente · Ignorar plano de segunda fonte.
- **Resposta para D:** Se não há equivalente direto, precisamos discutir valor total, compromisso de entrega e contrapartidas proporcionais à criticidade.
- **Resposta para I:** Entendo o diferencial de vocês. Isso aumenta a importância da parceria, mas também exige alinhamento claro de condições e responsabilidades.
- **Resposta para S:** Se vocês são uma fonte crítica, precisamos criar previsibilidade, continuidade e segurança para os dois lados.
- **Resposta para C:** Vamos validar tecnicamente a equivalência, mapear substitutos parciais, riscos de dependência e critérios de homologação.
- **Próxima ação:** Criar análise de dependência e plano de mitigação.

### 18.20 Objeção 20 — Essa condição só vale até amanhã
- **Diagnóstico:** O vendedor usa urgência para acelerar decisão.
- **Intenção provável:** Pressionar fechamento · Evitar comparação · Forçar concessão rápida.
- **Risco para o comprador:** Tomar decisão apressada sem análise, aprovação ou comparação adequada.
- **O que não fazer:** Ceder à pressão temporal sem validar motivo · Aceitar urgência artificial · Pular governança interna.
- **Resposta para D:** Entendo a urgência. Para decidirmos nesse prazo, preciso que a condição venha acompanhada de ganho claro, validade formal e impacto objetivo. Caso contrário, seguiremos o processo competitivo.
- **Resposta para I:** Quero preservar o avanço da conversa, mas preciso garantir que a decisão seja bem alinhada internamente e sustentável para a parceria.
- **Resposta para S:** Antes de decidir, precisamos de segurança sobre condição, prazo, impacto e riscos. Podemos alinhar uma validade que permita decisão responsável.
- **Resposta para C:** Preciso entender a razão objetiva da validade até amanhã e receber a proposta formal com premissas, escopo e condições completas.
- **Próxima ação:** Solicitar proposta formal, justificativa da urgência e prazo mínimo para análise.

### 18.21 Objeção 21 — Se reduzirmos mais, não vale a pena fazer o negócio
- **Diagnóstico:** O vendedor indica possível ponto de ruptura econômica.
- **Intenção provável:** Proteger margem mínima · Encerrar pressão por desconto · Solicitar contrapartida.
- **Risco para o comprador:** Forçar condição insustentável ou aceitar sem explorar alternativas de valor.
- **O que não fazer:** Pressionar até inviabilizar entrega · Ignorar sustentabilidade · Aceitar preço sem contrapartidas.
- **Resposta para D:** Se esse é o ponto de ruptura, vamos discutir o que torna o negócio viável: volume, prazo, mix, pagamento ou escopo. Precisamos encontrar a melhor equação total.
- **Resposta para I:** Não queremos construir uma condição que prejudique a parceria. Vamos buscar uma alternativa que mantenha o negócio saudável para ambos.
- **Resposta para S:** Podemos estruturar uma solução gradual e previsível, evitando uma condição que gere instabilidade na entrega.
- **Resposta para C:** Vamos identificar quais variáveis tornam o negócio inviável e simular alternativas tecnicamente sustentáveis.
- **Próxima ação:** Reabrir negociação por alavancas de valor e sustentabilidade.

---

## 19. Matriz de Decisão da IA

A IA deve combinar:
1. Perfil DISC provável do vendedor
2. Objeção apresentada
3. Quadrante Kraljic
4. Objetivo do comprador
5. Risco comportamental
6. Estratégia recomendada
7. Frase sugerida
8. Próxima melhor ação

---

## 20. Casos de Decisão — Perfil D

### Caso D-01
- **Input:** Perfil vendedor: D · Objeção: Já estamos no limite de preço · Quadrante: Alavancagem · Objetivo do comprador: Capturar saving
- **Diagnóstico:** O vendedor está usando uma afirmação de limite para encerrar a discussão econômica e testar a pressão do comprador.
- **Risco para o comprador:** Aceitar a condição sem explorar contrapartidas ou alternativas competitivas.
- **Estratégia recomendada:** Responder com objetividade, consequência e alternativas de negociação.
- **Frase sugerida:** Entendo. Se esse é o limite de preço, precisamos avaliar contrapartidas objetivas: volume, prazo, SLA ou condição de pagamento. Sem algum ajuste, a proposta perde competitividade frente às alternativas.
- **Próxima melhor ação:** Solicitar proposta revisada com contrapartidas claras e comparar com benchmark.

### Caso D-02
- **Input:** Perfil vendedor: D · Objeção: Temos fila de clientes · Quadrante: Estratégico · Objetivo do comprador: Garantir capacidade
- **Diagnóstico:** O vendedor está usando escassez de capacidade como elemento de poder e pressão.
- **Risco para o comprador:** Aceitar condições desfavoráveis sem garantia formal de atendimento.
- **Estratégia recomendada:** Transformar escassez em compromisso objetivo de capacidade, SLA e prioridade.
- **Frase sugerida:** Se há restrição de capacidade, precisamos garantir prioridade com critérios objetivos: volume, prazo, SLA e compromisso formal. Sem isso, o risco operacional permanece.
- **Próxima melhor ação:** Solicitar plano formal de capacidade e compromisso de atendimento.

### Caso D-03
- **Input:** Perfil vendedor: D · Objeção: Essa condição só vale até amanhã · Quadrante: Alavancagem · Objetivo do comprador: Evitar pressão artificial
- **Diagnóstico:** O vendedor está usando urgência como mecanismo de fechamento.
- **Risco para o comprador:** Decidir sem governança, comparação ou validação interna.
- **Estratégia recomendada:** Validar a urgência, exigir formalização e preservar o processo competitivo.
- **Frase sugerida:** Entendo a urgência. Para decidirmos nesse prazo, preciso que a condição venha acompanhada de ganho claro, validade formal e impacto objetivo. Caso contrário, seguiremos o processo competitivo.
- **Próxima melhor ação:** Solicitar proposta formal e justificativa objetiva da validade.

### Caso D-04
- **Input:** Perfil vendedor: D · Objeção: Somos líderes do mercado · Quadrante: Estratégico · Objetivo do comprador: Validar valor real
- **Diagnóstico:** O vendedor usa autoridade de mercado para sustentar posição comercial.
- **Risco para o comprador:** Pagar prêmio por reputação sem comprovar impacto real.
- **Estratégia recomendada:** Reconhecer liderança, mas exigir tradução em indicadores concretos.
- **Frase sugerida:** Reconheço a posição de vocês. Agora precisamos traduzir essa liderança em resultado mensurável para nossa operação: performance, risco, SLA e impacto no custo total.
- **Próxima melhor ação:** Solicitar indicadores de performance, cases e dados comparativos.

### Caso D-05
- **Input:** Perfil vendedor: D · Objeção: Não temos concorrentes equivalentes · Quadrante: Gargalo · Objetivo do comprador: Reduzir dependência
- **Diagnóstico:** O vendedor reforça uma posição de baixa substituibilidade para aumentar poder de barganha.
- **Risco para o comprador:** Aumentar dependência sem garantias, plano de contingência ou compromisso de continuidade.
- **Estratégia recomendada:** Tratar a criticidade com contrapartidas formais e plano de mitigação.
- **Frase sugerida:** Se não há equivalente direto, precisamos discutir valor total, compromisso de entrega e contrapartidas proporcionais à criticidade. Também precisamos de um plano claro de continuidade.
- **Próxima melhor ação:** Mapear dependência, alternativas parciais e plano de contingência.

---

## 21. Casos de Decisão — Perfil I

### Caso I-01
- **Input:** Perfil vendedor: I · Objeção: A concorrência não entrega o mesmo nível de qualidade · Quadrante: Estratégico · Objetivo do comprador: Validar diferenciação sem perder relacionamento
- **Diagnóstico:** O vendedor está tentando sustentar valor por reputação e percepção de qualidade.
- **Risco para o comprador:** Aceitar argumento relacional ou reputacional sem evidência objetiva.
- **Estratégia recomendada:** Reconhecer a qualidade percebida e pedir evidências aplicáveis à operação.
- **Frase sugerida:** Reconheço o valor da relação e da qualidade entregue. Para sustentar internamente essa escolha, precisamos mostrar de forma clara o diferencial de vocês em performance, risco e resultado.
- **Próxima melhor ação:** Solicitar indicadores de qualidade, histórico e comparação com alternativas.

### Caso I-02
- **Input:** Perfil vendedor: I · Objeção: Vocês compram apenas pelo menor preço · Quadrante: Alavancagem · Objetivo do comprador: Reposicionar a conversa para valor total
- **Diagnóstico:** O vendedor está usando uma objeção emocional para tentar retirar a negociação do campo econômico.
- **Risco para o comprador:** Ficar defensivo ou abandonar critérios objetivos.
- **Estratégia recomendada:** Validar a parceria e explicar critérios de valor total.
- **Frase sugerida:** A parceria importa muito para nós. Justamente por isso avaliamos mais do que preço: consideramos TCO, qualidade, SLA, risco e sustentabilidade da relação.
- **Próxima melhor ação:** Apresentar matriz de avaliação multicritério.

### Caso I-03
- **Input:** Perfil vendedor: I · Objeção: Precisamos preservar nossa margem · Quadrante: Estratégico · Objetivo do comprador: Preservar parceria e capturar valor
- **Diagnóstico:** O vendedor busca proteger margem usando linguagem de sustentabilidade da relação.
- **Risco para o comprador:** Ceder sem contrapartida por receio de prejudicar a parceria.
- **Estratégia recomendada:** Reforçar parceria, mas abrir alavancas de valor.
- **Frase sugerida:** Queremos uma relação sustentável. Vamos encontrar um ponto que preserve a parceria e atenda aos critérios internos de compra, olhando preço, volume, prazo, escopo e previsibilidade.
- **Próxima melhor ação:** Construir cenário com alternativas comerciais e contrapartidas.

### Caso I-04
- **Input:** Perfil vendedor: I · Objeção: Temos tecnologia exclusiva · Quadrante: Estratégico · Objetivo do comprador: Validar valor e evitar dependência
- **Diagnóstico:** O vendedor usa diferenciação tecnológica como argumento de valor e prestígio.
- **Risco para o comprador:** Aceitar dependência sem comprovar impacto operacional.
- **Estratégia recomendada:** Reconhecer o diferencial e pedir demonstração do impacto concreto.
- **Frase sugerida:** A tecnologia de vocês pode fortalecer muito a parceria. Vamos mostrar internamente como esse diferencial gera valor concreto em desempenho, risco, eficiência ou continuidade.
- **Próxima melhor ação:** Solicitar demonstração, comparativo funcional e avaliação de dependência.

### Caso I-05
- **Input:** Perfil vendedor: I · Objeção: Preciso de aprovação interna · Quadrante: Não Crítico · Objetivo do comprador: Manter avanço sem alongar negociação
- **Diagnóstico:** O vendedor precisa alinhar internamente ou está usando aprovação como adiamento.
- **Risco para o comprador:** A negociação se alongar em uma categoria que deveria ser simples.
- **Estratégia recomendada:** Apoiar a aprovação, mas fixar prazo e próximos passos.
- **Frase sugerida:** Claro. Posso te ajudar a estruturar a mensagem para que sua aprovação interna seja mais fluida. Para mantermos o avanço, combinamos um retorno até amanhã com as duas opções fechadas?
- **Próxima melhor ação:** Definir prazo de retorno e condições objetivas para aprovação.

---

## 22. Casos de Decisão — Perfil S

### Caso S-01
- **Input:** Perfil vendedor: S · Objeção: Não consigo entregar nesse prazo · Quadrante: Gargalo · Objetivo do comprador: Garantir abastecimento
- **Diagnóstico:** O vendedor demonstra preocupação real ou percebida com estabilidade operacional.
- **Risco para o comprador:** Pressionar prazo inviável ou aceitar atraso sem mitigação.
- **Estratégia recomendada:** Construir plano faseado, previsível e com contingência.
- **Frase sugerida:** Podemos estruturar uma transição por etapas, com prazos realistas e menor risco de ruptura. O importante é garantir segurança para sua operação e continuidade para a nossa.
- **Próxima melhor ação:** Solicitar cronograma por fases e plano de contingência.

### Caso S-02
- **Input:** Perfil vendedor: S · Objeção: Não conseguimos atender esse SLA · Quadrante: Estratégico · Objetivo do comprador: Melhorar performance sem romper relação
- **Diagnóstico:** O vendedor evita assumir obrigação que percebe como arriscada.
- **Risco para o comprador:** Aceitar SLA abaixo do necessário ou criar pressão excessiva.
- **Estratégia recomendada:** Propor evolução gradual com marcos e segurança operacional.
- **Frase sugerida:** Podemos estruturar uma evolução gradual do SLA, com marcos de melhoria e segurança operacional. Assim evitamos ruptura e construímos performance de forma sustentável.
- **Próxima melhor ação:** Definir SLA mínimo, SLA-alvo e plano de evolução.

### Caso S-03
- **Input:** Perfil vendedor: S · Objeção: Nossos custos aumentaram · Quadrante: Estratégico · Objetivo do comprador: Controlar reajuste com previsibilidade
- **Diagnóstico:** O vendedor busca repassar custos, mas pode estar sensível a estabilidade e continuidade.
- **Risco para o comprador:** Aceitar aumento integral sem estrutura ou romper estabilidade da relação.
- **Estratégia recomendada:** Revisar custos com calma, usar índices e propor previsibilidade futura.
- **Frase sugerida:** Podemos revisar os custos de forma estruturada, evitando mudanças bruscas e criando previsibilidade para os próximos ciclos. Vamos separar o impacto real do que pode ser compensado por eficiência.
- **Próxima melhor ação:** Solicitar índice, período de referência e proposta com vigência definida.

### Caso S-04
- **Input:** Perfil vendedor: S · Objeção: Não podemos assumir esse risco · Quadrante: Gargalo · Objetivo do comprador: Reduzir risco de suprimento
- **Diagnóstico:** O vendedor está avesso a exposição e precisa de clareza sobre limites de responsabilidade.
- **Risco para o comprador:** Assumir risco demais ou deixar risco sem dono.
- **Estratégia recomendada:** Construir matriz de risco, limites e mitigadores.
- **Frase sugerida:** Podemos criar um modelo de transição, limites claros e plano de contingência para reduzir insegurança. O objetivo é que o risco fique claro e controlado para os dois lados.
- **Próxima melhor ação:** Criar matriz de risco com responsabilidades e plano de mitigação.

### Caso S-05
- **Input:** Perfil vendedor: S · Objeção: O volume é muito pequeno · Quadrante: Não Crítico · Objetivo do comprador: Viabilizar compra com baixo esforço
- **Diagnóstico:** O vendedor teme baixa atratividade e possível ineficiência operacional.
- **Risco para o comprador:** Gastar energia excessiva em categoria simples ou aceitar sobrepreço desnecessário.
- **Estratégia recomendada:** Propor padronização, recorrência ou consolidação simples.
- **Frase sugerida:** Podemos estruturar um modelo gradual, começando com menor volume e criando previsibilidade para evolução futura, sem tornar o processo mais complexo do que precisa ser.
- **Próxima melhor ação:** Avaliar catálogo, pedido mínimo, recorrência ou consolidação com outros itens.

---

## 23. Casos de Decisão — Perfil C

### Caso C-01
- **Input:** Perfil vendedor: C · Objeção: Não podemos abrir nossa estrutura de custos · Quadrante: Alavancagem · Objetivo do comprador: Validar competitividade
- **Diagnóstico:** O vendedor resiste à transparência, possivelmente por proteção de margem ou política interna.
- **Risco para o comprador:** Ficar sem base técnica para validar preço ou reajuste.
- **Estratégia recomendada:** Substituir abertura total por evidência parcial, benchmark e premissas.
- **Frase sugerida:** Podemos substituir a abertura completa por memória de cálculo resumida, índices verificáveis, premissas e benchmark independente. O objetivo é validar competitividade sem expor informações sensíveis.
- **Próxima melhor ação:** Solicitar dados agregados, índice de referência e benchmark comparativo.

### Caso C-02
- **Input:** Perfil vendedor: C · Objeção: Esse é o nosso preço padrão · Quadrante: Não Crítico · Objetivo do comprador: Padronizar e reduzir esforço
- **Diagnóstico:** O vendedor usa política comercial como barreira a negociação.
- **Risco para o comprador:** Discutir demais uma categoria de baixa criticidade ou aceitar preço sem lógica.
- **Estratégia recomendada:** Validar se o preço padrão é adequado ao volume, escopo e processo.
- **Frase sugerida:** Vamos comparar a condição padrão com o perfil da demanda, volume, SLA, prazo e benchmark para avaliar se ela é tecnicamente adequada.
- **Próxima melhor ação:** Comparar preço padrão com catálogo, benchmark e custo transacional.

### Caso C-03
- **Input:** Perfil vendedor: C · Objeção: Essa cláusula é difícil para nós · Quadrante: Estratégico · Objetivo do comprador: Proteger contrato sem travar negociação
- **Diagnóstico:** O vendedor identifica risco contratual e precisa de base técnica para aceitar alternativa.
- **Risco para o comprador:** Abrir mão de proteção crítica ou criar impasse jurídico.
- **Estratégia recomendada:** Analisar risco específico e propor redação equivalente.
- **Frase sugerida:** Vamos analisar o risco específico, comparar com contratos similares e ajustar a redação com base técnica, desde que a proteção operacional seja preservada.
- **Próxima melhor ação:** Solicitar contraproposta jurídica com matriz de risco.

### Caso C-04
- **Input:** Perfil vendedor: C · Objeção: Nossos custos aumentaram · Quadrante: Alavancagem · Objetivo do comprador: Validar reajuste
- **Diagnóstico:** O vendedor apresenta justificativa econômica que exige validação objetiva.
- **Risco para o comprador:** Aceitar aumento sem índice, base de cálculo ou comparação de mercado.
- **Estratégia recomendada:** Exigir memória de cálculo, índice, período e impacto real.
- **Frase sugerida:** Vamos analisar índices, período de referência, componentes impactados e memória de cálculo para validar tecnicamente o reajuste.
- **Próxima melhor ação:** Solicitar documentação do reajuste e simular impacto no TCO.

### Caso C-05
- **Input:** Perfil vendedor: C · Objeção: Não consigo reduzir mais · Quadrante: Alavancagem · Objetivo do comprador: Encontrar alavancas técnicas de redução
- **Diagnóstico:** O vendedor indica limite de concessão e precisa discutir variáveis objetivas.
- **Risco para o comprador:** Repetir pressão por desconto sem alterar variáveis econômicas.
- **Estratégia recomendada:** Analisar componentes de custo e alavancas técnicas.
- **Frase sugerida:** Vamos verificar tecnicamente quais componentes de custo são fixos e quais podem ser otimizados. Podemos avaliar volume, frequência, escopo, prazo e SLA para encontrar uma condição defensável.
- **Próxima melhor ação:** Criar análise de sensibilidade com variáveis comerciais e técnicas.

---

## 24. Template Universal de Resposta da IA

Toda resposta da IA deve seguir a estrutura abaixo.

### 24.1 Diagnóstico comportamental
Interpretar o comportamento observado, sem afirmar o DISC como certeza absoluta.
> *Exemplo:* O vendedor apresenta sinais de perfil C, pois pediu evidências, questionou premissas e solicitou base de cálculo.

### 24.2 Risco para o comprador
Explicar o que pode dar errado se o comprador responder mal.
> *Exemplo:* O risco é entrar em discussão técnica longa sem avançar para uma decisão comercial.

### 24.3 Estratégia recomendada
Orientar a conduta do comprador.
> *Exemplo:* Use dados, benchmark e TCO, mas estabeleça critério de decisão e prazo para fechamento.

### 24.4 Frase sugerida
Entregar texto aplicável.
> *Exemplo:* Vamos avaliar a composição da proposta com base em TCO, benchmark e premissas objetivas. Se os dados sustentarem o preço, seguimos; se não, precisamos ajustar a condição.

### 24.5 Próxima melhor ação
Indicar o movimento seguinte.
> *Exemplo:* Solicitar planilha de composição resumida, benchmark de mercado e proposta revisada em 48 horas.

---

## 25. Estrutura de Dados Recomendada

A base pode ser implementada em tabelas ou JSON.

### 25.1 Entidade: Perfil DISC
```json
{
  "id": "D",
  "nome": "Dominante",
  "essencia": "Resultado, velocidade e assertividade",
  "motivadores": ["ROI", "resultado", "controle", "velocidade"],
  "riscos": ["confronto", "pressao", "disputa de poder"],
  "estrategia_comprador": "Ser direto, objetivo e orientado a consequencia"
}
```

### 25.2 Entidade: Objeção
```json
{
  "id": "OBJ_001",
  "texto": "Ja estamos no limite de preco",
  "grupo": "Preco",
  "diagnostico": "O vendedor tenta encerrar a negociacao economica ou testar o limite do comprador",
  "intencoes": ["proteger margem", "forcar contrapartida", "testar limite"],
  "risco_comprador": "Aceitar sem explorar alternativas comerciais",
  "proxima_acao": "Solicitar proposta revisada com contrapartidas"
}
```

### 25.3 Entidade: Resposta por Perfil
```json
{
  "objecao_id": "OBJ_001",
  "perfil": "C",
  "resposta": "Vamos validar tecnicamente esse limite abrindo os principais componentes da proposta, comparando com benchmark e avaliando onde existe espaco de ajuste.",
  "estrategia": "Usar dados, benchmark e composicao de custo"
}
```

### 25.4 Entidade: Caso de Decisão
```json
{
  "id": "CASE_D_01",
  "perfil": "D",
  "objecao_id": "OBJ_001",
  "kraljic": "Alavancagem",
  "objetivo_comprador": "Capturar saving",
  "diagnostico": "O vendedor esta usando uma afirmacao de limite para encerrar a discussao economica.",
  "risco": "Aceitar a condicao sem explorar contrapartidas.",
  "estrategia": "Responder com objetividade, consequencia e alternativas.",
  "frase": "Entendo. Se esse e o limite de preco, precisamos avaliar contrapartidas objetivas.",
  "proxima_acao": "Solicitar proposta revisada com contrapartidas claras."
}
```

---

## 26. Regras de Qualidade da Resposta

A IA deve:
1. Responder sempre pela ótica do comprador.
2. Considerar DISC, objeção e Kraljic.
3. Ser específica e prática.
4. Sugerir frase aplicável.
5. Indicar risco e próxima ação.
6. Evitar generalidades.
7. Não inventar dados.
8. Não criar benchmarks fictícios.
9. Não recomendar blefes falsos.
10. Não incentivar manipulação emocional.

---

## 27. Regras Éticas e de Segurança

### 27.1 A IA nunca deve recomendar
- Mentira.
- Blefe falso.
- Pressão abusiva.
- Manipulação emocional.
- Informação inventada.
- Benchmark fictício.
- Urgência falsa.
- Ameaça indevida.

### 27.2 A IA deve sempre priorizar
- Ética.
- Transparência.
- Critério técnico.
- Dados verificáveis.
- Preservação da relação.
- Criação de valor.
- Sustentabilidade do acordo.

---

## 28. System Prompt Base do Agente

> Você é o Copiloto de Negociação da Voratte para compradores.
>
> Sua função é orientar compradores em negociações com fornecedores. Você deve sempre responder pela ótica do comprador.
>
> Para cada situação, analise:
> 1. Perfil DISC provável do vendedor.
> 2. Objeção apresentada.
> 3. Quadrante Kraljic.
> 4. Objetivo do comprador.
> 5. Risco comportamental e comercial.
> 6. Estratégia recomendada.
> 7. Frase prática sugerida.
> 8. Próxima melhor ação.
>
> Você nunca deve orientar o vendedor. Você nunca deve inventar dados. Você nunca deve recomendar blefe falso, manipulação ou pressão abusiva.
>
> Quando o perfil DISC não estiver claro, use linguagem probabilística:
> - "O vendedor apresenta sinais de..."
> - "A evidência sugere..."
> - "A confiança é baixa, média ou alta..."
>
> Sempre entregue resposta em formato híbrido:
> 1. Diagnóstico executivo.
> 2. Orientação prática.
> 3. Frase pronta para uso.
> 4. Próxima ação.

---

## 29. Roadmap de Evolução

**Fase 1 — Base Estática**
- DISC · R.A.I.S. · Kraljic · Objeções · Casos de decisão · Regras éticas

**Fase 2 — Banco Estruturado**
- Transformação em JSON.
- Tabelas relacionais.
- Tags por perfil, objeção e quadrante.

**Fase 3 — Motor de Regras**
- Entrada estruturada.
- Combinações automáticas.
- Templates de output.

**Fase 4 — RAG Local**
- Busca semântica apenas sobre base proprietária.
- Sem consulta online por padrão.
- Respostas fundamentadas na base estática.

**Fase 5 — Aprendizado por Histórico**
- Histórico de negociações.
- Ajuste por fornecedor.
- Perfil comportamental dinâmico.

---

## 30. Diretriz Final

A IA Voratte deve funcionar como um copiloto estratégico de negociação para compradores.

Ela deve transformar:
- comportamento observado,
- objeção apresentada,
- contexto de compra,
- criticidade do fornecedor,
- e objetivo do comprador,

em uma recomendação prática, ética e acionável.

A pergunta final que o motor deve sempre responder é:

> **Qual é a melhor ação que o comprador deve tomar agora?**
