// ====================== ADMIN ======================
// O admin geral vê TUDO: todas as empresas, gestores, usuários, estatísticas globais.

function AdminDashboard({ go }) {
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
            <Ic.Shield s={12}/> Console de Administração · Vorätte
          </div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.1 }}>
            Visão global da plataforma
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--brown-200)', marginTop: 8, maxWidth: 520 }}>
            Acompanhe o uso da Vorätte em todas as empresas, gestores e profissionais conectados.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 28 }}>
            <AdminStat label="Empresas" value={loading ? '—' : String(stats.empresas)} />
            <AdminStat label="Gestores" value={loading ? '—' : String(stats.gestores)} />
            <AdminStat label="Usuários" value={loading ? '—' : String(stats.usuarios)} />
            <AdminStat label="Avaliações concluídas" value={loading ? '—' : String(stats.avaliacoes)} />
          </div>
        </div>
      </div>

      {/* Distribuição DISC global */}
      <div className="card">
        <div className="card-title">Distribuição DISC global</div>
        <div className="card-sub">Perfis predominantes · {discDist ? discDist.total + ' avaliações' : 'sem dados'}</div>
        {!discDist ? (
          <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
            Distribuição será exibida quando houver avaliações concluídas.
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
              center={<><div className="letter" style={{ fontSize: 32 }}>{discDist.main}</div><div className="label">+ comum</div></>}
            />
            <div className="legend" style={{ flex: 1 }}>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>Dominante</span><span className="pct">{discDist.pct.D}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>Influente</span><span className="pct">{discDist.pct.I}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>Estável</span><span className="pct">{discDist.pct.S}%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>Conforme</span><span className="pct">{discDist.pct.C}%</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Companies & cargos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="card-title">Empresas mais ativas</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Por número de usuários cadastrados</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => go('empresas')}>
              Ver todas <Ic.Arrow s={12}/>
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Carregando…</div>
          ) : topCompanies.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Nenhuma empresa cadastrada.</div>
          ) : topCompanies.map(function (c, i) {
            const name = c.name || '—';
            return (
              <div key={c.id || i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 100px 60px', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < topCompanies.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.sector || 'Setor não informado'}</div>
                </div>
                <div>{c.sector ? <span className="badge badge-outline">{c.sector}</span> : <span style={{ color: 'var(--muted-soft)', fontSize: 11 }}>—</span>}</div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{c.userCount || 0}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}> usuários</span></div>
                <button className="icon-btn"><Ic.Arrow s={16}/></button>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">Distribuição por cargo</div>
          <div className="card-sub">Onde estão os usuários da plataforma</div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Carregando…</div>
          ) : roleDist.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Distribuição será exibida quando houver usuários com cargo definido.</div>
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

// Gráfico de barras: avaliações DISC concluídas nos últimos 12 meses
function MonthlyBars({ series, max }) {
  const safeMax = max || 1;
  return (
    <div style={{ padding: '20px 4px 4px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8, alignItems: 'end', minHeight: 200 }}>
      {series.map(function (b, i) {
        const h = b.n === 0 ? 4 : Math.max(8, Math.round(b.n / safeMax * 150));
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, color: b.n > 0 ? 'var(--ink)' : 'transparent', fontWeight: 600, fontVariantNumeric: 'tabular-nums', minHeight: 14 }}>
              {b.n > 0 ? b.n : '·'}
            </div>
            <div style={{ width: '100%', height: h, background: b.n > 0 ? 'var(--brown-700)' : 'var(--brown-100)', borderRadius: 4, transition: 'height .3s' }} />
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// helpers de transformação Firestore → shape de exibição
function userToRow(doc) {
  var levelMap = { aluno: 'Aluno', gestor: 'Gestor', admin: 'Admin' };
  var status = doc.discCompleted ? 'Ativo' : (doc.invited ? 'Convidado' : 'Pendente');
  return {
    name:    doc.name    || '—',
    email:   doc.email   || '—',
    company: doc.companyName || doc.companyId || '—',
    role:    doc.jobTitle || '—',
    level:   levelMap[doc.role] || doc.role || '—',
    disc:    doc.discMain || '—',
    active:  doc.lastSeen ? '—' : '—',   // timestamp formatado: melhoria futura
    status:  status,
  };
}

function companyToRow(doc) {
  return {
    name:      doc.name      || '—',
    sector:    doc.sector    || '—',
    users:     doc.userCount    || 0,
    managers:  doc.managerCount || 0,
    completed: doc.completedPct || 0,
    plan:      doc.plan || 'Starter',
    since:     doc.since || '—',
  };
}

function gestorToRow(doc) {
  var [done, total] = [doc.teamCompletedCount || 0, doc.teamSize || 0];
  return {
    name:      doc.name        || '—',
    email:     doc.email       || '—',
    company:   doc.companyName || doc.companyId || '—',
    team:      total,
    completed: total ? done + '/' + total : '—',
  };
}

// ============ ADMIN — USUÁRIOS (visão geral) ============
function AdminUsuarios({ go }) {
  var [users, setUsers]       = React.useState([]);
  var [rawCounts, setRawCounts] = React.useState({ total: 0, aluno: 0, gestor: 0, admin: 0 });
  var [loading, setLoading]   = React.useState(true);
  var [showModal, setShowModal] = React.useState(false);

  React.useEffect(function() {
    window.fbGetAllUsers(500).then(function(docs) {
      var counts = { total: docs.length, aluno: 0, gestor: 0, admin: 0 };
      docs.forEach(function (d) {
        if (counts.hasOwnProperty(d.role)) counts[d.role] += 1;
      });
      setRawCounts(counts);
      setUsers(docs.map(userToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  function pctSub(n) {
    return rawCounts.total ? Math.round(n / rawCounts.total * 100) + '% do total' : '—';
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <input className="input" placeholder="Buscar usuário, e-mail, empresa..." style={{ paddingLeft: 38 }} />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <Ic.Search s={16}/>
            </div>
          </div>
          <button className="btn btn-secondary"><Ic.Settings s={14}/> Filtros</button>
          <button className="btn btn-ghost"><Ic.Download s={14}/> Exportar CSV</button>
        </div>
        <button className="btn btn-primary" onClick={function(){ setShowModal(true); }}><Ic.Plus s={14}/> Convidar usuário</button>
      </div>
      {showModal && <CriarUsuarioModal onClose={function(){ setShowModal(false); }} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Mini2 label="Total"           value={loading ? '—' : String(rawCounts.total)}  sub="todos os perfis" />
        <Mini2 label="Alunos"          value={loading ? '—' : String(rawCounts.aluno)}  sub={pctSub(rawCounts.aluno)} />
        <Mini2 label="Gestores"        value={loading ? '—' : String(rawCounts.gestor)} sub={pctSub(rawCounts.gestor)} />
        <Mini2 label="Administradores" value={loading ? '—' : String(rawCounts.admin)}  sub="acesso global" />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Carregando usuários…</div>
        )}
        {!loading && users.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Nenhum usuário encontrado no Firestore.</div>
        )}
        {!loading && users.length > 0 && <table className="tbl">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>Usuário</th>
            <th>Empresa</th>
            <th>Cargo</th>
            <th>Nível</th>
            <th>DISC</th>
            <th>Última atividade</th>
            <th>Status</th>
            <th style={{ paddingRight: 24, textAlign: 'right' }}>Ações</th>
          </tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
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
                    background: u.level === 'Admin' ? 'var(--ink)' : u.level === 'Gestor' ? 'var(--brown-700)' : 'var(--brown-50)',
                    color: u.level === 'Aluno' ? 'var(--brown-700)' : 'var(--brown-50)',
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
                    color: u.status === 'Ativo' ? 'var(--brown-700)' : u.status === 'Pendente' ? '#a87139' : 'var(--muted)',
                  }}>● {u.status}</span>
                </td>
                <td style={{ paddingRight: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    <button className="icon-btn"><Ic.Eye s={16}/></button>
                    <button className="icon-btn"><Ic.More s={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
        <span>Mostrando {users.length} usuários</span>
      </div>
    </div>
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
  var [cos, setCos] = React.useState([]);
  var [loading, setLoading] = React.useState(true);

  React.useEffect(function() {
    window.fbGetAllCompanies().then(function(docs) {
      setCos(docs.map(companyToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <input className="input" placeholder="Buscar empresa..." style={{ paddingLeft: 38 }} />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><Ic.Search s={16}/></div>
          </div>
          <button className="btn btn-secondary"><Ic.Settings s={14}/> Setor</button>
          <button className="btn btn-secondary"><Ic.Settings s={14}/> Plano</button>
        </div>
        <button className="btn btn-primary"><Ic.Plus s={14}/> Cadastrar empresa</button>
      </div>

      {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Carregando empresas…</div>}
      {!loading && cos.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Nenhuma empresa encontrada no Firestore.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {cos.map((c, i) => (
          <div key={i} className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>
                {c.name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.sector} · cliente desde {c.since}</div>
              </div>
              <span className="badge" style={{
                background: c.plan === 'Enterprise' ? 'var(--ink)' : c.plan === 'Business' ? 'var(--brown-700)' : 'var(--brown-50)',
                color: c.plan === 'Starter' ? 'var(--brown-700)' : 'var(--brown-50)',
                fontSize: 10,
              }}>{c.plan}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '12px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Usuários</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{c.users}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Gestores</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{c.managers}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Concluído</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{c.completed}%</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="progress" style={{ height: 6 }}>
                <span style={{ width: c.completed + '%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}><Ic.Eye s={12}/> Detalhes</button>
              <button className="btn btn-ghost" style={{ padding: '8px 10px' }}><Ic.More s={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ ADMIN — GESTORES ============
function AdminGestores({ go }) {
  var [ms, setMs]             = React.useState([]);
  var [loading, setLoading]   = React.useState(true);
  var [showModal, setShowModal] = React.useState(false);

  React.useEffect(function() {
    window.fbGetAllGestores().then(function(docs) {
      setMs(docs.map(gestorToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 320 }}>
          <input className="input" placeholder="Buscar gestor..." style={{ paddingLeft: 38 }} />
          <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><Ic.Search s={16}/></div>
        </div>
        <button className="btn btn-primary" onClick={function(){ setShowModal(true); }}><Ic.Plus s={14}/> Promover usuário a gestor</button>
      </div>
      {showModal && <CriarUsuarioModal defaultRole="gestor" onClose={function(){ setShowModal(false); }} />}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Carregando gestores…</div>}
        {!loading && ms.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Nenhum gestor encontrado no Firestore.</div>}
        {!loading && ms.length > 0 && <table className="tbl">
          <thead><tr>
            <th style={{ paddingLeft: 24 }}>Gestor</th><th>Empresa</th><th>Equipe</th><th>Cobertura DISC</th><th>Permissões</th><th style={{ paddingRight: 24, textAlign: 'right' }}>Ações</th>
          </tr></thead>
          <tbody>
            {ms.map((m, i) => {
              var parts = typeof m.completed === 'string' ? m.completed.split('/').map(Number) : [0, 0];
              var done = parts[0] || 0, total = parts[1] || m.team || 0;
              var pct = total ? (done/total) * 100 : 0;
              return (
                <tr key={i}>
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
                  <td>{m.team} colaboradores</td>
                  <td style={{ minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress" style={{ flex: 1, height: 6 }}><span style={{ width: pct + '%' }}/></div>
                      <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{m.completed}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <span className="badge badge-outline" style={{ fontSize: 10 }}>Ver equipe</span>
                      <span className="badge badge-outline" style={{ fontSize: 10 }}>Relatórios</span>
                      <span className="badge badge-outline" style={{ fontSize: 10 }}>Exportar</span>
                    </div>
                  </td>
                  <td style={{ paddingRight: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="icon-btn"><Ic.Eye s={16}/></button>
                      <button className="icon-btn"><Ic.Settings s={16}/></button>
                      <button className="icon-btn"><Ic.More s={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>}
      </div>
    </div>
  );
}

// ============ ADMIN — ESTATÍSTICAS ============
const MES_LABELS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function AdminEstatisticas({ go }) {
  var [users, setUsers]               = React.useState([]);
  var [companies, setCompanies]       = React.useState([]);
  var [discResults, setDiscResults]   = React.useState([]);
  var [loading, setLoading]           = React.useState(true);

  React.useEffect(function () {
    Promise.all([
      window.fbGetAllUsers(500).catch(function () { return []; }),
      window.fbGetAllCompanies().catch(function () { return []; }),
      window.fbGetAllDiscResults ? window.fbGetAllDiscResults(500).catch(function () { return []; }) : Promise.resolve([]),
    ]).then(function (results) {
      setUsers(results[0] || []);
      setCompanies(results[1] || []);
      setDiscResults(results[2] || []);
      setLoading(false);
    });
  }, []);

  const completed = React.useMemo(function () {
    return users.filter(function (u) { return u.discCompleted; }).length;
  }, [users]);

  const completionRate = React.useMemo(function () {
    return users.length ? Math.round(completed / users.length * 100) + '%' : '—';
  }, [users, completed]);

  // Perfil de comprador mais frequente (substitui o antigo "Tempo médio")
  const topBuyer = React.useMemo(function () {
    const counts = {};
    discResults.forEach(function (r) {
      const c = r.code || r.main;
      if (!c) return;
      counts[c] = (counts[c] || 0) + 1;
    });
    const entries = Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; });
    if (!entries.length) return null;
    const top = entries[0];
    const profile = window.BUYER_PROFILES && window.BUYER_PROFILES[top[0]];
    return { code: top[0], n: top[1], label: profile ? profile.shortLabel : top[0] };
  }, [discResults]);

  // Série mensal: últimos 12 meses, contagem de DISCs concluídos por mês
  const monthlySeries = React.useMemo(function () {
    const now = new Date();
    const buckets = [];
    const idx = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + '-' + d.getMonth();
      buckets.push({ key: key, label: MES_LABELS[d.getMonth()], n: 0 });
      idx[key] = buckets.length - 1;
    }
    discResults.forEach(function (r) {
      if (!r.completedAt) return;
      try {
        const d = r.completedAt.toDate ? r.completedAt.toDate() : new Date(r.completedAt);
        const key = d.getFullYear() + '-' + d.getMonth();
        if (idx[key] != null) buckets[idx[key]].n += 1;
      } catch (e) {}
    });
    return buckets;
  }, [discResults]);

  const maxMonthly = React.useMemo(function () {
    return monthlySeries.reduce(function (m, b) { return Math.max(m, b.n); }, 0);
  }, [monthlySeries]);

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

  // Fallback: top empresas por número de usuários cadastrados (deriva de users[].companyName)
  const topCompaniesByUser = React.useMemo(function () {
    if (sectors.length > 0) return [];
    const counts = {};
    users.forEach(function (u) {
      const name = (u.companyName || '').trim();
      if (!name) return;
      counts[name] = (counts[name] || 0) + 1;
    });
    const entries = Object.entries(counts);
    if (!entries.length) return [];
    const maxN = entries.reduce(function (m, e) { return Math.max(m, e[1]); }, 1);
    return entries
      .map(function (e) { return { name: e[0], n: e[1], pct: Math.round(e[1] / maxN * 100) }; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 6);
  }, [users, sectors]);

  // Cruzamento DISC × Cargo: top jobTitles com distribuição empilhada D/I/S/C
  const discByRole = React.useMemo(function () {
    const groups = {};
    users.forEach(function (u) {
      const j = u.jobTitle && u.jobTitle.trim();
      const m = u.discMain;
      if (!j || !m || 'DISC'.indexOf(m) < 0) return;
      if (!groups[j]) groups[j] = { D: 0, I: 0, S: 0, C: 0, total: 0 };
      groups[j][m] += 1;
      groups[j].total += 1;
    });
    return Object.entries(groups)
      .map(function (e) {
        const g = e[1];
        return {
          role: e[0], total: g.total,
          d: Math.round(g.D / g.total * 100),
          i: Math.round(g.I / g.total * 100),
          s: Math.round(g.S / g.total * 100),
          c: Math.round(g.C / g.total * 100),
        };
      })
      .sort(function (a, b) { return b.total - a.total; })
      .slice(0, 6);
  }, [users]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Mini2 label="DISC concluídos"     value={loading ? '—' : String(completed)} sub={loading ? '' : 'de ' + users.length + ' usuários'} />
        <Mini2 label="Taxa de conclusão"   value={loading ? '—' : completionRate}    sub="usuários que completaram" />
        <Mini2 label="Empresas"            value={loading ? '—' : String(companies.length)} sub="cadastradas na plataforma" />
        <Mini2 label="Perfil mais comum"   value={loading ? '—' : (topBuyer ? topBuyer.code : '—')} sub={loading ? '' : (topBuyer ? topBuyer.label + ' · ' + topBuyer.n + ' avaliações' : 'sem dados ainda')} />
      </div>

      <div className="card">
        <div className="card-title">Avaliações por mês · 12 meses</div>
        <div className="card-sub">Volume de DISC concluídos na plataforma</div>
        {loading ? (
          <div style={{ padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>Carregando…</div>
        ) : maxMonthly === 0 ? (
          <div style={{ padding: '32px 0', color: 'var(--muted)', fontSize: 13, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 10 }}>
            Volume mensal será exibido quando houver DISCs concluídos no período.
          </div>
        ) : (
          <MonthlyBars series={monthlySeries} max={maxMonthly} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Setores mais ativos</div>
          <div className="card-sub">{sectors.length > 0 ? 'Distribuição de usuários por setor' : (topCompaniesByUser.length > 0 ? 'Top empresas por usuários cadastrados' : 'Distribuição de usuários')}</div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Carregando…</div>
          ) : sectors.length > 0 ? sectors.map(function (s) {
            return (
              <div key={s.name} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{s.pct}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}><span style={{ width: Math.min(s.pct * 4, 100) + '%' }}/></div>
              </div>
            );
          }) : topCompaniesByUser.length > 0 ? topCompaniesByUser.map(function (c) {
            return (
              <div key={c.name} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{c.n} usuários</span>
                </div>
                <div className="progress" style={{ height: 6 }}><span style={{ width: c.pct + '%' }}/></div>
              </div>
            );
          }) : (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Cadastre setores nas empresas ou associe usuários a empresas para ver a distribuição.</div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Cruzamento DISC × Cargo</div>
          <div className="card-sub">Perfis dominantes nos cargos com avaliações</div>
          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Carregando…</div>
          ) : discByRole.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Cruzamento será exibido quando houver cargos preenchidos com DISC concluído.</div>
          ) : discByRole.map(function (r) {
            return (
              <div key={r.role} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{r.role}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{r.total} {r.total === 1 ? 'avaliação' : 'avaliações'}</span>
                </div>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'var(--brown-50)' }}>
                  {r.d > 0 && <div style={{ width: r.d + '%', background: 'var(--disc-d)' }} title={'D ' + r.d + '%'} />}
                  {r.i > 0 && <div style={{ width: r.i + '%', background: 'var(--disc-i)' }} title={'I ' + r.i + '%'} />}
                  {r.s > 0 && <div style={{ width: r.s + '%', background: 'var(--disc-s)' }} title={'S ' + r.s + '%'} />}
                  {r.c > 0 && <div style={{ width: r.c + '%', background: 'var(--disc-c)' }} title={'C ' + r.c + '%'} />}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 5, fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--disc-d)', marginRight: 4, verticalAlign: 'middle' }}/>D {r.d}%</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--disc-i)', marginRight: 4, verticalAlign: 'middle' }}/>I {r.i}%</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--disc-s)', marginRight: 4, verticalAlign: 'middle' }}/>S {r.s}%</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--disc-c)', marginRight: 4, verticalAlign: 'middle' }}/>C {r.c}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ ADMIN — PERMISSÕES ============
function AdminPermissoes({ go }) {
  const roles = [
    {
      name: 'Aluno',
      sub: 'Acesso ao próprio teste DISC e relatórios pessoais',
      perms: {
        'Responder DISC': true, 'Ver próprios relatórios': true, 'Exportar PDF próprio': true,
        'Cruzamento de perfis': true, 'Plano de desenvolvimento': true,
        'Ver equipe': false, 'Comparar colaboradores': false, 'Relatórios consolidados': false,
        'Gerenciar usuários': false, 'Gerenciar empresas': false, 'Acesso global': false,
      },
    },
    {
      name: 'Gestor',
      sub: 'Acesso aos colaboradores da sua equipe',
      perms: {
        'Responder DISC': true, 'Ver próprios relatórios': true, 'Exportar PDF próprio': true,
        'Cruzamento de perfis': true, 'Plano de desenvolvimento': true,
        'Ver equipe': true, 'Comparar colaboradores': true, 'Relatórios consolidados': true,
        'Gerenciar usuários': false, 'Gerenciar empresas': false, 'Acesso global': false,
      },
    },
    {
      name: 'Administrador',
      sub: 'Acesso global a usuários, empresas e configurações',
      perms: {
        'Responder DISC': true, 'Ver próprios relatórios': true, 'Exportar PDF próprio': true,
        'Cruzamento de perfis': true, 'Plano de desenvolvimento': true,
        'Ver equipe': true, 'Comparar colaboradores': true, 'Relatórios consolidados': true,
        'Gerenciar usuários': true, 'Gerenciar empresas': true, 'Acesso global': true,
      },
    },
  ];
  const allPerms = Object.keys(roles[0].perms);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="card">
        <div className="card-title">Matriz de permissões</div>
        <div className="card-sub">Configure o que cada nível de acesso pode fazer na plataforma</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 0 }}>
          <div />
          {roles.map(r => (
            <div key={r.name} style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{r.sub}</div>
            </div>
          ))}

          {allPerms.map((perm, i) => (
            <React.Fragment key={perm}>
              <div style={{ padding: '14px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 13.5, color: 'var(--ink-soft)' }}>{perm}</div>
              {roles.map(r => (
                <div key={r.name+perm} style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center' }}>
                  {r.perms[perm] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brown-700)', fontSize: 12, fontWeight: 600 }}>
                      <div style={{ width: 28, height: 16, borderRadius: 999, background: 'var(--brown-700)', position: 'relative' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white', position: 'absolute', right: 2, top: 2 }}/>
                      </div>
                      Permitido
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-soft)', fontSize: 12 }}>
                      <div style={{ width: 28, height: 16, borderRadius: 999, background: 'var(--brown-100)', position: 'relative' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white', position: 'absolute', left: 2, top: 2 }}/>
                      </div>
                      Bloqueado
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MODAL — CRIAR USUÁRIO (somente admin) ============
function CriarUsuarioModal({ onClose, defaultRole }) {
  var [form, setForm] = React.useState({
    name: '', email: '', password: '', jobTitle: '', companyName: '',
    role: defaultRole || 'aluno',
  });
  var [loading, setLoading] = React.useState(false);
  var [error, setError]     = React.useState('');
  var [success, setSuccess] = React.useState(false);

  function setField(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Nome, e-mail e senha são obrigatórios.');
      return;
    }
    setError(''); setLoading(true);
    try {
      var uid = await window.fbCreateUser(form.email, form.password);
      await window.fbCreateUserDoc(uid, {
        name: form.name, email: form.email,
        jobTitle: form.jobTitle, companyName: form.companyName, role: form.role,
      });
      setSuccess(true);
    } catch(err) {
      var msg = err.message || 'Erro ao criar usuário.';
      if (msg === 'EMAIL_EXISTS') msg = 'Este e-mail já está cadastrado.';
      if (msg.indexOf('WEAK_PASSWORD') !== -1) msg = 'A senha deve ter pelo menos 6 caracteres.';
      setError(msg);
    } finally { setLoading(false); }
  }

  var roleLabels = { aluno: 'Aluno', gestor: 'Gestor', admin: 'Admin' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32 }}
           onClick={function(e) { e.stopPropagation(); }}>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brown-50)',
                          color: 'var(--brown-700)', display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ic.Check s={24}/>
            </div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>Usuário criado!</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
              <strong>{form.name}</strong> foi cadastrado como <strong>{roleLabels[form.role]}</strong> e já pode fazer login.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>Criar usuário</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>
              Preencha os dados para criar uma nova conta na plataforma.
            </div>

            {error && (
              <div style={{ fontSize: 12.5, color: '#b91c1c', marginBottom: 14,
                            padding: '10px 14px', background: '#fef2f2',
                            border: '1px solid #fecaca', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label>Nome completo *</label>
                <input className="input" type="text" value={form.name}
                  onChange={function(e) { setField('name', e.target.value); }}
                  placeholder="Ex: Ana Paula Souza" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>E-mail *</label>
                  <input className="input" type="email" value={form.email}
                    onChange={function(e) { setField('email', e.target.value); }}
                    placeholder="email@empresa.com" />
                </div>
                <div className="field">
                  <label>Senha *</label>
                  <input className="input" type="password" value={form.password}
                    onChange={function(e) { setField('password', e.target.value); }}
                    placeholder="Mínimo 6 caracteres" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Cargo profissional</label>
                  <input className="input" type="text" value={form.jobTitle}
                    onChange={function(e) { setField('jobTitle', e.target.value); }}
                    placeholder="Ex: Comprador Sênior" />
                </div>
                <div className="field">
                  <label>Empresa</label>
                  <input className="input" type="text" value={form.companyName}
                    onChange={function(e) { setField('companyName', e.target.value); }}
                    placeholder="Nome da empresa" />
                </div>
              </div>

              <div className="field">
                <label>Papel na plataforma</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['aluno', 'gestor', 'admin'].map(function(r) {
                    return (
                      <button key={r} type="button"
                        onClick={function() { setField('role', r); }}
                        className={'btn ' + (form.role === r ? 'btn-primary' : 'btn-secondary')}
                        style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
                      >
                        {roleLabels[r]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Criando…' : 'Criar usuário'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
window.AdminUsuarios = AdminUsuarios;
window.AdminEmpresas = AdminEmpresas;
window.AdminGestores = AdminGestores;
window.AdminEstatisticas = AdminEstatisticas;
window.AdminPermissoes = AdminPermissoes;
