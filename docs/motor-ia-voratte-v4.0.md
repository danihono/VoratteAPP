# MOTOR VORATTE 4.0
### Especificação Funcional e Técnica Consolidada
**Base estática determinística para negociação inteligente em compras — ótica do comprador**

> Este documento consolida os 6 entregáveis do cliente (Especificação Funcional + Anexo A Partes 1, 2, 2B, 3 e 4) numa única fonte canônica. Substitui integralmente o Motor v2.1/3.0.

---

## MUDANÇA-CHAVE EM RELAÇÃO À VERSÃO ANTERIOR

> **O OBJETIVO DEIXA DE SER UMA ESCOLHA DO USUÁRIO.**
>
> Na versão anterior, o usuário selecionava perfil DISC + objeção + quadrante **+ objetivo**.
> No 4.0, o usuário seleciona apenas **perfil DISC + objeção + quadrante**. O **objetivo é DERIVADO automaticamente** da combinação `objeção × quadrante`, via Matriz de Inferência (Parte 3), que retorna um **objetivo primário + objetivo secundário**.
>
> Consequência: **toda** combinação possível (21 objeções × 4 quadrantes × 4 perfis) produz uma saída completa — não existe mais combinação "órfã" ou tela que "trava sem mudar nada".

---

## 1. OBJETIVO DO MOTOR

O Motor Voratte 4.0 apoia **compradores** em negociações com fornecedores.

O motor interpreta:
- Objeção do vendedor
- Perfil DISC do vendedor
- Quadrante Kraljic

E produz:
- Diagnóstico comportamental
- Risco para o comprador
- Estratégia recomendada
- Alavanca principal
- Frase sugerida para o comprador utilizar
- Próxima melhor ação

---

## 2. FLUXO DE DECISÃO

```
OBJEÇÃO
  ↓
KRALJIC
  ↓
OBJETIVO PRIMÁRIO        (derivado da Matriz de Inferência)
  ↓
OBJETIVO SECUNDÁRIO      (derivado da Matriz de Inferência)
  ↓
ESTRATÉGIA               (vem do Objetivo)
  ↓
DISC                     (adapta só a linguagem)
  ↓
RESPOSTA FINAL
```

**Princípio determinístico:** o LLM não cria estratégia. O LLM apenas: identifica contexto → busca a regra correta → monta a resposta → adapta a linguagem ao DISC.

---

## 3. ENTRADAS

| Campo | Valores |
|-------|---------|
| Objeção | uma das 21 objeções oficiais |
| Perfil DISC (do vendedor) | D · I · S · C |
| Quadrante Kraljic | Alavancagem · Estratégico · Gargalo · Não Crítico |

> O **objetivo NÃO é entrada** — é derivado (ver Parte 3).

---

## 4. TABELA MESTRA DE OBJETIVOS (Anexo A — Parte 1)

Cada objetivo carrega: categoria, diagnóstico, risco, estratégia, alavanca principal e próxima ação. **A partir do 4.0, diagnóstico/risco/estratégia vêm do OBJETIVO** (não da objeção).

### OBJ01 — Capturar Saving
- **Categoria:** Econômico
- **Diagnóstico:** O vendedor está protegendo preço, margem ou política comercial.
- **Risco:** Aceitar condições econômicas sem explorar oportunidades de redução.
- **Estratégia:** Utilizar concorrência, benchmark, volume, consolidação de demanda e TCO.
- **Alavanca principal:** Preço
- **Próxima melhor ação:** Solicitar proposta alternativa com contrapartidas comerciais.

### OBJ02 — Validar Competitividade
- **Categoria:** Econômico
- **Diagnóstico:** Existe dúvida se a proposta apresentada está alinhada ao mercado.
- **Risco:** Assumir competitividade sem evidência objetiva.
- **Estratégia:** Comparar preço, escopo, SLA, TCO e alternativas disponíveis.
- **Alavanca principal:** Benchmark
- **Próxima melhor ação:** Montar comparativo técnico-comercial.

