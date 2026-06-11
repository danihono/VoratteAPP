// Relatórios list + Relatório (single report cover/page) + Plano + Comparações + Perfil

// Persiste o relatório do próprio aluno em /reports com doc ID determinístico
// ('self_{uid}') para garantir 1 doc único por aluno — reexportações sobrescrevem
// o mesmo doc (apenas atualizam createdAt), evitando duplicatas na listagem.
async function persistOwnReport(user) {
  if (!user || !user.id || !window.fbSaveReport) return;
  try {
    await window.fbSaveReport({
      userId: user.id,
      type: 'individual',
      title: 'Meu relatório DISC' + (user.name ? (' · ' + user.name) : ''),
      targetId: user.id,
      targetLabel: user.name || user.email || '',
      createdBy: user.id,
      createdByName: user.name || '',
    }, 'self_' + user.id);
  } catch (e) {
    console.warn('persistOwnReport falhou (PDF foi gerado mesmo assim):', e);
  }
}

function RelatoriosScreen({ go, user }) {
  useLang();
  var [rows, setRows]       = React.useState([]);
  var [loading, setLoading] = React.useState(true);
  var [query, setQuery]     = React.useState('');
  var [typeFilter, setTypeFilter] = React.useState('todos');
  var [filterOpen, setFilterOpen] = React.useState(false);
  var filterRef = React.useRef(null);

  function reloadReports() {
    if (!user || !user.id || !window.fbGetReportsByUser) { setLoading(false); return; }
    return window.fbGetReportsByUser(user.id).then(function (docs) {
      setRows(docs || []);
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }

  React.useEffect(function () {
    reloadReports();
  }, [user && user.id]);

  // Fecha o popover de filtros ao clicar fora ou apertar Esc
  React.useEffect(function () {
    if (!filterOpen) return;
    function onDoc(e) { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setFilterOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return function () {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  const filtered = React.useMemo(function () {
    var q = query.trim().toLowerCase();
    return rows.filter(function (r) {
      if (typeFilter !== 'todos' && r.type !== typeFilter) return false;
      if (!q) return true;
      var title = (r.title || '').toLowerCase();
      var type  = (r.type  || '').toLowerCase();
      return title.indexOf(q) !== -1 || type.indexOf(q) !== -1;
    });
  }, [rows, query, typeFilter]);

  const filterOptions = [
    { key: 'todos',         label: t('relatorios.filterAll') },
    { key: 'individual',    label: t('relatorios.filterIndividual') },
    { key: 'empresa',       label: t('relatorios.filterEmpresa') },
    { key: 'grupo',         label: t('relatorios.filterGrupo') },
    { key: 'personalizado', label: t('relatorios.filterPersonalizado') },
  ];
  const activeFilterLabel = (filterOptions.find(function (o) { return o.key === typeFilter; }) || filterOptions[0]).label;

  function fmtDate(ts) {
    if (!ts) return '—';
    try {
      var lang = window.getLang();
      var loc = lang === 'es' ? 'es' : lang === 'en' ? 'en-US' : 'pt-BR';
      return ts.toDate().toLocaleDateString(loc);
    } catch (e) {}
    if (typeof ts === 'string') return ts;
    return '—';
  }

  // Exporta o relatório real do usuário em PDF (busca o DISC se necessário) e persiste em /reports
  function handleExport() {
    function doExport(disc) {
      window.exportReportPDF(window.buildReportData(user, disc));
      persistOwnReport(user).then(function () { reloadReports(); });
    }
    if (window.DISC_LAST_RESULT) { doExport(window.DISC_LAST_RESULT); return; }
    if (user && user.id) {
      window.fbGetDiscResult(user.id).then(function (doc) {
        const r = relDiscResultFromDoc(doc);
        if (!r) { alert(t('relatorios.alert.doTestFirst')); return; }
        window.DISC_LAST_RESULT = r;
        doExport(r);
      }).catch(function () { alert(t('relatorios.alert.cantLoad')); });
    } else {
      alert(t('relatorios.alert.doTestFirst'));
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <input
              className="input"
              placeholder={t('relatorios.searchPlaceholder')}
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <Ic.Search s={16}/>
            </div>
          </div>

          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
            >
              <Ic.Settings s={14}/> {t('relatorios.filters')}
              {typeFilter !== 'todos' && (
                <span className="badge badge-brown" style={{ padding: '2px 8px', fontSize: 11 }}>
                  {activeFilterLabel}
                </span>
              )}
            </button>
            {filterOpen && (
              <div style={{
                position: 'absolute', left: 0, top: '110%', zIndex: 51,
                minWidth: 220, background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 12, boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-soft)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                  {t('relatorios.filterHeader')}
                </div>
                {filterOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setTypeFilter(opt.key); setFilterOpen(false); }}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 18px', alignItems: 'center',
                      width: '100%', textAlign: 'left',
                      padding: '10px 14px',
                      background: typeFilter === opt.key ? 'var(--brown-50)' : 'transparent',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--line-soft)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--ink)', fontWeight: typeFilter === opt.key ? 600 : 500 }}>{opt.label}</span>
                    {typeFilter === opt.key && <Ic.Check s={14}/>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => go('relatorio')}>
          <Ic.Plus s={14}/> {t('relatorios.new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>{t('relatorios.loading')}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}
               dangerouslySetInnerHTML={{ __html: t('relatorios.empty') }} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            {t('relatorios.noResults')}
          </div>
        ) : (
          <div className="tbl-wrap"><table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>{t('relatorios.col.report')}</th>
                <th>{t('relatorios.col.date')}</th>
                <th>{t('relatorios.col.type')}</th>
                <th style={{ textAlign: 'right', paddingRight: 24 }}>{t('relatorios.col.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic.Pdf s={16}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.title || t('relatorios.itemTitle')}</div>
                      </div>
                    </div>
                  </td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td><span className="badge badge-outline">{r.type || '—'}</span></td>
                  <td style={{ paddingRight: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="icon-btn" onClick={() => go('relatorio')}><Ic.Eye s={16}/></button>
                      <button className="icon-btn" onClick={handleExport} title={t('relatorios.downloadTitle')}><Ic.Download s={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          {t(filtered.length === 1 ? 'relatorios.showing' : 'relatorios.showingPlural', { count: filtered.length })}
        </div>
      )}
    </div>
  );
}

// ============ RELATÓRIO (cover + body, personalizado) ============
const REL_DISC_COLORS = { D: 'var(--disc-d)', I: 'var(--disc-i)', S: 'var(--disc-s)', C: 'var(--disc-c)' };

// Reconstrói o resultado DISC a partir do doc salvo no Firestore
function relDiscResultFromDoc(doc) {
  if (!doc) return null;
  const profile = window.BUYER_PROFILES[doc.code] || window.BUYER_PROFILES[doc.main];
  if (!profile) return null;
  return {
    mostGraph:   doc.mostGraph   || { D: doc.d, I: doc.i, S: doc.s, C: doc.c },
    leastGraph:  doc.leastGraph  || { D: 0, I: 0, S: 0, C: 0 },
    changeGraph: doc.changeGraph || { D: 0, I: 0, S: 0, C: 0 },
    code: doc.code || doc.main,
    profile: profile,
  };
}

function RelatorioScreen({ go, user }) {
  useLang();
  const [result, setResult] = React.useState(window.DISC_LAST_RESULT || null);
  const [loading, setLoading] = React.useState(!window.DISC_LAST_RESULT);

  React.useEffect(function () {
    if (result || !user || !user.id) { setLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function (doc) {
      const r = relDiscResultFromDoc(doc);
      if (r) { setResult(r); window.DISC_LAST_RESULT = r; }
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [user && user.id]);

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>{t('relatorio.loading')}</div>;
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 44, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <h2 className="serif" style={{ fontSize: 24, fontWeight: 500 }}>{t('relatorio.unavailableTitle')}</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420 }}>
          {t('relatorio.unavailableBody')}
        </p>
        <button className="btn btn-primary" onClick={function () { go('teste'); }}>
          {t('relatorio.takeTest')} <Ic.Arrow s={14} />
        </button>
      </div>
    );
  }

  const data = window.buildReportData(user, result);
  const mainColor = REL_DISC_COLORS[data.primary];
  const profile = data.profile;
  const kr = data.kraljic;
  // Labels traduzidos para o donut e legenda
  const primaryLabel = t('disc.' + data.primary + '.full');
  const donutData = data.composition.map(function (c) {
    return { key: c.key, label: t('disc.' + c.key + '.full'), value: c.value, color: c.color };
  });

  function exportPDF() {
    window.exportReportPDF(data);
    persistOwnReport(user);
  }

  // Estrutura PT-BR-resolved do profile preservada (Fase 2 traduzirá o conteúdo).
  // Helpers para o blurb da seção 1 (formato com strong/em via interpolação).
  const secondaryPart = profile.secondary ? t('relatorio.secondaryAnd', { sec: profile.secondary }) : '';
  const blurbHtml = t('relatorio.profileBlurb', {
    type: profile.buyerType,
    primary: primaryLabel,
    code: data.primary,
    pct: data.predominance,
    secondaryPart: secondaryPart,
  });

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-ghost" onClick={function () { go('relatorios'); }}>
          <Ic.ArrowL s={14} /> {t('relatorio.back')}
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportPDF}><Ic.Pdf s={14} /> {t('relatorio.exportPDF')}</button>
          <button className="btn btn-primary" onClick={exportPDF}><Ic.Download s={14} /> {t('relatorio.downloadFull')}</button>
        </div>
      </div>

      {/* COVER */}
      <div className="report-cover">
        <div className="cover-image" />
        <div className="login-brand" style={{ marginBottom: 'auto' }}>
          <img src="assets/voratte-logo.webp" alt="Vorätte" style={{ height: 24 }} />
          <div className="login-tag">{t('app.brandTag').split('\n').map(function (line, i, arr) {
            return <React.Fragment key={i}>{line}{i < arr.length - 1 ? <br/> : null}</React.Fragment>;
          })}</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="report-eyebrow">{t('relatorio.eyebrow')}</div>
        <h1 className="report-title">
          {t('relatorio.title')}<br/>
          <em>{t('relatorio.titleEm')}</em>
        </h1>

        <div className="m-stack-2" style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 40, fontSize: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>{t('relatorio.cover.professional')}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>{data.name}</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{data.jobTitle || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>{t('relatorio.cover.company')}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>{data.company || '—'}</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{data.email || ''}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>{t('relatorio.cover.profile')}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4, color: mainColor }}>
              {data.code} · {primaryLabel}
            </div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{t('relatorio.cover.predominance', { pct: data.predominance })}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>{t('relatorio.cover.issuedOn')}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>{data.dateStr}</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{t('relatorio.cover.discNote')}</div>
          </div>
        </div>
      </div>

      {/* SECTION 1 — análise comportamental */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="01" label={t('relatorio.sec01')} />
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 36, alignItems: 'center' }}>
          <Donut size={220} stroke={26} data={donutData}
            center={<><div className="letter" style={{ color: mainColor }}>{data.primary}</div><div className="label">{primaryLabel}</div></>}
          />
          <div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', marginBottom: 12 }}>
              {t('relatorio.profileLine')} <em style={{ color: mainColor }}>{profile.label}</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 580 }}
               dangerouslySetInnerHTML={{ __html: blurbHtml }} />
            <div className="legend" style={{ marginTop: 22, maxWidth: 380 }}>
              {donutData.map(function (d) {
                return (
                  <div className="legend-row" key={d.key}>
                    <div className="sw" style={{ background: d.color }} />
                    <span>{d.key} · {d.label}</span>
                    <span className="pct">{d.value}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — o que move / o que trava */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="02" label={t('relatorio.sec02')} />
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('relatorio.movesTitle')}</div>
            {profile.motivators.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" /><span>{s}</span></div>;
            })}
          </div>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('relatorio.brakesTitle')}</div>
            {profile.fears.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" style={{ background: 'var(--disc-d)' }} /><span>{s}</span></div>;
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Kraljic */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="03" label={t('relatorio.sec03')} />
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 36, alignItems: 'center' }}>
          <RelKraljicMatrix kr={kr} />
          <div>
            <div className="badge badge-brown" style={{ marginBottom: 10 }}>{kr.positionLabel}</div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
              {t('relatorio.buyerLabel', { label: kr.label })}
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 14, maxWidth: 540 }}>
              {kr.buyerPosture}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="stat" style={{ flex: 1 }}>
                <div className="stat-label">{t('relatorio.financialImpact')}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{kr.axis.impactoFinanceiro}</div>
              </div>
              <div className="stat" style={{ flex: 1 }}>
                <div className="stat-label">{t('relatorio.supplyRisk')}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{kr.axis.riscoSuprimento}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — leitura completa do quadrante */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="04" label={t('relatorio.sec04')} />
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{t('relatorio.wantsTitle')}</div>
            {kr.whatHeWants.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" /><span>{s}</span></div>;
            })}
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{t('relatorio.avoidTitle')}</div>
            {kr.whatToAvoid.map(function (s) {
              const txt = (window.voratteKavoid && window.voratteKavoid(s)) || s;
              return <div className="list-row" key={s}><div className="bullet" style={{ background: 'var(--disc-d)' }} /><span>{txt}</span></div>;
            })}
          </div>
        </div>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            [t('relatorio.metricLeverage'), kr.negotiationLeverage],
            [t('relatorio.metricProposal'), kr.proposalFocus],
            [t('relatorio.metricContract'), kr.contractStyle],
            [t('relatorio.metricRisk'),     kr.riskForVendor],
          ].map(function (row) {
            return (
              <div key={row[0]} style={{ padding: 16, borderRadius: 12, background: 'var(--paper-warm)', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 5 }}>{row[0]}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{row[1]}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5 — seu estilo de negociação (ótica comprador, via helper) */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="05" label={t('relatorio.sec05')} />
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Como você negocia</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Autoconhecimento para reconhecer seus próprios gatilhos na mesa de negociação.</p>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {(function () {
            const e = (window.voratteEstiloComprador && window.voratteEstiloComprador(data.primary)) || { tom: '', ritmo: '', objecao: '' };
            return [
              [t('relatorio.toneIdeal'), e.tom],
              [t('relatorio.closing'),   e.ritmo],
              [t('relatorio.objections'),e.objecao],
            ].map(function (row) {
            return (
              <div key={row[0]} style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>{row[0]}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{row[1]}</div>
              </div>
            );
          });
          })()}
        </div>
      </section>

      {/* SECTION 6 — playbook de negociação (motor) — espelha o §07 do PDF */}
      {window.MOTOR_KRALJIC && window.MOTOR_KRALJIC[kr.dominantQuadrant] && (function () {
        const MK = window.MOTOR_KRALJIC[kr.dominantQuadrant];
        const MR = window.MOTOR_RESPOSTAS || {};
        const MOBJ = window.MOTOR_OBJECOES_BY_ID || {};
        const MD = window.MOTOR_DISC || {};
        const perfis = ['D', 'I', 'S', 'C'];
        const nomeP = function (x) { return (MD[x] && MD[x].nome) || x; };
        const cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; };
        return (
          <section className="card" style={{ padding: 36 }}>
            <SectionLabel num="06" label="Playbook de negociação" />
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Como conduzir conforme o vendedor</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              A recomendação muda com o perfil de quem está do outro lado. No seu quadrante (<strong>{MK.label}</strong>), conduza assim:
            </p>
            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
              {perfis.map(function (x) {
                return (
                  <div key={x} style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, border: '1px solid var(--line)', borderLeft: '3px solid ' + REL_DISC_COLORS[x] }}>
                    <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>Com um vendedor {x} · {nomeP(x)}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{cap(MK.usoDISC[x])}</div>
                  </div>
                );
              })}
            </div>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Objeções comuns e sua resposta — por perfil do vendedor</div>
            {['OBJ_01', 'OBJ_03'].map(function (oid) {
              const o = MOBJ[oid]; const resp = MR[oid] || {};
              if (!o) return null;
              return (
                <div key={oid} style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 4 }}>Objeção: &ldquo;{o.texto}&rdquo;</div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>
                    <strong>Diagnóstico:</strong> {o.diagnostico} <strong>· Próxima ação:</strong> {o.proximaAcao}
                  </p>
                  <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {perfis.map(function (x) {
                      return (
                        <div key={x} style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, border: '1px solid var(--line)' }}>
                          <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4, color: REL_DISC_COLORS[x] }}>Vendedor {x} · {nomeP(x)}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{resp[x] || ''}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })()}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px', fontSize: 11.5, color: 'var(--muted)' }}>
        <span>{t('relatorio.footer', { date: data.dateStr })}</span>
        <button className="btn btn-secondary" onClick={exportPDF}><Ic.Pdf s={14} /> {t('relatorio.footerExport')}</button>
      </div>
    </div>
  );
}

// Mini matriz de Kraljic com o comprador plotado (usada na pré-visualização)
function RelKraljicMatrix({ kr }) {
  const x = kr.axis.riscoSuprimento;
  const y = kr.axis.impactoFinanceiro;
  const cells = [
    { id: 'alavancagem',  icon: <Ic.Chart s={15} />,   nameKey: 'relatorio.cellAlavancagem' },
    { id: 'estrategico',  icon: <Ic.Diamond s={15} />, nameKey: 'relatorio.cellEstrategico' },
    { id: 'nao_criticos', icon: <Ic.Cart s={15} />,    nameKey: 'relatorio.cellNaoCriticos' },
    { id: 'gargalo',      icon: <Ic.Link s={15} />,    nameKey: 'relatorio.cellGargalo' },
  ];
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{t('relatorio.matrixAxisY')}</div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', aspectRatio: '1.25 / 1' }}>
        {cells.map(function (c) {
          const mine = kr.dominantQuadrant === c.id;
          return (
            <div key={c.id} style={{
              border: '1px solid ' + (mine ? 'var(--brown-300)' : 'var(--line)'),
              background: mine ? 'var(--brown-50)' : 'var(--paper)',
              padding: 10, display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--paper-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-600)' }}>{c.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{t(c.nameKey)}</div>
              {mine && <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--brown-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sua posição</div>}
            </div>
          );
        })}
        <div style={{
          position: 'absolute', left: x + '%', top: (100 - y) + '%',
          transform: 'translate(-50%,-50%)', width: 24, height: 24, borderRadius: '50%',
          background: 'var(--brown-700)', border: '3px solid var(--paper)',
          boxShadow: '0 0 0 3px var(--brown-700)',
        }} />
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginTop: 4, textAlign: 'right' }}>{t('relatorio.matrixAxisX')}</div>
    </div>
  );
}

