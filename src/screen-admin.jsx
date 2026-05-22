// ====================== ADMIN ======================
// O admin geral vê TUDO: todas as empresas, gestores, usuários, estatísticas globais.

function AdminDashboard({ go }) {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--brown-950), var(--brown-850))', color: 'var(--brown-50)', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(164,113,72,0.3), transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <div className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--brown-200)' }}>
            <Ic.Shield s={12}/> Console de Administração · Voratte v2.6
          </div>
          <h2 className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.1 }}>
            Visão global da plataforma
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--brown-200)', marginTop: 8, maxWidth: 520 }}>
            Acompanhe o uso da Voratte em todas as empresas, gestores e profissionais conectados.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginTop: 28 }}>
            <AdminStat label="Empresas" value="147" delta="+8 no mês" />
            <AdminStat label="Gestores" value="384" delta="+22 no mês" />
            <AdminStat label="Usuários ativos" value="2 814" delta="+184 no mês" />
            <AdminStat label="Avaliações concluídas" value="11 562" delta="+612 no mês" />
            <AdminStat label="Relatórios gerados" value="38 904" delta="+2.1k no mês" />
          </div>
        </div>
      </div>

      {/* charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>

        {/* Growth chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div className="card-title">Crescimento da plataforma</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Usuários ativos · últimos 12 meses</div>
            </div>
            <div className="tabs">
              <button className="tab active">12m</button>
              <button className="tab">6m</button>
              <button className="tab">30d</button>
            </div>
          </div>

          <GrowthChart />
        </div>

        {/* Global DISC distribution */}
        <div className="card">
          <div className="card-title">Distribuição DISC global</div>
          <div className="card-sub">Perfis predominantes · 11.562 avaliações</div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut
              size={170} stroke={22}
              data={[
                { key: 'D', value: 28, color: 'var(--disc-d)' },
                { key: 'I', value: 31, color: 'var(--disc-i)' },
                { key: 'S', value: 22, color: 'var(--disc-s)' },
                { key: 'C', value: 19, color: 'var(--disc-c)' },
              ]}
              center={<><div className="letter" style={{ fontSize: 32 }}>I</div><div className="label">+ comum</div></>}
            />
            <div className="legend" style={{ flex: 1 }}>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>Dominante</span><span className="pct">28%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>Influente</span><span className="pct">31%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>Estável</span><span className="pct">22%</span></div>
              <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>Conforme</span><span className="pct">19%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies & cargos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="card-title">Empresas mais ativas</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Por volume de avaliações no mês</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => go('empresas')}>
              Ver todas <Ic.Arrow s={12}/>
            </button>
          </div>
          {[
            ['ABC Indústria S.A.',     'Manufatura',         184, 'Beatriz Almeida'],
            ['Norvel Logística',       'Logística',          142, 'Carlos Souza'],
            ['Petromine Energias',     'Energia',            128, 'Marina Tellez'],
            ['Casa Lume Varejo',       'Varejo',              98, 'Roberto Tang'],
            ['Olivar Alimentos',       'Alimentos',           76, 'Patricia Nunes'],
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 100px 60px', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--line-soft)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                {r[0].slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r[0]}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Gestor principal: {r[3]}</div>
              </div>
              <div><span className="badge badge-outline">{r[1]}</span></div>
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r[2]}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}> usuários</span></div>
              <button className="icon-btn"><Ic.Arrow s={16}/></button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Distribuição por cargo</div>
          <div className="card-sub">Onde estão os usuários da plataforma</div>
          {[
            ['Comprador Pleno',       18, 506],
            ['Comprador Sênior',      16, 450],
            ['Comprador Júnior',      14, 394],
            ['Coordenador',           12, 338],
            ['Especialista',          11, 309],
            ['Gerente de Compras',    10, 281],
            ['Supervisor',             8, 225],
            ['Assistente',             7, 197],
            ['Diretor',                4, 114],
          ].map(([role, pct, n]) => (
            <div key={role} style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{role}</span>
                <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{n} · {pct}%</span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <span style={{ width: (pct * 5) + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminStat({ label, value, delta }) {
  return (
    <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em', color: 'var(--brown-50)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--brown-300)', marginTop: 4, fontWeight: 600 }}>{delta}</div>
    </div>
  );
}

// Simple SVG line chart for global growth
function GrowthChart() {
  const pts = [820, 880, 940, 1020, 1180, 1280, 1390, 1540, 1720, 1980, 2480, 2814];
  const months = ['jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai'];
  const W = 620, H = 220, P = 30;
  const max = Math.max(...pts), min = Math.min(...pts);
  const xStep = (W - 2*P) / (pts.length - 1);
  const yFor = v => H - P - ((v - min) / (max - min)) * (H - 2*P);
  const path = pts.map((v, i) => (i ? 'L' : 'M') + (P + i*xStep) + ',' + yFor(v)).join(' ');
  const area = path + ` L ${P + (pts.length-1)*xStep},${H-P} L ${P},${H-P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139,90,43,0.32)"/>
          <stop offset="100%" stopColor="rgba(139,90,43,0)"/>
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={P} x2={W-P} y1={P + t*(H-2*P)} y2={P + t*(H-2*P)} stroke="#f3ecdf" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#g)" />
      <path d={path} fill="none" stroke="var(--brown-700)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((v, i) => (
        <circle key={i} cx={P + i*xStep} cy={yFor(v)} r={i === pts.length-1 ? 5 : 3} fill="var(--brown-700)" stroke="var(--paper)" strokeWidth="2" />
      ))}
      {months.map((m, i) => (
        <text key={i} x={P + i*xStep} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--muted)" fontFamily="Manrope">{m}</text>
      ))}
    </svg>
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
  var [loading, setLoading]   = React.useState(true);
  var [showModal, setShowModal] = React.useState(false);

  React.useEffect(function() {
    window.fbGetAllUsers(100).then(function(docs) {
      setUsers(docs.map(userToRow));
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

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
        <Mini2 label="Total" value="2 814" sub="todos os perfis" />
        <Mini2 label="Alunos" value="2 246" sub="80% do total" />
        <Mini2 label="Gestores" value="384"  sub="14% do total" />
        <Mini2 label="Administradores" value="22" sub="acesso global" />
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
        <span>Mostrando {users.length} usuários</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}><Ic.ArrowL s={12}/></button>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>1</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>2</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>3</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>…</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>282</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}><Ic.Arrow s={12}/></button>
        </div>
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
function AdminEstatisticas({ go }) {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Mini2 label="DISC concluídos" value="11 562" sub="+612 no mês" />
        <Mini2 label="Tempo médio" value="9.4 min" sub="−8% vs mês ant." />
        <Mini2 label="Taxa de conclusão" value="87%" sub="+3 pts no mês" />
        <Mini2 label="NPS Voratte" value="9.1" sub="+0.2 vs trimestre" />
      </div>

      <div className="card">
        <div className="card-title">Avaliações por mês · 12 meses</div>
        <div className="card-sub">Volume de DISC concluídos na plataforma</div>
        <GrowthChart />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Setores mais ativos</div>
          {[
            ['Manufatura',        24],
            ['Logística',         18],
            ['Energia',           14],
            ['Varejo',            12],
            ['Alimentos',          9],
            ['Tecnologia',         8],
            ['Farmacêutico',       7],
            ['Construção',         5],
            ['Outros',             3],
          ].map(([s, p]) => (
            <div key={s} style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>{s}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{p}%</span>
              </div>
              <div className="progress" style={{ height: 6 }}><span style={{ width: (p*4) + '%' }}/></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Cruzamento DISC × Cargo</div>
          <div className="card-sub">Perfis dominantes nos cargos sênior</div>
          {[
            ['Diretor de Compras',     'D · 48%', 'I · 22%'],
            ['Gerente de Compras',     'I · 38%', 'D · 28%'],
            ['Coordenador',            'S · 32%', 'C · 28%'],
            ['Comprador Sênior',       'D · 42%', 'C · 24%'],
            ['Comprador Pleno',        'I · 36%', 'S · 24%'],
            ['Especialista',           'C · 54%', 'S · 22%'],
            ['Assistente',             'S · 38%', 'I · 32%'],
          ].map(([role, p1, p2], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 12, padding: '12px 0', borderBottom: i < 6 ? '1px solid var(--line-soft)' : 'none', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{role}</span>
              <span style={{ color: 'var(--brown-700)', fontWeight: 600 }}>{p1}</span>
              <span style={{ color: 'var(--muted)' }}>{p2}</span>
            </div>
          ))}
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