### OBJ03 — Encontrar Alavancas Técnicas de Redução
- **Categoria:** Econômico
- **Diagnóstico:** O vendedor demonstra limite para redução direta de preço.
- **Risco:** Travar a negociação exclusivamente em desconto.
- **Estratégia:** Atuar em escopo, frequência, especificação, SLA, lote, logística ou prazo.
- **Alavanca principal:** Escopo
- **Próxima melhor ação:** Abrir decomposição técnica da proposta.

### OBJ04 — Validar Valor Real
- **Categoria:** Econômico
- **Diagnóstico:** O vendedor utiliza diferenciação, liderança ou qualidade para justificar preço.
- **Risco:** Pagar prêmio sem comprovação objetiva de valor.
- **Estratégia:** Converter diferenciação em indicadores mensuráveis.
- **Alavanca principal:** Valor
- **Próxima melhor ação:** Solicitar evidências concretas de resultado.

### OBJ05 — Validar Diferenciação sem Perder Relacionamento
- **Categoria:** Estratégico
- **Diagnóstico:** O vendedor usa relacionamento ou reputação para sustentar posição comercial.
- **Risco:** Aceitar argumentos subjetivos ou desgastar a relação.
- **Estratégia:** Reconhecer valor percebido e solicitar comprovação objetiva.
- **Alavanca principal:** Qualidade
- **Próxima melhor ação:** Solicitar indicadores comparativos.

### OBJ06 — Reposicionar a Conversa para Valor Total
- **Categoria:** Estratégico
- **Diagnóstico:** O vendedor tenta deslocar a negociação de preço para valor.
- **Risco:** Entrar em postura defensiva ou abandonar critérios econômicos.
- **Estratégia:** Reforçar avaliação por TCO, risco, qualidade e performance.
- **Alavanca principal:** TCO
- **Próxima melhor ação:** Apresentar matriz multicritério.

### OBJ07 — Garantir Capacidade
- **Categoria:** Estratégico
- **Diagnóstico:** O fornecedor indica limitação de atendimento ou produção.
- **Risco:** Perder prioridade operacional.
- **Estratégia:** Formalizar capacidade, reserva de volume e prioridade.
- **Alavanca principal:** Capacidade
- **Próxima melhor ação:** Solicitar plano formal de capacidade.

### OBJ08 — Garantir Abastecimento
- **Categoria:** Estratégico
- **Diagnóstico:** Existe ameaça à continuidade de fornecimento.
- **Risco:** Ruptura operacional.
- **Estratégia:** Priorizar abastecimento, continuidade e contingência.
- **Alavanca principal:** Continuidade
- **Próxima melhor ação:** Definir plano de abastecimento.

### OBJ09 — Reduzir Dependência
- **Categoria:** Risco
- **Diagnóstico:** O vendedor reforça exclusividade ou baixa substituibilidade.
- **Risco:** Dependência excessiva.
- **Estratégia:** Buscar segunda fonte, alternativas ou substituição parcial.
- **Alavanca principal:** Dependência
- **Próxima melhor ação:** Construir plano de mitigação.

### OBJ10 — Validar Valor e Evitar Dependência
- **Categoria:** Risco
- **Diagnóstico:** O fornecedor sustenta diferencial tecnológico ou exclusivo.
- **Risco:** Criar lock-in sem avaliar benefícios.
- **Estratégia:** Mensurar valor entregue versus dependência criada.
- **Alavanca principal:** Tecnologia
- **Próxima melhor ação:** Executar análise de dependência.

### OBJ11 — Reduzir Risco de Suprimento
- **Categoria:** Risco
- **Diagnóstico:** A objeção revela risco operacional, jurídico ou logístico.
- **Risco:** Transferência inadequada de risco para o comprador.
- **Estratégia:** Mapear riscos e controles.
- **Alavanca principal:** Risco
- **Próxima melhor ação:** Criar matriz de risco.

### OBJ12 — Controlar Reajuste com Previsibilidade
- **Categoria:** Econômico
- **Diagnóstico:** O fornecedor busca reajuste recorrente ou estrutural.
- **Risco:** Perda de previsibilidade financeira.
- **Estratégia:** Estabelecer índices, gatilhos e critérios claros.
- **Alavanca principal:** Índice
- **Próxima melhor ação:** Formalizar política de reajuste.

