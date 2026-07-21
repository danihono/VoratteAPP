// ====================== ADMIN ======================
// O admin geral vê TUDO: todas as empresas, gestores, usuários, estatísticas globais.

const JOB_TITLE_OPTIONS = [
  'Menor Aprendiz',
  'Assistente de Compras',
  'Comprador Júnior',
  'Comprador Pleno',
  'Comprador Sênior',
  'Especialista',
  'Coordenador',
  'Supervisor',
  'Gerente',
  'Diretor',
];

// Formato de data curto reutilizado nos modais e na tabela CSV. Aceita Firestore Timestamp,
// Date ou string já formatada — retorna '—' quando o valor é null/undefined.
function fmtAdminDate(ts) {
  if (!ts) return '—';
  try {
    var lang = window.getLang();
    var loc = lang === 'es' ? 'es' : lang === 'en' ? 'en-US' : 'pt-BR';
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleDateString(loc);
    if (ts instanceof Date) return ts.toLocaleDateString(loc);
  } catch (e) {}
  if (typeof ts === 'string') return ts;
  return '—';
}

// Gera um CSV com BOM UTF-8 (Excel pt-BR abre sem mojibake) e dispara download no navegador.
// columns = [{ key: 'name', label: 'Nome', format?: (row) => string }]
function downloadCsv(filename, rows, columns) {
  function escape(value) {
    var s = value == null ? '' : String(value);
    if (s.indexOf('"') !== -1 || s.indexOf(',') !== -1 || s.indexOf('\n') !== -1 || s.indexOf(';') !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }
  var header = columns.map(function (c) { return escape(c.label); }).join(';');
  var lines  = rows.map(function (r) {
    return columns.map(function (c) {
      var v = c.format ? c.format(r) : (r[c.key] == null ? '' : r[c.key]);
      return escape(v);
    }).join(';');
  });
  var csv = '﻿' + header + '\n' + lines.join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 0);
}

