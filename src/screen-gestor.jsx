// ====================== GESTOR ======================
// O gestor vê APENAS os colaboradores do seu time.

// Cache de sessão: evita múltiplos fetches enquanto o gestor navega entre telas
var _gestorTeamCache = null;
var _gestorTeamFetch = null;

// Quando admin está em "Visão: Gestor" sem equipe vinculada, injeta o próprio admin
// (com o DISC que ele tiver feito como aluno demo) na lista — só para visualização.
async function _buildDemoSelfMember(currentUser) {
  if (!currentUser || !currentUser.id) return null;
  try {
    var disc = await window.fbGetDiscResult(currentUser.id);
    if (!disc) return null;
    return {
      id:        currentUser.id,
      name:      (currentUser.name || 'Você') + ' (demo)',
      role:      currentUser.jobTitle || 'Aluno demo',
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

function useGestorTeam(gestorId, currentUser) {
  var [team, setTeam] = React.useState(_gestorTeamCache || []);
  var [loading, setLoading] = React.useState(!_gestorTeamCache);

  React.useEffect(function() {
    var cancelled = false;
    function applyDemoFallback(data) {
      // Só injeta o demo-self quando o usuário logado é admin (sinaliza modo demo)
      // e a equipe real veio vazia.
      if (data.length > 0 || !currentUser || currentUser.role !== 'admin') {
        if (!cancelled) { setTeam(data); setLoading(false); }
        return;
      }
      _buildDemoSelfMember(currentUser).then(function (self) {
        if (cancelled) return;
        setTeam(self ? [self] : []);
        setLoading(false);
      });
    }

    if (_gestorTeamCache) { applyDemoFallback(_gestorTeamCache); return; }
    if (!gestorId) { setLoading(false); return; }
    if (!_gestorTeamFetch) {
      _gestorTeamFetch = window.fbGetTeamMembers(gestorId);
    }
    _gestorTeamFetch.then(function(data) {
      _gestorTeamCache = data;
      applyDemoFallback(data);
    }).catch(function(err) {
      console.error('Erro ao carregar time:', err);
      if (!cancelled) setLoading(false);
    });

    return function () { cancelled = true; };
  }, [gestorId, currentUser && currentUser.id, currentUser && currentUser.role]);

  return [team, loading];
}

function GestorDashboard({ go, user }) {
  var [team, teamLoading] = useGestorTeam(user && user.id, user);
  var GESTOR_TEAM = team;
  var done = GESTOR_TEAM.filter(function(p) { return p.status === 'done'; }).length;
  var pending = GESTOR_TEAM.length - done;
  var firstName = user && user.name ? user.name.split(' ')[0] : 'Gestor';

  // Distribuição DISC real do time
  var dist = React.useMemo(function () {
    var counts = { D: 0, I: 0, S: 0, C: 0 };
    GESTOR_TEAM.forEach(function (m) { if (m.main && counts.hasOwnProperty(m.main)) counts[m.main] += 1; });
    var total = counts.D + counts.I + counts.S + counts.C;
    if (!total) return null;
    var labels = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme' };
    var top = ['D','I','S','C'].reduce(function (a, b) { return counts[a] >= counts[b] ? a : b; });
    return {
      counts: counts, total: total,
      topKey: top, topLabel: labels[top],
      topPct: Math.round(counts[top] / total * 100),
    };
  }, [GESTOR_TEAM]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, background: 'radial-gradient(circle, var(--brown-50), transparent 70%)' }} />
          <div className="badge badge-brown" style={{ position: 'relative' }}><Ic.Shield s={12}/> Visão de Gestor</div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.15, maxWidth: 460 }}>
            Olá, {firstName}. <span style={{ color: 'var(--muted)' }}>
              {teamLoading
                ? 'Carregando dados do time…'
                : GESTOR_TEAM.length
                  ? GESTOR_TEAM.length + ' colaborador' + (GESTOR_TEAM.length === 1 ? '' : 'es') + ' · ' + done + ' avaliado' + (done === 1 ? '' : 's') + '.'
                  : 'Você ainda não tem colaboradores vinculados.'}
            </span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 26 }}>
            <div className="stat">
              <div className="stat-label">Colaboradores</div>
              <div className="stat-value">{GESTOR_TEAM.length}</div>
              <div className="stat-delta">{done} avaliados</div>
            </div>
            <div className="stat">
              <div className="stat-label">Pendentes</div>
              <div className="stat-value" style={{ color: pending > 0 ? 'var(--disc-d)' : 'inherit' }}>{pending}</div>
              <div className="stat-delta">{pending > 0 ? 'Aguardando avaliação' : 'Tudo em dia'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Perfil dominante</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{dist ? dist.topKey + ' · ' + dist.topPct + '%' : '—'}</div>
              <div className="stat-delta">{dist ? dist.topLabel : 'Sem dados'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => go('equipe')}>
              Ver minha equipe <Ic.Arrow s={14}/>
            </button>
            <button className="btn btn-secondary" onClick={() => go('relatorios')}>
              <Ic.Pdf s={14}/> Relatório consolidado
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Distribuição comportamental do time</div>
          <div className="card-sub">Perfis predominantes</div>
          {!dist ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
              Distribuição será exibida quando sua equipe completar avaliações.
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
                center={<><div className="letter">{dist.total}</div><div className="label">{dist.total === 1 ? 'avaliado' : 'avaliados'}</div></>}
              />
              <div className="legend" style={{ flex: 1 }}>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>Dominante</span><span className="pct">{dist.counts.D}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>Influente</span><span className="pct">{dist.counts.I}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>Estável</span><span className="pct">{dist.counts.S}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>Conforme</span><span className="pct">{dist.counts.C}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quem ainda não fez */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="card-title">Status de avaliação</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Acompanhe quem ainda precisa responder o DISC</div>
          </div>
          <button className="btn btn-secondary"><Ic.Bell s={14}/> Notificar pendentes</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GESTOR_TEAM.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 140px 140px 60px', gap: 14, alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: p.status === 'done' ? 'var(--paper)' : 'var(--paper-warm)', border: '1px solid var(--line-soft)' }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{p.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.role}</div>
              </div>
              <div>
                {p.status === 'done' && <span className="badge badge-brown">● Avaliado</span>}
                {p.status === 'pending' && <span className="badge" style={{ background: '#f8e8d4', color: '#a87139' }}>● Em andamento</span>}
                {p.status === 'invited' && <span className="badge badge-outline">● Convidado</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Última: {p.last}</div>
              <button className="icon-btn" onClick={() => go('equipe')}><Ic.Arrow s={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GestorEquipe({ go, user }) {
  var [team, teamLoading] = useGestorTeam(user && user.id, user);
  var GESTOR_TEAM = team;
  var [sel, setSel] = React.useState(null);
  var selId = sel || (GESTOR_TEAM.length ? GESTOR_TEAM[0].id : null);
  var p = GESTOR_TEAM.find(function(x) { return x.id === selId; }) || null;

  if (teamLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)', fontSize: 13 }}>Carregando equipe…</div>;
  }
  if (!GESTOR_TEAM.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)', fontSize: 13 }}>Nenhum colaborador encontrado neste time.</div>;
  }

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: '100%' }}>

      {/* List */}
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)' }}>
          <div className="card-title" style={{ marginBottom: 2 }}>Minha equipe</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>{GESTOR_TEAM.length} colaboradores</div>
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
                {p.main !== '—' && <div className="badge badge-brown">Perfil {p.main}</div>}
                <div className="badge badge-outline">Última avaliação: {p.last}</div>
                <div className="badge badge-outline">{p.reports} relatórios</div>
              </div>
            </div>
            {p.status === 'done' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary"><Ic.Chat s={14}/> Mensagem</button>
                <button className="btn btn-primary"><Ic.Pdf s={14}/> Relatório</button>
              </div>
            ) : (
              <button className="btn btn-primary"><Ic.Bell s={14}/> Lembrar avaliação</button>
            )}
          </div>
        </div>

        {p.status === 'done' ? (
          <React.Fragment>
            <div className="card" style={{ padding: 24 }}>
              <div className="card-title">Perfil DISC de {p.name.split(' ')[0]}</div>
              <div className="card-sub">Composição comportamental</div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center' }}>
                <Donut
                  size={170} stroke={22}
                  data={[
                    { key: 'D', value: p.d, color: 'var(--disc-d)' },
                    { key: 'I', value: p.i, color: 'var(--disc-i)' },
                    { key: 'S', value: p.s, color: 'var(--disc-s)' },
                    { key: 'C', value: p.c, color: 'var(--disc-c)' },
                  ]}
                  center={<><div className="letter">{p.main}</div><div className="label">{{D:'Dominante',I:'Influente',S:'Estável',C:'Conforme'}[p.main]}</div></>}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { k: 'D', v: p.d, l: 'Dominância', c: 'var(--disc-d)' },
                    { k: 'I', v: p.i, l: 'Influência', c: 'var(--disc-i)' },
                    { k: 'S', v: p.s, l: 'Estabilidade', c: 'var(--disc-s)' },
                    { k: 'C', v: p.c, l: 'Conformidade', c: 'var(--disc-c)' },
                  ].map(d => (
                    <div key={d.k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.l} ({d.k})</div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{d.v}%</div>
                      </div>
                      <div className="progress"><span style={{ width: d.v + '%', background: d.c }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="card-title">Forças no contexto de Compras</div>
                {[
                  'Fechamento ágil em pressão de prazo',
                  'Defesa firme de margens',
                  'Liderança em itens de Alavancagem',
                  'Resiliência em rodadas longas',
                ].map((s, i) => <div className="list-row" key={i}><Ic.Check s={14}/><span>{s}</span></div>)}
              </div>
              <div className="card">
                <div className="card-title">Riscos a monitorar</div>
                {[
                  'Pode acelerar decisões em itens estratégicos',
                  'Desgaste com fornecedores S/C',
                  'Pouca escuta em concessões mútuas',
                  'Resistência a delegar análises técnicas',
                ].map((s, i) => <div className="list-row" key={i}><div className="bullet" style={{ background: 'var(--disc-d)' }}/><span>{s}</span></div>)}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Relatórios de {p.name.split(' ')[0]}</div>
              <div className="card-sub">{p.reports || 0} documentos disponíveis</div>
              <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13.5 }}>
                Lista de relatórios disponíveis em breve.
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Ic.Disc s={28}/>
            </div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{p.name.split(' ')[0]} ainda não respondeu o DISC</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, maxWidth: 380, margin: '6px auto 0' }}>
              {p.status === 'invited' ? 'O convite foi enviado e está aguardando aceite.' : 'A avaliação foi iniciada mas não foi concluída.'}
            </p>
            <button className="btn btn-primary" style={{ marginTop: 18 }}>
              <Ic.Bell s={14}/> Enviar lembrete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GestorMapa({ go, user }) {
  var [team, teamLoading] = useGestorTeam(user && user.id, user);

  // Agrega a equipe por cargo (jobTitle), contando o perfil principal (DISC main) de cada membro.
  const matrix = React.useMemo(() => {
    if (!team || !team.length) return [];
    const byRole = {};
    team.forEach(function (m) {
      if (!m.main) return; // ignora membros sem DISC
      const role = m.role || 'Sem cargo';
      if (!byRole[role]) byRole[role] = { role: role, D: 0, I: 0, S: 0, C: 0 };
      byRole[role][m.main] += 1;
    });
    return Object.values(byRole);
  }, [team]);

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
        <div className="card-title">Mapa comportamental por cargo</div>
        <div className="card-sub">Quantos colaboradores de cada perfil em cada nível</div>

        {teamLoading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Carregando equipe…</div>
        ) : !matrix.length ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            O mapa será gerado quando sua equipe completar avaliações DISC.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr)', gap: 4, alignItems: 'center' }}>
            <div />
            {['D','I','S','C'].map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0' }}>
                <div className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}>{k}</div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{{D:'Dominante',I:'Influente',S:'Estável',C:'Conforme'}[k]}</span>
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
        )}
      </div>
    </div>
  );
}

function GestorRelatorios({ go, user }) {
  const rows = [];
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="tabs">
          <button className="tab active">Da equipe</button>
          <button className="tab">Consolidados</button>
          <button className="tab">Por cargo</button>
        </div>
        <button className="btn btn-primary"><Ic.Plus s={14}/> Gerar consolidado</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            Nenhum relatório gerado ainda.
          </div>
        ) : (
          <table className="tbl">
            <thead><tr>
              <th style={{ paddingLeft: 24 }}>Relatório</th><th>Tipo</th><th>Autor</th><th>Data</th><th style={{ textAlign: 'right', paddingRight: 24 }}>Ações</th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic.Pdf s={14}/>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                    </div>
                  </td>
                  <td><span className="badge badge-outline">{r.type}</span></td>
                  <td>{r.author}</td>
                  <td>{r.date}</td>
                  <td style={{ paddingRight: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="icon-btn" onClick={() => go('relatorio')}><Ic.Eye s={16}/></button>
                      <button className="icon-btn"><Ic.Download s={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

window.GestorDashboard = GestorDashboard;
window.GestorEquipe = GestorEquipe;
window.GestorMapa = GestorMapa;
window.GestorRelatorios = GestorRelatorios;