### OBJ13 — Validar Reajuste
- **Categoria:** Econômico
- **Diagnóstico:** Existe pedido de aumento baseado em custos.
- **Risco:** Aceitar reajuste sem fundamento.
- **Estratégia:** Validar premissas, índices e memória de cálculo.
- **Alavanca principal:** Custo
- **Próxima melhor ação:** Auditar composição do reajuste.

### OBJ14 — Preservar Parceria e Capturar Valor
- **Categoria:** Estratégico
- **Diagnóstico:** O fornecedor possui relevância estratégica.
- **Risco:** Deteriorar relacionamento ou capturar pouco valor.
- **Estratégia:** Combinar parceria, governança e geração de valor.
- **Alavanca principal:** Relacionamento
- **Próxima melhor ação:** Construir modelo ganha-ganha.

### OBJ15 — Melhorar Performance sem Romper Relação
- **Categoria:** Estratégico
- **Diagnóstico:** O fornecedor resiste a metas de prazo, SLA ou qualidade.
- **Risco:** Aceitar performance inadequada ou gerar ruptura.
- **Estratégia:** Implementar melhoria gradual.
- **Alavanca principal:** Performance
- **Próxima melhor ação:** Criar plano evolutivo.

### OBJ16 — Evitar Pressão Artificial
- **Categoria:** Governança
- **Diagnóstico:** O vendedor utiliza urgência para acelerar decisão.
- **Risco:** Tomar decisão sem análise adequada.
- **Estratégia:** Validar urgência e preservar governança.
- **Alavanca principal:** Prazo
- **Próxima melhor ação:** Solicitar formalização da condição.

### OBJ17 — Manter Avanço sem Alongar Negociação
- **Categoria:** Governança
- **Diagnóstico:** O vendedor utiliza aprovação interna como barreira.
- **Risco:** Perder velocidade de negociação.
- **Estratégia:** Apoiar aprovação e controlar prazo.
- **Alavanca principal:** Follow-up
- **Próxima melhor ação:** Definir data de retorno.

### OBJ18 — Viabilizar Compra com Baixo Esforço
- **Categoria:** Operacional
- **Diagnóstico:** A categoria não justifica processo complexo.
- **Risco:** Desperdício de tempo e energia.
- **Estratégia:** Simplificar.
- **Alavanca principal:** Eficiência
- **Próxima melhor ação:** Padronizar processo.

### OBJ19 — Padronizar e Reduzir Esforço
- **Categoria:** Operacional
- **Diagnóstico:** O processo possui excesso de customização.
- **Risco:** Custo transacional elevado.
- **Estratégia:** Automação e padronização.
- **Alavanca principal:** Padronização
- **Próxima melhor ação:** Migrar para fluxo padrão.

### OBJ20 — Proteger Contrato sem Travar Negociação
- **Categoria:** Contratual
- **Diagnóstico:** Existe resistência contratual relevante.
- **Risco:** Perder proteção jurídica ou travar o negócio.
- **Estratégia:** Buscar equivalência de proteção.
- **Alavanca principal:** Contrato
- **Próxima melhor ação:** Solicitar contraproposta jurídica.

---

## 5. MATRIZ OFICIAL DE INFERÊNCIA (Anexo A — Parte 3)
### Objeção × Kraljic → Objetivo Primário + Secundário

> **Esta é a principal tabela de decisão do motor.** 21 objeções × 4 quadrantes = 84 regras.
> Armazenar como `TB_REGRAS_INFERENCIA`.

### GRUPO 1 — PREÇO E MARGEM

**"Já estamos no limite de preço"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ01 | OBJ03 |
| Estratégico | OBJ14 | OBJ04 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ19 | OBJ18 |

**"Esse é nosso preço padrão"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ01 | OBJ02 |
| Estratégico | OBJ14 | OBJ04 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ19 | OBJ18 |

**"Não consigo reduzir mais"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ03 | OBJ01 |
| Estratégico | OBJ14 | OBJ04 |
| Gargalo | OBJ11 | OBJ08 |
| Não Crítico | OBJ19 | OBJ18 |

