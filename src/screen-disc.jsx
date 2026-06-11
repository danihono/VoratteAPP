// DISC — teste de perfil do comprador, análise e cruzamento entre perfis

const DISC_META = {
  D: { full: 'Dominância',    label: 'Dominante', color: 'var(--disc-d)' },
  I: { full: 'Influência',    label: 'Influente', color: 'var(--disc-i)' },
  S: { full: 'Estabilidade',  label: 'Estável',   color: 'var(--disc-s)' },
  C: { full: 'Conformidade',  label: 'Conforme',  color: 'var(--disc-c)' },
};

// Reconstrói o objeto de resultado completo a partir do que foi salvo no Firestore
function discResultFromDoc(doc) {
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

// ============ TESTE DISC ============
function DiscTestScreen({ go, user, refreshProfile }) {
  const questions = window.DISC_QUESTIONS || [];
  const total = questions.length;
  const [phase, setPhase] = React.useState('intro');  // 'intro' | 'instructions' | 'test'
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});   // { [qId]: { most, least } }
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const q = questions[idx];
  const current = (q && answers[q.id]) || {};
  const answeredCount = Object.keys(answers).filter(function (k) {
    return answers[k].most && answers[k].least;
  }).length;
  const allDone = answeredCount === total;

  // Seleciona "Mais" / "Menos" para uma dimensão na questão atual
  function pick(kind, dimension) {
    const cur = Object.assign({}, answers[q.id] || {});
    // toggle: clicar de novo na mesma escolha desmarca
    if (cur[kind] === dimension) {
      delete cur[kind];
    } else {
      cur[kind] = dimension;
      // não permite Mais e Menos no mesmo adjetivo
      const other = kind === 'most' ? 'least' : 'most';
      if (cur[other] === dimension) delete cur[other];
    }
    const next = Object.assign({}, answers);
    next[q.id] = cur;
    setAnswers(next);
  }

  async function finish() {
    if (!allDone || saving) return;
    setSaving(true);
    setError('');

    const answersArr = questions.map(function (qq) {
      return { questionId: qq.id, most: answers[qq.id].most, least: answers[qq.id].least };
    });
    const result = window.calculateDisc(answersArr);
    window.DISC_LAST_RESULT = result;

    const pct = function (dim) { return Math.round((result.mostGraph[dim] / total) * 100); };
    const saved = {
      d: pct('D'), i: pct('I'), s: pct('S'), c: pct('C'),
      main: result.profile.primary,
      code: result.code,
      mostGraph: result.mostGraph,
      leastGraph: result.leastGraph,
      changeGraph: result.changeGraph,
      answers: answersArr,
    };

    try {
      if (user && user.id && window.fbSaveDiscResult) {
        await window.fbSaveDiscResult(user.id, saved);
      }
      // Re-carrega perfil para refletir discCompleted/discMain no Firestore
      if (refreshProfile) await refreshProfile();
      go('analise');
    } catch (e) {
      console.error('Erro ao salvar DISC:', e);
      setError('Não foi possível salvar agora — seu resultado foi calculado e será exibido.');
      go('analise');
    } finally {
      setSaving(false);
    }
  }

  // ---- Tela 1: intro colorida e chamativa ----
  if (phase === 'intro') {
    const tiles = [
      { k: 'd', letter: 'D', name: 'Dominância' },
      { k: 'i', letter: 'I', name: 'Influência' },
      { k: 's', letter: 'S', name: 'Estabilidade' },
      { k: 'c', letter: 'C', name: 'Conformidade' },
    ];
    return (
      <div className="page-enter" style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none' }}>
          <div style={{
            padding: 52,
            background: 'linear-gradient(135deg, var(--brown-950) 0%, var(--brown-850) 55%, var(--brown-800) 100%)',
            color: 'var(--brown-50)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: -110, top: -120, width: 360, height: 360, background: 'radial-gradient(circle, rgba(216,58,42,0.42), transparent 62%)' }} />
            <div style={{ position: 'absolute', right: -90, top: -70, width: 320, height: 320, background: 'radial-gradient(circle, rgba(232,181,58,0.40), transparent 62%)' }} />
            <div style={{ position: 'absolute', right: 80, bottom: -150, width: 360, height: 360, background: 'radial-gradient(circle, rgba(78,168,104,0.38), transparent 62%)' }} />
            <div style={{ position: 'absolute', left: 120, bottom: -170, width: 340, height: 340, background: 'radial-gradient(circle, rgba(58,111,181,0.40), transparent 62%)' }} />

            <div style={{ position: 'relative', maxWidth: 640 }}>
              <div className="badge" style={{ background: 'rgba(255,255,255,0.10)', color: 'var(--brown-100)' }}>
                <Ic.Sparkle s={12}/> Avaliação DISC · Perfil do Comprador
              </div>
              <h1 className="serif" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.06, marginTop: 18 }}>
                Descubra seu<br/>
                <em style={{
                  background: 'linear-gradient(90deg, var(--disc-d), var(--disc-i) 38%, var(--disc-s) 68%, var(--disc-c))',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>perfil de comprador</em>
              </h1>
              <p style={{ fontSize: 15, color: 'var(--brown-200)', marginTop: 18, lineHeight: 1.6, maxWidth: 520 }}>
                São <strong style={{ color: 'var(--brown-50)' }}>24 grupos de palavras</strong> e leva
                cerca de <strong style={{ color: 'var(--brown-50)' }}>10 minutos</strong>. Não existe
                resposta certa — suas respostas são confidenciais e revelam como você negocia.
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
                {tiles.map(function (t) {
                  return (
                    <div key={t.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div className={'disc-tile disc-' + t.k}>{t.letter}</div>
                      <div style={{ fontSize: 11, color: 'var(--brown-200)', fontWeight: 600 }}>{t.name}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
                <button className="btn btn-primary btn-lg" style={{ background: 'var(--brown-50)', color: 'var(--brown-900)' }} onClick={function () { setPhase('instructions'); }}>
                  Quero começar <Ic.Arrow s={16}/>
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.10)', color: 'var(--brown-50)' }} onClick={function () { go('dashboard'); }}>
                  Agora não
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 12, color: 'var(--muted)' }}>
          <Ic.Lock s={12} /> Respostas criptografadas · resultado disponível só para você e seu gestor
        </div>
      </div>
    );
  }

  // ---- Tela 2: instruções de como responder ----
  if (phase === 'instructions') {
    const steps = [
      { c: 'var(--disc-i)', t: 'Um grupo de cada vez', d: 'A cada tela você vê 4 palavras. Leia as quatro antes de decidir.' },
      { c: 'var(--disc-s)', t: 'Marque 1 "Mais" — fica verde', d: 'A palavra MAIS parecida com o seu jeito de ser. O botão fica verde.' },
      { c: 'var(--disc-d)', t: 'Marque 1 "Menos" — fica vermelho', d: 'A palavra MENOS parecida com você. O botão fica vermelho.' },
      { c: 'var(--disc-c)', t: 'Sinceridade, sem pensar demais', d: 'Não existe resposta certa. Responda rápido — a 1ª impressão é a mais fiel.' },
    ];
    const examplePill = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      minWidth: 86, padding: '9px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
      color: '#fff', border: '1px solid transparent',
    };
    return (
      <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
            Etapa final antes de começar
          </div>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: 6 }}>
            Como responder o teste
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 24 }}>
            Leva só um minuto entender — depois é só seguir o fluxo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map(function (st, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', background: 'var(--paper-warm)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: st.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 14, fontFamily: "'Fraunces', Georgia, serif" }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{st.t}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, marginTop: 2 }}>{st.d}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 22, padding: 18, borderRadius: 'var(--radius-md)', background: 'var(--brown-50)', border: '1px dashed var(--brown-300)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
              Exemplo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', background: 'var(--paper)' }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Decidido</div>
              <div style={Object.assign({}, examplePill, { background: 'var(--disc-s)', borderColor: 'var(--disc-s)' })}>
                <Ic.Check s={13} /> Mais
              </div>
              <div style={Object.assign({}, examplePill, { background: 'var(--disc-d)', borderColor: 'var(--disc-d)' })}>
                − Menos
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
              Verde = mais parecido com você · Vermelho = menos parecido com você.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button className="btn btn-secondary" onClick={function () { setPhase('intro'); }}>
              <Ic.ArrowL s={14} /> Voltar
            </button>
            <button className="btn btn-primary" onClick={function () { setPhase('test'); }}>
              Estou pronto, iniciar teste <Ic.Arrow s={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) {
    return <div className="card" style={{ padding: 32 }}>Banco de questões indisponível.</div>;
  }

  const pillBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    minWidth: 86, padding: '9px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
    cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--paper)',
    color: 'var(--muted)', transition: 'all 140ms ease', userSelect: 'none',
  };

  return (
    <div className="page-enter" style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="badge badge-outline">Teste DISC · Perfil do Comprador</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Questão <strong style={{ color: 'var(--ink)' }}>{idx + 1}</strong> de {total}
            <span style={{ marginLeft: 10, color: 'var(--muted)' }}>· {answeredCount} respondidas</span>
          </div>
        </div>
        <div className="progress">
          <span style={{
            width: ((idx + 1) / total) * 100 + '%',
            background: 'linear-gradient(90deg, var(--disc-d), var(--disc-i) 38%, var(--disc-s) 70%, var(--disc-c))',
          }} />
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
          Adjetivos · Como você se comporta
        </div>
        <h2 className="serif" style={{ fontSize: 25, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 6 }}>
          Em cada grupo, marque o que é <em>mais</em> e o que é <em>menos</em> parecido com você.
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 22 }}>
          Escolha exatamente <strong>1 “Mais”</strong> e <strong>1 “Menos”</strong> entre as quatro palavras.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map(function (o) {
            const isMost = current.most === o.dimension;
            const isLeast = current.least === o.dimension;
            return (
              <div
                className="m-discopt"
                key={q.id + '-' + o.dimension}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  border: '1px solid ' + (isMost ? 'var(--disc-s)' : isLeast ? 'var(--disc-d)' : 'var(--line)'),
                  background: isMost ? 'rgba(78,168,104,0.12)' : isLeast ? 'rgba(216,58,42,0.10)' : 'var(--paper)',
                  transition: 'all 140ms ease',
                }}
              >
                <div className="m-discword" style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{o.word}</div>
                <div
                  onClick={function () { pick('most', o.dimension); }}
                  style={Object.assign({}, pillBase, isMost ? {
                    background: 'var(--disc-s)', color: '#fff', borderColor: 'var(--disc-s)',
                  } : null)}
                >
                  <Ic.Check s={13} /> Mais
                </div>
                <div
                  onClick={function () { pick('least', o.dimension); }}
                  style={Object.assign({}, pillBase, isLeast ? {
                    background: 'var(--disc-d)', color: '#fff', borderColor: 'var(--disc-d)',
                  } : null)}
                >
                  − Menos
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--disc-d)' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26 }}>
          <button className="btn btn-secondary" disabled={idx === 0} onClick={function () { setIdx(Math.max(0, idx - 1)); }}>
            <Ic.ArrowL s={14} /> Anterior
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={function () { go('dashboard'); }}>Salvar e sair</button>
            {idx < total - 1 ? (
              <button
                className="btn btn-primary"
                disabled={!(current.most && current.least)}
                onClick={function () { setIdx(Math.min(total - 1, idx + 1)); }}
              >
                Próxima <Ic.Arrow s={14} />
              </button>
            ) : (
              <button className="btn btn-primary" disabled={!allDone || saving} onClick={finish}>
                {saving ? 'Calculando…' : 'Finalizar teste'} <Ic.Arrow s={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 12, color: 'var(--muted)' }}>
        <Ic.Lock s={12} /> Respostas criptografadas · resultado disponível só para você e seu gestor
      </div>
    </div>
  );
}