// Gráfico de crescimento — barras dos últimos 6 meses contando users.createdAt.
// SVG inline pra não trazer biblioteca; estilo discreto, alinhado ao design.
function GrowthChart({ users }) {
  useLang();
  // Buckets dos últimos 6 meses (inclui o atual). Chave 'YYYY-M'.
  const buckets = React.useMemo(function () {
    var now = new Date();
    var slots = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      slots.push({
        key:   d.getFullYear() + '-' + d.getMonth(),
        label: d.toLocaleDateString(
          window.getLang() === 'es' ? 'es' : window.getLang() === 'en' ? 'en-US' : 'pt-BR',
          { month: 'short' }
        ),
        count: 0,
      });
    }
    var index = {};
    slots.forEach(function (s) { index[s.key] = s; });
    users.forEach(function (u) {
      var ts = u.createdAt;
      if (!ts || typeof ts.toDate !== 'function') return;
      var d = ts.toDate();
      var k = d.getFullYear() + '-' + d.getMonth();
      if (index[k]) index[k].count += 1;
    });
    return slots;
  }, [users, window.getLang()]);

  var total = buckets.reduce(function (sum, b) { return sum + b.count; }, 0);
  if (!total) {
    return (
      <div style={{
        padding: '48px 24px', textAlign: 'center',
        color: 'var(--muted)', fontSize: 13,
        border: '1px dashed var(--line)', borderRadius: 10,
      }}>
        {t('admin.stats.growthEmpty')}
      </div>
    );
  }

  var maxV = Math.max.apply(null, buckets.map(function (b) { return b.count; })) || 1;
  var width = 540, height = 180, padX = 28, padTop = 18, padBottom = 28;
  var slotW = (width - padX * 2) / buckets.length;
  var barW  = slotW * 0.5;

  return (
    <div style={{ padding: '12px 0' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width, display: 'block' }}>
        {/* eixo Y suave em 3 linhas */}
        {[0, 0.5, 1].map(function (frac) {
          var y = padTop + (height - padTop - padBottom) * (1 - frac);
          return (
            <line key={frac} x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--line-soft)" strokeDasharray={frac === 0 ? '0' : '3 4'} />
          );
        })}
        {buckets.map(function (b, i) {
          var h = (height - padTop - padBottom) * (b.count / maxV);
          var x = padX + i * slotW + (slotW - barW) / 2;
          var y = (height - padBottom) - h;
          return (
            <g key={b.key}>
              {b.count > 0 && (
                <rect x={x} y={y} width={barW} height={h} rx={3} fill="var(--brown-700)" />
              )}
              <text x={padX + i * slotW + slotW / 2} y={height - padBottom + 18} fontSize="10.5" textAnchor="middle" fill="var(--muted)">
                {b.label}
              </text>
              <text x={padX + i * slotW + slotW / 2} y={y - 6} fontSize="11" fontWeight="600" textAnchor="middle" fill="var(--ink)">
                {b.count > 0 ? b.count : ''}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{t('admin.stats.growthYAxis')}</div>
    </div>
  );
}

// Popover de filtro genérico — fecha ao clicar fora ou apertar Esc.
// options = [{ key, label }], onChange recebe a key escolhida.
function AdminFilterPopover({ label, value, options, onChange }) {
  useLang();
  var [open, setOpen] = React.useState(false);
  var ref = React.useRef(null);
  React.useEffect(function () {
    if (!open) return;
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return function () {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  var active = options.find(function (o) { return o.key === value; }) || options[0];
  var isAll  = !value || value === 'todos' || value === 'all';
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="btn btn-secondary" onClick={function () { setOpen(function (o) { return !o; }); }}>
        <Ic.Settings s={14}/> {label}
        {!isAll && (
          <span className="badge badge-brown" style={{ padding: '2px 8px', fontSize: 11 }}>{active.label}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', left: 0, top: '110%', zIndex: 51,
          minWidth: 220, background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 12, boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          {options.map(function (opt) {
            return (
              <button
                key={opt.key}
                type="button"
                onClick={function () { onChange(opt.key); setOpen(false); }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 18px', alignItems: 'center',
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px',
                  background: value === opt.key ? 'var(--brown-50)' : 'transparent',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--line-soft)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--ink)', fontWeight: value === opt.key ? 600 : 500 }}>{opt.label}</span>
                {value === opt.key && <Ic.Check s={14}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Modal genérico para Ver/Editar do admin — backdrop click-to-close + X + header.
function AdminModalShell({ title, lede, onClose, children, footer, width }) {
  useLang();
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
        onClick={function (e) { e.stopPropagation(); }}
        className="card"
        style={{
          width: '100%', maxWidth: width || 520, padding: 28,
          background: 'var(--paper)', boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h3>
            {lede && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{lede}</div>
            )}
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label={t('common.close')} style={{ flexShrink: 0 }}>
            <Ic.Close s={16} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div style={{ marginTop: 18 }}>{footer}</div>}
      </div>
    </div>
  );
}

// Linha chave/valor usada nos modais "Ver detalhes" (read-only).
function AdminDetailRow({ label, value }) {
  return (
    <div className="m-kv" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '10px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 13.5 }}>
      <div style={{ color: 'var(--muted)' }}>{label}</div>
      <div style={{ color: 'var(--ink)', fontWeight: 500, wordBreak: 'break-word' }}>{value == null || value === '' ? '—' : value}</div>
    </div>
  );
}

function AdminDashboard({ go }) {
  useLang();
  var [users, setUsers]         = React.useState([]);
  var [companies, setCompanies] = React.useState([]);
  var [gestores, setGestores]   = React.useState([]);
  var [loading, setLoading]     = React.useState(true);

  React.useEffect(function () {
    Promise.all([
      window.fbGetAllUsers(500).catch(function () { return []; }),
      window.fbGetAllCompanies().catch(function () { return []; }),
      window.fbGetAllGestores().catch(function () { return []; }),
    ]).then(function (results) {
      setUsers(results[0] || []);
      setCompanies(results[1] || []);
      setGestores(results[2] || []);
      setLoading(false);
    });
  }, []);

  // Stats globais derivados
  const stats = React.useMemo(() => {
    const completed = users.filter(function (u) { return u.discCompleted; }).length;
    return {
      empresas: companies.length,
      gestores: gestores.length,
      usuarios: users.length,
      avaliacoes: completed,
    };
  }, [users, companies, gestores]);

  // Top 5 empresas por userCount
  const topCompanies = React.useMemo(() => {
    return companies
      .slice()
      .sort(function (a, b) { return (b.userCount || 0) - (a.userCount || 0); })
      .slice(0, 5);
  }, [companies]);

  // Distribuição DISC global (a partir de discMain dos usuários)
  const discDist = React.useMemo(() => {
    const buckets = { D: 0, I: 0, S: 0, C: 0 };
    users.forEach(function (u) { if (u.discMain && buckets.hasOwnProperty(u.discMain)) buckets[u.discMain] += 1; });
    const total = buckets.D + buckets.I + buckets.S + buckets.C;
    if (!total) return null;
    return {
      total: total,
      pct: { D: Math.round(buckets.D/total*100), I: Math.round(buckets.I/total*100), S: Math.round(buckets.S/total*100), C: Math.round(buckets.C/total*100) },
      main: ['D','I','S','C'].reduce(function (a, b) { return buckets[a] >= buckets[b] ? a : b; }),
    };
  }, [users]);

  // Distribuição por cargo (jobTitle)
  const roleDist = React.useMemo(() => {
    const counts = {};
    users.forEach(function (u) {
      const j = u.jobTitle && u.jobTitle.trim();
      if (!j) return;
      counts[j] = (counts[j] || 0) + 1;
    });
    const total = Object.values(counts).reduce(function (a, b) { return a + b; }, 0);
    if (!total) return [];
    return Object.entries(counts)
      .map(function (e) { return { role: e[0], n: e[1], pct: Math.round(e[1]/total*100) }; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 9);
  }, [users]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--brown-950), var(--brown-850))', color: 'var(--brown-50)', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(164,113,72,0.3), transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <div className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--brown-200)' }}>
            <Ic.Shield s={12}/> {t('admin.badge')}
          </div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.1 }}>
            {t('admin.heroTitle')}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--brown-200)', marginTop: 8, maxWidth: 520 }}>
            {t('admin.heroLede')}
          </p>

          <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 28 }}>
            <AdminStat label={t('admin.stat.companies')} value={loading ? '—' : String(stats.empresas)} />
            <AdminStat label={t('admin.stat.managers')}  value={loading ? '—' : String(stats.gestores)} />
            <AdminStat label={t('admin.stat.users')}     value={loading ? '—' : String(stats.usuarios)} />
            <AdminStat label={t('admin.stat.completed')} value={loading ? '—' : String(stats.avaliacoes)} />
          </div>
        </div>
      </div>

      {/* Distribuição DISC global */}
      <div className="card">
        <div className="card-title">{t('admin.discDist.title')}</div>
        <div className="card-sub">{discDist ? t('admin.discDist.sub', { n: discDist.total }) : t('admin.discDist.subEmpty')}</div>
        {!discDist ? (
          <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
            {t('admin.discDist.empty')}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut
              size={170} stroke={22}
              data={[
                { key: 'D', value: discDist.pct.D, color: 'var(--disc-d)' },
                { key: 'I', value: discDist.pct.I, color: 'var(--disc-i)' },
                { key: 'S', value: discDist.pct.S, color: 'var(--disc-s)' },
                { key: 'C', value: discDist.pct.C, color: 'var(--disc-c)' },
              ]}
              center={<><div className="letter" style={{ fontSize: 32 }}>{discDist.main}</div><div className="label">{t('admin.discDist.commonLabel')}</div></>}
            />
            <div className="legend" style={{ flex: 1 }}>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>{t('disc.D.label')}</span><span className="pct">{discDist.pct.D}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>{t('disc.I.label')}</span><span className="pct">{discDist.pct.I}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>{t('disc.S.label')}</span><span className="pct">{discDist.pct.S}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>{t('disc.C.label')}</span><span className="pct">{discDist.pct.C}%</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Companies & cargos */}
      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="card-title">{t('admin.topCompanies.title')}</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>{t('admin.topCompanies.sub')}</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => go('empresas')}>
              {t('admin.topCompanies.viewAll')} <Ic.Arrow s={12}/>
            </button>
          </div>
          <div className="m-rowgrid-wrap">
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>{t('admin.topCompanies.loading')}</div>
          ) : topCompanies.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>{t('admin.topCompanies.empty')}</div>
          ) : topCompanies.map(function (c, i) {
            const name = c.name || '—';
            return (
              <div key={c.id || i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 100px 60px', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < topCompanies.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.sector || t('admin.topCompanies.noSector')}</div>
                </div>
                <div>{c.sector ? <span className="badge badge-outline">{c.sector}</span> : <span style={{ color: 'var(--muted-soft)', fontSize: 11 }}>—</span>}</div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{c.userCount || 0}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>{t('admin.topCompanies.usersSuffix')}</span></div>
                <button className="icon-btn"><Ic.Arrow s={16}/></button>
              </div>
            );
          })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t('admin.roleDist.title')}</div>
          <div className="card-sub">{t('admin.roleDist.sub')}</div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>{t('admin.topCompanies.loading')}</div>
          ) : roleDist.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>{t('admin.roleDist.empty')}</div>
          ) : roleDist.map(function (r) {
            return (
              <div key={r.role} style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.role}</span>
                  <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{r.n} · {r.pct}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <span style={{ width: Math.min(r.pct, 100) + '%' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminStat({ label, value }) {
  return (
    <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em', color: 'var(--brown-50)' }}>{value}</div>
    </div>
  );
}


// helpers de transformação Firestore → shape de exibição (preservam id e doc raw para modais)
function userToRow(doc) {
  var levelMap = {
    aluno:  t('admin.userLevel.aluno'),
    gestor: t('admin.userLevel.gestor'),
    admin:  t('admin.userLevel.admin'),
  };
  // Qualquer atividade real (login = lastSeen, ou DISC concluído) marca como Ativo.
  // Sem atividade: respeita o estado do convite.
  var hasActivity = !!doc.lastSeen || !!doc.discCompleted;
  var status = hasActivity
    ? t('admin.userRow.status.active')
    : (doc.invited ? t('admin.userRow.status.invited') : t('admin.userRow.status.pending'));
  return {
    id:      doc.id,
    name:    doc.name    || '—',
    email:   doc.email   || '—',
    company: doc.companyName || doc.companyId || '—',
    role:    doc.jobTitle || '—',
    level:   levelMap[doc.role] || doc.role || '—',
    disc:    doc.discMain || '—',
    active:  fmtAdminDate(doc.lastSeen),
    status:  status,
    _doc:    doc,
  };
}

function companyToRow(doc) {
  return {
    id:        doc.id,
    name:      doc.name      || '—',
    sector:    doc.sector    || '—',
    users:     doc.userCount    || 0,
    managers:  doc.managerCount || 0,
    completed: doc.completedPct || 0,
    plan:      doc.plan || 'Starter',
    since:     doc.since || '—',
    _doc:      doc,
  };
}

function gestorToRow(doc) {
  var done = doc.teamCompletedCount || 0, total = doc.teamSize || 0;
  return {
    id:        doc.id,
    name:      doc.name        || '—',
    email:     doc.email       || '—',
    company:   doc.companyName || doc.companyId || '—',
    team:      total,
    completed: total ? done + '/' + total : '—',
    _doc:      doc,
  };
}

// ============ ADMIN — USUÁRIOS (visão geral) ============
function AdminUsuarios({ go }) {
  useLang();
  var [users, setUsers]       = React.useState([]);
  var [rawCounts, setRawCounts] = React.useState({ total: 0, aluno: 0, gestor: 0, admin: 0 });
  var [loading, setLoading]   = React.useState(true);
  var [showModal, setShowModal] = React.useState(false);
  var [query, setQuery]       = React.useState('');
  var [roleFilter, setRoleFilter]     = React.useState('todos');
  var [statusFilter, setStatusFilter] = React.useState('todos');
  var [verUser, setVerUser]     = React.useState(null);
  var [editUser, setEditUser]   = React.useState(null);

  function reload() {
    setLoading(true);
    return window.fbGetAllUsers(500).then(function(docs) {
      var counts = { total: docs.length, aluno: 0, gestor: 0, admin: 0 };
      docs.forEach(function (d) {
        if (counts.hasOwnProperty(d.role)) counts[d.role] += 1;
      });
      setRawCounts(counts);
      setUsers(docs.map(userToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  React.useEffect(function() { reload(); }, [window.getLang()]);

  function pctSub(n) {
    return rawCounts.total ? t('admin.users.mini.pct', { pct: Math.round(n / rawCounts.total * 100) }) : '—';
  }

  const filtered = React.useMemo(function () {
    var q = query.trim().toLowerCase();
    return users.filter(function (u) {
      var doc = u._doc || {};
      if (roleFilter !== 'todos' && doc.role !== roleFilter) return false;
      if (statusFilter !== 'todos') {
        var st = (doc.lastSeen || doc.discCompleted) ? 'done' : (doc.invited ? 'invited' : 'pending');
        if (st !== statusFilter) return false;
      }
      if (!q) return true;
      var name = (u.name || '').toLowerCase();
      var email = (u.email || '').toLowerCase();
      var company = (u.company || '').toLowerCase();
      return name.indexOf(q) !== -1 || email.indexOf(q) !== -1 || company.indexOf(q) !== -1;
    });
  }, [users, query, roleFilter, statusFilter]);

  function handleExportCsv() {
    downloadCsv('voratte-usuarios.csv', filtered, [
      { key: 'name',    label: t('admin.field.name') },
      { key: 'email',   label: t('admin.field.email') },
      { key: 'company', label: t('admin.field.company') },
      { key: 'role',    label: t('admin.field.jobTitle') },
      { key: 'level',   label: t('admin.field.role') },
      { key: 'disc',    label: t('admin.field.discMain') },
      { key: 'status',  label: t('admin.users.col.status') },
      { label: t('admin.field.createdAt'), format: function (r) { return fmtAdminDate(r._doc && r._doc.createdAt); } },
    ]);
  }

  const roleOptions = [
    { key: 'todos',  label: t('admin.filter.all') },
    { key: 'aluno',  label: t('admin.userLevel.aluno') },
    { key: 'gestor', label: t('admin.userLevel.gestor') },
    { key: 'admin',  label: t('admin.userLevel.admin') },
  ];
  const statusOptions = [
    { key: 'todos',   label: t('admin.filter.all') },
    { key: 'done',    label: t('admin.userRow.status.active') },
    { key: 'pending', label: t('admin.userRow.status.pending') },
    { key: 'invited', label: t('admin.userRow.status.invited') },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <input
              className="input"
              placeholder={t('admin.users.search')}
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <Ic.Search s={16}/>
            </div>
          </div>
          <AdminFilterPopover label={t('admin.filter.role')}   value={roleFilter}   options={roleOptions}   onChange={setRoleFilter} />
          <AdminFilterPopover label={t('admin.filter.status')} value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
          <button className="btn btn-ghost" onClick={handleExportCsv} disabled={!filtered.length}>
            <Ic.Download s={14}/> {t('admin.users.exportCsv')}
          </button>
        </div>
        <button className="btn btn-primary" onClick={function(){ setShowModal(true); }}><Ic.Plus s={14}/> {t('admin.users.invite')}</button>
      </div>
      {showModal && <CriarAlunoModal
        onClose={function(){ setShowModal(false); }}
        onCreated={function(){ reload(); }} />}
      {verUser && <VerUsuarioModal user={verUser} onClose={function(){ setVerUser(null); }} />}
      {editUser && <EditarUsuarioModal user={editUser} onClose={function(){ setEditUser(null); }} onSaved={reload} />}

      <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Mini2 label={t('admin.users.mini.total')}    value={loading ? '—' : String(rawCounts.total)}  sub={t('admin.users.mini.totalSub')} />
        <Mini2 label={t('admin.users.mini.alunos')}   value={loading ? '—' : String(rawCounts.aluno)}  sub={pctSub(rawCounts.aluno)} />
        <Mini2 label={t('admin.users.mini.gestores')} value={loading ? '—' : String(rawCounts.gestor)} sub={pctSub(rawCounts.gestor)} />
        <Mini2 label={t('admin.users.mini.admins')}   value={loading ? '—' : String(rawCounts.admin)}  sub={t('admin.users.mini.adminsSub')} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.users.loading')}</div>
        )}
        {!loading && users.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.users.empty')}</div>
        )}
        {!loading && users.length > 0 && filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.filter.noResults')}</div>
        )}
        {!loading && filtered.length > 0 && <div className="tbl-wrap"><table className="tbl">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>{t('admin.users.col.user')}</th>
            <th>{t('admin.users.col.company')}</th>
            <th>{t('admin.users.col.role')}</th>
            <th>{t('admin.users.col.level')}</th>
            <th>{t('admin.users.col.disc')}</th>
            <th>{t('admin.users.col.lastSeen')}</th>
            <th>{t('admin.users.col.status')}</th>
            <th style={{ paddingRight: 24, textAlign: 'right' }}>{t('common.actions')}</th>
          </tr></thead>
          <tbody>
            {filtered.map((u, i) => {
              const adminLabel = t('admin.userLevel.admin');
              const gestorLabel = t('admin.userLevel.gestor');
              const alunoLabel = t('admin.userLevel.aluno');
              const isAdmin = u.level === adminLabel;
              const isGestor = u.level === gestorLabel;
              const isAluno = u.level === alunoLabel;
              const activeStatus = t('admin.userRow.status.active');
              const pendingStatus = t('admin.userRow.status.pending');
              return (
                <tr key={u.id || i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.company}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className="badge" style={{
                      background: isAdmin ? 'var(--ink)' : isGestor ? 'var(--brown-700)' : 'var(--brown-50)',
                      color: isAluno ? 'var(--brown-700)' : 'var(--brown-50)',
                    }}>{u.level}</span>
                  </td>
                  <td>
                    {u.disc === '—' ? (
                      <span style={{ color: 'var(--muted-soft)' }}>—</span>
                    ) : (
                      <div className={'disc-tile disc-' + u.disc.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}>{u.disc}</div>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{u.active}</td>
                  <td>
                    <span style={{
                      fontSize: 11.5, fontWeight: 600,
                      color: u.status === activeStatus ? 'var(--brown-700)' : u.status === pendingStatus ? '#a87139' : 'var(--muted)',
                    }}>● {u.status}</span>
                  </td>
                  <td style={{ paddingRight: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="icon-btn" onClick={function(){ setVerUser(u); }} title={t('admin.ver.title')}><Ic.Eye s={16}/></button>
                      <ReenviarConviteButton user={u} />
                      <button className="icon-btn" onClick={function(){ setEditUser(u); }} title={t('admin.editar.title')}><Ic.More s={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
        <span>{t('admin.users.showing', { n: filtered.length })}</span>
      </div>
    </div>
  );
}

// ====== Modais Ver / Editar — Usuário ======
function VerUsuarioModal({ user, onClose }) {
  useLang();
  var doc = (user && user._doc) || {};
  var levelMap = {
    aluno:  t('admin.userLevel.aluno'),
    gestor: t('admin.userLevel.gestor'),
    admin:  t('admin.userLevel.admin'),
  };
  return (
    <AdminModalShell title={t('admin.ver.title')} onClose={onClose}>
      <AdminDetailRow label={t('admin.field.name')}          value={doc.name} />
      <AdminDetailRow label={t('admin.field.email')}         value={doc.email} />
      <AdminDetailRow label={t('admin.field.jobTitle')}      value={doc.jobTitle} />
      <AdminDetailRow label={t('admin.field.role')}          value={levelMap[doc.role] || doc.role} />
      <AdminDetailRow label={t('admin.field.company')}       value={doc.companyName || doc.companyId} />
      <AdminDetailRow label={t('admin.field.discMain')}      value={doc.discMain} />
      <AdminDetailRow label={t('admin.field.discCompleted')} value={doc.discCompleted ? t('admin.bool.yes') : t('admin.bool.no')} />
      <AdminDetailRow label={t('admin.field.createdAt')}     value={fmtAdminDate(doc.createdAt)} />
    </AdminModalShell>
  );
}

function EditarUsuarioModal({ user, onClose, onSaved }) {
  useLang();
  var doc = (user && user._doc) || {};
  var [name, setName]         = React.useState(doc.name || '');
  var [jobTitle, setJobTitle] = React.useState(doc.jobTitle || '');
  var [loading, setLoading]   = React.useState(false);
  var [error, setError]       = React.useState('');

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var trimmed = name.trim();
    if (!trimmed) { setError(t('admin.editar.nameRequired')); return; }
    setError('');
    setLoading(true);
    try {
      await window.fbUpdateUserProfile(doc.id, { name: trimmed, jobTitle: jobTitle.trim() });
      if (typeof onSaved === 'function') await onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError(t('admin.editar.error'));
      setLoading(false);
    }
  }

  return (
    <AdminModalShell title={t('admin.editar.title')} lede={t('admin.editar.readOnlyHint')} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <div className="field">
          <label>{t('admin.field.name')} <span style={{ color: 'var(--disc-d)' }}>*</span></label>
          <input className="input" type="text" autoFocus value={name} onChange={e => { setName(e.target.value); setError(''); }} />
        </div>
        <div className="field">
          <label>{t('admin.field.jobTitle')}</label>
          <input className="input" type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
        </div>

        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.email')}: <strong style={{ color: 'var(--ink)' }}>{doc.email || '—'}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.role')}: <strong style={{ color: 'var(--ink)' }}>{doc.role || '—'}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.company')}: <strong style={{ color: 'var(--ink)' }}>{doc.companyName || doc.companyId || '—'}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.discMain')}: <strong style={{ color: 'var(--ink)' }}>{doc.discMain || '—'}</strong></div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>{t('admin.editar.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? t('admin.editar.saving') : t('admin.editar.save')}
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

function Mini2({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// ============ ADMIN — EMPRESAS ============
function AdminEmpresas({ go }) {
  useLang();
  var [cos, setCos] = React.useState([]);
  var [loading, setLoading] = React.useState(true);
  var [showModal, setShowModal] = React.useState(false);
  var [query, setQuery]               = React.useState('');
  var [sectorFilter, setSectorFilter] = React.useState('todos');
  var [planFilter, setPlanFilter]     = React.useState('todos');
  var [verCo, setVerCo]   = React.useState(null);
  var [editCo, setEditCo] = React.useState(null);

  function reload() {
    setLoading(true);
    window.fbGetAllCompanies().then(function(docs) {
      setCos(docs.map(companyToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  React.useEffect(function() { reload(); }, []);

  const sectorOptions = React.useMemo(function () {
    var uniq = {};
    cos.forEach(function (c) { if (c.sector && c.sector !== '—') uniq[c.sector] = true; });
    return [{ key: 'todos', label: t('admin.filter.all') }].concat(
      Object.keys(uniq).sort().map(function (s) { return { key: s, label: s }; })
    );
  }, [cos, window.getLang()]);

  const planOptions = [
    { key: 'todos',      label: t('admin.filter.all') },
    { key: 'Starter',    label: 'Starter' },
    { key: 'Business',   label: 'Business' },
    { key: 'Enterprise', label: 'Enterprise' },
  ];

  const filtered = React.useMemo(function () {
    var q = query.trim().toLowerCase();
    return cos.filter(function (c) {
      if (sectorFilter !== 'todos' && c.sector !== sectorFilter) return false;
      if (planFilter   !== 'todos' && c.plan   !== planFilter)   return false;
      if (!q) return true;
      return (c.name || '').toLowerCase().indexOf(q) !== -1 ||
             (c.sector || '').toLowerCase().indexOf(q) !== -1;
    });
  }, [cos, query, sectorFilter, planFilter]);

  function handleExportCsv() {
    downloadCsv('voratte-empresas.csv', filtered, [
      { key: 'name',      label: t('admin.field.name') },
      { key: 'sector',    label: t('admin.field.sector') },
      { key: 'plan',      label: t('admin.field.plan') },
      { key: 'users',     label: t('admin.field.userCount') },
      { key: 'managers',  label: t('admin.field.managerCount') },
      { key: 'completed', label: t('admin.field.completedPct'), format: function (r) { return r.completed + '%'; } },
      { label: t('admin.field.createdAt'), format: function (r) { return fmtAdminDate(r._doc && r._doc.createdAt); } },
    ]);
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 280 }}>
            <input
              className="input"
              placeholder={t('admin.empresas.search')}
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><Ic.Search s={16}/></div>
          </div>
          <AdminFilterPopover label={t('admin.empresas.sector')} value={sectorFilter} options={sectorOptions} onChange={setSectorFilter} />
          <AdminFilterPopover label={t('admin.empresas.plan')}   value={planFilter}   options={planOptions}   onChange={setPlanFilter} />
          <button className="btn btn-ghost" onClick={handleExportCsv} disabled={!filtered.length}>
            <Ic.Download s={14}/> {t('admin.csv.companies')}
          </button>
        </div>
        <button className="btn btn-primary" onClick={function(){ setShowModal(true); }}><Ic.Plus s={14}/> {t('admin.empresas.new')}</button>
      </div>
      {showModal && <CriarEmpresaModal
        onClose={function(){ setShowModal(false); }}
        onCreated={function(){ reload(); }} />}
      {verCo && <VerEmpresaModal company={verCo} onClose={function(){ setVerCo(null); }} />}
      {editCo && <EditarEmpresaModal company={editCo} onClose={function(){ setEditCo(null); }} onSaved={reload} />}

      {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.empresas.loading')}</div>}
      {!loading && cos.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.empresas.empty')}</div>}
      {!loading && cos.length > 0 && filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.filter.noResults')}</div>}
      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {filtered.map((c, i) => (
          <div key={c.id || i} className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>
                {c.name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t('admin.empresas.clientSince', { sector: c.sector, since: c.since })}</div>
              </div>
              <span className="badge" style={{
                background: c.plan === 'Enterprise' ? 'var(--ink)' : c.plan === 'Business' ? 'var(--brown-700)' : 'var(--brown-50)',
                color: c.plan === 'Starter' ? 'var(--brown-700)' : 'var(--brown-50)',
                fontSize: 10,
              }}>{c.plan}</span>
            </div>

            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '12px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{t('admin.empresas.users')}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{c.users}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{t('admin.empresas.managers')}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{c.managers}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{t('admin.empresas.completedPct')}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{c.completed}%</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="progress" style={{ height: 6 }}>
                <span style={{ width: c.completed + '%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={function(){ setVerCo(c); }} style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}>
                <Ic.Eye s={12}/> {t('admin.empresas.details')}
              </button>
              <button className="btn btn-ghost" onClick={function(){ setEditCo(c); }} style={{ padding: '8px 10px' }} title={t('admin.editar.empresaTitle')}>
                <Ic.More s={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== Modais Ver / Editar — Empresa ======
function VerEmpresaModal({ company, onClose }) {
  useLang();
  var doc = (company && company._doc) || {};
  return (
    <AdminModalShell title={t('admin.ver.empresaTitle')} onClose={onClose}>
      <AdminDetailRow label={t('admin.field.name')}         value={doc.name} />
      <AdminDetailRow label={t('admin.field.sector')}       value={doc.sector} />
      <AdminDetailRow label={t('admin.field.plan')}         value={doc.plan} />
      <AdminDetailRow label={t('admin.field.cnpj')}         value={doc.cnpj} />
      <AdminDetailRow label={t('admin.field.phone')}        value={doc.phone} />
      <AdminDetailRow label={t('admin.field.website')}      value={doc.website} />
      <AdminDetailRow label={t('admin.field.userCount')}    value={doc.userCount} />
      <AdminDetailRow label={t('admin.field.managerCount')} value={doc.managerCount} />
      <AdminDetailRow label={t('admin.field.completedPct')} value={(doc.completedPct || 0) + '%'} />
      <AdminDetailRow label={t('admin.field.createdAt')}    value={fmtAdminDate(doc.createdAt)} />
    </AdminModalShell>
  );
}

function EditarEmpresaModal({ company, onClose, onSaved }) {
  useLang();
  var doc = (company && company._doc) || {};
  var [name, setName]       = React.useState(doc.name || '');
  var [sector, setSector]   = React.useState(doc.sector || '');
  var [plan, setPlan]       = React.useState(doc.plan || 'Starter');
  var [cnpj, setCnpj]       = React.useState(doc.cnpj || '');
  var [phone, setPhone]     = React.useState(doc.phone || '');
  var [website, setWebsite] = React.useState(doc.website || '');
  var [loading, setLoading] = React.useState(false);
  var [error, setError]     = React.useState('');

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var trimmed = name.trim();
    if (!trimmed) { setError(t('admin.editar.nameRequired')); return; }
    setError('');
    setLoading(true);
    try {
      await window.fbUpdateCompany(doc.id, {
        name:    trimmed,
        sector:  sector.trim(),
        plan:    plan,
        cnpj:    cnpj.trim(),
        phone:   phone.trim(),
        website: website.trim(),
      });
      if (typeof onSaved === 'function') await onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      setError(t('admin.editar.error'));
      setLoading(false);
    }
  }

  return (
    <AdminModalShell title={t('admin.editar.empresaTitle')} lede={t('admin.editar.readOnlyHint')} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        <div className="field">
          <label>{t('admin.field.name')} <span style={{ color: 'var(--disc-d)' }}>*</span></label>
          <input className="input" type="text" autoFocus value={name} onChange={e => { setName(e.target.value); setError(''); }} />
        </div>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>{t('admin.field.sector')}</label>
            <input className="input" type="text" value={sector} onChange={e => setSector(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('admin.field.plan')}</label>
            <select className="input" value={plan} onChange={e => setPlan(e.target.value)}>
              <option value="Starter">Starter</option>
              <option value="Business">Business</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t('admin.field.cnpj')}</label>
          <input className="input" type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} />
        </div>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>{t('admin.field.phone')}</label>
            <input className="input" type="text" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('admin.field.website')}</label>
            <input className="input" type="text" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>
        </div>

        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.userCount')}: <strong style={{ color: 'var(--ink)' }}>{doc.userCount || 0}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.managerCount')}: <strong style={{ color: 'var(--ink)' }}>{doc.managerCount || 0}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.completedPct')}: <strong style={{ color: 'var(--ink)' }}>{(doc.completedPct || 0) + '%'}</strong></div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>{t('admin.editar.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? t('admin.editar.saving') : t('admin.editar.save')}
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

// ============ ADMIN — GESTORES ============
function AdminGestores({ go }) {
  useLang();
  var [ms, setMs]             = React.useState([]);
  var [loading, setLoading]   = React.useState(true);
  var [showModal, setShowModal] = React.useState(false);
  var [query, setQuery]   = React.useState('');
  var [verG, setVerG]     = React.useState(null);
  var [editG, setEditG]   = React.useState(null);

  function reload() {
    setLoading(true);
    window.fbGetAllGestores().then(function(docs) {
      setMs(docs.map(gestorToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }

  React.useEffect(function() { reload(); }, []);

  const filtered = React.useMemo(function () {
    var q = query.trim().toLowerCase();
    if (!q) return ms;
    return ms.filter(function (m) {
      return (m.name || '').toLowerCase().indexOf(q) !== -1 ||
             (m.email || '').toLowerCase().indexOf(q) !== -1 ||
             (m.company || '').toLowerCase().indexOf(q) !== -1;
    });
  }, [ms, query]);

  function handleExportCsv() {
    downloadCsv('voratte-gestores.csv', filtered, [
      { key: 'name',      label: t('admin.field.name') },
      { key: 'email',     label: t('admin.field.email') },
      { key: 'company',   label: t('admin.field.company') },
      { key: 'team',      label: t('admin.field.teamSize') },
      { key: 'completed', label: t('admin.gestores.col.coverage') },
      { label: t('admin.field.jobTitle'), format: function (r) { return (r._doc && r._doc.jobTitle) || ''; } },
      { label: t('admin.field.createdAt'), format: function (r) { return fmtAdminDate(r._doc && r._doc.createdAt); } },
    ]);
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <input
              className="input"
              placeholder={t('admin.gestores.search')}
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><Ic.Search s={16}/></div>
          </div>
          <button className="btn btn-ghost" onClick={handleExportCsv} disabled={!filtered.length}>
            <Ic.Download s={14}/> {t('admin.csv.gestores')}
          </button>
        </div>
        <button className="btn btn-primary" onClick={function(){ setShowModal(true); }}><Ic.Plus s={14}/> {t('admin.gestores.promote')}</button>
      </div>
      {showModal && <CriarGestorModal
        onClose={function(){ setShowModal(false); }}
        onCreated={function(){ reload(); }} />}
      {verG && <VerGestorModal gestor={verG} onClose={function(){ setVerG(null); }} />}
      {editG && <EditarGestorModal gestor={editG} onClose={function(){ setEditG(null); }} onSaved={reload} />}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.gestores.loading')}</div>}
        {!loading && ms.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.gestores.empty')}</div>}
        {!loading && ms.length > 0 && filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{t('admin.filter.noResults')}</div>}
        {!loading && filtered.length > 0 && <div className="tbl-wrap"><table className="tbl">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>{t('admin.gestores.col.gestor')}</th>
            <th>{t('admin.gestores.col.company')}</th>
            <th>{t('admin.gestores.col.team')}</th>
            <th>{t('admin.gestores.col.coverage')}</th>
            <th>{t('admin.gestores.col.perms')}</th>
            <th style={{ paddingRight: 24, textAlign: 'right' }}>{t('common.actions')}</th>
          </tr></thead>
          <tbody>
            {filtered.map((m, i) => {
              var parts = typeof m.completed === 'string' ? m.completed.split('/').map(Number) : [0, 0];
              var done = parts[0] || 0, total = parts[1] || m.team || 0;
              var pct = total ? (done/total) * 100 : 0;
              return (
                <tr key={m.id || i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{m.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.company}</td>
                  <td>{t('admin.gestores.teamSuffix', { n: m.team })}</td>
                  <td style={{ minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress" style={{ flex: 1, height: 6 }}><span style={{ width: pct + '%' }}/></div>
                      <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{m.completed}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <span className="badge badge-outline" style={{ fontSize: 10 }}>{t('admin.gestores.perm.viewTeam')}</span>
                      <span className="badge badge-outline" style={{ fontSize: 10 }}>{t('admin.gestores.perm.reports')}</span>
                      <span className="badge badge-outline" style={{ fontSize: 10 }}>{t('admin.gestores.perm.export')}</span>
                    </div>
                  </td>
                  <td style={{ paddingRight: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="icon-btn" onClick={function(){ setVerG(m); }} title={t('admin.ver.gestorTitle')}><Ic.Eye s={16}/></button>
                      <button className="icon-btn" onClick={function(){ setEditG(m); }} title={t('admin.editar.gestorTitle')}><Ic.Settings s={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>}
      </div>
    </div>
  );
}

// ====== Modais Ver / Editar — Gestor ======
function VerGestorModal({ gestor, onClose }) {
  useLang();
  var doc = (gestor && gestor._doc) || {};
  return (
    <AdminModalShell title={t('admin.ver.gestorTitle')} onClose={onClose}>
      <AdminDetailRow label={t('admin.field.name')}       value={doc.name} />
      <AdminDetailRow label={t('admin.field.email')}      value={doc.email} />
      <AdminDetailRow label={t('admin.field.jobTitle')}   value={doc.jobTitle} />
      <AdminDetailRow label={t('admin.field.company')}    value={doc.companyName || doc.companyId} />
      <AdminDetailRow label={t('admin.field.teamSize')}   value={doc.teamSize || 0} />
      <AdminDetailRow label={t('admin.field.createdAt')}  value={fmtAdminDate(doc.createdAt)} />
    </AdminModalShell>
  );
}

function EditarGestorModal({ gestor, onClose, onSaved }) {
  useLang();
  var doc = (gestor && gestor._doc) || {};
  var [name, setName]         = React.useState(doc.name || '');
  var [jobTitle, setJobTitle] = React.useState(doc.jobTitle || '');
  var [loading, setLoading]   = React.useState(false);
  var [error, setError]       = React.useState('');

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var trimmed = name.trim();
    if (!trimmed) { setError(t('admin.editar.nameRequired')); return; }
    setError('');
    setLoading(true);
    try {
      await window.fbUpdateUserProfile(doc.id, { name: trimmed, jobTitle: jobTitle.trim() });
      if (typeof onSaved === 'function') await onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar gestor:', err);
      setError(t('admin.editar.error'));
      setLoading(false);
    }
  }

  return (
    <AdminModalShell title={t('admin.editar.gestorTitle')} lede={t('admin.editar.readOnlyHint')} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <div className="field">
          <label>{t('admin.field.name')} <span style={{ color: 'var(--disc-d)' }}>*</span></label>
          <input className="input" type="text" autoFocus value={name} onChange={e => { setName(e.target.value); setError(''); }} />
        </div>
        <div className="field">
          <label>{t('admin.field.jobTitle')}</label>
          <input className="input" type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
        </div>

        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.email')}: <strong style={{ color: 'var(--ink)' }}>{doc.email || '—'}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.company')}: <strong style={{ color: 'var(--ink)' }}>{doc.companyName || doc.companyId || '—'}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('admin.field.teamSize')}: <strong style={{ color: 'var(--ink)' }}>{doc.teamSize || 0}</strong></div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>{t('admin.editar.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? t('admin.editar.saving') : t('admin.editar.save')}
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

// ============ ADMIN — ESTATÍSTICAS ============
function AdminEstatisticas({ go }) {
  useLang();
  var [users, setUsers]         = React.useState([]);
  var [companies, setCompanies] = React.useState([]);
  var [loading, setLoading]     = React.useState(true);

  React.useEffect(function () {
    Promise.all([
      window.fbGetAllUsers(500).catch(function () { return []; }),
      window.fbGetAllCompanies().catch(function () { return []; }),
    ]).then(function (results) {
      setUsers(results[0] || []);
      setCompanies(results[1] || []);
      setLoading(false);
    });
  }, []);

  const completed = React.useMemo(function () {
    return users.filter(function (u) { return u.discCompleted; }).length;
  }, [users]);

  const completionRate = React.useMemo(function () {
    return users.length ? Math.round(completed / users.length * 100) + '%' : '—';
  }, [users, completed]);

  // Setores: agregação a partir do campo sector das empresas, ponderado por userCount
  const sectors = React.useMemo(function () {
    const counts = {};
    companies.forEach(function (c) {
      const s = c.sector && c.sector.trim();
      if (!s) return;
      counts[s] = (counts[s] || 0) + (c.userCount || 1);
    });
    const total = Object.values(counts).reduce(function (a, b) { return a + b; }, 0);
    if (!total) return [];
    return Object.entries(counts)
      .map(function (e) { return { name: e[0], pct: Math.round(e[1] / total * 100) }; })
      .sort(function (a, b) { return b.pct - a.pct; });
  }, [companies]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Mini2 label={t('admin.stats.discDone')}        value={loading ? '—' : String(completed)}        sub={loading ? '' : t('admin.stats.discDoneSub', { n: users.length })} />
        <Mini2 label={t('admin.stats.completionRate')}  value={loading ? '—' : completionRate}           sub={t('admin.stats.completionRateSub')} />
        <Mini2 label={t('admin.stats.companies')}       value={loading ? '—' : String(companies.length)} sub={t('admin.stats.companiesSub')} />
        <Mini2 label={t('admin.stats.avgTime')}         value="—"                                        sub={t('admin.stats.avgTimeSub')} />
      </div>

      <div className="card">
        <div className="card-title">{t('admin.stats.evalsTitle')}</div>
        <div className="card-sub">{t('admin.stats.evalsSub')}</div>
        <GrowthChart users={users} />
      </div>

      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">{t('admin.stats.sectorsTitle')}</div>
          <div className="card-sub">{t('admin.stats.sectorsSub')}</div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>{t('admin.topCompanies.loading')}</div>
          ) : sectors.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>{t('admin.stats.sectorsEmpty')}</div>
          ) : sectors.map(function (s) {
            return (
              <div key={s.name} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{s.pct}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}><span style={{ width: Math.min(s.pct * 4, 100) + '%' }}/></div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title">{t('admin.stats.crossTitle')}</div>
          <div className="card-sub">{t('admin.stats.crossSub')}</div>
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            {t('admin.stats.crossEmpty')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ADMIN — PERMISSÕES ============
function AdminPermissoes({ go }) {
  useLang();
  // Lista canônica de permissões por chave (ordenadas), independente do idioma
  const PERM_KEYS = [
    'disc', 'ownReports', 'exportPdf', 'cruzamento', 'plano',
    'viewTeam', 'compare', 'consReports',
    'manageUsers', 'manageComps', 'globalAcc',
  ];
  const roles = [
    {
      name:  t('admin.perms.role.aluno'),
      sub:   t('admin.perms.role.alunoSub'),
      perms: {
        disc: true, ownReports: true, exportPdf: true, cruzamento: true, plano: true,
        viewTeam: false, compare: false, consReports: false,
        manageUsers: false, manageComps: false, globalAcc: false,
      },
    },
    {
      name:  t('admin.perms.role.gestor'),
      sub:   t('admin.perms.role.gestorSub'),
      perms: {
        disc: true, ownReports: true, exportPdf: true, cruzamento: true, plano: true,
        viewTeam: true, compare: true, consReports: true,
        manageUsers: false, manageComps: false, globalAcc: false,
      },
    },
    {
      name:  t('admin.perms.role.admin'),
      sub:   t('admin.perms.role.adminSub'),
      perms: {
        disc: true, ownReports: true, exportPdf: true, cruzamento: true, plano: true,
        viewTeam: true, compare: true, consReports: true,
        manageUsers: true, manageComps: true, globalAcc: true,
      },
    },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="card">
        <div className="card-title">{t('admin.perms.title')}</div>
        <div className="card-sub">{t('admin.perms.sub')}</div>

        <div className="m-rowgrid-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 0 }}>
          <div />
          {roles.map(r => (
            <div key={r.name} style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{r.sub}</div>
            </div>
          ))}

          {PERM_KEYS.map((permKey) => (
            <React.Fragment key={permKey}>
              <div style={{ padding: '14px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 13.5, color: 'var(--ink-soft)' }}>{t('admin.perms.item.' + permKey)}</div>
              {roles.map(r => (
                <div key={r.name+permKey} style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center' }}>
                  {r.perms[permKey] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brown-700)', fontSize: 12, fontWeight: 600 }}>
                      <div style={{ width: 28, height: 16, borderRadius: 999, background: 'var(--brown-700)', position: 'relative' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white', position: 'absolute', right: 2, top: 2 }}/>
                      </div>
                      {t('common.yesPermitted')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-soft)', fontSize: 12 }}>
                      <div style={{ width: 28, height: 16, borderRadius: 999, background: 'var(--brown-100)', position: 'relative' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white', position: 'absolute', left: 2, top: 2 }}/>
                      </div>
                      {t('common.noBlocked')}
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

// ============ HELPERS DE MODAL ============
function ModalFrame({ children, onClose, width }) {
  return (
    <div
      className="m-modal-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div className="card"
        style={{ width: '100%', maxWidth: width || 480, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={function(e) { e.stopPropagation(); }}>
        {children}
      </div>
    </div>
  );
}

function ModalErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ fontSize: 12.5, color: '#b91c1c', marginBottom: 14,
                  padding: '10px 14px', background: '#fef2f2',
                  border: '1px solid #fecaca', borderRadius: 8 }}>
      {message}
    </div>
  );
}

function ModalSuccessIcon() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brown-50)',
                  color: 'var(--brown-700)', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      <Ic.Check s={24}/>
    </div>
  );
}

function JobTitleSelect({ value, onChange }) {
  var hasCustomValue = value && JOB_TITLE_OPTIONS.indexOf(value) === -1;
  return (
    <select className="input" value={value} onChange={onChange}>
      <option value="">{t('admin.modal.field.jobSelect')}</option>
      {hasCustomValue && <option value={value}>{value}</option>}
      {JOB_TITLE_OPTIONS.map(function (job) {
        return <option key={job} value={job}>{job}</option>;
      })}
    </select>
  );
}

// Botão de "Reenviar convite" na linha de cada usuário da tabela admin.
// A senha original não fica armazenada (só o Firebase Auth), então o reenvio dispara
// o email NATIVO do Firebase de redefinição de senha — o usuário recebe um link para
// definir uma nova e entrar. Também re-marca invited:true para refletir o reenvio.
function ReenviarConviteButton({ user }) {
  useLang();
  var [state, setState] = React.useState('idle'); // 'idle' | 'sending' | 'sent' | 'failed'
  var resetTimer = React.useRef(null);

  React.useEffect(function () {
    return function () { if (resetTimer.current) clearTimeout(resetTimer.current); };
  }, []);

  async function handleClick(e) {
    e.stopPropagation();
    if (state === 'sending' || !user || !user.email) return;
    setState('sending');
    try {
      await window.fbResetPassword(user.email);
      if (user.id && window.fbMarkInvited) {
        window.fbMarkInvited(user.id).catch(function () { /* best-effort */ });
      }
      setState('sent');
      resetTimer.current = setTimeout(function () { setState('idle'); }, 3000);
    } catch (err) {
      console.error('Reenvio falhou:', err);
      setState('failed');
      resetTimer.current = setTimeout(function () { setState('idle'); }, 3500);
    }
  }

  var color = state === 'sent' ? 'var(--brown-700)'
            : state === 'failed' ? '#b91c1c'
            : undefined;
  var title = state === 'sent'   ? t('admin.resend.sent')
            : state === 'failed' ? t('admin.resend.failed')
            : t('admin.resend.title');

  return (
    <button
      className="icon-btn"
      onClick={handleClick}
      disabled={state === 'sending'}
      title={title}
      style={color ? { color: color } : undefined}
    >
      <Ic.Mail s={16}/>
    </button>
  );
}

// Botão "Enviar convite por email" — usado no success state dos modais de gestor/aluno.
// Lê window.EMAILJS_CONFIG; se não configurado, mostra mensagem de aviso em vez de erro técnico.
function InviteEmailButton({ recipient }) {
  useLang();
  var [state, setState] = React.useState('idle'); // 'idle' | 'sending' | 'sent' | 'failed' | 'notConfigured'
  var [errorMsg, setErrorMsg] = React.useState('');

  async function handleSend() {
    if (!window.isEmailJSConfigured || !window.isEmailJSConfigured()) {
      setState('notConfigured');
      return;
    }
    setState('sending'); setErrorMsg('');
    try {
      await window.sendInviteEmail(recipient);
      if (recipient.uid && window.fbMarkInvited) {
        window.fbMarkInvited(recipient.uid);
      }
      setState('sent');
    } catch (err) {
      setErrorMsg((err && err.text) || (err && err.message) || String(err));
      setState('failed');
    }
  }

  if (state === 'sent') {
    return (
      <div style={{ fontSize: 12.5, color: 'var(--brown-700)', fontWeight: 600,
                    padding: '12px 14px', background: 'var(--brown-50)',
                    border: '1px solid var(--brown-100)', borderRadius: 8, textAlign: 'center' }}>
        {t('admin.invite.sent', { email: recipient.email })}
      </div>
    );
  }

  if (state === 'notConfigured') {
    return (
      <div style={{ fontSize: 12, color: '#92400e', padding: '10px 14px',
                    background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
        {t('admin.invite.notConfigured')}
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="btn btn-primary"
        style={{ width: '100%' }} onClick={handleSend} disabled={state === 'sending'}>
        <Ic.Mail s={14}/> {state === 'sending' ? t('admin.invite.sending') : t('admin.invite.button')}
      </button>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center', lineHeight: 1.4 }}>
        {t('admin.invite.hint')}
      </div>
      {state === 'failed' && (
        <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 8, textAlign: 'center' }}>
          {t('admin.invite.failed', { reason: errorMsg })}
        </div>
      )}
    </div>
  );
}

// ============ MODAL — CADASTRAR EMPRESA ============
function CriarEmpresaModal({ onClose, onCreated }) {
  useLang();
  var [form, setForm] = React.useState({
    name: '', sector: '', cnpj: '', phone: '', website: '', plan: 'Starter',
  });
  var [loading, setLoading] = React.useState(false);
  var [error, setError]     = React.useState('');
  var [success, setSuccess] = React.useState(false);

  function setField(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.sector || !form.cnpj || !form.phone || !form.website) {
      setError(t('admin.empresa.modal.errors.required'));
      return;
    }
    var digits = form.cnpj.replace(/\D/g, '');
    if (digits.length !== 14) {
      setError(t('admin.empresa.modal.errors.cnpj'));
      return;
    }
    setError(''); setLoading(true);
    try {
      var company = await window.fbCreateCompany({
        name:    form.name.trim(),
        sector:  form.sector.trim(),
        cnpj:    form.cnpj.trim(),
        phone:   form.phone.trim(),
        website: form.website.trim(),
        plan:    form.plan,
        since:   new Date().toISOString().slice(0, 10),
      });
      setSuccess(true);
      if (onCreated) onCreated(company);
    } catch (err) {
      setError(t('admin.empresa.modal.errors.generic'));
    } finally { setLoading(false); }
  }

  return (
    <ModalFrame onClose={onClose} width={520}>
      {success ? (
        <div style={{ textAlign: 'center' }}>
          <ModalSuccessIcon />
          <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>{t('admin.empresa.modal.successTitle')}</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}
             dangerouslySetInnerHTML={{ __html: t('admin.empresa.modal.successBody', { name: form.name }) }} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>{t('common.close')}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{t('admin.empresa.modal.title')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>{t('admin.empresa.modal.sub')}</div>

          <ModalErrorBox message={error} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>{t('admin.empresa.modal.field.name')}</label>
              <input className="input" type="text" value={form.name}
                onChange={function(e) { setField('name', e.target.value); }}
                placeholder={t('admin.empresa.modal.field.namePh')} autoFocus />
            </div>

            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>{t('admin.empresa.modal.field.sector')}</label>
                <input className="input" type="text" value={form.sector}
                  onChange={function(e) { setField('sector', e.target.value); }}
                  placeholder={t('admin.empresa.modal.field.sectorPh')} />
              </div>
              <div className="field">
                <label>{t('admin.empresa.modal.field.cnpj')}</label>
                <input className="input" type="text" value={form.cnpj}
                  onChange={function(e) { setField('cnpj', e.target.value); }}
                  placeholder={t('admin.empresa.modal.field.cnpjPh')} />
              </div>
            </div>

            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>{t('admin.empresa.modal.field.phone')}</label>
                <input className="input" type="tel" value={form.phone}
                  onChange={function(e) { setField('phone', e.target.value); }}
                  placeholder={t('admin.empresa.modal.field.phonePh')} />
              </div>
              <div className="field">
                <label>{t('admin.empresa.modal.field.website')}</label>
                <input className="input" type="text" value={form.website}
                  onChange={function(e) { setField('website', e.target.value); }}
                  placeholder={t('admin.empresa.modal.field.websitePh')} />
              </div>
            </div>

            <div className="field">
              <label>{t('admin.empresa.modal.field.plan')}</label>
              <select className="input" value={form.plan}
                onChange={function(e) { setField('plan', e.target.value); }}>
                <option value="Starter">Starter</option>
                <option value="Business">Business</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? t('admin.empresa.modal.creating') : t('admin.empresa.modal.create')}
            </button>
          </div>
        </form>
      )}
    </ModalFrame>
  );
}

// ============ MODAL — CADASTRAR GESTOR ============
function CriarGestorModal({ onClose, onCreated }) {
  useLang();
  var [companies, setCompanies] = React.useState([]);
  var [loadingCompanies, setLoadingCompanies] = React.useState(true);
  var [form, setForm] = React.useState({
    name: '', email: '', password: '', jobTitle: '', companyId: '',
  });
  var [loading, setLoading] = React.useState(false);
  var [error, setError]     = React.useState('');
  var [created, setCreated] = React.useState(null);

  React.useEffect(function() {
    window.fbGetAllCompanies().then(function(docs) {
      setCompanies(docs || []);
      setLoadingCompanies(false);
    }).catch(function() { setLoadingCompanies(false); });
  }, []);

  function setField(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.companyId) {
      setError(t('admin.gestor.modal.errors.required'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('admin.modal.errors.weak'));
      return;
    }
    var company = companies.find(function(c) { return c.id === form.companyId; });
    if (!company) {
      setError(t('admin.gestor.modal.errors.required'));
      return;
    }
    setError(''); setLoading(true);
    try {
      var uid = await window.fbCreateUser(form.email, form.password);
      await window.fbCreateUserDoc(uid, {
        name:        form.name.trim(),
        email:       form.email.trim(),
        role:        'gestor',
        jobTitle:    form.jobTitle.trim(),
        companyId:   company.id,
        companyName: company.name,
      });
      window.fbIncrementCompanyCounter(company.id, 'managerCount');
      setCreated({
        uid:         uid,
        name:        form.name.trim(),
        email:       form.email.trim(),
        password:    form.password,
        role:        'gestor',
        companyName: company.name,
      });
      if (onCreated) onCreated();
    } catch (err) {
      var msg = err.message || '';
      if (msg === 'EMAIL_EXISTS') setError(t('admin.modal.errors.exists'));
      else if (msg.indexOf('WEAK_PASSWORD') !== -1) setError(t('admin.modal.errors.weak'));
      else setError(t('admin.modal.errors.generic'));
    } finally { setLoading(false); }
  }

  return (
    <ModalFrame onClose={onClose} width={520}>
      {created ? (
        <div style={{ textAlign: 'center' }}>
          <ModalSuccessIcon />
          <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>{t('admin.gestor.modal.successTitle')}</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}
             dangerouslySetInnerHTML={{ __html: t('admin.gestor.modal.successBody', { name: created.name, company: created.companyName }) }} />
          <div style={{ marginBottom: 14 }}>
            <InviteEmailButton recipient={created} />
          </div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>{t('common.close')}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{t('admin.gestor.modal.title')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>{t('admin.gestor.modal.sub')}</div>

          <ModalErrorBox message={error} />

          {!loadingCompanies && companies.length === 0 && (
            <div style={{ fontSize: 12.5, color: '#92400e', padding: '10px 14px',
                          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 14 }}>
              {t('admin.gestor.modal.field.noCompanies')}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>{t('admin.modal.field.name')}</label>
              <input className="input" type="text" value={form.name}
                onChange={function(e) { setField('name', e.target.value); }}
                placeholder={t('admin.modal.field.namePh')} autoFocus />
            </div>

            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>{t('admin.modal.field.email')}</label>
                <input className="input" type="email" value={form.email}
                  onChange={function(e) { setField('email', e.target.value); }}
                  placeholder={t('admin.modal.field.emailPh')} />
              </div>
              <div className="field">
                <label>{t('admin.modal.field.password')}</label>
                <input className="input" type="password" value={form.password}
                  onChange={function(e) { setField('password', e.target.value); }}
                  placeholder={t('admin.modal.field.passwordPh')} />
              </div>
            </div>

            <div className="field">
              <label>{t('admin.modal.field.job')}</label>
              <JobTitleSelect value={form.jobTitle}
                onChange={function(e) { setField('jobTitle', e.target.value); }} />
            </div>

            <div className="field">
              <label>{t('admin.gestor.modal.field.company')}</label>
              <select className="input" value={form.companyId}
                onChange={function(e) { setField('companyId', e.target.value); }}
                disabled={loadingCompanies || companies.length === 0}>
                <option value="">{t('admin.gestor.modal.field.companyPh')}</option>
                {companies.map(function(c) {
                  return <option key={c.id} value={c.id}>{c.name}</option>;
                })}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
              disabled={loading || companies.length === 0}>
              {loading ? t('admin.gestor.modal.creating') : t('admin.gestor.modal.create')}
            </button>
          </div>
        </form>
      )}
    </ModalFrame>
  );
}

// ============ MODAL — CADASTRAR ALUNO ============
function CriarAlunoModal({ onClose, onCreated }) {
  useLang();
  var [companies, setCompanies] = React.useState([]);
  var [gestores, setGestores]   = React.useState([]);
  var [loadingCompanies, setLoadingCompanies] = React.useState(true);
  var [loadingGestores, setLoadingGestores]   = React.useState(false);
  var [form, setForm] = React.useState({
    name: '', email: '', password: '', jobTitle: '', companyId: '', gestorId: '',
  });
  var [loading, setLoading] = React.useState(false);
  var [error, setError]     = React.useState('');
  var [created, setCreated] = React.useState(null);

  React.useEffect(function() {
    window.fbGetAllCompanies().then(function(docs) {
      setCompanies(docs || []);
      setLoadingCompanies(false);
    }).catch(function() { setLoadingCompanies(false); });
  }, []);

  // Recarrega gestores sempre que mudar a empresa selecionada
  React.useEffect(function() {
    if (!form.companyId) {
      setGestores([]);
      return;
    }
    setLoadingGestores(true);
    setForm(function(f) { return Object.assign({}, f, { gestorId: '' }); });
    window.fbGetGestoresByCompany(form.companyId).then(function(docs) {
      setGestores(docs || []);
      setLoadingGestores(false);
    }).catch(function() { setLoadingGestores(false); });
  }, [form.companyId]);

  function setField(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(t('admin.aluno.modal.errors.required'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('admin.modal.errors.weak'));
      return;
    }
    // Empresa e gestor são opcionais
    var company = form.companyId ? companies.find(function(c) { return c.id === form.companyId; }) : null;
    var gestor  = form.gestorId ? gestores.find(function(g) { return g.id === form.gestorId; }) : null;
    setError(''); setLoading(true);
    try {
      var uid = await window.fbCreateUser(form.email, form.password);
      var userDoc = {
        name:        form.name.trim(),
        email:       form.email.trim(),
        role:        'aluno',
        jobTitle:    form.jobTitle.trim(),
      };
      if (company) {
        userDoc.companyId   = company.id;
        userDoc.companyName = company.name;
      }
      if (gestor) {
        userDoc.gestorId   = gestor.id;
        userDoc.gestorName = gestor.name;
      }
      await window.fbCreateUserDoc(uid, userDoc);
      if (company) window.fbIncrementCompanyCounter(company.id, 'userCount');
      if (gestor && window.fbIncrementUserCounter) window.fbIncrementUserCounter(gestor.id, 'teamSize');
      setCreated({
        uid:         uid,
        name:        form.name.trim(),
        email:       form.email.trim(),
        password:    form.password,
        role:        'aluno',
        companyName: company ? company.name : '',
        gestorName:  gestor ? gestor.name : '',
      });
      if (onCreated) onCreated();
    } catch (err) {
      var msg = err.message || '';
      if (msg === 'EMAIL_EXISTS') setError(t('admin.modal.errors.exists'));
      else if (msg.indexOf('WEAK_PASSWORD') !== -1) setError(t('admin.modal.errors.weak'));
      else setError(t('admin.modal.errors.generic'));
    } finally { setLoading(false); }
  }

  var emptyCompanies = !loadingCompanies && companies.length === 0;
  var emptyGestores  = !!form.companyId && !loadingGestores && gestores.length === 0;

  return (
    <ModalFrame onClose={onClose} width={520}>
      {created ? (
        <div style={{ textAlign: 'center' }}>
          <ModalSuccessIcon />
          <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>{t('admin.aluno.modal.successTitle')}</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}
             dangerouslySetInnerHTML={{ __html:
               created.companyName
                 ? (created.gestorName
                     ? t('admin.aluno.modal.successBody',        { name: created.name, company: created.companyName, gestor: created.gestorName })
                     : t('admin.aluno.modal.successBodyCompany', { name: created.name, company: created.companyName }))
                 : t('admin.aluno.modal.successBodyPlain',       { name: created.name }) }} />
          <div style={{ marginBottom: 14 }}>
            <InviteEmailButton recipient={created} />
          </div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>{t('common.close')}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{t('admin.aluno.modal.title')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>{t('admin.aluno.modal.sub')}</div>

          <ModalErrorBox message={error} />

          {emptyCompanies && (
            <div style={{ fontSize: 12.5, color: '#92400e', padding: '10px 14px',
                          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 14 }}>
              {t('admin.gestor.modal.field.noCompanies')}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>{t('admin.modal.field.name')}</label>
              <input className="input" type="text" value={form.name}
                onChange={function(e) { setField('name', e.target.value); }}
                placeholder={t('admin.modal.field.namePh')} autoFocus />
            </div>

            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>{t('admin.modal.field.email')}</label>
                <input className="input" type="email" value={form.email}
                  onChange={function(e) { setField('email', e.target.value); }}
                  placeholder={t('admin.modal.field.emailPh')} />
              </div>
              <div className="field">
                <label>{t('admin.modal.field.password')}</label>
                <input className="input" type="password" value={form.password}
                  onChange={function(e) { setField('password', e.target.value); }}
                  placeholder={t('admin.modal.field.passwordPh')} />
              </div>
            </div>

            <div className="field">
              <label>{t('admin.modal.field.job')}</label>
              <JobTitleSelect value={form.jobTitle}
                onChange={function(e) { setField('jobTitle', e.target.value); }} />
            </div>

            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>{t('admin.aluno.modal.field.company')}</label>
                <select className="input" value={form.companyId}
                  onChange={function(e) { setField('companyId', e.target.value); }}
                  disabled={loadingCompanies || emptyCompanies}>
                  <option value="">{t('admin.aluno.modal.field.companyPh')}</option>
                  {companies.map(function(c) {
                    return <option key={c.id} value={c.id}>{c.name}</option>;
                  })}
                </select>
              </div>
              <div className="field">
                <label>{t('admin.aluno.modal.field.gestor')}</label>
                <select className="input" value={form.gestorId}
                  onChange={function(e) { setField('gestorId', e.target.value); }}
                  disabled={!form.companyId || loadingGestores || emptyGestores}>
                  <option value="">{t('admin.aluno.modal.field.gestorPh')}</option>
                  {gestores.map(function(g) {
                    return <option key={g.id} value={g.id}>{g.name}</option>;
                  })}
                </select>
              </div>
            </div>

            {emptyGestores && (
              <div style={{ fontSize: 12, color: '#92400e', padding: '8px 12px',
                            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6 }}>
                {t('admin.aluno.modal.field.noGestor')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
              disabled={loading}>
              {loading ? t('admin.aluno.modal.creating') : t('admin.aluno.modal.create')}
            </button>
          </div>
        </form>
      )}
    </ModalFrame>
  );
}

window.AdminDashboard = AdminDashboard;
window.AdminUsuarios = AdminUsuarios;
window.AdminEmpresas = AdminEmpresas;
window.AdminGestores = AdminGestores;
window.AdminEstatisticas = AdminEstatisticas;
window.AdminPermissoes = AdminPermissoes;