**"Precisamos preservar nossa margem"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ03 | OBJ01 |
| Estratégico | OBJ14 | OBJ04 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ19 | OBJ18 |

**"Se reduzirmos mais não vale a pena fazer negócio"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ03 | OBJ01 |
| Estratégico | OBJ14 | OBJ05 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ19 | OBJ18 |

### GRUPO 2 — VALOR E DIFERENCIAÇÃO

**"Somos líderes do mercado"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ04 | OBJ02 |
| Estratégico | OBJ14 | OBJ04 |
| Gargalo | OBJ09 | OBJ10 |
| Não Crítico | OBJ19 | OBJ18 |

**"Temos tecnologia exclusiva"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ04 | OBJ02 |
| Estratégico | OBJ10 | OBJ14 |
| Gargalo | OBJ09 | OBJ10 |
| Não Crítico | OBJ19 | OBJ18 |

**"Não temos concorrentes equivalentes"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ02 | OBJ04 |
| Estratégico | OBJ10 | OBJ14 |
| Gargalo | OBJ09 | OBJ10 |
| Não Crítico | OBJ19 | OBJ18 |

**"A concorrência não entrega a mesma qualidade"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ04 | OBJ02 |
| Estratégico | OBJ05 | OBJ14 |
| Gargalo | OBJ08 | OBJ09 |
| Não Crítico | OBJ19 | OBJ18 |

### GRUPO 3 — CUSTOS E REAJUSTES

**"Nossos custos aumentaram"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ13 | OBJ03 |
| Estratégico | OBJ12 | OBJ14 |
| Gargalo | OBJ12 | OBJ11 |
| Não Crítico | OBJ19 | OBJ18 |

**"Não podemos abrir nossa estrutura de custos"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ02 | OBJ13 |
| Estratégico | OBJ14 | OBJ12 |
| Gargalo | OBJ11 | OBJ08 |
| Não Crítico | OBJ19 | OBJ18 |

### GRUPO 4 — CAPACIDADE E ATENDIMENTO

**"O volume é muito pequeno"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ01 | OBJ03 |
| Estratégico | OBJ14 | OBJ07 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ18 | OBJ19 |

**"Temos fila de clientes"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ02 | OBJ01 |
| Estratégico | OBJ07 | OBJ14 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ18 | OBJ19 |

**"Não consigo entregar nesse prazo"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ02 | OBJ15 |
| Estratégico | OBJ15 | OBJ14 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ18 | OBJ19 |

**"Não conseguimos atender esse SLA"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ15 | OBJ02 |
| Estratégico | OBJ15 | OBJ14 |
| Gargalo | OBJ11 | OBJ08 |
| Não Crítico | OBJ19 | OBJ18 |

### GRUPO 5 — CONTRATUAL E GOVERNANÇA

**"O prazo de pagamento é muito longo"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ01 | OBJ03 |
| Estratégico | OBJ14 | OBJ12 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ19 | OBJ18 |

**"Preciso de aprovação interna"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ17 | OBJ01 |
| Estratégico | OBJ14 | OBJ17 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ17 | OBJ19 |

**"Essa cláusula é difícil para nós"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ20 | OBJ03 |
| Estratégico | OBJ20 | OBJ14 |
| Gargalo | OBJ11 | OBJ08 |
| Não Crítico | OBJ19 | OBJ18 |

**"Não podemos assumir esse risco"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ03 | OBJ20 |
| Estratégico | OBJ20 | OBJ14 |
| Gargalo | OBJ11 | OBJ08 |
| Não Crítico | OBJ19 | OBJ18 |

**"Vocês compram apenas pelo menor preço"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ06 | OBJ04 |
| Estratégico | OBJ14 | OBJ05 |
| Gargalo | OBJ08 | OBJ09 |
| Não Crítico | OBJ19 | OBJ18 |

**"Essa condição só vale até amanhã"**
| Kraljic | Primário | Secundário |
|---------|----------|------------|
| Alavancagem | OBJ16 | OBJ17 |
| Estratégico | OBJ14 | OBJ16 |
| Gargalo | OBJ08 | OBJ11 |
| Não Crítico | OBJ17 | OBJ19 |

### ALGORITMO DE PRIORIZAÇÃO
- **Regra 1:** selecionar o **Objetivo Primário** — ele determina diagnóstico, risco, estratégia, alavanca e próxima ação.
- **Regra 2:** usar o **Objetivo Secundário** apenas para **enriquecer** diagnóstico, estratégia e próxima ação (complemento, não substituição).

*Exemplo:* objeção "Temos tecnologia exclusiva" + Estratégico → Primário OBJ10 (Validar valor e evitar dependência) + Secundário OBJ14 (Preservar parceria e capturar valor). Estratégia principal = OBJ10; complemento = OBJ14.

---

## 6. BIBLIOTECA DISC DE FRASES (Anexo A — Partes 2 e 2B)
### 20 objetivos × 4 perfis = 80 frases

> A **frase é a única parte adaptada ao DISC.** Indexada por `objetivo + perfil`.

### OBJ01 — Capturar Saving
- **D:** "Entendo sua posição. Considerando volume, recorrência e potencial da oportunidade, precisamos revisar a condição para garantir competitividade frente às alternativas disponíveis."
- **I:** "Entendo sua posição e quero preservar uma relação sustentável para ambos. Vamos buscar uma condição que gere valor para vocês e seja defensável internamente para nós."
- **S:** "Entendo. Podemos avaliar alternativas que tragam previsibilidade e segurança para os dois lados sem comprometer a continuidade da operação."
- **C:** "Vamos analisar benchmark, TCO e composição da proposta para identificar oportunidades objetivas de redução."

### OBJ02 — Validar Competitividade
- **D:** "Preciso entender como sua proposta se posiciona frente ao mercado para justificar uma decisão competitiva."
- **I:** "Quero garantir que estamos tomando a melhor decisão possível sem perder os benefícios da parceria construída."
- **S:** "Vamos comparar as opções disponíveis de forma estruturada para reduzir riscos e aumentar segurança na decisão."
- **C:** "Precisamos comparar preço, escopo, SLA, TCO e critérios técnicos para validar a competitividade da proposta."

### OBJ03 — Encontrar Alavancas Técnicas de Redução
- **D:** "Se o preço já atingiu seu limite, vamos trabalhar outras alavancas que possam melhorar a competitividade da proposta."
- **I:** "Talvez exista uma forma de gerar valor para ambos sem concentrar toda a negociação exclusivamente em preço."
- **S:** "Podemos avaliar ajustes graduais em escopo, frequência ou modelo operacional para reduzir impacto para ambos."
- **C:** "Vamos decompor os fatores que influenciam custo para identificar oportunidades técnicas de otimização."

### OBJ04 — Validar Valor Real
- **D:** "Se existe um diferencial relevante, preciso entender qual resultado concreto ele entrega para justificar essa condição."
- **I:** "Reconheço o valor que vocês afirmam entregar. Vamos traduzir isso em benefícios objetivos para facilitar nossa decisão."
- **S:** "Gostaria de entender como esse diferencial contribui para estabilidade, segurança e continuidade da operação."
- **C:** "Precisamos medir esse diferencial por meio de indicadores, evidências e resultados comparáveis."

### OBJ05 — Validar Diferenciação sem Perder Relacionamento
- **D:** "Reconheço seu posicionamento. Agora precisamos comprovar objetivamente o valor adicional entregue."
- **I:** "Valorizamos muito a relação construída. Para avançarmos, precisamos demonstrar internamente o diferencial de vocês."
- **S:** "Vamos analisar o diferencial apresentado sem comprometer a confiança e a estabilidade da relação."
- **C:** "Gostaria de avaliar métricas comparativas que sustentem tecnicamente essa diferenciação."

### OBJ06 — Reposicionar a Conversa para Valor Total
- **D:** "Preço é apenas uma variável. Precisamos avaliar o resultado total gerado pela solução."
- **I:** "Nosso objetivo é construir valor para ambos e não apenas discutir preço isoladamente."
- **S:** "Precisamos avaliar todos os impactos da decisão para garantir uma solução equilibrada e sustentável."
- **C:** "Vamos analisar TCO, SLA, risco, qualidade e performance para tomar uma decisão completa."

