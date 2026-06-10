// Matriz de Kraljic — posiciona o comprador na matriz a partir do resultado DISC

// Reconstrói o resultado DISC a partir do doc salvo no Firestore
function kDiscResultFromDoc(doc) {
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

// alavancagem=D · estrategico=I · gargalo=S · nao_criticos=C
const KQUAD_DIM = { alavancagem: 'D', estrategico: 'I', gargalo: 'S', nao_criticos: 'C' };

// Override KAVOID (whatToAvoid → ótica-comprador) é fonte única em
// src/disc-estilo.jsx → window.voratteKavoid(item). kraljic-data.jsx congelado.

function KraljicScreen({ go, user }) {
  const [result, setResult] = React.useState(window.DISC_LAST_RESULT || null);
  const [loading, setLoading] = React.useState(!window.DISC_LAST_RESULT);
  const [active, setActive] = React.useState(null);   // quadrante em foco (clique)
  const [vendedor, setVendedor] = React.useState('D'); // DISC do VENDEDOR (contraparte) — indexa usoDISC §15

  React.useEffect(function () {
    if (result || !user || !user.id) { setLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function (doc) {
      const r = kDiscResultFromDoc(doc);
      if (r) { setResult(r); window.DISC_LAST_RESULT = r; }
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [user && user.id]);

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Carregando matriz…</div>;
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 44, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <h2 className="serif" style={{ fontSize: 24, fontWeight: 500 }}>A matriz de Kraljic complementa o DISC</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 460 }}>
          Faça o teste DISC primeiro — com o seu perfil, posicionamos você na matriz
          e geramos a leitura completa de comportamento de compra.
        </p>
        <button className="btn btn-primary" onClick={function () { go('teste'); }}>
          Fazer o teste DISC <Ic.Arrow s={14} />
        </button>
      </div>
    );
  }

  const kr = window.calculateKraljic(result.changeGraph);
  const activeQuad = active || kr.dominantQuadrant;

  const icons = {
    alavancagem:  <Ic.Chart s={18} />,
    estrategico:  <Ic.Diamond s={18} />,
    gargalo:      <Ic.Link s={18} />,
    nao_criticos: <Ic.Cart s={18} />,
  };

  // Monta dados de cada quadrante (perfil Kraljic + dimensão DISC)
  function quadInfo(id) {
    const kp = window.KRALJIC_PROFILES[id];
    const dim = KQUAD_DIM[id];
    const bp = window.BUYER_PROFILES[dim];
    return { id: id, dim: dim, kp: kp, discType: bp.shortLabel, icon: icons[id] };
  }
  // ordem visual da matriz 2×2
  const grid = ['alavancagem', 'estrategico', 'nao_criticos', 'gargalo'].map(quadInfo);
  const act = quadInfo(activeQuad);

  // posição do ponto: X = risco (0→100 esq→dir), Y = impacto (0→100 baixo→cima)
  const dotX = kr.axis.riscoSuprimento;
  const dotY = kr.axis.impactoFinanceiro;

  // Dados do motor para o quadrante em foco — compartilhados entre o topo
  // ("sua próxima ação", na coluna direita da matriz) e a seção de detalhe.
  const mk = (window.MOTOR_KRALJIC && window.MOTOR_KRALJIC[act.id]) || null;
  const discVend = (window.MOTOR_DISC && window.MOTOR_DISC[vendedor]) || { nome: vendedor };
  const usoRaw = (mk && mk.usoDISC && mk.usoDISC[vendedor]) || '';
  const usoFmt = usoRaw ? usoRaw.charAt(0).toUpperCase() + usoRaw.slice(1) : '';
  const naoAceitar = (act.kp.whatToAvoid || []).map(function (it) {
    return (window.voratteKavoid && window.voratteKavoid(it)) || it;
  });
  const secLabel = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, margin: '22px 0 12px' };
  function cardRow(rows) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {rows.map(function (row) {
          return (
            <div key={row[0]} style={{ padding: 16, borderRadius: 12, background: 'var(--paper-warm)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 5 }}>{row[0]}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{row[1]}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* SEÇÃO 1 — Matriz + cabeçalho do resultado + "Como conduzir" (ação imediata) */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 36, alignItems: 'start' }}>

          {/* MATRIZ com o comprador plotado */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
              Posicionamento estratégico
            </div>
            <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em', margin: '6px 0 20px' }}>
              Matriz de Kraljic
            </h2>

            <div style={{ display: 'flex', gap: 8 }}>
              {/* eixo Y */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: 26, paddingBottom: 26 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Alto</span>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 600 }}>
                  Impacto financeiro
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Baixo</span>
              </div>

              <div style={{ flex: 1 }}>
                {/* área 2×2 com o ponto sobreposto */}
                <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', aspectRatio: '1.32 / 1' }}>
                  {grid.map(function (q) {
                    return (
                      <QuadCell key={q.id} q={q} active={activeQuad === q.id} mine={kr.dominantQuadrant === q.id}
                        onClick={function () { setActive(q.id); }} />
                    );
                  })}

                  {/* ponto do comprador */}
                  <div
                    title={'Impacto ' + dotY + ' · Risco ' + dotX}
                    style={{
                      position: 'absolute', left: dotX + '%', top: (100 - dotY) + '%',
                      transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'var(--brown-700)', border: '3px solid var(--paper)',
                      boxShadow: '0 0 0 3px var(--brown-700), 0 4px 12px rgba(21,9,10,0.35)',
                    }} />
                  </div>
                </div>

                {/* eixo X */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
                  <span>Baixo</span>
                  <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 600 }}>
                    Risco de fornecimento
                  </span>
                  <span>Alto</span>
                </div>
              </div>
            </div>
          </div>

          {/* CABEÇALHO DO RESULTADO + "COMO CONDUZIR" (ação imediata) */}
          <div>
            {activeQuad === kr.dominantQuadrant ? (
              <div className="badge badge-brown" style={{ marginBottom: 12 }}>
                <Ic.Sparkle s={11} /> Sua posição · derivada do seu DISC
              </div>
            ) : (
              <div className="badge badge-outline" style={{ marginBottom: 12 }}>
                <Ic.Compare s={11} /> Comparando · sua posição é {kr.positionLabel}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--paper-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-600)' }}>{act.icon}</div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                  Quadrante em foco
                </div>
                <div className="serif" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>{act.kp.label}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div className="stat">
                <div className="stat-label">Perfil DISC</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{result.code}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Impacto financeiro</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{dotY}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Risco de suprimento</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{dotX}</div>
              </div>
            </div>

            <div style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
                Postura de compra esperada
              </div>
              {act.kp.buyerPosture}
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.55 }}>
              Clique nos quadrantes da matriz para comparar os outros perfis de comprador.
            </div>

            {/* COMO CONDUZIR — ação imediata (subiu p/ a coluna direita, embaixo do foco) */}
            {mk && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
                <div className="card-title">Como conduzir a negociação</div>
                <div className="card-sub" style={{ marginBottom: 12 }}>
                  Conforme o perfil do <strong>vendedor</strong>
                </div>

                <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>
                  Perfil DISC do vendedor
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {['D', 'I', 'S', 'C'].map(function (p) {
                    const on = vendedor === p;
                    return (
                      <button key={p} onClick={function () { setVendedor(p); }} title={((window.MOTOR_DISC || {})[p] || {}).nome || p}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 8, cursor: 'pointer',
                          border: '1px solid ' + (on ? 'var(--brown-300)' : 'var(--line)'),
                          background: on ? 'var(--brown-50)' : 'var(--paper)',
                        }}>
                        <span className={'disc-tile disc-' + p.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6, opacity: on ? 1 : 0.4 }}>{p}</span>
                      </button>
                    );
                  })}
                </div>

                {/* sua próxima ação (usoDISC §15, indexado pelo VENDEDOR) */}
                <div style={{ borderRadius: 12, background: 'var(--paper-warm)', border: '1px solid var(--line)', borderLeft: '3px solid var(--disc-' + vendedor.toLowerCase() + ')', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className={'disc-tile disc-' + vendedor.toLowerCase()} style={{ width: 22, height: 22, fontSize: 12, borderRadius: 6 }}>{vendedor}</span>
                    <span style={{ fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
                      Sua próxima ação · com um vendedor {vendedor} ({discVend.nome})
                    </span>
                  </div>
                  <div className="serif" style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink)' }}>{usoFmt}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2 — Os 4 quadrantes de Kraljic (seletor central; liga topo e detalhe) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="card-title">Os 4 quadrantes de Kraljic</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>A posição do fornecedor em cada um</div>
          </div>
          <div className="badge badge-brown"><Ic.Sparkle s={11} /> Inteligência aplicada</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {grid.map(function (q) {
            const mine = kr.dominantQuadrant === q.id;
            return (
              <div key={q.id} onClick={function () { setActive(q.id); }}
                style={{
                  padding: 18, borderRadius: 12, cursor: 'pointer',
                  background: activeQuad === q.id ? 'var(--brown-50)' : 'var(--paper-warm)',
                  border: '1px solid ' + (activeQuad === q.id ? 'var(--brown-300)' : 'var(--line)'),
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-600)' }}>{q.icon}</div>
                  {mine && <div className="badge badge-brown">Sua posição</div>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{q.kp.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{q.kp.buyerPosture}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 3 — Condução detalhada (Seu jogo · Buscar×Evitar · Leitura de poder) */}
      {mk && (
        <div className="card">
          <div>
            <div className="card-title">Condução detalhada</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>
              Seu plano no quadrante <strong>{mk.label}</strong>
            </div>
          </div>

          {/* seu jogo no quadrante (§15) */}
          <div style={secLabel}>Seu jogo neste quadrante</div>
          {cardRow([
            ['Seu objetivo no quadrante', mk.objetivoComprador],
            ['Sua estratégia', mk.estrategia],
            ['Estilo de negociação', mk.estiloNegociacao],
            ['Risco a evitar', mk.riscoPrincipal],
          ])}

          {/* o que buscar × o que não aceitar (kraljic-data reenquadrado p/ ótica comprador) */}
          <div style={secLabel}>O que buscar × o que não aceitar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <KPillar title="O que você deve buscar neste fornecedor" items={act.kp.whatHeWants} />
            <KPillar title="Táticas do vendedor a não aceitar" items={naoAceitar} tone="warn" />
          </div>

          {/* leitura de poder (kraljic-data reenquadrado por rótulo) */}
          <div style={secLabel}>Leitura de poder</div>
          {cardRow([
            ['Seu poder de negociação', act.kp.negotiationLeverage],
            ['Onde focar a proposta', act.kp.proposalFocus],
            ['Como estruturar o contrato', act.kp.contractStyle],
            ['Sua alavanca: o ponto de pressão do vendedor', act.kp.riskForVendor],
          ])}
        </div>
      )}

      {/* Rodapé de ação da tela */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={function () { go('relatorio'); }}>
          Ver estratégias recomendadas <Ic.Arrow s={14} />
        </button>
        <button className="btn btn-secondary" onClick={function () { go('cruzamento'); }}>
          <Ic.Compare s={14} /> Cruzar com outros perfis
        </button>
      </div>
    </div>
  );
}

// Célula da matriz — mostra quadrante, dimensão DISC e o que o comprador quer
function QuadCell({ q, active, mine, onClick }) {
  return (
    <div
      className="kraljic-cell"
      style={{
        background: active ? 'var(--brown-50)' : 'var(--paper)',
        borderColor: active ? 'var(--brown-300)' : 'var(--line)',
        boxShadow: active ? 'inset 0 0 0 1px var(--brown-300)' : 'none',
        gap: 8, padding: 18,
      }}
      onClick={onClick}
    >
      <div className="top">
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--paper-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-600)' }}>{q.icon}</div>
        {mine && <div className="badge badge-brown">Sua posição</div>}
      </div>
      <div>
        <h4 style={{ marginBottom: 2 }}>{q.kp.label}</h4>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {q.kp.whatHeWants.map(function (w, i) {
          return (
            <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
              <span style={{ color: 'var(--brown-400)' }}>•</span>
              <span>{w}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KPillar({ title, items, tone }) {
  return (
    <div className="card" style={{ background: 'var(--paper-warm)' }}>
      <div className="card-title">{title}</div>
      <div style={{ marginTop: 10 }}>
        {(items || []).map(function (it, i) {
          return (
            <div className="list-row" key={i}>
              <div className="bullet" style={tone === 'warn' ? { background: 'var(--disc-d)' } : null} />
              <span>{it}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.KraljicScreen = KraljicScreen;