function SectionLabel({ num, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 300, color: 'var(--brown-300)', letterSpacing: '-0.02em' }}>{num}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ============ PLANO ============

// Eixos D/I/S/C → 4 cards do plano de desenvolvimento. Ações são fixas no v1;
// o que personaliza o card é o score do eixo correspondente (vira a barra de progresso).
const PLAN_AXES = [
  { key: 'D', icon: <Ic.Target s={20}/>,    titleKey: 'plano.card.D.title', subKey: 'plano.card.D.sub', actionsKeys: ['plano.card.D.action1','plano.card.D.action2','plano.card.D.action3'] },
  { key: 'I', icon: <Ic.Sparkle s={20}/>,   titleKey: 'plano.card.I.title', subKey: 'plano.card.I.sub', actionsKeys: ['plano.card.I.action1','plano.card.I.action2','plano.card.I.action3'] },
  { key: 'S', icon: <Ic.Handshake s={20}/>, titleKey: 'plano.card.S.title', subKey: 'plano.card.S.sub', actionsKeys: ['plano.card.S.action1','plano.card.S.action2','plano.card.S.action3'] },
  { key: 'C', icon: <Ic.Chart s={20}/>,     titleKey: 'plano.card.C.title', subKey: 'plano.card.C.sub', actionsKeys: ['plano.card.C.action1','plano.card.C.action2','plano.card.C.action3'] },
];

