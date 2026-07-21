// Dashboard — main landing after login

function toDiscData(raw) {
  if (!raw) return null;
  return [
    { key: 'D', label: t('disc.D.full'), value: raw.d || 0, color: 'var(--disc-d)' },
    { key: 'I', label: t('disc.I.full'), value: raw.i || 0, color: 'var(--disc-i)' },
    { key: 'S', label: t('disc.S.full'), value: raw.s || 0, color: 'var(--disc-s)' },
    { key: 'C', label: t('disc.C.full'), value: raw.c || 0, color: 'var(--disc-c)' },
  ];
}

function DashboardScreen({ go, user }) {
  useLang();
  const [discData, setDiscData] = React.useState(null);
  const [discRaw, setDiscRaw]   = React.useState(null);
  const [discLoading, setDiscLoading] = React.useState(true);
  const [recentReports, setRecentReports] = React.useState([]);

  React.useEffect(function() {
    if (!user) { setDiscLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function(raw) {
      const data = toDiscData(raw);
      setDiscData(data);
      setDiscRaw(raw || null);
      // mantém window.DISC_DATA atualizado para outros scripts que possam consumi-lo
      if (data) window.DISC_DATA = data;
      setDiscLoading(false);
    }).catch(function() { setDiscLoading(false); });
  }, [user && user.id]);

  // Atividade recente — últimos 3 relatórios gerados pelo aluno
  React.useEffect(function () {
    if (!user || !user.id || !window.fbGetReportsByUser) return;
    window.fbGetReportsByUser(user.id).then(function (docs) {
      setRecentReports((docs || []).slice(0, 3));
    }).catch(function () { /* silencioso */ });
  }, [user && user.id]);

  function fmtDate(ts) {
    if (!ts) return '—';
    try {
      var lang = window.getLang();
      var loc = lang === 'es' ? 'es' : lang === 'en' ? 'en-US' : 'pt-BR';
      return ts.toDate().toLocaleDateString(loc);
    } catch (e) {}
    return '—';
  }

  // Reconstrói labels do donut quando o idioma muda (re-render por useLang acima)
  const discDataLocalized = React.useMemo(function () {
    if (!discData) return null;
    return discData.map(function (d) {
      return Object.assign({}, d, { label: t('disc.' + d.key + '.full') });
    });
  }, [discData, window.getLang()]);

  const dominant = discDataLocalized ? discDataLocalized.reduce(function(a, b) { return a.value > b.value ? a : b; }) : null;
  const firstName = user && user.name ? user.name.split(' ')[0] : t('comp.donutPerson');

  // Card "Plano" no dashboard — usa o eixo dominante do user para sugerir 2 ações.
  // buildPlanCards é exposto por screen-rest.jsx; depende da ordem de carregamento do HTML.
  const planCard = React.useMemo(function () {
    if (!dominant || !discRaw || !window.buildPlanCards) return null;
    var all = window.buildPlanCards(discRaw);
    return all.find(function (c) { return c.key === dominant.key; }) || all[0] || null;
  }, [dominant, discRaw, window.getLang()]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Welcome hero */}
      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, background: 'radial-gradient(circle, var(--brown-50), transparent 70%)' }} />

          {dominant && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <div className="badge badge-brown"><Ic.Sparkle s={12}/> {t('dashboard.badge.done')}</div>
            </div>
          )}
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.15, maxWidth: 460 }}>
            {t('dashboard.helloMostName', { name: firstName })} <span style={{ color: 'var(--muted)' }}>
              {dominant ? t('dashboard.heroSubHas') : t('dashboard.heroSubEmpty')}
            </span>
          </h2>

          <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 26 }}>
            <div className="stat">
              <div className="stat-label">{t('dashboard.stat.dominantLbl')}</div>
              <div className="stat-value">
                {discLoading ? '…' : dominant ? dominant.key + ' · ' + dominant.value + '%' : '—'}
              </div>
              <div className="stat-delta">{dominant ? t('disc.' + dominant.key + '.label') : t('dashboard.stat.waiting')}</div>
            </div>
            <div className="stat">
              <div className="stat-label">{t('dashboard.stat.statusLbl')}</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{discLoading ? '…' : dominant ? t('dashboard.stat.statusDone') : t('dashboard.stat.statusPending')}</div>
              <div className="stat-delta">{dominant ? t('dashboard.stat.deltaDone') : t('dashboard.stat.deltaPending')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {dominant ? (
              <>
                <button className="btn btn-primary" onClick={() => go('analise')}>
                  {t('dashboard.cta.analysis')} <Ic.Arrow s={14} />
                </button>
                <button className="btn btn-secondary" onClick={() => go('relatorio')}>
                  <Ic.Pdf s={14} /> {t('dashboard.cta.export')}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => go('teste')}>
                <Ic.Disc s={14}/> {t('dashboard.cta.startTest')}
              </button>
            )}
          </div>
        </div>

        {/* Donut + summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-title">{t('dashboard.profile.title')}</div>
              <div className="card-sub">{t('dashboard.profile.sub')}</div>
            </div>
            <button className="icon-btn"><Ic.More s={16}/></button>
          </div>

          {discLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 170, color: 'var(--muted)', fontSize: 13 }}>{t('dashboard.profile.loading')}</div>
          ) : discDataLocalized ? (
            <React.Fragment>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 6 }}>
                <Donut
                  size={170} stroke={22} data={discDataLocalized}
                  center={<><div className="letter">{dominant.key}</div><div className="label">{t('disc.' + dominant.key + '.label')}</div></>}
                />
                <div className="legend" style={{ flex: 1 }}>
                  {discDataLocalized.map(d => (
                    <div className="legend-row" key={d.key}>
                      <div className="sw" style={{ background: d.color }} />
                      <span>{d.key} · {d.label}</span>
                      <span className="pct">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="divider" />
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}
                 dangerouslySetInnerHTML={{ __html: t('dashboard.profile.summary', { label: t('disc.' + dominant.key + '.label'), pct: dominant.value }) }} />
            </React.Fragment>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              {t('dashboard.profile.empty')}{' '}
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 8px', display: 'inline-flex' }} onClick={() => go('teste')}>{t('dashboard.profile.emptyCta')}</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <div className="section-title">{t('dashboard.quickAccess')}</div>
        <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <QuickCard icon={<Ic.Kraljic s={20}/>} title={t('dashboard.quick.kraljic')}     sub={t('dashboard.quick.kraljicSub')}     onClick={() => go('kraljic')} />
          <QuickCard icon={<Ic.Object s={20}/>}  title={t('dashboard.quick.objecoes')}    sub={t('dashboard.quick.objecoesSub')}    onClick={() => go('objecoes')} />
          {/* rota do aluno é 'cruzamento' — 'comparacoes' só existe no mapa do gestor */}
          <QuickCard icon={<Ic.Compare s={20}/>} title={t('dashboard.quick.comparacoes')} sub={t('dashboard.quick.comparacoesSub')} onClick={() => go('cruzamento')} />
          <QuickCard icon={<Ic.Report s={20}/>}  title={t('dashboard.quick.relatorios')}  sub={t('dashboard.quick.relatoriosSub')}  onClick={() => go('relatorios')} />
        </div>
      </div>

      {/* Bottom row — plano + atividade recente */}
      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div className="card-title">{t('dashboard.plano.title')}</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>{t('dashboard.plano.sub')}</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => go('plano')}>
              {t('dashboard.plano.viewAll')} <Ic.Arrow s={12}/>
            </button>
          </div>
          {planCard ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {planCard.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 15, fontWeight: 600 }}>{planCard.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{planCard.sub}</div>
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: 'var(--brown-700)' }}>{planCard.pct}%</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {planCard.actions.slice(0, 2).map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brown-400)', marginTop: 7, flexShrink: 0 }} />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13.5 }}>
              {dominant ? t('dashboard.plano.emptyWith') : t('dashboard.plano.emptyWithout')}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">{t('dashboard.activity.title')}</div>
          <div className="card-sub">{t('dashboard.activity.sub')}</div>
          {recentReports.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13.5 }}>
              {t('dashboard.activity.empty')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {recentReports.map((r, i) => (
                <button
                  key={r.id || i}
                  type="button"
                  onClick={() => go('relatorios')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    background: 'var(--paper-warm)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 10,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ic.Pdf s={14}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.title || t('relatorios.itemTitle')}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{fmtDate(r.createdAt)}</div>
                  </div>
                  <Ic.Arrow s={14}/>
                </button>
              ))}
            </div>
          )}
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
