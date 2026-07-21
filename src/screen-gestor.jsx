// ====================== GESTOR ======================
// O gestor vê APENAS os colaboradores do seu time.

// Cache de sessão chaveado por gestorId — evita refetch enquanto o gestor navega
// entre telas, mas não vaza entre sessões/usuários diferentes na mesma aba.
var _gestorTeamCache = {}; // { [gestorId]: members[] }
var _gestorTeamFetch = {}; // { [gestorId]: Promise<members[]> }

// Invalida o cache no logout — força refetch quando outro usuário loga sem refresh.
window.clearGestorTeamCache = function () {
  _gestorTeamCache = {};
  _gestorTeamFetch = {};
};

// Monta uma URL mailto: para abrir o cliente de e-mail padrão do gestor.
// Suporta to (destino direto), bcc (lista de destinatários), subject e body.
function buildMailto(opts) {
  var o = opts || {};
  var params = [];
  if (o.bcc)     params.push('bcc=' + encodeURIComponent(o.bcc));
  if (o.subject) params.push('subject=' + encodeURIComponent(o.subject));
  if (o.body)    params.push('body=' + encodeURIComponent(o.body));
  return 'mailto:' + (o.to || '') + (params.length ? '?' + params.join('&') : '');
}

// Quando admin está em "Visão: Gestor" sem equipe vinculada, injeta o próprio admin
// (com o DISC que ele tiver feito como aluno demo) na lista — só para visualização.
async function _buildDemoSelfMember(currentUser) {
  if (!currentUser || !currentUser.id) return null;
  try {
    var disc = await window.fbGetDiscResult(currentUser.id);
    if (!disc) return null;
    return {
      id:        currentUser.id,
      name:      (currentUser.name || t('gestor.demoSelf.fallbackName')) + t('gestor.demoSelf.suffix'),
      role:      currentUser.jobTitle || t('gestor.demoSelf.fallbackJob'),
      d:         disc.d || 0,
      i:         disc.i || 0,
      s:         disc.s || 0,
      c:         disc.c || 0,
      main:      disc.main || '—',
      last:      '—',
      reports:   0,
      status:    'done',
      _demoSelf: true,
    };
  } catch (e) {
    return null;
  }
}

// Exporta o relatório PDF de um MEMBRO do time (não o do gestor logado).
// Reutiliza a mesma infra do relatório individual: fbGetDiscResult + buildReportData
// + exportReportPDF (padrão idêntico ao handleReExport do admin). Persiste os
// metadados em /reports com doc determinístico 'team_{memberUid}' (best-effort).
async function exportMemberReport(member, gestorUser) {
  if (!member || !member.id) return;
  var doc = await window.fbGetDiscResult(member.id);
  if (!doc) { alert(t('gestor.report.noDisc')); return; }
  var code = doc.code || doc.main;
  var discR = {
    mostGraph:   doc.mostGraph   || { D: doc.d, I: doc.i, S: doc.s, C: doc.c },
    leastGraph:  doc.leastGraph  || { D: 0, I: 0, S: 0, C: 0 },
    changeGraph: doc.changeGraph || { D: 0, I: 0, S: 0, C: 0 },
    code: code,
    profile: window.BUYER_PROFILES[code] || window.BUYER_PROFILES[doc.main],
  };
  // shape vindo de fbGetTeamMembers: role = jobTitle; empresa vem do gestor (mesmo tenant)
  var userLike = {
    name:        member.name !== '—' ? member.name : '',
    jobTitle:    member.role !== '—' ? member.role : '',
    companyName: (gestorUser && gestorUser.companyName) || '',
    email:       member.email || '',
  };
  window.exportReportPDF(window.buildReportData(userLike, discR));
  try {
    await window.fbSaveReport({
      userId:        member.id,
      type:          'individual',
      title:         t('gestor.report.title', { name: userLike.name || member.email || member.id }),
      targetId:      member.id,
      targetLabel:   userLike.name || member.email || '',
      createdBy:     gestorUser && gestorUser.id,
      createdByName: (gestorUser && gestorUser.name) || '',
    }, 'team_' + member.id);
    // Contador de relatórios do membro (regras permitem gestor do time incrementar)
    if (window.fbIncrementUserCounter) window.fbIncrementUserCounter(member.id, 'reportCount');
  } catch (e) {
    console.warn('fbSaveReport (membro) falhou — PDF foi gerado mesmo assim:', e);
  }
}

