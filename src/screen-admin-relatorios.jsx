// ====================== ADMIN — TODOS OS RELATÓRIOS ======================
// Lista global de relatórios da plataforma + wizard de geração com 4 tipos:
// Individual, Empresa, Grupo (tipo de comprador), Personalizado (filtros combinados).
//
// Reusa window.buildReportData / window.exportReportPDF para o Individual
// e window.vorattePrintHTML + window.voratteLoadLogo para os agregados.

(function () {
  const MES_REL = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const DISC_LABEL_REL = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme' };
  const DISC_FULL_REL  = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' };
  const DISC_COLOR_REL = { D: '#d83a2a', I: '#e8b53a', S: '#4ea868', C: '#3a6fb5' };

  function fmtDate(ts) {
    if (!ts) return '—';
    try { return ts.toDate().toLocaleDateString('pt-BR'); } catch (e) {}
    if (ts instanceof Date) return ts.toLocaleDateString('pt-BR');
    if (typeof ts === 'string') return ts;
    return '—';
  }

  function fmtDateLong(d) {
    d = d || new Date();
    return d.getDate() + ' ' + MES_REL[d.getMonth()] + '. ' + d.getFullYear();
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ============ Listagem ============
  function AdminRelatorios({ go, user }) {
    useLang();
    var [reports, setReports]   = React.useState([]);
    var [users, setUsers]       = React.useState([]);
    var [companies, setCompanies] = React.useState([]);
    var [discResults, setDiscResults] = React.useState([]);
    var [loading, setLoading]   = React.useState(true);
    var [search, setSearch]     = React.useState('');
    var [filterType, setFilterType] = React.useState('all');
    var [wizardOpen, setWizardOpen] = React.useState(false);

    function fetchReports() {
      return window.fbGetAllReports(500).catch(function () { return []; });
    }

    React.useEffect(function () {
      Promise.all([
        fetchReports(),
        window.fbGetAllUsers(500).catch(function () { return []; }),
        window.fbGetAllCompanies().catch(function () { return []; }),
        window.fbGetAllDiscResults ? window.fbGetAllDiscResults(500).catch(function () { return []; }) : Promise.resolve([]),
      ]).then(function (r) {
        setReports(r[0] || []);
        setUsers(r[1] || []);
        setCompanies(r[2] || []);
        setDiscResults(r[3] || []);
        setLoading(false);
      });
    }, []);

    const filtered = React.useMemo(function () {
      const q = search.trim().toLowerCase();
      return reports.filter(function (r) {
        if (filterType !== 'all' && r.type !== filterType) return false;
        if (!q) return true;
        return (
          (r.title || '').toLowerCase().indexOf(q) >= 0 ||
          (r.targetLabel || '').toLowerCase().indexOf(q) >= 0
        );
      });
    }, [reports, search, filterType]);

    const typeBadge = {
      individual:   { label: t('adminRel.badge.individual'),    color: 'var(--brown-700)' },
      empresa:      { label: t('adminRel.badge.empresa'),       color: 'var(--brown-700)' },
      grupo:        { label: t('adminRel.badge.grupo'),         color: 'var(--brown-700)' },
      personalizado:{ label: t('adminRel.badge.personalizado'), color: 'var(--brown-700)' },
    };

    function handleReExport(r) {
      // Reexporta apenas relatório individual (precisa do DISC do alvo)
      if (r.type === 'individual' && r.targetId) {
        const target = users.filter(function (u) { return u.id === r.targetId; })[0];
        if (!target) { alert(t('adminRel.alert.targetNotFound')); return; }
        window.fbGetDiscResult(target.id).then(function (doc) {
          if (!doc) { alert(t('adminRel.alert.noDisc')); return; }
          const disc = {
            mostGraph: doc.mostGraph || { D: doc.d, I: doc.i, S: doc.s, C: doc.c },
            leastGraph: doc.leastGraph || { D: 0, I: 0, S: 0, C: 0 },
            changeGraph: doc.changeGraph || { D: 0, I: 0, S: 0, C: 0 },
            code: doc.code || doc.main,
            profile: window.BUYER_PROFILES[doc.code] || window.BUYER_PROFILES[doc.main],
          };
          window.exportReportPDF(window.buildReportData(target, disc));
        });
        return;
      }
      // Agregados: rerenderiza a partir da config salva
      if (r.config) {
        regenerateAggregate(r.config);
        return;
      }
      alert(t('adminRel.alert.noConfig'));
    }

    function regenerateAggregate(config) {
      const data = buildAggregateReportData(config, users, discResults, companies);
      exportAggregateReportPDF(data);
    }

    function onCreated() {
      setWizardOpen(false);
      setLoading(true);
      fetchReports().then(function (r) {
        setReports(r || []);
        setLoading(false);
      });
    }

    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <input className="input" placeholder={t('adminRel.search')} style={{ paddingLeft: 38 }}
                value={search} onChange={function (e) { setSearch(e.target.value); }} />
              <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                <Ic.Search s={16}/>
              </div>
            </div>
            <select className="input" style={{ width: 200 }} value={filterType}
              onChange={function (e) { setFilterType(e.target.value); }}>
              <option value="all">{t('adminRel.filter.all')}</option>
              <option value="individual">{t('adminRel.filter.individual')}</option>
              <option value="empresa">{t('adminRel.filter.empresa')}</option>
              <option value="grupo">{t('adminRel.filter.grupo')}</option>
              <option value="personalizado">{t('adminRel.filter.personalizado')}</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={function () { setWizardOpen(true); }}>
            <Ic.Plus s={14}/> {t('adminRel.new')}
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>{t('adminRel.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}
                 dangerouslySetInnerHTML={{ __html: reports.length === 0 ? t('adminRel.emptyAll') : t('adminRel.emptyFiltered') }} />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>{t('adminRel.col.report')}</th>
                  <th>{t('adminRel.col.target')}</th>
                  <th>{t('adminRel.col.type')}</th>
                  <th>{t('adminRel.col.date')}</th>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(function (r, i) {
                  const badge = typeBadge[r.type] || { label: r.type || '—', color: 'var(--muted)' };
                  return (
                    <tr key={r.id || i}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ic.Pdf s={16}/>
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.title || t('adminRel.itemTitle')}</div>
                            {r.createdByName && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t('adminRel.byPrefix', { name: r.createdByName })}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5 }}>{r.targetLabel || '—'}</td>
                      <td><span className="badge badge-outline">{badge.label}</span></td>
                      <td>{fmtDate(r.createdAt)}</td>
                      <td style={{ paddingRight: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="icon-btn" onClick={function () { handleReExport(r); }} title={t('adminRel.reexport')}><Ic.Download s={16}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            {t(reports.length === 1 ? 'adminRel.showingOf' : 'adminRel.showingOfPlural', { n: filtered.length, total: reports.length })}
          </div>
        )}

        {wizardOpen && (
          <AdminReportWizard
            currentUser={user}
            users={users}
            companies={companies}
            discResults={discResults}
            onClose={function () { setWizardOpen(false); }}
            onCreated={onCreated}
          />
        )}
      </div>
    );
  }

  // ============ Wizard ============
  function AdminReportWizard({ currentUser, users, companies, discResults, onClose, onCreated }) {
    useLang();
    var [step, setStep]     = React.useState(1);
    var [kind, setKind]     = React.useState(null);
    // target/filter state — variável conforme tipo
    var [individualUserId, setIndividualUserId] = React.useState('');
    var [companyId, setCompanyId]   = React.useState('');
    var [buyerCode, setBuyerCode]   = React.useState('');
    var [filterCompany, setFilterCompany] = React.useState('');
    var [filterJob, setFilterJob]   = React.useState('');
    var [filterDisc, setFilterDisc] = React.useState('');
    var [individualSearch, setIndividualSearch] = React.useState('');
    var [busy, setBusy]     = React.useState(false);
    var [err, setErr]       = React.useState('');

    const buyerCodeList = React.useMemo(function () {
      const p = window.BUYER_PROFILES || {};
      return Object.keys(p).map(function (k) {
        return { code: k, label: p[k].label || k, shortLabel: p[k].shortLabel || k };
      });
    }, []);

    const jobTitleList = React.useMemo(function () {
      const set = {};
      users.forEach(function (u) {
        const j = u.jobTitle && u.jobTitle.trim();
        if (j) set[j] = true;
      });
      return Object.keys(set).sort();
    }, [users]);

    const companyNameList = React.useMemo(function () {
      const set = {};
      companies.forEach(function (c) { if (c.name) set[c.name] = true; });
      users.forEach(function (u) { if (u.companyName) set[u.companyName] = true; });
      return Object.keys(set).sort();
    }, [companies, users]);

    const individualMatches = React.useMemo(function () {
      const q = individualSearch.trim().toLowerCase();
      if (!q) return users.slice(0, 20);
      return users.filter(function (u) {
        return (
          ((u.name || '') + ' ' + (u.email || '') + ' ' + (u.jobTitle || '') + ' ' + (u.companyName || ''))
            .toLowerCase().indexOf(q) >= 0
        );
      }).slice(0, 20);
    }, [users, individualSearch]);

    // Preview: contagem de usuários alvo conforme tipo/filtros
    const preview = React.useMemo(function () {
      if (kind === 'individual') {
        const u = users.filter(function (x) { return x.id === individualUserId; })[0];
        if (!u) return null;
        return { kind: 'individual', label: u.name, sub: (u.jobTitle || '—') + ' · ' + (u.companyName || '—'), disc: u.discMain || '—', completed: u.discCompleted ? t('adminRel.wiz.previewDone') : t('adminRel.wiz.previewPending') };
      }
      if (kind === 'empresa') {
        if (!companyId) return null;
        const cmp = companies.filter(function (c) { return c.id === companyId; })[0];
        const name = cmp ? cmp.name : '';
        const matchedUsers = users.filter(function (u) { return u.companyName === name || u.companyId === companyId; });
        const done = matchedUsers.filter(function (u) { return u.discCompleted; }).length;
        return { kind: 'empresa', label: name || '—', sub: t('adminRel.wiz.empresa.previewSub', { n: matchedUsers.length, done: done }), n: matchedUsers.length };
      }
      if (kind === 'grupo') {
        if (!buyerCode) return null;
        const matched = discResults.filter(function (r) { return (r.code || r.main) === buyerCode; });
        const profile = (window.BUYER_PROFILES || {})[buyerCode];
        return { kind: 'grupo', label: buyerCode + ' · ' + (profile ? profile.label : ''), sub: t('adminRel.wiz.grupo.previewSub', { n: matched.length }), n: matched.length };
      }
      if (kind === 'personalizado') {
        const matched = filterUsersByCriteria(users, { companyName: filterCompany, jobTitle: filterJob, discMain: filterDisc });
        const filtersLabel = [
          filterCompany && t('adminRel.wiz.perso.companyTag', { v: filterCompany }),
          filterJob && t('adminRel.wiz.perso.jobTag', { v: filterJob }),
          filterDisc && t('adminRel.wiz.perso.discTag', { v: filterDisc }),
        ].filter(Boolean).join(' · ') || t('adminRel.wiz.perso.noFilters');
        return { kind: 'personalizado', label: filtersLabel, sub: t('adminRel.wiz.perso.previewSub', { n: matched.length }), n: matched.length };
      }
      return null;
    }, [kind, individualUserId, companyId, buyerCode, filterCompany, filterJob, filterDisc, users, companies, discResults]);

    function canGenerate() {
      if (busy) return false;
      if (kind === 'individual') return !!individualUserId;
      if (kind === 'empresa')    return !!companyId;
      if (kind === 'grupo')      return !!buyerCode;
      if (kind === 'personalizado') return !!(filterCompany || filterJob || filterDisc);
      return false;
    }

    async function handleGenerate() {
      if (!canGenerate()) return;
      setBusy(true); setErr('');
      try {
        if (kind === 'individual') {
          await generateIndividual();
        } else {
          await generateAggregate();
        }
        onCreated && onCreated();
      } catch (e) {
        console.error(e);
        setErr(e && e.message ? e.message : t('adminRel.wiz.errGeneric'));
      } finally {
        setBusy(false);
      }
    }

    async function generateIndividual() {
      const target = users.filter(function (u) { return u.id === individualUserId; })[0];
      if (!target) throw new Error(t('adminRel.wiz.errNoUser'));
      const doc = await window.fbGetDiscResult(target.id);
      if (!doc) throw new Error(t('adminRel.wiz.errNoUserDisc'));
      const discR = {
        mostGraph: doc.mostGraph || { D: doc.d, I: doc.i, S: doc.s, C: doc.c },
        leastGraph: doc.leastGraph || { D: 0, I: 0, S: 0, C: 0 },
        changeGraph: doc.changeGraph || { D: 0, I: 0, S: 0, C: 0 },
        code: doc.code || doc.main,
        profile: window.BUYER_PROFILES[doc.code] || window.BUYER_PROFILES[doc.main],
      };
      window.exportReportPDF(window.buildReportData(target, discR));

      await saveReportMeta({
        type: 'individual',
        title: t('adminRel.wiz.titleIndividual', { name: target.name || target.email || '—' }),
        targetId: target.id,
        targetLabel: (target.name || '—') + ' · ' + (target.jobTitle || '—'),
        config: { kind: 'individual', individualUserId: target.id },
      });
    }

    async function generateAggregate() {
      const config = {
        kind: kind,
        companyId: companyId,
        buyerCode: buyerCode,
        filterCompany: filterCompany,
        filterJob: filterJob,
        filterDisc: filterDisc,
      };
      const data = buildAggregateReportData(config, users, discResults, companies);
      if (!data.members || data.members.length === 0) {
        throw new Error(t('adminRel.wiz.errNoMatch'));
      }
      exportAggregateReportPDF(data);

      await saveReportMeta({
        type: kind,
        title: data.title,
        targetLabel: data.subtitle || preview.label,
        config: config,
      });
    }

    async function saveReportMeta(meta) {
      if (!window.fbSaveReport) return;
      try {
        await window.fbSaveReport(Object.assign({
          createdBy: currentUser && currentUser.id,
          createdByName: currentUser && currentUser.name,
        }, meta));
      } catch (e) { console.warn('fbSaveReport falhou (PDF foi gerado mesmo assim):', e); }
    }

    return (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)',
                 display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}
        onClick={onClose}
      >
        <div className="card" style={{ width: '100%', maxWidth: 720, padding: 32 }}
             onClick={function (e) { e.stopPropagation(); }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div className="serif" style={{ fontSize: 22, marginBottom: 2 }}>{t('adminRel.wiz.title')}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {t('adminRel.wiz.stepOf', { step: step, kind: kind ? labelForKind(kind) : t('adminRel.wiz.pickKind') })}
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} title={t('common.close')} style={{ fontSize: 18, lineHeight: 1, color: 'var(--muted)' }}>×</button>
          </div>

          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <KindCard icon={<Ic.User s={20}/>}     title={t('adminRel.wiz.kind.individual')} desc={t('adminRel.wiz.kind.individualDesc')} onClick={function () { setKind('individual'); setStep(2); }} />
              <KindCard icon={<Ic.Kraljic s={20}/>}  title={t('adminRel.wiz.kind.empresa')}    desc={t('adminRel.wiz.kind.empresaDesc')}    onClick={function () { setKind('empresa'); setStep(2); }} />
              <KindCard icon={<Ic.Target s={20}/>}   title={t('adminRel.wiz.kind.grupo')}      desc={t('adminRel.wiz.kind.grupoDesc')}      onClick={function () { setKind('grupo'); setStep(2); }} />
              <KindCard icon={<Ic.Sparkle s={20}/>}  title={t('adminRel.wiz.kind.perso')}      desc={t('adminRel.wiz.kind.persoDesc')}      onClick={function () { setKind('personalizado'); setStep(2); }} />
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {kind === 'individual' && (
                <div className="field">
                  <label>{t('adminRel.wiz.user')}</label>
                  <input className="input" placeholder={t('adminRel.wiz.userSearch')}
                    value={individualSearch} onChange={function (e) { setIndividualSearch(e.target.value); }} />
                  <div style={{ marginTop: 10, maxHeight: 260, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 10 }}>
                    {individualMatches.length === 0 && (
                      <div style={{ padding: 16, fontSize: 12.5, color: 'var(--muted)' }}>{t('adminRel.wiz.noUser')}</div>
                    )}
                    {individualMatches.map(function (u) {
                      const sel = u.id === individualUserId;
                      return (
                        <button key={u.id} onClick={function () { setIndividualUserId(u.id); }}
                          style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: sel ? 'var(--brown-50)' : 'transparent',
                                   border: 'none', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer',
                                   display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brown-100)', color: 'var(--brown-800)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                            {(u.name || u.email || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{u.name || u.email || '—'}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{(u.jobTitle || '—') + ' · ' + (u.companyName || '—')}</div>
                          </div>
                          {u.discMain && <span className="badge badge-outline" style={{ fontSize: 10 }}>{u.discMain}</span>}
                          {!u.discCompleted && <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{t('adminRel.wiz.noDisc')}</span>}
                          {sel && <Ic.Check s={14}/>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {kind === 'empresa' && (
                <div className="field">
                  <label>{t('adminRel.wiz.empresaLabel')}</label>
                  <select className="input" value={companyId} onChange={function (e) { setCompanyId(e.target.value); }}>
                    <option value="">{t('adminRel.wiz.selectPrompt')}</option>
                    {companies.map(function (c) {
                      return <option key={c.id} value={c.id}>{c.name || c.id}</option>;
                    })}
                  </select>
                </div>
              )}

              {kind === 'grupo' && (
                <div className="field">
                  <label>{t('adminRel.wiz.buyerLabel')}</label>
                  <select className="input" value={buyerCode} onChange={function (e) { setBuyerCode(e.target.value); }}>
                    <option value="">{t('adminRel.wiz.selectPrompt')}</option>
                    {buyerCodeList.map(function (b) {
                      return <option key={b.code} value={b.code}>{b.code + ' · ' + b.label}</option>;
                    })}
                  </select>
                </div>
              )}

              {kind === 'personalizado' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="field">
                    <label>{t('adminRel.wiz.companyOpt')}</label>
                    <select className="input" value={filterCompany} onChange={function (e) { setFilterCompany(e.target.value); }}>
                      <option value="">{t('adminRel.wiz.allOpt')}</option>
                      {companyNameList.map(function (n) { return <option key={n} value={n}>{n}</option>; })}
                    </select>
                  </div>
                  <div className="field">
                    <label>{t('adminRel.wiz.jobOpt')}</label>
                    <select className="input" value={filterJob} onChange={function (e) { setFilterJob(e.target.value); }}>
                      <option value="">{t('adminRel.wiz.allJobs')}</option>
                      {jobTitleList.map(function (j) { return <option key={j} value={j}>{j}</option>; })}
                    </select>
                  </div>
                  <div className="field">
                    <label>{t('adminRel.wiz.discOpt')}</label>
                    <select className="input" value={filterDisc} onChange={function (e) { setFilterDisc(e.target.value); }}>
                      <option value="">{t('adminRel.wiz.allDiscs')}</option>
                      <option value="D">D · {t('disc.D.label')}</option>
                      <option value="I">I · {t('disc.I.label')}</option>
                      <option value="S">S · {t('disc.S.label')}</option>
                      <option value="C">C · {t('disc.C.label')}</option>
                    </select>
                  </div>
                </div>
              )}

              {preview && (
                <div className="card" style={{ padding: 16, background: 'var(--brown-50)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{t('adminRel.wiz.preview')}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{preview.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{preview.sub}</div>
                  {preview.disc && <div style={{ marginTop: 6 }}><span className="badge badge-outline">{t('adminRel.wiz.previewDisc', { disc: preview.disc })}</span> <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 8 }}>{preview.completed}</span></div>}
                </div>
              )}

              {err && (
                <div style={{ fontSize: 12.5, color: '#b91c1c', padding: '10px 14px', background: '#fef2f2',
                              border: '1px solid #fecaca', borderRadius: 8 }}>{err}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={function () { setStep(1); setErr(''); }}>
                  <Ic.ArrowL s={14}/> {t('common.back')}
                </button>
                <button className="btn btn-primary" disabled={!canGenerate()} onClick={handleGenerate}>
                  {busy ? t('adminRel.wiz.generating') : (<><Ic.Pdf s={14}/> {t('adminRel.wiz.generate')}</>)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function KindCard({ icon, title, desc, onClick }) {
    return (
      <button onClick={onClick}
        style={{ textAlign: 'left', padding: 18, background: 'var(--paper)', border: '1px solid var(--line)',
                 borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                 transition: 'border-color .15s, background .15s' }}
        onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'var(--brown-700)'; e.currentTarget.style.background = 'var(--brown-50)'; }}
        onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--paper)'; }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brown-100)', color: 'var(--brown-800)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div className="serif" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>{desc}</div>
      </button>
    );
  }

  function labelForKind(k) {
    return ({
      individual:    t('adminRel.wiz.kind.individual'),
      empresa:       t('adminRel.wiz.kind.empresa'),
      grupo:         t('adminRel.wiz.kind.grupo'),
      personalizado: t('adminRel.wiz.kind.perso'),
    })[k] || k;
  }

  // ============ Filtro de usuários por critérios ============
  function filterUsersByCriteria(users, crit) {
    return users.filter(function (u) {
      if (!u.discCompleted) return false;
      if (crit.companyName && u.companyName !== crit.companyName) return false;
      if (crit.jobTitle && u.jobTitle !== crit.jobTitle) return false;
      if (crit.discMain && u.discMain !== crit.discMain) return false;
      return true;
    });
  }

  // ============ Builder de dados do relatório agregado ============
  function buildAggregateReportData(config, users, discResults, companies) {
    let title = '';
    let subtitle = '';
    let members = [];

    if (config.kind === 'empresa') {
      const cmp = (companies || []).filter(function (c) { return c.id === config.companyId; })[0];
      const name = cmp ? cmp.name : '';
      members = users.filter(function (u) { return u.discCompleted && (u.companyName === name || u.companyId === config.companyId); });
      title = 'Relatório consolidado · ' + (name || 'Empresa');
      subtitle = 'Empresa: ' + (name || '—');
    } else if (config.kind === 'grupo') {
      const profile = (window.BUYER_PROFILES || {})[config.buyerCode];
      const matchingIds = {};
      (discResults || []).forEach(function (r) {
        if ((r.code || r.main) === config.buyerCode) matchingIds[r.userId || r.id] = true;
      });
      members = users.filter(function (u) { return matchingIds[u.id]; });
      title = 'Relatório por grupo · ' + config.buyerCode;
      subtitle = 'Tipo de comprador: ' + (profile ? profile.label : config.buyerCode);
    } else if (config.kind === 'personalizado') {
      members = filterUsersByCriteria(users, { companyName: config.filterCompany, jobTitle: config.filterJob, discMain: config.filterDisc });
      title = 'Relatório personalizado';
      const tags = [
        config.filterCompany && ('empresa = ' + config.filterCompany),
        config.filterJob && ('cargo = ' + config.filterJob),
        config.filterDisc && ('DISC = ' + config.filterDisc),
      ].filter(Boolean);
      subtitle = tags.length ? 'Filtros: ' + tags.join(' · ') : 'Filtros: nenhum';
    }

    // Indexa disc_results por userId
    const drByUser = {};
    (discResults || []).forEach(function (r) { drByUser[r.userId || r.id] = r; });

    // Distribuição DISC e tipos de comprador
    const discCounts = { D: 0, I: 0, S: 0, C: 0 };
    const codeCounts = {};
    const jobCounts  = {};
    members.forEach(function (u) {
      const m = u.discMain;
      if (m && discCounts.hasOwnProperty(m)) discCounts[m] += 1;
      const dr = drByUser[u.id];
      const code = (dr && (dr.code || dr.main)) || u.discMain;
      if (code) codeCounts[code] = (codeCounts[code] || 0) + 1;
      const j = u.jobTitle && u.jobTitle.trim();
      if (j) jobCounts[j] = (jobCounts[j] || 0) + 1;
    });
    const total = members.length || 1;
    const discPct = {
      D: Math.round(discCounts.D / total * 100),
      I: Math.round(discCounts.I / total * 100),
      S: Math.round(discCounts.S / total * 100),
      C: Math.round(discCounts.C / total * 100),
    };
    const mainDim = ['D','I','S','C'].reduce(function (a, b) { return discCounts[a] >= discCounts[b] ? a : b; });

    const topCodes = Object.entries(codeCounts)
      .map(function (e) { return { code: e[0], n: e[1], pct: Math.round(e[1] / total * 100), profile: (window.BUYER_PROFILES || {})[e[0]] }; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 5);

    const topJobs = Object.entries(jobCounts)
      .map(function (e) { return { role: e[0], n: e[1], pct: Math.round(e[1] / total * 100) }; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 6);

    // Lista de membros para o PDF
    const memberRows = members.slice(0, 50).map(function (u) {
      const dr = drByUser[u.id];
      return {
        name: u.name || '—',
        jobTitle: u.jobTitle || '—',
        company: u.companyName || '—',
        disc: u.discMain || '—',
        code: (dr && (dr.code || dr.main)) || u.discMain || '—',
      };
    });

    return {
      title: title,
      subtitle: subtitle,
      dateStr: fmtDateLong(new Date()),
      totalMembers: members.length,
      totalAllUsers: (users || []).length,
      discCounts: discCounts,
      discPct: discPct,
      mainDim: mainDim,
      topCodes: topCodes,
      topJobs: topJobs,
      members: memberRows,
      hasAnyData: members.length > 0,
      config: config,
    };
  }

  // ============ Render do PDF agregado ============
  function donutSVG(pct) {
    const cx = 100, cy = 100, r = 70, sw = 22;
    const parts = ['D','I','S','C'].filter(function (k) { return pct[k] > 0; });
    if (parts.length === 0) {
      return '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'
        + '<circle cx="100" cy="100" r="' + r + '" fill="none" stroke="#ebe4d8" stroke-width="' + sw + '"/></svg>';
    }
    const C = 2 * Math.PI * r;
    let acc = 0;
    let segs = '';
    parts.forEach(function (k) {
      const frac = pct[k] / 100;
      const len = C * frac;
      const gap = C - len;
      const rot = -90 + (acc / 100) * 360;
      segs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + DISC_COLOR_REL[k] +
        '" stroke-width="' + sw + '" stroke-dasharray="' + len + ' ' + gap + '" stroke-dashoffset="0"' +
        ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" stroke-linecap="butt"/>';
      acc += pct[k];
    });
    return '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="100" cy="100" r="' + r + '" fill="none" stroke="#f3ecdf" stroke-width="' + sw + '"/>'
      + segs
      + '</svg>';
  }

  function aggregateReportHTML(data, logoSrc) {
    const C = {
      ink: '#0f0907', inkSoft: '#2a201a', muted: '#7a6b5d',
      paper: '#ffffff', paperWarm: '#fbf8f3', line: '#ebe4d8', lineSoft: '#f3ecdf',
      brown950: '#15090a', brown850: '#28180f', brown700: '#4a2c1b',
      brown500: '#8b5a2b', brown300: '#c9a17a', brown100: '#f0e3d0', brown50: '#faf5ee',
    };

    const style =
      '@page{size:A4;margin:0;}' +
      '*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
      'body{margin:0;background:' + C.paperWarm + ';color:' + C.ink + ';font-family:Manrope,system-ui,sans-serif;font-size:11px;line-height:1.55;}' +
      '.serif{font-family:Fraunces,Georgia,serif;}' +
      '.cover{width:210mm;height:297mm;padding:18mm;background:linear-gradient(180deg,' + C.brown950 + ' 0%,' + C.brown850 + ' 100%);color:' + C.brown50 + ';display:flex;flex-direction:column;page-break-after:always;position:relative;overflow:hidden;}' +
      '.cover-logo{height:24px;}' +
      '.cover-tag{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:' + C.brown300 + ';margin-top:6px;}' +
      '.cover-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:' + C.brown300 + ';font-weight:600;margin-bottom:10px;}' +
      '.cover-title{font-family:Fraunces,Georgia,serif;font-size:48px;font-weight:500;line-height:1.05;letter-spacing:-.02em;margin:0 0 18px 0;}' +
      '.cover-title em{font-style:italic;color:' + C.brown300 + ';font-weight:400;}' +
      '.cover-meta{display:grid;grid-template-columns:repeat(4,auto);gap:30px;margin-top:24px;font-size:11px;}' +
      '.cm-k{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:' + C.brown300 + ';font-weight:600;}' +
      '.cm-v{font-family:Fraunces,Georgia,serif;font-size:20px;font-weight:500;margin-top:4px;}' +
      '.cm-s{color:' + C.brown300 + ';margin-top:2px;}' +
      '.page{width:210mm;padding:18mm;background:' + C.paper + ';page-break-after:always;}' +
      '.section{margin-bottom:22px;}' +
      '.section-label{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:' + C.muted + ';font-weight:600;margin-bottom:10px;display:flex;gap:10px;align-items:center;}' +
      '.section-label .num{display:inline-block;background:' + C.brown700 + ';color:' + C.brown50 + ';padding:2px 8px;border-radius:6px;font-weight:700;letter-spacing:.08em;}' +
      '.rtitle{font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:500;letter-spacing:-.01em;margin:0 0 8px 0;color:' + C.ink + ';}' +
      '.rlead{font-size:12px;color:' + C.inkSoft + ';margin:0 0 14px 0;line-height:1.6;}' +
      '.donut-wrap{display:flex;gap:24px;align-items:center;}' +
      '.legend{display:flex;flex-direction:column;gap:6px;flex:1;}' +
      '.legend-row{display:flex;align-items:center;gap:10px;font-size:12px;}' +
      '.legend-row .sw{width:12px;height:12px;border-radius:3px;display:inline-block;}' +
      '.legend-row .pct{margin-left:auto;font-weight:700;font-variant-numeric:tabular-nums;}' +
      '.bar-row{padding:7px 0;}' +
      '.bar-head{display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px;}' +
      '.bar{height:7px;background:' + C.lineSoft + ';border-radius:3px;overflow:hidden;}' +
      '.bar > span{display:block;height:100%;background:' + C.brown700 + ';}' +
      '.tblc{width:100%;border-collapse:collapse;font-size:11px;}' +
      '.tblc th{text-align:left;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:' + C.muted + ';font-weight:600;padding:8px 10px;border-bottom:1px solid ' + C.line + ';}' +
      '.tblc td{padding:8px 10px;border-bottom:1px solid ' + C.lineSoft + ';color:' + C.inkSoft + ';}' +
      '.tblc tr:last-child td{border-bottom:none;}' +
      '.disc-pill{display:inline-block;font-weight:700;font-size:10.5px;padding:2px 7px;border-radius:6px;color:#fff;}' +
      '.rfoot{padding:8mm 18mm;display:flex;justify-content:space-between;font-size:9px;color:' + C.muted + ';}' +
      '.exec-quote{padding:14px 16px;background:' + C.brown50 + ';border-left:3px solid ' + C.brown700 + ';font-size:12px;color:' + C.inkSoft + ';line-height:1.6;border-radius:0 8px 8px 0;}';

    // Capa
    const cover =
      '<div class="cover">' +
        '<div>' +
          (logoSrc ? '<img class="cover-logo" src="' + logoSrc + '" alt="Voratte"/>' : '<div class="serif" style="font-size:22px">Vorätte</div>') +
          '<div class="cover-tag">DISC · Compras &amp; Negociação</div>' +
        '</div>' +
        '<div style="flex:1"></div>' +
        '<div class="cover-eyebrow">Relatório consolidado · Vorätte</div>' +
        '<h1 class="cover-title">' + esc(data.title) + '<br/><em>' + esc(data.subtitle) + '</em></h1>' +
        '<div class="cover-meta">' +
          '<div><div class="cm-k">Usuários no grupo</div><div class="cm-v">' + data.totalMembers + '</div><div class="cm-s">de ' + data.totalAllUsers + ' na plataforma</div></div>' +
          '<div><div class="cm-k">Perfil dominante</div><div class="cm-v" style="color:' + DISC_COLOR_REL[data.mainDim] + '">' + data.mainDim + ' · ' + DISC_LABEL_REL[data.mainDim] + '</div><div class="cm-s">' + data.discPct[data.mainDim] + '% do grupo</div></div>' +
          '<div><div class="cm-k">Tipo + frequente</div><div class="cm-v">' + (data.topCodes[0] ? esc(data.topCodes[0].code) : '—') + '</div><div class="cm-s">' + (data.topCodes[0] && data.topCodes[0].profile ? esc(data.topCodes[0].profile.shortLabel) : '') + '</div></div>' +
          '<div><div class="cm-k">Emitido em</div><div class="cm-v">' + esc(data.dateStr) + '</div><div class="cm-s">Vorätte · DISC</div></div>' +
        '</div>' +
      '</div>';

    // 01 — Distribuição DISC
    const legend = ['D','I','S','C'].map(function (k) {
      return '<div class="legend-row"><span class="sw" style="background:' + DISC_COLOR_REL[k] + '"></span>' +
        '<span>' + DISC_FULL_REL[k] + ' (' + k + ')</span>' +
        '<span class="pct">' + data.discPct[k] + '%</span></div>';
    }).join('');
    const sec01 =
      '<div class="section">' +
        '<div class="section-label"><span class="num">01</span> Distribuição DISC do grupo</div>' +
        '<h2 class="rtitle">Como o perfil DISC se distribui</h2>' +
        '<p class="rlead">' + data.totalMembers + ' usuários com DISC concluído. A predominância é ' +
          '<strong>' + DISC_LABEL_REL[data.mainDim] + ' (' + data.mainDim + ')</strong>, presente em ' + data.discPct[data.mainDim] + '% do grupo.</p>' +
        '<div class="donut-wrap">' + donutSVG(data.discPct) +
          '<div class="legend">' + legend + '</div></div>' +
      '</div>';

    // 02 — Tipos de comprador
    const codesHTML = data.topCodes.length === 0
      ? '<div style="color:' + C.muted + ';font-size:11px;padding:10px 0">Nenhum tipo de comprador encontrado.</div>'
      : data.topCodes.map(function (c) {
          const label = (c.profile && c.profile.label) || c.code;
          return '<div class="bar-row">' +
            '<div class="bar-head"><span><strong>' + esc(c.code) + '</strong> · ' + esc(label) + '</span>' +
            '<span>' + c.n + ' · ' + c.pct + '%</span></div>' +
            '<div class="bar"><span style="width:' + c.pct + '%"></span></div></div>';
        }).join('');
    const sec02 =
      '<div class="section">' +
        '<div class="section-label"><span class="num">02</span> Tipos de comprador predominantes</div>' +
        '<h2 class="rtitle">Os perfis de compra mais frequentes</h2>' +
        codesHTML +
      '</div>';

    // 03 — Distribuição por cargo
    const jobsHTML = data.topJobs.length === 0
      ? '<div style="color:' + C.muted + ';font-size:11px;padding:10px 0">Cargos não preenchidos neste grupo.</div>'
      : data.topJobs.map(function (j) {
          return '<div class="bar-row">' +
            '<div class="bar-head"><span>' + esc(j.role) + '</span>' +
            '<span>' + j.n + ' · ' + j.pct + '%</span></div>' +
            '<div class="bar"><span style="width:' + j.pct + '%"></span></div></div>';
        }).join('');
    const sec03 =
      '<div class="section">' +
        '<div class="section-label"><span class="num">03</span> Distribuição por cargo</div>' +
        '<h2 class="rtitle">Onde estão os compradores deste grupo</h2>' +
        jobsHTML +
      '</div>';

    // 04 — Membros
    const memberRows = data.members.map(function (m) {
      return '<tr>' +
        '<td>' + esc(m.name) + '</td>' +
        '<td>' + esc(m.jobTitle) + '</td>' +
        '<td>' + esc(m.company) + '</td>' +
        '<td><span class="disc-pill" style="background:' + (DISC_COLOR_REL[m.disc] || C.brown700) + '">' + esc(m.disc) + '</span></td>' +
        '<td>' + esc(m.code) + '</td>' +
      '</tr>';
    }).join('');
    const sec04 =
      '<div class="section">' +
        '<div class="section-label"><span class="num">04</span> Membros do grupo</div>' +
        '<h2 class="rtitle">Lista de colaboradores incluídos</h2>' +
        '<table class="tblc"><thead><tr>' +
          '<th>Nome</th><th>Cargo</th><th>Empresa</th><th>DISC</th><th>Tipo</th>' +
        '</tr></thead><tbody>' + memberRows + '</tbody></table>' +
        (data.totalMembers > data.members.length ? '<div style="margin-top:8px;font-size:10.5px;color:' + C.muted + '">Exibindo ' + data.members.length + ' de ' + data.totalMembers + ' membros.</div>' : '') +
      '</div>';

    // 05 — Leitura executiva
    const mainProfile = (window.BUYER_PROFILES || {})[data.mainDim];
    const execText = mainProfile
      ? 'O grupo é majoritariamente <strong>' + DISC_LABEL_REL[data.mainDim] + '</strong> (' + data.discPct[data.mainDim] + '%). ' + esc(mainProfile.buyerType) + '. ' +
        'Na prática, este grupo tende a decidir com ' + (mainProfile.decisionShort || '') +
        ' e responde melhor a um tom ' + (mainProfile.toneShort || '') + '.'
      : 'Distribuição diversificada — sem perfil DISC majoritário acentuado.';
    const sec05 =
      '<div class="section">' +
        '<div class="section-label"><span class="num">05</span> Leitura executiva</div>' +
        '<div class="exec-quote">' + execText + '</div>' +
      '</div>';

    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>' +
      '<title>' + esc(data.title) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300..700;1,300..700&family=Manrope:wght@300..700&display=swap" rel="stylesheet">' +
      '<style>' + style + '</style></head><body>' +
      cover +
      '<div class="page">' + sec01 + sec02 + sec03 + sec04 + sec05 + '</div>' +
      '<div class="rfoot"><span>Relatório consolidado · ' + esc(data.dateStr) + ' · Vorätte</span>' +
      '<span>' + esc(data.subtitle) + '</span></div>' +
      '</body></html>';
  }

  function exportAggregateReportPDF(data) {
    const loader = window.voratteLoadLogo
      ? window.voratteLoadLogo()
      : Promise.resolve(null);
    loader.then(function (logoSrc) {
      const html = aggregateReportHTML(data, logoSrc);
      if (window.vorattePrintHTML) {
        window.vorattePrintHTML(html);
      } else {
        // fallback: abre em nova janela
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); }
      }
    });
  }

  // Exposição global
  window.AdminRelatorios = AdminRelatorios;
  window.buildAggregateReportData = buildAggregateReportData;
  window.exportAggregateReportPDF = exportAggregateReportPDF;
})();