// ============ GRÁFICO DE BARRAS — Máscara / Pressão / Real ============
function DiscBarChart({ most, least, change }) {
  const dims = [
    { key: 'D', label: 'D (Dominância)' },
    { key: 'I', label: 'I (Influência)' },
    { key: 'S', label: 'S (Estabilidade)' },
    { key: 'C', label: 'C (Conformidade)' },
  ];
  const series = [
    { name: 'Máscara (apresentação)', color: '#3f7cb8', data: most || {} },
    { name: 'Pressão (estresse)',     color: '#cf6a3f', data: least || {} },
    { name: 'Real (decisão)',         color: '#1f9d6b', data: change || {} },
  ];

  const all = [];
  dims.forEach(function (d) { series.forEach(function (s) { all.push(s.data[d.key] || 0); }); });
  let max = Math.max.apply(null, all.concat([0]));
  let min = Math.min.apply(null, all.concat([0]));
  max = Math.ceil(max / 2) * 2;
  min = Math.floor(min / 2) * 2;
  if (max === 0) max = 2;
  const range = (max - min) || 1;

  const W = 720, H = 300, padL = 40, padR = 14, padT = 14, padB = 48;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const y = function (v) { return padT + (plotH * (max - v)) / range; };
  const groupW = plotW / dims.length;
  const innerPad = groupW * 0.16;
  const barW = (groupW - innerPad * 2) / series.length;

  const ticks = [];
  for (let t = min; t <= max; t += 2) ticks.push(t);

  return (
    <div>
      <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* gridlines + rótulos do eixo Y */}
        {ticks.map(function (t) {
          return (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)}
                stroke={t === 0 ? 'var(--brown-300)' : 'var(--line)'} strokeWidth={t === 0 ? 1.5 : 1} />
              <text x={padL - 8} y={y(t) + 3.5} textAnchor="end"
                fontSize="10.5" fill="var(--muted)" fontFamily="Manrope, sans-serif">{t}</text>
            </g>
          );
        })}

        {/* barras */}
        {dims.map(function (d, gi) {
          const gx = padL + gi * groupW + innerPad;
          return (
            <g key={d.key}>
              {series.map(function (s, si) {
                const v = s.data[d.key] || 0;
                const bx = gx + si * barW;
                const top = v >= 0 ? y(v) : y(0);
                const h = Math.abs(y(v) - y(0));
                return (
                  <rect key={s.name} x={bx + 2} y={top} width={barW - 4} height={Math.max(h, 0.5)}
                    fill={s.color} rx="2" />
                );
              })}
              <text x={padL + gi * groupW + groupW / 2} y={H - padB + 20} textAnchor="middle"
                fontSize="11" fill="var(--ink-soft)" fontFamily="Manrope, sans-serif">{d.label}</text>
            </g>
          );
        })}
      </svg>

      {/* legenda */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 8, flexWrap: 'wrap' }}>
        {series.map(function (s) {
          return (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ink-soft)' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: 'inline-block' }} />
              {s.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ ANÁLISE DO RESULTADO ============
function AnaliseScreen({ go, user }) {
  const [result, setResult] = React.useState(window.DISC_LAST_RESULT || null);
  const [loading, setLoading] = React.useState(!window.DISC_LAST_RESULT);

  React.useEffect(function () {
    if (result || !user || !user.id) { setLoading(false); return; }
    window.fbGetDiscResult(user.id).then(function (doc) {
      const r = discResultFromDoc(doc);
      if (r) { setResult(r); window.DISC_LAST_RESULT = r; }
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [user && user.id]);

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Carregando análise…</div>;
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 44, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <h2 className="serif" style={{ fontSize: 24, fontWeight: 500 }}>Você ainda não fez o teste DISC</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420 }}>
          Responda às 24 questões para descobrir seu perfil de comprador e desbloquear a análise completa.
        </p>
        <button className="btn btn-primary" onClick={function () { go('teste'); }}>
          Fazer o teste DISC <Ic.Arrow s={14} />
        </button>
      </div>
    );
  }

  const profile = result.profile;
  const primary = profile.primary;
  const meta = DISC_META[primary];

  // Composição (gráfico de rosca) — % do gráfico Máscara
  const totalMost = result.mostGraph.D + result.mostGraph.I + result.mostGraph.S + result.mostGraph.C || 1;
  const composition = ['D', 'I', 'S', 'C'].map(function (k) {
    return {
      key: k, label: DISC_META[k].full, color: DISC_META[k].color,
      value: Math.round((result.mostGraph[k] / totalMost) * 100),
    };
  });

  const panels = [
    { label: 'Perfil',    value: result.code },
    { label: 'Tipo',      value: profile.shortLabel },
    { label: 'Decisão',   value: profile.decisionShort },
    { label: 'Tom ideal', value: profile.toneShort },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Topo — rosca + composição */}
      <div className="card" style={{ padding: 28 }}>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Donut size={220} stroke={28} data={composition}
              center={<><div className="letter">{primary}</div><div className="label">{meta.label}</div></>}
            />
            <div style={{ textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 500 }}>{profile.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {profile.secondary
                  ? <>secundário: <strong style={{ color: 'var(--ink)' }}>{DISC_META[profile.secondary].full} ({profile.secondary})</strong></>
                  : 'perfil puro, sem traço secundário forte'}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
              Análise comportamental do comprador
            </div>
            <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 8 }}>
              Composição do seu perfil
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18, maxWidth: 560 }}>
              {profile.buyerType}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {composition.map(function (d) {
                return (
                  <div key={d.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{d.label} ({d.key})</div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{d.value}%</div>
                    </div>
                    <div className="progress" style={{ background: 'var(--brown-50)' }}>
                      <span style={{ width: d.value + '%', background: d.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO 1 — Máscara / Pressão / Real */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
          Visualização do resultado
        </div>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 18 }}>
          Como esse comprador se comporta em três cenários
        </h2>

        <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
          {panels.map(function (p) {
            return (
              <div key={p.label} className="stat">
                <div className="stat-label">{p.label}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{p.value}</div>
              </div>
            );
          })}
        </div>

        <DiscBarChart most={result.mostGraph} least={result.leastGraph} change={result.changeGraph} />

        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, marginTop: 16, maxWidth: 680 }}>
          <strong style={{ color: 'var(--ink-soft)' }}>Máscara</strong> é como o comprador se apresenta numa primeira
          reunião · <strong style={{ color: 'var(--ink-soft)' }}>Pressão</strong> é como ele age sob estresse de
          negociação · <strong style={{ color: 'var(--ink-soft)' }}>Real</strong> é o perfil autêntico que governa a
          decisão de compra.
        </p>
      </div>

      {/* Detalhe do perfil */}
      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Pillar title="O que move o comprador (a)" items={profile.motivators} />
        <Pillar title="O que trava a decisão" items={profile.fears} tone="warn" />
      </div>
      <div className="card">
        <div className="card-title">Seu estilo de negociação</div>
        <div className="card-sub">Autoconhecimento — seus próprios gatilhos na mesa de negociação</div>
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {(function () {
            const e = (window.voratteEstiloComprador && window.voratteEstiloComprador(profile.primary)) || { tom: '', ritmo: '', objecao: '' };
            return [
              ['O tom que funciona com você', e.tom],
              ['Seu ritmo de decisão', e.ritmo],
              ['Como você reage a objeções', e.objecao],
              ['Estilo de decisão', profile.decisionStyle],
            ].map(function (row) {
              return (
                <div key={row[0]} style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 3 }}>{row[0]}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{row[1]}</div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* GRÁFICO 2 — tabela dos 11 tipos de comprador */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
          Referência
        </div>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          Os 11 tipos de comprador reconhecidos pela Vorätte
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>
          Perfis puros + combinações. O seu está destacado.
        </p>

        <div className="tbl-wrap"><table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Código</th>
              <th>Tipo de comprador</th>
              <th>Como esse perfil negocia</th>
            </tr>
          </thead>
          <tbody>
            {(window.BUYER_TYPE_TABLE || []).map(function (row) {
              const mine = row.code === result.code;
              return (
                <tr key={row.code} style={mine ? { background: 'var(--brown-50)' } : null}>
                  <td>
                    <strong style={{ color: 'var(--brown-700)' }}>{row.code}</strong>
                    {mine && <span className="badge badge-brown" style={{ marginLeft: 8 }}>Você</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.type}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{row.comoVender}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {!(user && user.role === 'gestor') && (
          <button className="btn btn-secondary" onClick={function () { go('cruzamento'); }}>
            Cruzamento com outros perfis <Ic.Arrow s={14} />
          </button>
        )}
        <button className="btn btn-primary" onClick={function () { go('relatorio'); }}>
          Gerar meu relatório <Ic.Arrow s={14} />
        </button>
      </div>
    </div>
  );
}

function Pillar({ title, items, tone }) {
  return (
    <div className="card">
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

// ============ CRUZAMENTO ENTRE PERFIS ============
function CruzamentoScreen({ go }) {
  const myResult = window.DISC_LAST_RESULT;
  const myPrimary = (myResult && myResult.profile && myResult.profile.primary) || 'D';
  const [target, setTarget] = React.useState('D');

  const data = {
    D: {
      identify: ['Direto', 'Competitivo', 'Focado em resultados', 'Impaciente', 'Gosta de desafios', 'Decisivo'],
      comm: ['Seja direto e objetivo', 'Foque em resultado, ROI e prazo', 'Apresente opções claras e exija contrapartidas', 'Mostre consequências objetivas', 'Evite rodeios e não entre em disputa de ego'],
      objs: [
        ['"Quero o resultado disso"', 'Apresente dados e ROI'],
        ['"Quanto isso vai economizar?"', 'Seja objetivo e vá direto ao ponto'],
        ['"Por que não é mais rápido?"', 'Mostre agilidade e assertividade'],
      ],
    },
    I: {
      identify: ['Comunicativo', 'Entusiasta', 'Influente', 'Otimista', 'Busca reconhecimento', 'Sociável'],
      comm: ['Reconheça a parceria e mantenha tom positivo', 'Use prova social e cases para ancorar', 'Traga estrutura à conversa fluida', 'Formalize por escrito os compromissos', 'Traduza o entusiasmo em próximos passos objetivos'],
      objs: [
        ['"Quem mais já comprou?"', 'Traga referências e casos visíveis'],
        ['"Como vão me ver com isso?"', 'Mostre o impacto reputacional positivo'],
        ['"Não quero parecer rígido"', 'Apresente alternativas flexíveis'],
      ],
    },
    S: {
      identify: ['Paciente', 'Estável', 'Bom ouvinte', 'Avesso a mudanças bruscas', 'Cooperativo', 'Leal'],
      comm: ['Crie um ambiente seguro e previsível', 'Explique cada passo com calma', 'Dê previsibilidade e reduza a incerteza', 'Evite pressão por urgência artificial', 'Confirme cada etapa do acordo'],
      objs: [
        ['"E se algo der errado?"', 'Mostre histórico e garantias'],
        ['"Precisamos pensar com calma"', 'Ofereça prazo para análise'],
        ['"E a equipe, vai aceitar?"', 'Envolva a equipe na decisão'],
      ],
    },
    C: {
      identify: ['Analítico', 'Detalhista', 'Cauteloso', 'Orientado por dados', 'Crítico', 'Perfeccionista'],
      comm: ['Traga dados, TCO e benchmark', 'Documente premissas e critérios', 'Respeite o tempo de análise', 'Antecipe objeções técnicas com evidência', 'Use linguagem técnica e precisa'],
      objs: [
        ['"Preciso pensar melhor"', 'Mostre benefícios racionais e dados'],
        ['"Quero ver mais opções"', 'Dê alternativas e benchmarks'],
        ['"E se mudarmos depois?"', 'Traga casos de adaptação bem-sucedidos'],
        ['"Isso atende à minha equipe?"', 'Envolva a equipe na decisão'],
      ],
    },
  };

  const d = data[target];
  const profiles = {
    D: { label: 'Dominante', desc: 'Resultado · Decisão · Velocidade' },
    I: { label: 'Influente', desc: 'Pessoas · Entusiasmo · Reconhecimento' },
    S: { label: 'Estável', desc: 'Cooperação · Paciência · Lealdade' },
    C: { label: 'Conforme', desc: 'Dados · Detalhe · Precisão' },
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
          Seu perfil é <strong style={{ color: 'var(--brown-700)' }}>{myPrimary} · {DISC_META[myPrimary].label}</strong>. Escolha com quem você está negociando:
        </div>
        <div className="m-stack-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
          {Object.entries(profiles).map(function (entry) {
            const k = entry[0], v = entry[1];
            return (
              <button
                key={k}
                onClick={function () { setTarget(k); }}
                style={{
                  padding: 16, borderRadius: 12,
                  border: '1px solid ' + (target === k ? 'var(--brown-700)' : 'var(--line)'),
                  background: target === k ? 'var(--brown-50)' : 'var(--paper)',
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 160ms ease',
                  boxShadow: target === k ? 'inset 0 0 0 1px var(--brown-700)' : 'none',
                }}
              >
                <div className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 38, height: 38, fontSize: 18 }}>{k}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{v.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{v.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Como identificar um perfil {target}</div>
          <div className="card-sub">Sinais comportamentais mais evidentes</div>
          {d.identify.map(function (it, i) {
            return (
              <div className="list-row" key={i}>
                <div className="bullet" />
                <span>{it}</span>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title">Como conduzir com esse perfil</div>
          <div className="card-sub">Sua condução de comprador, conforme o perfil</div>
          {d.comm.map(function (it, i) {
            return (
              <div className="list-row" key={i}>
                <Ic.Check s={14} />
                <span>{it}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="card-title">Objeções típicas do perfil {target}</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Antecipe e prepare resposta</div>
          </div>
          <div className="badge badge-brown"><Ic.Sparkle s={11} /> Sugerido por IA</div>
        </div>

        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          {d.objs.map(function (pair, i) {
            return (
              <div key={i} className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <div style={{ padding: 14, background: 'var(--paper-warm)', fontStyle: 'italic', color: 'var(--ink-soft)', fontSize: 13 }}>{pair[0]}</div>
                <div style={{ padding: 14, borderLeft: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{pair[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--ink)', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic.Bulb s={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, color: 'var(--brown-50)' }}>Dica estratégica</div>
            <p style={{ fontSize: 13, color: 'var(--brown-200)', marginTop: 4, lineHeight: 1.55 }}>
              {target === 'D' && 'Perfis D são competitivos. Estabeleça regras claras, foque em resultados mensuráveis e respeite o tempo do outro.'}
              {target === 'I' && 'Perfis I são influenciados por relacionamento e entusiasmo. Construa conexão e mostre os benefícios para as pessoas.'}
              {target === 'S' && 'Perfis S precisam de tempo e segurança. Não pressione decisões — construa confiança e demonstre estabilidade.'}
              {target === 'C' && 'Perfis C compram com dados. Apresente comparativos, evidências e respeite cada passo da análise.'}
            </p>
          </div>
          <button className="btn" style={{ background: 'var(--brown-700)', color: 'var(--brown-50)' }} onClick={function () { go('relatorio'); }}>
            Salvar no relatório <Ic.Arrow s={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

window.DiscTestScreen = DiscTestScreen;
window.AnaliseScreen = AnaliseScreen;
window.CruzamentoScreen = CruzamentoScreen;
window.DiscBarChart = DiscBarChart;