function useGestorTeam(gestorId, currentUser) {
  var cached = gestorId ? _gestorTeamCache[gestorId] : null;
  var [team, setTeam] = React.useState(cached || []);
  var [loading, setLoading] = React.useState(!cached);
  var [error, setError] = React.useState(null);

  React.useEffect(function() {
    var cancelled = false;
    function applyDemoFallback(data) {
      // Só injeta o demo-self quando o usuário logado é admin (sinaliza modo demo)
      // e a equipe real veio vazia.
      if (data.length > 0 || !currentUser || currentUser.role !== 'admin') {
        if (!cancelled) { setTeam(data); setLoading(false); setError(null); }
        return;
      }
      _buildDemoSelfMember(currentUser).then(function (self) {
        if (cancelled) return;
        setTeam(self ? [self] : []);
        setLoading(false);
        setError(null);
      });
    }

    if (!gestorId) { setLoading(false); return; }
    if (_gestorTeamCache[gestorId]) { applyDemoFallback(_gestorTeamCache[gestorId]); return; }
    if (!_gestorTeamFetch[gestorId]) {
      _gestorTeamFetch[gestorId] = window.fbGetTeamMembers(gestorId);
    }
    _gestorTeamFetch[gestorId].then(function(data) {
      _gestorTeamCache[gestorId] = data;
      applyDemoFallback(data);
    }).catch(function(err) {
      console.error('Erro ao carregar time:', err);
      delete _gestorTeamFetch[gestorId]; // permite retry na próxima montagem
      if (!cancelled) {
        setTeam([]);
        setLoading(false);
        setError(err && err.message ? err.message : 'unknown');
      }
    });

    return function () { cancelled = true; };
  }, [gestorId, currentUser && currentUser.id, currentUser && currentUser.role]);

  return [team, loading, error];
}

