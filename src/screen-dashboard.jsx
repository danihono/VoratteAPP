// Dashboard — main landing after login

const DISC_LABELS = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme' };
const DISC_FULL   = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' };

function toDiscData(raw) {
  if (!raw) return null;
  return [
    { key: 'D', label: DISC_FULL.D, value: raw.d || 0, color: 'var(--disc-d)' },
    { key: 'I', label: DISC_FULL.I, value: raw.i || 0, color: 'var(--disc-i)' },
    { key: 'S', label: DISC_FULL.S, value: raw.s || 0, color: 'var(--disc-s)' },
    { key: 'C', label: DISC_FULL.C, value: raw.c || 0, color: 'var(--disc-c)' },
  ];
}

function DashboardScreen({ go, user }) {
  const [discData, setDiscData] = React.useState(null);
  const [discLoading, setDiscLoading] = React.useState(true);

  React.useEffect(function() {
    if (!user) { setDiscLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function(raw) {
      const data = toDiscData(raw);
      setDiscData(data);
      // mantém window.DISC_DATA atualizado para outros scripts que possam consumi-lo
      if (data) window.DISC_DATA = data;
      setDiscLoading(false);
    }).catch(function() { setDiscLoading(false); });
  }, [user && user.id]);

  const dominant = discData ? discData.reduce(function(a, b) { return a.value > b.value ? a : b; }) : null;
  const firstName = user ? user.name.split(' ')[0] : 'você';

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Welcome hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, background: 'radial-gradient(circle, var(--brown-50), transparent 70%)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <div className="badge badge-brown"><Ic.Sparkle s={12}/> Análise atualizada · há 2 dias</div>
          </div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.15, maxWidth: 460 }}>
            Olá, {firstName}. <span style={{ color: 'var(--muted)' }}>Aqui está seu panorama estratégico de hoje.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 26 }}>
            <div className="stat">
              <div className="stat-label">Perfil predominante</div>
              <div className="stat-value">
                {discLoading ? '…' : dominant ? dominant.key + ' · ' + dominant.value + '%' : '—'}
              </div>
              <div className="stat-delta">{dominant ? DISC_LABELS[dominant.key] : 'Aguardando avaliação'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Compatibilidade equipe</div>
              <div className="stat-value">84%</div>
              <div className="stat-delta">Alto alinhamento</div>
            </div>
            <div className="stat">
              <div className="stat-label">Quadrante Kraljic</div>
              <div className="stat-value" style={{ fontSize: 26 }}>Alavancagem</div>
              <div className="stat-delta">Coerente com perfil D</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => go('analise')}>
              Acessar análise completa <Ic.Arrow s={14} />
            </button>
            <button className="btn btn-secondary" onClick={() => go('relatorio')}>
              <Ic.Pdf s={14} /> Exportar relatório
            </button>
          </div>
        </div>

        {/* Donut + summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-title">Seu perfil DISC</div>
              <div className="card-sub">Composição comportamental atual</div>
            </div>
            <button className="icon-btn"><Ic.More s={16}/></button>
          </div>

          {discLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 170, color: 'var(--muted)', fontSize: 13 }}>Carregando perfil…</div>
          ) : discData ? (
            <React.Fragment>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 6 }}>
                <Donut
                  size={170} stroke={22} data={discData}
                  center={<><div className="letter">{dominant.key}</div><div className="label">{DISC_LABELS[dominant.key]}</div></>}
                />
                <div className="legend" style={{ flex: 1 }}>
                  {discData.map(d => (
                    <div className="legend-row" key={d.key}>
                      <div className="sw" style={{ background: d.color }} />
                      <span>{d.key} · {d.label}</span>
                      <span className="pct">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="divider" />
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                Você possui um perfil <strong style={{ color: 'var(--ink)' }}>{DISC_LABELS[dominant.key]}</strong>,
                com {dominant.value}% de predominância no seu resultado DISC.
              </p>
            </React.Fragment>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Seu perfil DISC ainda não foi avaliado.{' '}
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 8px', display: 'inline-flex' }} onClick={() => go('teste')}>Iniciar agora</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <div className="section-title">Acesso rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <QuickCard icon={<Ic.Kraljic s={20}/>} title="Matriz de Kraljic" sub="Analisar categorias" onClick={() => go('kraljic')} />
          <QuickCard icon={<Ic.Object s={20}/>} title="Objeções" sub="Por perfil DISC" onClick={() => go('objecoes')} />
          <QuickCard icon={<Ic.Compare s={20}/>} title="Comparações" sub="Cruzar perfis" onClick={() => go('comparacoes')} />
          <QuickCard icon={<Ic.Report s={20}/>} title="Relatórios" sub="Meus documentos" onClick={() => go('relatorios')} />
        </div>
      </div>

      {/* Bottom row — DISC test progress + recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div className="card-title">Plano de desenvolvimento</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>4 dimensões em evolução</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => go('plano')}>
              Ver tudo <Ic.Arrow s={12}/>
            </button>
          </div>

          {[
            { label: 'Comunicação', icon: <Ic.Chat s={16}/>, sub: 'Escuta ativa e empatia', pct: 60 },
            { label: 'Negociação', icon: <Ic.Handshake s={16}/>, sub: 'Estratégias de concessão', pct: 40 },
            { label: 'Gestão de conflitos', icon: <Ic.Shield s={16}/>, sub: 'Paciência e diplomacia', pct: 30 },
            { label: 'Liderança', icon: <Ic.Sparkle s={16}/>, sub: 'Inspirar e desenvolver', pct: 50 },
          ].map(row => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 60px', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {row.icon}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.sub}</div>
              </div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-numeric', fontWeight: 600, color: 'var(--brown-700)' }}>{row.pct}%</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Atividade recente</div>
          <div className="card-sub">Últimas ações na plataforma</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { t: 'Relatório DISC gerado', sub: 'PDF · 24 páginas', when: 'há 2 dias', icon: <Ic.Pdf s={14}/> },
              { t: 'Quadrante Kraljic atualizado', sub: 'Alavancagem · 12 itens', when: 'há 5 dias', icon: <Ic.Kraljic s={14}/> },
              { t: 'Comparação com perfil C', sub: 'Fornecedor Estratégico Sul', when: 'há 8 dias', icon: <Ic.Compare s={14}/> },
              { t: 'Reavaliação DISC concluída', sub: '28 questões · 9 min', when: 'há 14 dias', icon: <Ic.Disc s={14}/> },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.t}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.sub}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-soft)', whiteSpace: 'nowrap' }}>{r.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        padding: 18, textAlign: 'left', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 180ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--brown-300)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

window.DashboardScreen = DashboardScreen;
window.DISC_DATA = window.DISC_DATA || [];