// Monta os 4 cards do plano resolvendo i18n e pct a partir do doc DISC do usuário.
// disc pode ser o doc raw do Firestore (campos d/i/s/c) ou null.
function buildPlanCards(disc) {
  return PLAN_AXES.map(function (ax) {
    var pct = disc ? Math.max(0, Math.min(100, Math.round(disc[ax.key.toLowerCase()] || 0))) : 0;
    return {
      key:     ax.key,
      icon:    ax.icon,
      title:   t(ax.titleKey),
      sub:     t(ax.subKey),
      actions: ax.actionsKeys.map(function (k) { return t(k); }),
      pct:     pct,
    };
  });
}

window.PLAN_AXES = PLAN_AXES;
window.buildPlanCards = buildPlanCards;

function PlanoScreen({ go, user }) {
  useLang();
  const firstName = user && user.name ? user.name.split(' ')[0] : '';
  const [disc, setDisc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  // checked[axisKey] = [bool, bool, bool] — state local, não persiste entre sessões
  const [checked, setChecked] = React.useState({ D: [false,false,false], I: [false,false,false], S: [false,false,false], C: [false,false,false] });

  React.useEffect(function () {
    if (!user || !user.id || !window.fbGetDiscResult) { setLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function (raw) {
      setDisc(raw || null);
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [user && user.id]);

  const hasDisc = !!(disc && (disc.d || disc.i || disc.s || disc.c));
  const cards = React.useMemo(function () { return buildPlanCards(disc); }, [disc, window.getLang()]);

  function toggle(axisKey, idx) {
    setChecked(function (prev) {
      var next = Object.assign({}, prev);
      var arr = (prev[axisKey] || [false,false,false]).slice();
      arr[idx] = !arr[idx];
      next[axisKey] = arr;
      return next;
    });
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--ink), var(--brown-900))', color: 'var(--brown-50)', border: 'none' }}>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>
              {t('plano.eyebrow')}
            </div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', marginTop: 8 }}
                dangerouslySetInnerHTML={{ __html: firstName ? t('plano.titleWith', { name: firstName }) : t('plano.titleNoName') }}
            />
            <p style={{ fontSize: 13.5, color: 'var(--brown-200)', marginTop: 8, maxWidth: 560 }}>
              {hasDisc ? t('plano.lede.ready') : t('plano.lede')}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
          {t('common.loading')}
        </div>
      ) : !hasDisc ? (
        <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
          {t('plano.emptyMsg')}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => go('teste')}>
              <Ic.Disc s={14}/> {t('plano.goTest')}
            </button>
          </div>
        </div>
      ) : (
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {cards.map(it => (
            <div key={it.key} className="card">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {it.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{it.title}</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--brown-700)' }}>{it.pct}%</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{it.sub}</div>
                  <div className="progress" style={{ marginTop: 12 }}>
                    <span style={{ width: it.pct + '%' }} />
                  </div>
                </div>
              </div>
              <div className="divider" style={{ margin: '18px 0 14px' }} />
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
                {t('plano.nextActions')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {it.actions.map((a, i) => {
                  var isChecked = (checked[it.key] || [])[i] || false;
                  return (
                    <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(it.key, i)}
                        style={{ accentColor: 'var(--brown-700)', marginTop: 3 }}
                      />
                      <span style={{ textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.6 : 1 }}>{a}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ COMPARAÇÕES ============
function ComparacoesScreen({ go, user }) {
  useLang();
  var [team, setTeam]       = React.useState([]);
  var [loading, setLoading] = React.useState(true);

  React.useEffect(function () {
    const gestorId = user && user.gestorId;
    if (!gestorId || !window.fbGetTeamMembers) { setLoading(false); return; }
    window.fbGetTeamMembers(gestorId).then(function (members) {
      setTeam((members || []).filter(function (m) { return m.main; }));
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [user && user.gestorId]);

  const dist = React.useMemo(function () {
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    team.forEach(function (m) { if (counts.hasOwnProperty(m.main)) counts[m.main] += 1; });
    const total = counts.D + counts.I + counts.S + counts.C;
    if (!total) return null;
    const labels = { D: t('disc.D.label'), I: t('disc.I.label'), S: t('disc.S.label'), C: t('disc.C.label') };
    const top = ['D','I','S','C'].reduce(function (a, b) { return counts[a] >= counts[b] ? a : b; });
    const bottom = ['D','I','S','C'].reduce(function (a, b) { return counts[a] <= counts[b] ? a : b; });
    return {
      counts: counts, total: total, labels: labels,
      mostCommonLabel: labels[top], mostCommonCount: counts[top],
      rarestLabel: labels[bottom], rarestCount: counts[bottom],
      pct: {
        D: Math.round(counts.D/total*100), I: Math.round(counts.I/total*100),
        S: Math.round(counts.S/total*100), C: Math.round(counts.C/total*100),
      },
    };
  }, [team, window.getLang()]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 24 }}>
        <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 20 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>{t('comp.summary')}</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>
              {loading ? t('comp.loadingTeam') : (team.length ? t('comp.teamAvaliados', { n: team.length }) : t('comp.teamEmpty'))}
            </div>
          </div>
          <Mini label={t('comp.mostCommon')} value={dist ? dist.mostCommonLabel : '—'} sub={dist ? t('comp.peopleSingular', { n: dist.mostCommonCount }) : '—'} />
          <Mini label={t('comp.rarest')}     value={dist ? dist.rarestLabel    : '—'} sub={dist ? t('comp.peopleSingular', { n: dist.rarestCount    }) : '—'} />
        </div>
      </div>

      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
            <div className="card-title" style={{ marginBottom: 2 }}>{t('comp.tableTitle')}</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>{t('comp.tableSub')}</div>
          </div>
          {loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>{t('comp.tableLoading')}</div>
          ) : team.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
              {t('comp.tableEmpty')}
            </div>
          ) : (
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>{t('comp.col.person')}</th>
                  <th>{t('comp.col.profile')}</th>
                  <th>{t('comp.col.disc')}</th>
                  <th style={{ paddingRight: 24, textAlign: 'right' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {team.map((p, i) => (
                  <tr key={p.id || i}>
                    <td style={{ paddingLeft: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--brown-400), var(--brown-700))' }}>
                          {(p.name || '—').split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <div className={'disc-tile disc-' + p.main.toLowerCase()} style={{ width: 30, height: 30, fontSize: 14 }}>{p.main}</div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{t('disc.' + p.main + '.label')}</span>
                      </div>
                    </td>
                    <td style={{ minWidth: 280 }}>
                      <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: 'var(--brown-50)' }}>
                        <span style={{ width: p.d+'%', background: 'var(--disc-d)' }} />
                        <span style={{ width: p.i+'%', background: 'var(--disc-i)' }} />
                        <span style={{ width: p.s+'%', background: 'var(--disc-s)' }} />
                        <span style={{ width: p.c+'%', background: 'var(--disc-c)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
                        <span>D {p.d}</span><span>I {p.i}</span><span>S {p.s}</span><span>C {p.c}</span>
                      </div>
                    </td>
                    <td style={{ paddingRight: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button className="icon-btn" onClick={() => go('cruzamento')}><Ic.Compare s={16}/></button>
                        <button className="icon-btn"><Ic.More s={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>

        <div className="card">
          <div className="card-title">{t('comp.distTitle')}</div>
          <div className="card-sub">{t('comp.distSub')}</div>
          {!dist ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
              {t('comp.distEmpty')}
            </div>
          ) : (
            <>
              <Donut size={180} stroke={24} data={[
                { key: 'D', value: dist.pct.D, color: 'var(--disc-d)' },
                { key: 'I', value: dist.pct.I, color: 'var(--disc-i)' },
                { key: 'S', value: dist.pct.S, color: 'var(--disc-s)' },
                { key: 'C', value: dist.pct.C, color: 'var(--disc-c)' },
              ]} center={<><div className="letter" style={{ fontSize: 28 }}>{dist.total}</div><div className="label">{dist.total === 1 ? t('comp.donutPerson') : t('comp.donutPeople')}</div></>} />
              <div className="legend" style={{ marginTop: 18 }}>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>{t('disc.D.label')}</span><span className="pct">{dist.counts.D}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>{t('disc.I.label')}</span><span className="pct">{dist.counts.I}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>{t('disc.S.label')}</span><span className="pct">{dist.counts.S}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>{t('disc.C.label')}</span><span className="pct">{dist.counts.C}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, sub }) {
  return (
    <div style={{ padding: 16, background: 'var(--paper-warm)', borderRadius: 10, border: '1px solid var(--line-soft)' }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ fontSize: 22 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// ============ PERFIL ============
function PerfilScreen({ go, user, refreshProfile }) {
  useLang();
  const u = user || {};
  const name = u.name || '—';
  const initials = u.name
    ? u.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase()
    : '·';
  const discMain = u.discMain;
  const [theme, setTheme] = window.useTheme();
  const [editOpen, setEditOpen] = React.useState(false);
  const subtitleParts = [];
  if (u.jobTitle)    subtitleParts.push(u.jobTitle);
  if (u.companyName) subtitleParts.push(u.companyName);
  const subtitle = subtitleParts.join(' · ') || t('perfil.noJob');

  // Tabela de dados profissionais: somente campos com valor real
  const profileFields = [];
  if (u.name)        profileFields.push([t('perfil.field.name'),    u.name]);
  if (u.email)       profileFields.push([t('perfil.field.email'),   u.email]);
  if (u.companyName) profileFields.push([t('perfil.field.company'), u.companyName]);
  if (u.jobTitle)    profileFields.push([t('perfil.field.job'),     u.jobTitle]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brown-400), var(--brown-700))', color: 'var(--brown-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, letterSpacing: '0.02em' }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em' }}>{name}</h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{subtitle}</div>
            {(discMain || u.companyName) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {discMain && (
                  <div className="badge badge-brown">
                    {t('perfil.badgeProfile', { label: t('disc.' + discMain + '.label'), code: discMain })}
                  </div>
                )}
                {u.companyName && (
                  <div className="badge badge-outline">{u.companyName}</div>
                )}
              </div>
            )}
          </div>
          <button className="btn btn-secondary" onClick={() => setEditOpen(true)}>
            <Ic.Settings s={14}/> {t('perfil.editBtn')}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 18 }}>
          <div>
            <div className="card-title">{t('perfil.appearance')}</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>
              {t('perfil.appearanceSub')}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <window.ThemeTogglePill />
          </div>
        </div>

        <div className="theme-card-row">
          <div
            className={'theme-preview light' + (theme === 'light' ? ' active' : '')}
            onClick={() => setTheme('light')}
            role="button"
            tabIndex={0}
          >
            <div className="tp-mock">
              <div className="tp-sidebar">
                <div className="tp-line bright" style={{ width: '70%' }} />
                <div className="tp-line" style={{ width: '90%' }} />
                <div className="tp-line" style={{ width: '60%' }} />
                <div className="tp-line" style={{ width: '80%' }} />
              </div>
              <div className="tp-main">
                <div className="tp-line" style={{ width: '40%' }} />
                <div className="tp-card" />
              </div>
            </div>
            <div className="tp-foot">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="tp-icon"><Ic.Sun s={14} /></div>
                <div>
                  <div>{t('perfil.themeLight')}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>{t('perfil.themeLightSub')}</div>
                </div>
              </div>
              <div className="tp-check"><Ic.Check s={12} /></div>
            </div>
          </div>

          <div
            className={'theme-preview dark' + (theme === 'dark' ? ' active' : '')}
            onClick={() => setTheme('dark')}
            role="button"
            tabIndex={0}
          >
            <div className="tp-mock">
              <div className="tp-sidebar">
                <div className="tp-line bright" style={{ width: '70%' }} />
                <div className="tp-line" style={{ width: '90%' }} />
                <div className="tp-line" style={{ width: '60%' }} />
                <div className="tp-line" style={{ width: '80%' }} />
              </div>
              <div className="tp-main">
                <div className="tp-line" style={{ width: '40%' }} />
                <div className="tp-card" />
              </div>
            </div>
            <div className="tp-foot">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="tp-icon"><Ic.Moon s={14} /></div>
                <div>
                  <div>{t('perfil.themeDark')}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>{t('perfil.themeDarkSub')}</div>
                </div>
              </div>
              <div className="tp-check"><Ic.Check s={12} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">{t('perfil.profDataTitle')}</div>
          <div className="card-sub">{t('perfil.profDataSub')}</div>
          {profileFields.length === 0 ? (
            <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13.5 }}>
              {t('perfil.profDataEmpty')}
            </div>
          ) : profileFields.map(function (f, i) {
            return (
              <div key={f[0]} className="m-kv" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '10px 0', borderBottom: i < profileFields.length - 1 ? '1px solid var(--line-soft)' : 'none', fontSize: 13.5 }}>
                <div style={{ color: 'var(--muted)' }}>{f[0]}</div>
                <div style={{ color: 'var(--ink)', fontWeight: 500 }}>{f[1]}</div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">{t('perfil.history')}</div>
          <div className="card-sub">{t('perfil.historySub')}</div>
          <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13.5 }}>
            {t('perfil.historyEmpty')}
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary btn-block" onClick={() => go('teste')}>
              {discMain ? t('perfil.redoTest') : t('perfil.doTest')} <Ic.Arrow s={14}/>
            </button>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditarPerfilModal
          user={u}
          onClose={() => setEditOpen(false)}
          onSaved={refreshProfile}
        />
      )}
    </div>
  );
}

// Modal de edição de perfil — atualiza name e jobTitle em /users/{uid}.
// Email é gerenciado pelo admin (requer reauth no Firebase Auth para mudar).
function EditarPerfilModal({ user, onClose, onSaved }) {
  useLang();
  const [name, setName] = React.useState(user.name || '');
  const [jobTitle, setJobTitle] = React.useState(user.jobTitle || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var trimmedName = name.trim();
    if (!trimmedName) { setError(t('perfil.edit.nameRequired')); return; }
    setError('');
    setLoading(true);
    try {
      await window.fbUpdateUserProfile(user.id, {
        name: trimmedName,
        jobTitle: jobTitle.trim(),
      });
      if (typeof onSaved === 'function') await onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(t('perfil.edit.error'));
      setLoading(false);
    }
  }

  return (
    <div
      className="m-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(21, 9, 10, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          width: '100%', maxWidth: 480, padding: 28,
          background: 'var(--paper)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{t('perfil.edit.title')}</h3>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
              {t('perfil.edit.lede')}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label={t('common.close')}
            style={{ flexShrink: 0 }}
          >
            <Ic.Close s={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          <div className="field">
            <label>{t('perfil.edit.nameLabel')} <span style={{ color: 'var(--disc-d)' }}>*</span></label>
            <input
              className="input"
              type="text"
              autoFocus
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder={t('perfil.edit.namePlaceholder')}
            />
          </div>

          <div className="field">
            <label>{t('perfil.edit.jobLabel')}</label>
            <input
              className="input"
              type="text"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder={t('perfil.edit.jobPlaceholder')}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>
              {t('perfil.edit.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? t('perfil.edit.saving') : t('perfil.edit.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.RelatoriosScreen = RelatoriosScreen;
window.RelatorioScreen = RelatorioScreen;
window.PlanoScreen = PlanoScreen;
window.ComparacoesScreen = ComparacoesScreen;
window.PerfilScreen = PerfilScreen;
