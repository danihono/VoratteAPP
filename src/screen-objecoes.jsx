// Objeções por Perfil

function ObjecoesScreen({ go }) {
  const [tab, setTab] = React.useState('D');

  const objs = {
    D: {
      common: [
        '"Quero o resultado disso"',
        '"Quanto isso vai economizar?"',
        '"Por que não é mais rápido?"',
        '"Não tenho tempo para detalhes"',
      ],
      counter: [
        'Apresente dados objetivos e ROI',
        'Seja direto e vá ao ponto',
        'Mostre agilidade e assertividade',
        'Foque no resultado final, não no processo',
      ],
      avoid: ['Ficar em rodeios', 'Apresentar muitos detalhes', 'Falar em "talvez"', 'Demorar para concluir'],
      use: ['"O resultado é..."', '"Em X dias entregamos"', '"ROI projetado de Y%"', '"Conclusão objetiva: ..."'],
    },
    I: {
      common: [
        '"Preciso pensar melhor"',
        '"Quero ver mais opções"',
        '"E se mudarmos depois?"',
        '"Isso atende à minha equipe?"',
      ],
      counter: [
        'Mostre benefícios emocionais e reconhecimento',
        'Dê opções e alternativas visíveis',
        'Traga casos de sucesso reais',
        'Envolva a equipe na decisão',
      ],
      avoid: ['Soar muito frio ou técnico', 'Ignorar reconhecimento', 'Limitar a uma única opção', 'Não envolver pessoas'],
      use: ['"Outras empresas como X..."', '"Imagine sua equipe..."', '"Você seria reconhecido por..."', '"Vamos construir juntos"'],
    },
    S: {
      common: [
        '"E se algo der errado?"',
        '"Precisamos pensar com calma"',
        '"E a equipe, vai aceitar?"',
        '"Estamos confortáveis com o atual"',
      ],
      counter: [
        'Mostre histórico, estabilidade e garantias',
        'Ofereça prazo para análise',
        'Envolva a equipe e mostre suporte',
        'Apresente transição gradual e segura',
      ],
      avoid: ['Pressionar por urgência', 'Mudança abrupta', 'Ignorar relacionamentos atuais', 'Excesso de mudança'],
      use: ['"Temos X anos de histórico..."', '"No seu ritmo..."', '"Suporte garantido em..."', '"Transição em fases"'],
    },
    C: {
      common: [
        '"Preciso pensar melhor"',
        '"Quero ver mais opções"',
        '"E se mudarmos depois?"',
        '"Isso atende à minha equipe?"',
      ],
      counter: [
        'Mostre benefícios racionais e dados',
        'Dê opções e alternativas comparativas',
        'Traga casos de adaptação bem-sucedidos',
        'Envolva a equipe na decisão',
      ],
      avoid: ['Afirmações sem prova', 'Pressão por tempo', 'Generalizações', 'Falta de documentação'],
      use: ['"Os dados mostram..."', '"Documentado em..."', '"Comparativo entre A e B..."', '"Conforme norma X..."'],
    },
  };

  const d = objs[tab];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="tabs">
          {['D','I','S','C'].map(k => (
            <button key={k} className={'tab' + (tab===k?' active':'')} onClick={() => setTab(k)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 22, height: 22, fontSize: 12, borderRadius: 6 }}>{k}</span>
                Perfil {k}
              </span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Suas conversas com perfis <strong style={{ color: 'var(--ink)' }}>{tab}</strong> · 14 negociações ativas
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Objeções comuns do perfil {tab}</div>
          <div className="card-sub">O que você provavelmente vai ouvir</div>
          {d.common.map((q, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < d.common.length-1 ? '1px solid var(--line-soft)' : 'none', display: 'flex', gap: 12 }}>
              <Ic.Chat s={16} />
              <span style={{ fontSize: 13.5, fontStyle: 'italic', color: 'var(--ink-soft)' }}>{q}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Como contornar</div>
          <div className="card-sub">Resposta estratégica recomendada</div>
          {d.counter.map((q, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < d.counter.length-1 ? '1px solid var(--line-soft)' : 'none', display: 'flex', gap: 12 }}>
              <Ic.Check s={16} />
              <span style={{ fontSize: 13.5 }}>{q}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ background: 'var(--paper-warm)', borderColor: 'var(--brown-200)' }}>
          <div className="card-title">Linguagem a usar</div>
          <div className="card-sub">Palavras que conectam</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.use.map((u, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--paper)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', fontStyle: 'italic' }}>{u}</div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: 'var(--paper-warm)', borderColor: 'var(--brown-200)' }}>
          <div className="card-title">Linguagem a evitar</div>
          <div className="card-sub">O que afasta esse perfil</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.avoid.map((u, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--paper)', borderRadius: 8, fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--disc-d)', fontWeight: 700 }}>×</span> {u}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--ink)', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic.Bulb s={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600 }}>Dica estratégica</div>
            <p style={{ fontSize: 13, color: 'var(--brown-200)', marginTop: 4, lineHeight: 1.55 }}>
              {tab === 'D' && 'Perfis D respeitam quem é direto. Vá ao ponto, mostre resultados em 30 segundos e respeite o tempo.'}
              {tab === 'I' && 'Perfis I são influenciados por relacionamento e entusiasmo. Construa conexão e mostre benefícios para as pessoas.'}
              {tab === 'S' && 'Perfis S compram segurança, não promessas. Mostre estabilidade, suporte e transição gradual.'}
              {tab === 'C' && 'Perfis C compram dados, não convicção. Traga evidência documental e respeite o tempo de análise.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ObjecoesScreen = ObjecoesScreen;
