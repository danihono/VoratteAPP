// DISC — test, full analysis, profile crossing

function DiscTestScreen({ go }) {
  const [q, setQ] = React.useState(12);
  const [picked, setPicked] = React.useState('A');
  const total = 28;
  const opts = [
    { k: 'A', t: 'Tomo a frente e busco resolver rapidamente.' },
    { k: 'B', t: 'Motivo a equipe e mantenho o otimismo.' },
    { k: 'C', t: 'Prefiro manter a calma e buscar estabilidade.' },
    { k: 'D', t: 'Analiso cuidadosamente antes de agir.' },
  ];
  return (
    <div className="page-enter" style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="badge badge-outline">Teste DISC · Aplicado a Compras</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Pergunta <strong style={{ color: 'var(--ink)' }}>{q}</strong> de {total}
          </div>
        </div>
        <div className="progress">
          <span style={{ width: `${(q/total)*100}%` }} />
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
          Cenário · Tomada de decisão
        </div>
        <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 4 }}>
          Em um ambiente desafiador, eu…
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Escolha a alternativa que melhor representa seu comportamento.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opts.map(o => (
            <div
              key={o.k}
              className={'q-option' + (picked === o.k ? ' selected' : '')}
              onClick={() => setPicked(o.k)}
            >
              <div className="letter">{o.k}</div>
              <div style={{ flex: 1 }}>{o.t}</div>
              {picked === o.k && <Ic.Check s={18} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button className="btn btn-secondary" onClick={() => setQ(Math.max(1, q-1))}><Ic.ArrowL s={14}/> Anterior</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => go('dashboard')}>Salvar e sair</button>
            <button className="btn btn-primary" onClick={() => { if (q < total) setQ(q+1); else go('analise'); }}>
              {q < total ? 'Próxima' : 'Finalizar'} <Ic.Arrow s={14}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', fontSize: 12, color: 'var(--muted)' }}>
        <Ic.Lock s={12}/> Respostas criptografadas · pressione <span className="kbd">A</span>–<span className="kbd">D</span> para responder
      </div>
    </div>
  );
}

// ============ ANALYSIS ============
function AnaliseScreen({ go }) {
  const [tab, setTab] = React.useState('caracteristicas');

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Top — donut + composition */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Donut size={220} stroke={28} data={DISC_DATA}
              center={<><div className="letter">D</div><div className="label">Dominante</div></>}
            />
            <div style={{ textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 500 }}>Perfil predominante</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>secundário: <strong style={{ color: 'var(--ink)' }}>Influência (I)</strong></div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
              Análise comportamental
            </div>
            <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 22 }}>
              Composição do seu perfil
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {DISC_DATA.map(d => (
                <div key={d.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.label} ({d.key})</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{d.value}%</div>
                  </div>
                  <div className="progress" style={{ background: 'var(--brown-50)' }}>
                    <span style={{ width: `${d.value}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tabs">
          {[
            ['caracteristicas','Características'],
            ['forcas','Forças'],
            ['atencao','Pontos de atenção'],
            ['comunicacao','Comunicação'],
            ['negociacao','Negociação'],
          ].map(([k,l]) => (
            <button key={k} className={'tab' + (tab===k?' active':'')} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => go('cruzamento')}>
          Cruzamento com outros perfis <Ic.Arrow s={14}/>
        </button>
      </div>

      {/* Tab content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {tab === 'caracteristicas' && <>
          <Pillar title="Como você decide" items={[
            'Foco em resultados',
            'Tomada de decisão rápida',
            'Gosta de desafios',
            'Determinado e independente',
            'Competitivo e líder nato',
          ]} />
          <Pillar title="Como você se comporta" items={[
            'Direto na comunicação',
            'Forte senso de urgência',
            'Pouca tolerância a processos lentos',
            'Aceita riscos calculados',
            'Mobiliza pessoas pela ação',
          ]} />
        </>}
        {tab === 'forcas' && <>
          <Pillar title="Forças naturais" items={[
            'Liderança em momentos críticos',
            'Velocidade na negociação',
            'Determinação para fechar acordos',
            'Resiliência sob pressão',
          ]} />
          <Pillar title="Valor entregue à equipe" items={[
            'Direciona objetivos com clareza',
            'Resolve travas operacionais',
            'Impulsiona prazos de fechamento',
            'Defende posições frente a fornecedores',
          ]} />
        </>}
        {tab === 'atencao' && <>
          <Pillar title="Pontos de atenção" items={[
            'Pode ser muito direto',
            'Dificuldade em delegar',
            'Sensibilidade a críticas',
            'Impaciência com processos longos',
          ]} tone="warn" />
          <Pillar title="Riscos comportamentais" items={[
            'Desgaste de relacionamento com perfis S/C',
            'Decisões precipitadas em itens estratégicos',
            'Pouca escuta em concessões',
            'Conflitos em equipes diversas',
          ]} tone="warn" />
        </>}
        {tab === 'comunicacao' && <>
          <Pillar title="Seu estilo" items={[
            'Direto, claro e assertivo',
            'Foco em resultado, não em rapport',
            'Prefere conversas rápidas e objetivas',
            'Pouco espaço para small talk',
          ]} />
          <Pillar title="Como ser mais eficaz" items={[
            'Comece pela conclusão, depois detalhe',
            'Dê espaço para o outro responder',
            'Use dados objetivos, não apenas convicção',
            'Adapte o ritmo ao perfil do interlocutor',
          ]} />
        </>}
        {tab === 'negociacao' && <>
          <Pillar title="Estilo de negociação" items={[
            'Competitivo e focado em ganhos',
            'Busca fechamento rápido',
            'Forte em barganha distributiva',
            'Coloca termos na mesa cedo',
          ]} />
          <Pillar title="Quando ajustar" items={[
            'Em itens estratégicos, prefira ganha-ganha',
            'Em gargalos, invista em parceria de longo prazo',
            'Em fornecedores únicos, reduza pressão',
            'Em itens não críticos, delegue mais',
          ]} />
        </>}
      </div>

      {/* impact summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--brown-50), var(--paper-warm))', borderColor: 'var(--brown-200)' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', color: 'var(--brown-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic.Bulb s={20} />
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Como isso impacta suas compras</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 720 }}>
              Você tende a fechar com firmeza e foco no que gera resultado — vantagem
              em itens de Alavancagem. Em itens Estratégicos e Gargalo, pode acelerar
              decisões e perder valor de longo prazo. Equilibre com perfis S/C ao seu lado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pillar({ title, items, tone }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div style={{ marginTop: 10 }}>
        {items.map((it, i) => (
          <div className="list-row" key={i}>
            <div className="bullet" style={tone==='warn' ? { background: 'var(--disc-d)' } : null} />
            <span>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ CRUZAMENTO ENTRE PERFIS ============
function CruzamentoScreen({ go }) {
  const [target, setTarget] = React.useState('D');

  const data = {
    D: {
      identify: ['Direto', 'Competitivo', 'Focado em resultados', 'Impaciente', 'Gosta de desafios', 'Decisivo'],
      comm: ['Seja direto e objetivo', 'Foque em resultados e números', 'Apresente soluções rápidas', 'Evite rodeios e detalhes em excesso', 'Mostre como sua solução economiza tempo'],
      objs: [
        ['"Quero o resultado disso"', 'Apresente dados e ROI'],
        ['"Quanto isso vai economizar?"', 'Seja objetivo e vá direto ao ponto'],
        ['"Por que não é mais rápido?"', 'Mostre agilidade e assertividade'],
      ],
    },
    I: {
      identify: ['Comunicativo', 'Entusiasta', 'Influente', 'Otimista', 'Busca reconhecimento', 'Sociável'],
      comm: ['Crie ambiente cordial e leve', 'Use histórias e casos de sucesso', 'Reconheça contribuições publicamente', 'Demonstre entusiasmo genuíno', 'Conecte a solução a pessoas, não só a números'],
      objs: [
        ['"Quem mais já comprou?"', 'Traga referências e casos visíveis'],
        ['"Como vão me ver com isso?"', 'Mostre o impacto reputacional positivo'],
        ['"Não quero parecer rígido"', 'Apresente alternativas flexíveis'],
      ],
    },
    S: {
      identify: ['Paciente', 'Estável', 'Bom ouvinte', 'Avesso a mudanças bruscas', 'Cooperativo', 'Leal'],
      comm: ['Construa confiança antes de pedir decisões', 'Explique mudanças com calma e previsibilidade', 'Demonstre estabilidade do fornecedor', 'Evite pressão por urgência artificial', 'Confirme cada passo do acordo'],
      objs: [
        ['"E se algo der errado?"', 'Mostre histórico e garantias'],
        ['"Precisamos pensar com calma"', 'Ofereça prazo para análise'],
        ['"E a equipe, vai aceitar?"', 'Envolva a equipe na decisão'],
      ],
    },
    C: {
      identify: ['Analítico', 'Detalhista', 'Cauteloso', 'Orientado por dados', 'Crítico', 'Perfeccionista'],
      comm: ['Traga dados, comparativos e evidências', 'Documente cada cláusula com clareza', 'Respeite o tempo de análise', 'Evite afirmações sem prova', 'Use linguagem técnica e precisa'],
      objs: [
        ['"Preciso pensar melhor"', 'Mostre benefícios racionais e dados'],
        ['"Quero ver mais opções"', 'Dê alternativas e benchmarks'],
        ['"E se mudarmos depois?"', 'Traga casos de adaptação bem-sucedidos'],
        ['"Isso atende à minha equipe?"', 'Envolva a equipe na decisão'],
      ],
    },
  };

  const d = data[target];
  const profiles = {
    D: { label: 'Dominante', desc: 'Resultado · Decisão · Velocidade' },
    I: { label: 'Influente', desc: 'Pessoas · Entusiasmo · Reconhecimento' },
    S: { label: 'Estável', desc: 'Cooperação · Paciência · Lealdade' },
    C: { label: 'Conforme', desc: 'Dados · Detalhe · Precisão' },
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
          Seu perfil é <strong style={{ color: 'var(--brown-700)' }}>D · Dominante</strong>. Escolha com quem você está negociando:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
          {Object.entries(profiles).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setTarget(k)}
              style={{
                padding: 16, borderRadius: 12,
                border: '1px solid ' + (target===k ? 'var(--brown-700)' : 'var(--line)'),
                background: target===k ? 'var(--brown-50)' : 'var(--paper)',
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 160ms ease',
                boxShadow: target===k ? 'inset 0 0 0 1px var(--brown-700)' : 'none',
              }}
            >
              <div className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 38, height: 38, fontSize: 18 }}>{k}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{v.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Como identificar um perfil {target}</div>
          <div className="card-sub">Sinais comportamentais mais evidentes</div>
          {d.identify.map((it, i) => (
            <div className="list-row" key={i}>
              <div className="bullet" />
              <span>{it}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Como se comunicar</div>
          <div className="card-sub">Adaptação de linguagem e ritmo</div>
          {d.comm.map((it, i) => (
            <div className="list-row" key={i}>
              <Ic.Check s={14} />
              <span>{it}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="card-title">Objeções típicas do perfil {target}</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Antecipe e prepare resposta</div>
          </div>
          <div className="badge badge-brown"><Ic.Sparkle s={11}/> Sugerido por IA</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          {d.objs.map(([q, a], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ padding: 14, background: 'var(--paper-warm)', fontStyle: 'italic', color: 'var(--ink-soft)', fontSize: 13 }}>{q}</div>
              <div style={{ padding: 14, borderLeft: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--ink)', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic.Bulb s={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, color: 'var(--brown-50)' }}>Dica estratégica</div>
            <p style={{ fontSize: 13, color: 'var(--brown-200)', marginTop: 4, lineHeight: 1.55 }}>
              {target === 'D' && 'D vs D: ambos competitivos. Estabeleça regras claras, foque em resultados mensuráveis e respeite o tempo do outro.'}
              {target === 'I' && 'Perfis I são influenciados por relacionamento e entusiasmo. Construa conexão e mostre os benefícios para as pessoas.'}
              {target === 'S' && 'Perfis S precisam de tempo e segurança. Não pressione decisões — construa confiança e demonstre estabilidade.'}
              {target === 'C' && 'Perfis C compram com dados. Apresente comparativos, evidências e respeite cada passo da análise.'}
            </p>
          </div>
          <button className="btn" style={{ background: 'var(--brown-700)', color: 'var(--brown-50)' }} onClick={() => go('relatorio')}>
            Salvar no relatório <Ic.Arrow s={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

window.DiscTestScreen = DiscTestScreen;
window.AnaliseScreen = AnaliseScreen;
window.CruzamentoScreen = CruzamentoScreen;