### OBJ07 — Garantir Capacidade
- **D:** "Precisamos de uma garantia clara de capacidade para sustentar nossa operação."
- **I:** "Quero construir uma solução que dê previsibilidade para ambos e preserve nossa parceria."
- **S:** "Vamos estruturar um planejamento que ofereça segurança e estabilidade operacional."
- **C:** "Preciso validar capacidade produtiva, lead time e critérios de priorização para reduzir riscos."

### OBJ08 — Garantir Abastecimento
- **D:** "O ponto principal é assegurar continuidade de fornecimento sem risco para nossa operação."
- **I:** "Precisamos encontrar uma solução que preserve a parceria e garanta atendimento contínuo."
- **S:** "Vamos construir um plano de abastecimento previsível e seguro para ambos."
- **C:** "Gostaria de validar plano de continuidade, lead time e contingências disponíveis."

### OBJ09 — Reduzir Dependência
- **D:** "Precisamos reduzir riscos associados à concentração excessiva em uma única alternativa."
- **I:** "Quero preservar a relação, mas também construir um modelo sustentável para o longo prazo."
- **S:** "Precisamos garantir segurança operacional mesmo em cenários de mudança."
- **C:** "Vamos avaliar objetivamente o grau de dependência e os riscos associados."

### OBJ10 — Validar Valor e Evitar Dependência
- **D:** "Se a tecnologia gera valor superior, precisamos medir esse ganho frente ao risco de dependência."
- **I:** "Reconheço o diferencial da solução. Vamos avaliar como maximizar valor sem criar vulnerabilidades futuras."
- **S:** "Precisamos garantir que a adoção dessa tecnologia preserve estabilidade e continuidade."
- **C:** "Gostaria de comparar benefícios, riscos, substituibilidade e impacto operacional."

### OBJ11 — Reduzir Risco de Suprimento
- **D:** "Precisamos reduzir a exposição ao risco antes de avançar. Quero entender quais garantias existem para assegurar continuidade e minimizar impactos na operação."
- **I:** "Quero construir uma solução segura para ambos os lados, preservando a parceria e reduzindo vulnerabilidades futuras."
- **S:** "Vamos estruturar uma alternativa que aumente previsibilidade e reduza riscos para nossas operações."
- **C:** "Gostaria de avaliar objetivamente os riscos envolvidos, os controles existentes e os mecanismos de mitigação disponíveis."

### OBJ12 — Controlar Reajuste com Previsibilidade
- **D:** "Entendo a necessidade de reajuste, mas precisamos construir uma regra previsível que evite impactos inesperados ao longo do contrato."
- **I:** "Vamos encontrar um modelo de reajuste que preserve a relação e dê previsibilidade para ambos."
- **S:** "Precisamos criar uma estrutura estável que reduza incertezas futuras para nossas equipes."
- **C:** "Gostaria de formalizar critérios objetivos, índices e gatilhos para garantir previsibilidade financeira."

### OBJ13 — Validar Reajuste
- **D:** "Antes de aprovar qualquer reajuste, preciso entender claramente os fatores que justificam esse aumento."
- **I:** "Vamos analisar juntos os fundamentos do reajuste para garantir uma decisão justa para ambos."
- **S:** "Quero compreender os impactos desse reajuste de forma estruturada para evitar riscos futuros."
- **C:** "Precisamos validar memória de cálculo, índices utilizados, período de referência e componentes impactados."

### OBJ14 — Preservar Parceria e Capturar Valor
- **D:** "Nosso objetivo é manter uma relação estratégica, mas também garantir geração de valor para ambos os lados."
- **I:** "Valorizamos muito essa parceria e queremos construir uma solução que fortaleça nossa relação no longo prazo."
- **S:** "Precisamos encontrar um equilíbrio que preserve estabilidade, continuidade e benefícios mútuos."
- **C:** "Vamos avaliar a proposta considerando valor total, riscos, performance e perspectivas futuras da parceria."

