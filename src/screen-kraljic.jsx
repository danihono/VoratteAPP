// Kraljic matrix screen — premium quadrant view

function KraljicScreen({ go }) {
  const [active, setActive] = React.useState('D');

  const quads = {
    D: {
      letter: 'D', name: 'Alavancagem',
      icon: <Ic.Chart s={20}/>,
      risk: 'baixo', impact: 'alto',
      desc: 'Alto impacto financeiro · Baixo risco de fornecimento',
      strategy: 'Maximizar poder de compra. Concorrência ativa entre fornecedores, leilões reversos, contratos com gatilhos de preço.',
      profile: 'D',
      profileNote: 'Perfil dominante (D) é ideal. Decisão rápida, foco em resultado e firmeza para extrair valor.',
      tactics: [
        'Promover concorrência entre 3+ fornecedores',
        'Renegociar preço a cada janela de revisão',
        'Padronizar especificações para abrir mercado',
        'Volume agregado para escala',
      ],
      risks: ['Foco excessivo em preço pode reduzir qualidade', 'Relacionamento desgastado com fornecedor estratégico'],
    },
    I: {
      letter: 'I', name: 'Estratégico',
      icon: <Ic.Diamond s={20}/>,
      risk: 'alto', impact: 'alto',
      desc: 'Alto impacto financeiro · Alto risco de fornecimento',
      strategy: 'Parceria de longo prazo. Co-desenvolvimento, contratos plurianuais, integração técnica e comercial.',
      profile: 'I',
      profileNote: 'Perfis I e S têm vantagem aqui — relacionamento, escuta e construção de confiança.',
      tactics: [
        'Contrato plurianual com cláusulas de revisão',
        'Plano conjunto de inovação e roadmap',
        'Reuniões executivas regulares com fornecedor',
        'Compartilhamento de previsão de demanda',
      ],
      risks: ['Dependência crítica do fornecedor', 'Custo elevado de troca'],
    },
    S: {
      letter: 'S', name: 'Gargalo',
      icon: <Ic.Link s={20}/>,
      risk: 'alto', impact: 'baixo',
      desc: 'Baixo impacto financeiro · Alto risco de fornecimento',
      strategy: 'Assegurar continuidade. Estoque de segurança, qualificação de fontes alternativas, contratos de fornecimento garantido.',
      profile: 'C',
      profileNote: 'Perfil C analisa risco com precisão. Perfis S são pacientes para qualificar alternativas.',
      tactics: [
        'Manter estoque de segurança ampliado',
        'Qualificar 2ª fonte alternativa',
        'Engenharia de substituição de material',
        'Contratos com SLA reforçado',
      ],
      risks: ['Ruptura de fornecimento por evento único', 'Falta de leverage comercial'],
    },
    C: {
      letter: 'C', name: 'Não Críticos',
      icon: <Ic.Cart s={20}/>,
      risk: 'baixo', impact: 'baixo',
      desc: 'Baixo impacto financeiro · Baixo risco de fornecimento',
      strategy: 'Eficiência operacional. Catálogos eletrônicos, P-card, automação de pedido, padronização e agrupamento.',
      profile: 'D',
      profileNote: 'Pode ser delegado. Foco em eficiência de processo, não em negociação intensa.',
      tactics: [
        'Catálogo eletrônico e self-service',
        'Cartão corporativo (P-card)',
        'Agrupar pedidos em fornecedor único',
        'Automatizar reposição com gatilho de estoque',
      ],
      risks: ['Tempo gasto demais em itens de baixo valor', 'Multiplicação desnecessária de fornecedores'],
    },
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 36, alignItems: 'start' }}>

          {/* Matrix visual */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
              Categorização estratégica
            </div>
            <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em', margin: '6px 0 22px' }}>
              Matriz de Kraljic
            </h2>

            <div className="kraljic-grid">
              {/* corner */}
              <div />
              <div className="kraljic-axis-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 8 }}>Baixo</div>
              <div className="kraljic-axis-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>Alto</div>
              <div />

              {/* row 1: Alto / Alavancagem · Estratégico */}
              <div className="kraljic-axis-label vertical">Alto</div>
              <QuadCell q={quads.D} active={active==='D'} onClick={() => setActive('D')} />
              <QuadCell q={quads.I} active={active==='I'} onClick={() => setActive('I')} />
              <div className="kraljic-axis-label vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 600 }}>Impacto financeiro</span>
              </div>

              {/* row 2: Baixo / Não Críticos · Gargalo */}
              <div className="kraljic-axis-label vertical">Baixo</div>
              <QuadCell q={quads.C} active={active==='C'} onClick={() => setActive('C')} />
              <QuadCell q={quads.S} active={active==='S'} onClick={() => setActive('S')} />
              <div />

              {/* bottom axis */}
              <div />
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 600, paddingTop: 10 }}>
                Risco de fornecimento
              </div>
              <div />
            </div>
          </div>

          {/* Side panel — selected quadrant detail */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div className={'disc-tile disc-' + active.toLowerCase()} style={{ width: 52, height: 52, fontSize: 26 }}>{quads[active].letter}</div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Quadrante</div>
                <div className="serif" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>{quads[active].name}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
              {quads[active].desc}
            </div>

            <div style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, marginBottom: 18, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
                Estratégia recomendada
              </div>
              {quads[active].strategy}
            </div>

            <div className="section-title">Táticas práticas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
              {quads[active].tactics.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 13.5, color: 'var(--ink-soft)' }}>
                  <Ic.Check s={16}/>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <div className="section-title">Riscos a monitorar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quads[active].risks.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 13.5, color: 'var(--ink-soft)' }}>
                  <div className="bullet" style={{ background: 'var(--disc-d)', marginTop: 8 }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DISC × Kraljic crossing */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="card-title">Cruzamento DISC × Kraljic</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Qual perfil performa melhor em cada quadrante</div>
          </div>
          <div className="badge badge-brown"><Ic.Sparkle s={11}/> Inteligência aplicada</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {Object.entries(quads).map(([k, q]) => (
            <div key={k} style={{
              padding: 18, borderRadius: 12,
              background: active === k ? 'var(--brown-50)' : 'var(--paper-warm)',
              border: '1px solid ' + (active === k ? 'var(--brown-300)' : 'var(--line)'),
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 32, height: 32, fontSize: 16 }}>{k}</div>
                <div className="badge badge-outline" style={{ fontSize: 10 }}>Ideal: {q.profile}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{q.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{q.profileNote}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => go('relatorio')}>
            Ver estratégias recomendadas <Ic.Arrow s={14}/>
          </button>
          <button className="btn btn-secondary" onClick={() => go('cruzamento')}>
            <Ic.Compare s={14}/> Cruzar com outros perfis
          </button>
        </div>
      </div>
    </div>
  );
}

function QuadCell({ q, active, onClick }) {
  return (
    <div
      className="kraljic-cell"
      style={{
        background: active ? 'var(--brown-50)' : 'var(--paper)',
        borderColor: active ? 'var(--brown-300)' : 'var(--line)',
        boxShadow: active ? 'inset 0 0 0 1px var(--brown-300)' : 'none',
      }}
      onClick={onClick}
    >
      <div className="top">
        <div className={'disc-tile disc-' + q.letter.toLowerCase()} style={{ width: 40, height: 40, fontSize: 20 }}>{q.letter}</div>
        <div style={{ color: 'var(--brown-500)' }}>{q.icon}</div>
      </div>
      <h4>{q.name}</h4>
      <p style={{ fontSize: 12, lineHeight: 1.5 }}>{q.desc}</p>
    </div>
  );
}

window.KraljicScreen = KraljicScreen;