function GestorDashboard({ go, user }) {
  useLang();
  var [team, teamLoading] = useGestorTeam(user && user.id, user);
  var GESTOR_TEAM = team;
  var done = GESTOR_TEAM.filter(function(p) { return p.status === 'done'; }).length;
  var pending = GESTOR_TEAM.length - done;
  var firstName = user && user.name ? user.name.split(' ')[0] : t('role.gestor');

  // Pendentes com e-mail cadastrado — alvo do botão "Notificar pendentes"
  var pendingWithEmail = GESTOR_TEAM.filter(function (m) {
    return m.status !== 'done' && m.email;
  });

  function handleNotifyPending() {
    if (!pendingWithEmail.length) { alert(t('gestor.notify.empty')); return; }
    var bcc = pendingWithEmail.map(function (m) { return m.email; }).join(',');
    var senderName = user && user.name ? user.name : t('role.gestor');
    window.location.href = buildMailto({
      bcc:     bcc,
      subject: t('gestor.notify.subject'),
      body:    t('gestor.notify.body', { name: senderName }),
    });
  }

  // Distribuição DISC real do time
  var dist = React.useMemo(function () {
    var counts = { D: 0, I: 0, S: 0, C: 0 };
    GESTOR_TEAM.forEach(function (m) { if (m.main && counts.hasOwnProperty(m.main)) counts[m.main] += 1; });
    var total = counts.D + counts.I + counts.S + counts.C;
    if (!total) return null;
    var labels = { D: t('disc.D.label'), I: t('disc.I.label'), S: t('disc.S.label'), C: t('disc.C.label') };
    var top = ['D','I','S','C'].reduce(function (a, b) { return counts[a] >= counts[b] ? a : b; });
    return {
      counts: counts, total: total,
      topKey: top, topLabel: labels[top],
      topPct: Math.round(counts[top] / total * 100),
    };
  }, [GESTOR_TEAM, window.getLang()]);

  // DISC do próprio gestor (opcional) — alimenta o card "Meu perfil DISC".
  // Usa o cache em memória se houver, senão busca o doc em /disc_results.
  var [myDisc, setMyDisc] = React.useState(window.DISC_LAST_RESULT || null);
  var [myDiscLoading, setMyDiscLoading] = React.useState(!window.DISC_LAST_RESULT);
  React.useEffect(function () {
    if (!user || !user.id || !window.fbGetDiscResult) { setMyDiscLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function (doc) {
      if (doc) { setMyDisc(doc); }
      setMyDiscLoading(false);
    }).catch(function () { setMyDiscLoading(false); });
  }, [user && user.id]);

  // Normaliza tanto o doc do Firestore (d/i/s/c) quanto o resultado em cache (mostGraph)
  function readMyDisc(src) {
    if (!src) return null;
    var mg = src.mostGraph || (typeof src.d === 'number' ? { D: src.d, I: src.i, S: src.s, C: src.c } : null);
    if (!mg) return null;
    var total = (mg.D + mg.I + mg.S + mg.C) || 1;
    var main = src.main || (src.profile && src.profile.primary) ||
      ['D','I','S','C'].reduce(function (a, b) { return mg[a] >= mg[b] ? a : b; });
    return {
      main: main, code: src.code || (src.profile && src.profile.code) || main, counts: mg,
      pct: {
        D: Math.round(mg.D / total * 100), I: Math.round(mg.I / total * 100),
        S: Math.round(mg.S / total * 100), C: Math.round(mg.C / total * 100),
      },
    };
  }
  var my = readMyDisc(myDisc);

  // Linha do hero: pluralização
  var heroLine;
  if (teamLoading) heroLine = t('gestor.loadingTeam');
  else if (GESTOR_TEAM.length) {
    heroLine = t(GESTOR_TEAM.length === 1 ? 'gestor.teamLine.one' : 'gestor.teamLine', {
      n: GESTOR_TEAM.length, done: done,
    });
  } else heroLine = t('gestor.noTeam');

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, background: 'radial-gradient(circle, var(--brown-50), transparent 70%)' }} />
          <div className="badge badge-brown" style={{ position: 'relative' }}><Ic.Shield s={12}/> {t('gestor.badge')}</div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.15, maxWidth: 460 }}>
            {t('gestor.helloName', { name: firstName })} <span style={{ color: 'var(--muted)' }}>
              {heroLine}
            </span>
          </h2>

          <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 26 }}>
            <div className="stat">
              <div className="stat-label">{t('gestor.stat.collaborators')}</div>
              <div className="stat-value">{GESTOR_TEAM.length}</div>
              <div className="stat-delta">{t('gestor.stat.evaluated', { n: done })}</div>
            </div>
            <div className="stat">
              <div className="stat-label">{t('gestor.stat.pending')}</div>
              <div className="stat-value" style={{ color: pending > 0 ? 'var(--disc-d)' : 'inherit' }}>{pending}</div>
              <div className="stat-delta">{pending > 0 ? t('gestor.stat.pendingWait') : t('gestor.stat.pendingOk')}</div>
            </div>
            <div className="stat">
              <div className="stat-label">{t('gestor.stat.dominant')}</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{dist ? dist.topKey + ' · ' + dist.topPct + '%' : '—'}</div>
              <div className="stat-delta">{dist ? dist.topLabel : t('gestor.stat.noData')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => go('equipe')}>
              {t('gestor.cta.viewTeam')} <Ic.Arrow s={14}/>
            </button>
            <button className="btn btn-secondary" onClick={() => go('relatorios')}>
              <Ic.Pdf s={14}/> {t('gestor.cta.report')}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t('gestor.distTitle')}</div>
          <div className="card-sub">{t('gestor.distSub')}</div>
          {!dist ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
              {t('gestor.distEmpty')}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <Donut
                size={170} stroke={22}
                data={[
                  { key: 'D', value: dist.counts.D, color: 'var(--disc-d)' },
                  { key: 'I', value: dist.counts.I, color: 'var(--disc-i)' },
                  { key: 'S', value: dist.counts.S, color: 'var(--disc-s)' },
                  { key: 'C', value: dist.counts.C, color: 'var(--disc-c)' },
                ]}
                center={<><div className="letter">{dist.total}</div><div className="label">{dist.total === 1 ? t('gestor.donutEvaluated.one') : t('gestor.donutEvaluated')}</div></>}
              />
              <div className="legend" style={{ flex: 1 }}>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>{t('disc.D.label')}</span><span className="pct">{dist.counts.D}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>{t('disc.I.label')}</span><span className="pct">{dist.counts.I}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>{t('disc.S.label')}</span><span className="pct">{dist.counts.S}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>{t('disc.C.label')}</span><span className="pct">{dist.counts.C}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meu perfil DISC — resultado pessoal do gestor (opcional) */}
      <div className="card">
        <div className="card-title">{t('gestor.myDisc.title')}</div>
        <div className="card-sub">{t('gestor.myDisc.sub')}</div>
        {myDiscLoading ? (
          <div style={{ padding: '18px 0', color: 'var(--muted)', fontSize: 13 }}>{t('gestor.myDisc.loading')}</div>
        ) : !my ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 460 }}>{t('gestor.myDisc.empty')}</div>
            <button className="btn btn-primary" onClick={() => go('teste')}>
              <Ic.Disc s={14}/> {t('gestor.myDisc.ctaTest')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            <Donut
              size={130} stroke={18}
              data={[
                { key: 'D', value: my.counts.D, color: 'var(--disc-d)' },
                { key: 'I', value: my.counts.I, color: 'var(--disc-i)' },
                { key: 'S', value: my.counts.S, color: 'var(--disc-s)' },
                { key: 'C', value: my.counts.C, color: 'var(--disc-c)' },
              ]}
              center={<><div className="letter">{my.main}</div><div className="label">{my.code}</div></>}
            />
            <div className="legend" style={{ flex: 1, minWidth: 220 }}>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>{t('disc.D.label')}</span><span className="pct">{my.pct.D}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>{t('disc.I.label')}</span><span className="pct">{my.pct.I}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>{t('disc.S.label')}</span><span className="pct">{my.pct.S}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>{t('disc.C.label')}</span><span className="pct">{my.pct.C}%</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => go('analise')}>
                <Ic.Target s={14}/> {t('gestor.myDisc.ctaAnalise')}
              </button>
              <button className="btn btn-primary" onClick={() => go('relatorio')}>
                <Ic.Pdf s={14}/> {t('gestor.myDisc.ctaReport')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quem ainda não fez */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="card-title">{t('gestor.evalStatusTitle')}</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>{t('gestor.evalStatusSub')}</div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleNotifyPending}
            disabled={!pendingWithEmail.length}
            title={!pendingWithEmail.length ? t('gestor.notify.empty') : undefined}
          >
            <Ic.Bell s={14}/> {t('gestor.notifyPending')}
          </button>
        </div>

        <div className="m-rowgrid-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GESTOR_TEAM.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 140px 140px 60px', gap: 14, alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: p.status === 'done' ? 'var(--paper)' : 'var(--paper-warm)', border: '1px solid var(--line-soft)' }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{p.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.role}</div>
              </div>
              <div>
                {p.status === 'done' && <span className="badge badge-brown">{t('gestor.status.done')}</span>}
                {p.status === 'pending' && <span className="badge" style={{ background: '#f8e8d4', color: '#a87139' }}>{t('gestor.status.pending')}</span>}
                {p.status === 'invited' && <span className="badge badge-outline">{t('gestor.status.invited')}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('gestor.lastLabel', { date: p.last })}</div>
              <button className="icon-btn" onClick={() => go('equipe')}><Ic.Arrow s={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GestorEquipe({ go, user }) {
  useLang();
  var [team, teamLoading, teamError] = useGestorTeam(user && user.id, user);
  var GESTOR_TEAM = team;
  var [sel, setSel] = React.useState(null);
  var [exporting, setExporting] = React.useState(false);
  var [memberReports, setMemberReports] = React.useState([]);
  var [reportsLoading, setReportsLoading] = React.useState(false);
  var selId = sel || (GESTOR_TEAM.length ? GESTOR_TEAM[0].id : null);
  var p = GESTOR_TEAM.find(function(x) { return x.id === selId; }) || null;
  var senderName = user && user.name ? user.name : t('role.gestor');

  // Relatórios reais do membro selecionado (regras: gestor lê reports do time)
  var loadMemberReports = React.useCallback(function (memberId) {
    if (!memberId || !window.fbGetReportsByUser) { setMemberReports([]); return; }
    setReportsLoading(true);
    window.fbGetReportsByUser(memberId).then(function (docs) {
      setMemberReports(docs || []);
      setReportsLoading(false);
    }).catch(function (err) {
      console.warn('Erro ao carregar relatórios do membro:', err);
      setMemberReports([]);
      setReportsLoading(false);
    });
  }, []);

  React.useEffect(function () { loadMemberReports(selId); }, [selId, loadMemberReports]);

  function handleMemberReport(member) {
    if (exporting) return;
    setExporting(true);
    exportMemberReport(member, user)
      .catch(function (e) { console.error('Erro ao gerar relatório do membro:', e); })
      .then(function () {
        setExporting(false);
        loadMemberReports(member && member.id); // reflete o doc recém-gravado na lista
      });
  }

  function fmtReportDate(ts) {
    if (!ts) return '—';
    try {
      var lang = window.getLang();
      var loc = lang === 'es' ? 'es' : lang === 'en' ? 'en-US' : 'pt-BR';
      return ts.toDate().toLocaleDateString(loc);
    } catch (e) {}
    return '—';
  }

  function handleMessage(member) {
    if (!member || !member.email) { alert(t('gestor.notify.empty')); return; }
    window.location.href = buildMailto({
      to:      member.email,
      subject: t('gestor.detail.msgSubject', { name: senderName }),
      body:    t('gestor.detail.msgBody', { member: member.name, name: senderName }),
    });
  }

  function handleRemind(member) {
    if (!member || !member.email) { alert(t('gestor.notify.empty')); return; }
    window.location.href = buildMailto({
      to:      member.email,
      subject: t('gestor.detail.remindSubject'),
      body:    t('gestor.detail.remindBody', { member: member.name, name: senderName }),
    });
  }

  if (teamLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)', fontSize: 13 }}>{t('gestor.team.loading')}</div>;
  }
  if (teamError) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--brown-700)', fontSize: 13, padding: 24, textAlign: 'center', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Falha ao carregar a equipe.</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{teamError}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Recarregue a página e tente novamente.</div>
    </div>;
  }
  if (!GESTOR_TEAM.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)', fontSize: 13 }}>{t('gestor.team.empty')}</div>;
  }

  return (
    <div className="page-enter m-split" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: '100%' }}>

      {/* List */}
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)' }}>
          <div className="card-title" style={{ marginBottom: 2 }}>{t('gestor.team.title')}</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>{t('gestor.team.count', { n: GESTOR_TEAM.length })}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {GESTOR_TEAM.map(function(person) { return (
            <button
              key={person.id}
              onClick={() => setSel(person.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', textAlign: 'left',
                padding: '14px 18px',
                background: selId === person.id ? 'var(--brown-50)' : 'transparent',
                borderLeft: '3px solid ' + (selId === person.id ? 'var(--brown-700)' : 'transparent'),
                borderBottom: '1px solid var(--line-soft)',
                cursor: 'pointer',
              }}
            >
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                {person.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{person.role}</div>
              </div>
              {person.main !== '—' ? (
                <div className={'disc-tile disc-' + person.main.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}>{person.main}</div>
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--brown-50)', border: '1px dashed var(--brown-300)', color: 'var(--brown-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>?</div>
              )}
            </button>
          ); })}
        </div>
      </div>

      {/* Detail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 18 }}>
              {p.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.name}</h2>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{p.role}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {p.main !== '—' && <div className="badge badge-brown">{t('perfil.badgeProfile', { label: t('disc.' + p.main + '.label'), code: p.main })}</div>}
                <div className="badge badge-outline">{t('gestor.detail.lastEval', { date: p.last })}</div>
                <div className="badge badge-outline">{t('gestor.detail.reportsCount', { n: memberReports.length })}</div>
              </div>
            </div>
            {p.status === 'done' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => handleMessage(p)} disabled={!p.email}>
                  <Ic.Chat s={14}/> {t('gestor.detail.message')}
                </button>
                <button className="btn btn-primary" onClick={() => handleMemberReport(p)} disabled={exporting}>
                  <Ic.Pdf s={14}/> {exporting ? t('gestor.report.generating') : t('gestor.detail.report')}
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => handleRemind(p)} disabled={!p.email}>
                <Ic.Bell s={14}/> {t('gestor.detail.remind')}
              </button>
            )}
          </div>
        </div>

        {p.status === 'done' ? (
          <React.Fragment>
            <div className="card" style={{ padding: 24 }}>
              <div className="card-title">{t('gestor.detail.discTitle', { name: p.name.split(' ')[0] })}</div>
              <div className="card-sub">{t('gestor.detail.discSub')}</div>
              <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center' }}>
                <Donut
                  size={170} stroke={22}
                  data={[
                    { key: 'D', value: p.d, color: 'var(--disc-d)' },
                    { key: 'I', value: p.i, color: 'var(--disc-i)' },
                    { key: 'S', value: p.s, color: 'var(--disc-s)' },
                    { key: 'C', value: p.c, color: 'var(--disc-c)' },
                  ]}
                  center={<><div className="letter">{p.main}</div><div className="label">{t('disc.' + p.main + '.label')}</div></>}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { k: 'D', v: p.d, c: 'var(--disc-d)' },
                    { k: 'I', v: p.i, c: 'var(--disc-i)' },
                    { k: 'S', v: p.s, c: 'var(--disc-s)' },
                    { k: 'C', v: p.c, c: 'var(--disc-c)' },
                  ].map(d => (
                    <div key={d.k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t('disc.' + d.k + '.full')} ({d.k})</div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{d.v}%</div>
                      </div>
                      <div className="progress"><span style={{ width: d.v + '%', background: d.c }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conteúdo derivado do perfil DISC REAL do membro (BUYER_PROFILES),
                não mais texto genérico igual para todos */}
            {(function () {
              var prof = window.BUYER_PROFILES && window.BUYER_PROFILES[p.main];
              if (!prof) return null;
              return (
                <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="card">
                    <div className="card-title">{t('relatorio.movesTitle')}</div>
                    {(prof.motivators || []).map((s, i) => <div className="list-row" key={i}><Ic.Check s={14}/><span>{s}</span></div>)}
                  </div>
                  <div className="card">
                    <div className="card-title">{t('relatorio.brakesTitle')}</div>
                    {(prof.fears || []).map((s, i) => <div className="list-row" key={i}><div className="bullet" style={{ background: 'var(--disc-d)' }}/><span>{s}</span></div>)}
                  </div>
                </div>
              );
            })()}

            <div className="card">
              <div className="card-title">{t('gestor.detail.reportsTitle', { name: p.name.split(' ')[0] })}</div>
              <div className="card-sub">{t('gestor.detail.reportsSub', { n: memberReports.length })}</div>
              {reportsLoading ? (
                <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13.5 }}>{t('common.loading')}</div>
              ) : memberReports.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13.5 }}>
                  {t('gestor.detail.reportsNone', { name: p.name.split(' ')[0] })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {memberReports.map(function (r) {
                    return (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--paper-warm)', border: '1px solid var(--line-soft)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Ic.Pdf s={14}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.title || t('relatorios.itemTitle')}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {fmtReportDate(r.createdAt)}{r.createdByName ? ' · ' + r.createdByName : ''}
                          </div>
                        </div>
                        <button className="icon-btn" onClick={() => handleMemberReport(p)} disabled={exporting} title={t('relatorios.downloadTitle')}>
                          <Ic.Download s={16}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </React.Fragment>
        ) : (
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Ic.Disc s={28}/>
            </div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{t('gestor.detail.noDiscTitle', { name: p.name.split(' ')[0] })}</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, maxWidth: 380, margin: '6px auto 0' }}>
              {p.status === 'invited' ? t('gestor.detail.noDiscInvited') : t('gestor.detail.noDiscPending')}
            </p>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => handleRemind(p)} disabled={!p.email}>
              <Ic.Bell s={14}/> {t('gestor.detail.remindBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GestorMapa({ go, user }) {
  useLang();
  var [team, teamLoading] = useGestorTeam(user && user.id, user);

  // Agrega a equipe por cargo (jobTitle), contando o perfil principal (DISC main) de cada membro.
  const matrix = React.useMemo(() => {
    if (!team || !team.length) return [];
    const byRole = {};
    team.forEach(function (m) {
      // membros sem DISC vêm com main '—' (placeholder), não null
      if (!m.main || !/^[DISC]$/.test(m.main)) return;
      const role = m.role || t('gestor.mapa.noJob');
      if (!byRole[role]) byRole[role] = { role: role, D: 0, I: 0, S: 0, C: 0 };
      byRole[role][m.main] += 1;
    });
    return Object.values(byRole);
  }, [team, window.getLang()]);

  const maxV = matrix.reduce(function (max, row) {
    return Math.max(max, row.D, row.I, row.S, row.C);
  }, 1);

  const cell = (v) => {
    if (!v) return { background: 'var(--paper-warm)', color: 'var(--muted-soft)' };
    const alpha = 0.18 + 0.6 * (v / maxV);
    return { background: `rgba(107, 68, 35, ${alpha})`, color: v > 1 ? '#fff' : 'var(--brown-50)' };
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="card">
        <div className="card-title">{t('gestor.mapa.title')}</div>
        <div className="card-sub">{t('gestor.mapa.sub')}</div>

        {teamLoading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('gestor.team.loading')}</div>
        ) : !matrix.length ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            {t('gestor.mapa.empty')}
          </div>
        ) : (
          <div className="m-rowgrid-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr)', gap: 4, alignItems: 'center' }}>
            <div />
            {['D','I','S','C'].map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0' }}>
                <div className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}>{k}</div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{t('disc.' + k + '.label')}</span>
              </div>
            ))}

            {matrix.map((row, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: '12px 0', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>{row.role}</div>
                {['D','I','S','C'].map(k => (
                  <div key={k} style={{
                    height: 44, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    ...cell(row[k]),
                  }}>{row[k] || '—'}</div>
                ))}
              </React.Fragment>
            ))}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GestorRelatorios({ go, user }) {
  useLang();
  var [team, teamLoading] = useGestorTeam(user && user.id, user);
  var [rows, setRows]     = React.useState([]);
  var [loading, setLoading] = React.useState(true);
  var [consBusy, setConsBusy] = React.useState(false);

  // Relatório consolidado do TIME — reutiliza o gerador agregado do admin
  // (window.buildAggregateReportData / exportAggregateReportPDF). O doc fica
  // com userId = gestor (dono), id determinístico para não duplicar na lista.
  async function handleNewConsolidated() {
    if (consBusy) return;
    var done = team.filter(function (m) { return m.main && m.main !== '—'; });
    if (!done.length) { alert(t('gestor.relatorios.consNone')); return; }
    if (!window.buildAggregateReportData || !window.exportAggregateReportPDF) return;
    setConsBusy(true);
    try {
      var discDocs = await Promise.all(done.map(function (m) {
        return window.fbGetDiscResult(m.id).catch(function () { return null; });
      }));
      var discResults = discDocs.map(function (d, i) {
        return Object.assign({ userId: done[i].id, main: done[i].main, code: done[i].main }, d || {});
      });
      var companyId = (user && user.companyId) || 'team';
      var companyName = (user && user.companyName) || t('gestor.relatorios.teamLabel');
      var usersLike = done.map(function (m) {
        return {
          id: m.id, name: m.name,
          jobTitle: m.role !== '—' ? m.role : '',
          companyId: companyId, companyName: companyName,
          discMain: m.main, discCompleted: true,
        };
      });
      var data = window.buildAggregateReportData(
        { kind: 'empresa', companyId: companyId },
        usersLike, discResults, [{ id: companyId, name: companyName }]
      );
      window.exportAggregateReportPDF(data);
      try {
        await window.fbSaveReport({
          userId: user.id,
          type: 'empresa',
          title: data.title,
          targetLabel: data.subtitle,
          createdBy: user.id,
          createdByName: (user && user.name) || '',
        }, 'teamcons_' + user.id);
      } catch (e) { console.warn('fbSaveReport (consolidado) falhou — PDF gerado mesmo assim:', e); }
      reloadRows();
    } catch (e) {
      console.error('Erro ao gerar consolidado do time:', e);
    } finally {
      setConsBusy(false);
    }
  }

  // Mapa uid -> nome para mostrar o "dono" do relatório
  var teamById = React.useMemo(function () {
    var m = {};
    team.forEach(function (p) { m[p.id] = p; });
    return m;
  }, [team]);

  function reloadRows() {
    if (!team.length) { setRows([]); setLoading(false); return; }
    if (!window.fbGetReportsByTeam) { setLoading(false); return; }
    // inclui o próprio gestor: o consolidado do time é gravado com userId = gestor
    var uids = team.map(function (p) { return p.id; }).concat(user && user.id ? [user.id] : []);
    setLoading(true);
    window.fbGetReportsByTeam(uids).then(function (docs) {
      setRows(docs || []);
      setLoading(false);
    }).catch(function (err) {
      console.error('Erro ao carregar relatórios do time:', err);
      setRows([]);
      setLoading(false);
    });
  }

  React.useEffect(function () {
    if (teamLoading) return;
    reloadRows();
  }, [teamLoading, team]);

  function fmtDate(ts) {
    if (!ts) return '—';
    try {
      var lang = window.getLang();
      var loc = lang === 'es' ? 'es' : lang === 'en' ? 'en-US' : 'pt-BR';
      return ts.toDate().toLocaleDateString(loc);
    } catch (e) {}
    return '—';
  }

  var isLoading = teamLoading || loading;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="tabs">
          <button className="tab active">{t('gestor.relatorios.tab.team')}</button>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleNewConsolidated}
          disabled={consBusy || teamLoading || !team.length}
          title={!team.length && !teamLoading ? t('gestor.relatorios.consNone') : undefined}
        >
          <Ic.Plus s={14}/> {consBusy ? t('gestor.report.generating') : t('gestor.relatorios.new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            {t('gestor.relatorios.loading')}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            {t('gestor.relatorios.empty')}
          </div>
        ) : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr>
              <th style={{ paddingLeft: 24 }}>{t('gestor.relatorios.col.report')}</th>
              <th>{t('gestor.relatorios.col.type')}</th>
              <th>{t('gestor.relatorios.col.owner')}</th>
              <th>{t('gestor.relatorios.col.date')}</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>{t('common.actions')}</th>
            </tr></thead>
            <tbody>
              {rows.map(function (r) {
                var owner = teamById[r.userId];
                var ownerName = owner ? owner.name : (r.targetLabel || '—');
                return (
                  <tr key={r.id}>
                    <td style={{ paddingLeft: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Ic.Pdf s={14}/>
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.title || t('relatorios.itemTitle')}</div>
                      </div>
                    </td>
                    <td><span className="badge badge-outline">{r.type || '—'}</span></td>
                    <td style={{ fontSize: 13 }}>{ownerName}</td>
                    <td>{fmtDate(r.createdAt)}</td>
                    <td style={{ paddingRight: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        {/* Membro do time → re-exporta o PDF dele; consolidado do gestor → regenera; senão relatório próprio */}
                        <button
                          className="icon-btn"
                          onClick={() => {
                            if (owner) exportMemberReport(owner, user);
                            else if (user && r.userId === user.id && r.type === 'empresa') handleNewConsolidated();
                            else go('relatorio');
                          }}
                          title={t('gestor.relatorios.actionView')}
                        >
                          <Ic.Eye s={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}

window.GestorDashboard = GestorDashboard;
window.GestorEquipe = GestorEquipe;
window.GestorMapa = GestorMapa;
window.GestorRelatorios = GestorRelatorios;