### OBJ15 — Melhorar Performance sem Romper Relação
- **D:** "Precisamos melhorar os resultados atuais sem comprometer a continuidade da relação."
- **I:** "Quero encontrar um caminho de evolução que fortaleça a parceria e aumente a performance."
- **S:** "Vamos construir um plano gradual de melhoria que seja seguro para todos os envolvidos."
- **C:** "Precisamos definir indicadores claros, metas mensuráveis e um plano estruturado de evolução."

### OBJ16 — Evitar Pressão Artificial
- **D:** "Entendo a urgência, mas precisamos tomar uma decisão baseada em valor e não apenas em prazo."
- **I:** "Quero avançar rapidamente, mas também garantir que a decisão seja boa para ambos."
- **S:** "Precisamos de tempo suficiente para avaliar a proposta sem comprometer a segurança da decisão."
- **C:** "Gostaria de entender objetivamente o motivo da limitação de prazo e validar os impactos envolvidos."

### OBJ17 — Manter Avanço sem Alongar Negociação
- **D:** "Vamos definir claramente os próximos passos para evitar atrasos desnecessários."
- **I:** "Posso ajudar a acelerar os alinhamentos internos para mantermos o ritmo da negociação."
- **S:** "Vamos organizar um cronograma simples para garantir continuidade e previsibilidade."
- **C:** "Precisamos estabelecer responsáveis, critérios de aprovação e datas objetivas para avançar."

### OBJ18 — Viabilizar Compra com Baixo Esforço
- **D:** "Precisamos encontrar uma solução simples e rápida que resolva a necessidade sem gerar complexidade desnecessária."
- **I:** "Vamos buscar uma alternativa prática que funcione bem para todos os envolvidos."
- **S:** "Gostaria de construir um processo simples e previsível para reduzir esforço operacional."
- **C:** "Vamos simplificar o fluxo mantendo os controles necessários para garantir conformidade."

### OBJ19 — Padronizar e Reduzir Esforço
- **D:** "Precisamos reduzir complexidade e tornar esse processo mais eficiente."
- **I:** "Uma solução padronizada pode beneficiar todos os envolvidos e facilitar nossa interação."
- **S:** "Vamos estruturar um modelo estável que reduza retrabalho e aumente previsibilidade."
- **C:** "Gostaria de formalizar um padrão operacional que reduza custo transacional e aumente eficiência."

### OBJ20 — Proteger Contrato sem Travar Negociação
- **D:** "Precisamos preservar as proteções essenciais do contrato sem impedir o avanço do negócio."
- **I:** "Quero encontrar uma solução equilibrada que proteja ambos os lados e preserve a relação."
- **S:** "Vamos construir uma alternativa contratual que gere segurança sem criar barreiras desnecessárias."
- **C:** "Precisamos analisar tecnicamente a cláusula e buscar uma redação equivalente que preserve a proteção necessária."

---

## 7. MOTOR DE DECISÃO (Anexo A — Parte 4)

**Passo 1 —** Consultar `TB_REGRAS_INFERENCIA` filtrando por `objeção + quadrante` → retorna `{ objetivo_primario, objetivo_secundario }`.

**Passo 2 —** Consultar `TB_OBJETIVOS` pelo primário → retorna `{ nome, diagnostico, risco, estrategia, alavanca_principal, proxima_acao }`.

**Passo 3 —** Consultar `TB_FRASES_DISC` por `objetivo_primario + perfil_disc` → retorna a `frase`.

**Passo 4 —** Montar a resposta final.

### Payload de entrada
```json
POST /api/v1/negociacao/analisar
{
  "perfil_disc": "D",
  "quadrante_kraljic": "ALAVANCAGEM",
  "objecao": "Esse é nosso preço padrão"
}
```

### Payload de saída
```json
{
  "perfil_disc": "D",
  "quadrante_kraljic": "ALAVANCAGEM",
  "objecao": "Esse é nosso preço padrão",
  "objetivo_primario":   { "codigo": "OBJ01", "nome": "Capturar Saving" },
  "objetivo_secundario": { "codigo": "OBJ02", "nome": "Validar Competitividade" },
  "diagnostico_comportamental": "O vendedor está protegendo preço, margem ou política comercial.",
  "risco_comprador": "Aceitar condições econômicas sem explorar oportunidades de redução.",
  "estrategia_recomendada": "Utilizar concorrência, benchmark, volume e TCO.",
  "alavanca_principal": "Preço",
  "frase_sugerida": "Entendo sua posição. Considerando volume, recorrência e potencial da oportunidade, precisamos revisar a condição para garantir competitividade frente às alternativas disponíveis.",
  "proxima_melhor_acao": "Solicitar proposta alternativa com contrapartidas comerciais."
}
```

---

## 8. FORMATO DE EXIBIÇÃO NO FRONT-END

Card de resposta com os campos: Perfil DISC · Quadrante · Objeção · **Objetivo (primário + secundário, exibidos como resultado calculado)** · Diagnóstico · Risco · Estratégia · Alavanca Principal · Frase Sugerida · Próxima Melhor Ação.

> **Mudança de UI:** o seletor de objetivo SAI. O objetivo passa a aparecer como **saída**, não como entrada.

---

## 9. ESTRUTURA DE BANCO DE DADOS

```sql
TB_OBJETIVOS (id, codigo, nome, categoria, diagnostico, risco,
              estrategia, alavanca_principal, proxima_acao, ativo)

TB_FRASES_DISC (id, codigo_objetivo, perfil_disc, frase, ativo)
  -- perfil_disc ∈ {D, I, S, C}

TB_REGRAS_INFERENCIA (id, objecao, quadrante, objetivo_primario,
                      objetivo_secundario, ativo)
  -- quadrante ∈ {ALAVANCAGEM, ESTRATEGICO, GARGALO, NAO_CRITICO}

TB_OBJECOES (id, descricao, categoria, ativo)

TB_LOG_DECISAO (id, data_hora, usuario, perfil_disc, objecao,
                quadrante, objetivo_primario, objetivo_secundario,
                resultado_json)
```

---

## 10. NÍVEL DE CONFIANÇA

| Fator | Peso |
|-------|------|
| Objeção encontrada | 40% |
| Quadrante válido | 30% |
| DISC identificado | 20% |
| Objetivo definido | 10% |

Exemplo: `{ "confianca": 92 }`.

---

## 11. CAMADA DE IA (OPCIONAL — não obrigatória no 4.0)

Função: refinar **apenas a linguagem** da frase, sem alterar estratégia.

**Prompt base:**
> Você é um negociador sênior de procurement. Sua função não é criar estratégia — a estratégia já foi definida pelo Motor Voratte. Receba perfil DISC, objeção, quadrante, objetivo, estratégia e frase sugerida. Sua única função é: (1) adaptar linguagem, (2) tornar a frase mais natural, (3) preservar a estratégia original. **Nunca altere:** objetivo, estratégia, risco, próxima ação.

---

## 12. REGRAS DE QUALIDADE E ÉTICA
- Responder sempre pela ótica do comprador.
- A estratégia vem da base, nunca de geração livre do LLM.
- Não inventar dados, benchmarks fictícios ou urgência falsa.
- Não recomendar mentira, blefe, pressão abusiva ou manipulação emocional.
- Garantir consistência, auditabilidade e redução de consumo de tokens.

---

## 13. EVOLUÇÃO FUTURA (MOTOR 5.0 — reservado, NÃO implementar no 4.0)

Campos reservados: `fase_negociacao`, `emocao_detectada`, `nivel_pressao`, `historico_fornecedor`, `saving_alvo`, `criticidade_operacional`.

---

## RESUMO DA ENTREGA (4.0)
- **20 objetivos** (com diagnóstico/risco/estratégia/alavanca/próxima-ação próprios)
- **80 frases DISC** (20 objetivos × 4 perfis)
- **21 objeções**
- **84 regras de inferência** (21 objeções × 4 quadrantes → primário + secundário)
- **Entrada:** perfil DISC + objeção + quadrante (objetivo NÃO é entrada)
- **Saída:** diagnóstico · risco · estratégia · alavanca principal · frase sugerida · próxima melhor ação
- Sem inferência livre do LLM para tomada de decisão.
