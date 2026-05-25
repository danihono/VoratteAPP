// Relatórios list + Relatório (single report cover/page) + Plano + Comparações + Perfil

function RelatoriosScreen({ go, user }) {
  var [rows, setRows]       = React.useState([]);
  var [loading, setLoading] = React.useState(true);

  React.useEffect(function () {
    if (!user || !user.id || !window.fbGetReportsByUser) { setLoading(false); return; }
    window.fbGetReportsByUser(user.id).then(function (docs) {
      setRows(docs || []);
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [user && user.id]);

  function fmtDate(ts) {
    if (!ts) return '—';
    try { return ts.toDate().toLocaleDateString('pt-BR'); } catch (e) {}
    if (typeof ts === 'string') return ts;
    return '—';
  }

  // Exporta o relatório real do usuário em PDF (busca o DISC se necessário)
  function handleExport() {
    if (window.DISC_LAST_RESULT) {
      window.exportReportPDF(window.buildReportData(user, window.DISC_LAST_RESULT));
      return;
    }
    if (user && user.id) {
      window.fbGetDiscResult(user.id).then(function (doc) {
        const r = relDiscResultFromDoc(doc);
        if (!r) { alert('Faça o teste DISC antes de gerar o relatório.'); return; }
        window.DISC_LAST_RESULT = r;
        window.exportReportPDF(window.buildReportData(user, r));
      }).catch(function () { alert('Não foi possível carregar o resultado DISC.'); });
    } else {
      alert('Faça o teste DISC antes de gerar o relatório.');
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <input className="input" placeholder="Buscar relatórios..." style={{ paddingLeft: 38 }} />
            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <Ic.Search s={16}/>
            </div>
          </div>
          <button className="btn btn-secondary"><Ic.Settings s={14}/> Filtros</button>
        </div>
        <button className="btn btn-primary" onClick={() => go('relatorio')}>
          <Ic.Plus s={14}/> Gerar novo relatório
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Carregando relatórios…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            Nenhum relatório gerado ainda. Clique em <strong>Gerar novo relatório</strong> para criar o primeiro.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Relatório</th>
                <th>Data</th>
                <th>Tipo</th>
                <th style={{ textAlign: 'right', paddingRight: 24 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic.Pdf s={16}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.title || 'Relatório'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td><span className="badge badge-outline">{r.type || '—'}</span></td>
                  <td style={{ paddingRight: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="icon-btn" onClick={() => go('relatorio')}><Ic.Eye s={16}/></button>
                      <button className="icon-btn" onClick={handleExport} title="Baixar PDF"><Ic.Download s={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Mostrando {rows.length} relatório{rows.length === 1 ? '' : 's'}
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
    return <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Carregando relatório…</div>;
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 44, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <h2 className="serif" style={{ fontSize: 24, fontWeight: 500 }}>Relatório indisponível</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420 }}>
          Faça o teste DISC para gerar seu relatório completo — perfil, matriz de Kraljic e exportação em PDF.
        </p>
        <button className="btn btn-primary" onClick={function () { go('teste'); }}>
          Fazer o teste DISC <Ic.Arrow s={14} />
        </button>
      </div>
    );
  }

  const data = window.buildReportData(user, result);
  const mainColor = REL_DISC_COLORS[data.primary];
  const profile = data.profile;
  const kr = data.kraljic;
  const donutData = data.composition.map(function (c) {
    return { key: c.key, label: c.full, value: c.value, color: c.color };
  });

  function exportPDF() { window.exportReportPDF(data); }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-ghost" onClick={function () { go('relatorios'); }}>
          <Ic.ArrowL s={14} /> Voltar aos relatórios
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportPDF}><Ic.Pdf s={14} /> Exportar PDF</button>
          <button className="btn btn-primary" onClick={exportPDF}><Ic.Download s={14} /> Baixar relatório completo</button>
        </div>
      </div>

      {/* COVER */}
      <div className="report-cover">
        <div className="cover-image" />
        <div className="login-brand" style={{ marginBottom: 'auto' }}>
          <img src="assets/voratte-logo.webp" alt="Vorätte" style={{ height: 24 }} />
          <div className="login-tag">DISC<br/>Compras &amp; Negociação</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="report-eyebrow">Relatório executivo · Vorätte</div>
        <h1 className="report-title">
          Perfil de Comprador<br/>
          <em>DISC &amp; Matriz de Kraljic</em>
        </h1>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 40, fontSize: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Profissional</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>{data.name}</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{data.jobTitle || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Empresa</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>{data.company || '—'}</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{data.email || ''}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Perfil</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4, color: mainColor }}>
              {data.code} · {data.primaryLabel}
            </div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>{data.predominance}% predominância</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Emitido em</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>{data.dateStr}</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>Vorätte · DISC</div>
          </div>
        </div>
      </div>

      {/* SECTION 1 — análise comportamental */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="01" label="Análise comportamental" />
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 36, alignItems: 'center' }}>
          <Donut size={220} stroke={26} data={donutData}
            center={<><div className="letter" style={{ color: mainColor }}>{data.primary}</div><div className="label">{data.primaryLabel}</div></>}
          />
          <div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', marginBottom: 12 }}>
              Perfil <em style={{ color: mainColor }}>{profile.label}</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 580 }}>
              {profile.buyerType}. Sua dimensão predominante é <strong>{data.primaryLabel} ({data.primary})</strong>,
              com {data.predominance}% de composição{profile.secondary ? ' e traço secundário ' + profile.secondary : ''}.
            </p>
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
        <SectionLabel num="02" label="O que move & o que trava" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>O que move a compra</div>
            {profile.motivators.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" /><span>{s}</span></div>;
            })}
          </div>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>O que trava a decisão</div>
            {profile.fears.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" style={{ background: 'var(--disc-d)' }} /><span>{s}</span></div>;
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Kraljic */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="03" label="Matriz de Kraljic — posicionamento" />
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 36, alignItems: 'center' }}>
          <RelKraljicMatrix kr={kr} />
          <div>
            <div className="badge badge-brown" style={{ marginBottom: 10 }}>{kr.positionLabel}</div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
              Comprador {kr.label}
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 14, maxWidth: 540 }}>
              {kr.buyerPosture}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="stat" style={{ flex: 1 }}>
                <div className="stat-label">Impacto financeiro</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{kr.axis.impactoFinanceiro}</div>
              </div>
              <div className="stat" style={{ flex: 1 }}>
                <div className="stat-label">Risco de suprimento</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{kr.axis.riscoSuprimento}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — leitura completa do quadrante */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="04" label="Leitura completa do quadrante" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>O que você quer do fornecedor</div>
            {kr.whatHeWants.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" /><span>{s}</span></div>;
            })}
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>O que evitar com você</div>
            {kr.whatToAvoid.map(function (s) {
              return <div className="list-row" key={s}><div className="bullet" style={{ background: 'var(--disc-d)' }} /><span>{s}</span></div>;
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            ['Poder de negociação', kr.negotiationLeverage],
            ['Foco da proposta', kr.proposalFocus],
            ['Estilo de contrato', kr.contractStyle],
            ['Risco para o vendedor', kr.riskForVendor],
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

      {/* SECTION 5 — recomendações de abordagem */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="05" label="Recomendações de abordagem" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {profile.salesApproach.map(function (r, i) {
            return (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < profile.salesApproach.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                <div className={'disc-tile disc-' + data.primary.toLowerCase()} style={{ width: 28, height: 28, fontSize: 13, borderRadius: 8 }}>{i + 1}</div>
                <span style={{ fontSize: 14, color: 'var(--ink-soft)', flex: 1, alignSelf: 'center' }}>{r}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 18 }}>
          {[['Tom ideal', profile.pitchTone], ['Fechamento', profile.closingStrategy], ['Objeções', profile.objectionHandling]].map(function (row) {
            return (
              <div key={row[0]} style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>{row[0]}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{row[1]}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px', fontSize: 11.5, color: 'var(--muted)' }}>
        <span>Relatório gerado em {data.dateStr} · Vorätte</span>
        <button className="btn btn-secondary" onClick={exportPDF}><Ic.Pdf s={14} /> Exportar este relatório em PDF</button>
      </div>
    </div>
  );
}

// Mini matriz de Kraljic com o comprador plotado (usada na pré-visualização)
function RelKraljicMatrix({ kr }) {
  const x = kr.axis.riscoSuprimento;
  const y = kr.axis.impactoFinanceiro;
  const cells = [
    { id: 'alavancagem', dim: 'D', name: 'Alavancagem' },
    { id: 'estrategico', dim: 'I', name: 'Estratégico' },
    { id: 'nao_criticos', dim: 'C', name: 'Não-críticos' },
    { id: 'gargalo', dim: 'S', name: 'Gargalo' },
  ];
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>↑ Impacto financeiro</div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', aspectRatio: '1.25 / 1' }}>
        {cells.map(function (c) {
          const mine = kr.dominantQuadrant === c.id;
          return (
            <div key={c.id} style={{
              border: '1px solid ' + (mine ? 'var(--brown-300)' : 'var(--line)'),
              background: mine ? 'var(--brown-50)' : 'var(--paper)',
              padding: 10, display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              <div className={'disc-tile disc-' + c.dim.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13 }}>{c.dim}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
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
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginTop: 4, textAlign: 'right' }}>Risco de suprimento →</div>
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
function PlanoScreen({ go, user }) {
  const firstName = user && user.name ? user.name.split(' ')[0] : '';
  const items = [];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--ink), var(--brown-900))', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>
              Trilha personalizada
            </div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', marginTop: 8 }}>
              {firstName ? <>Seu plano de desenvolvimento, <em style={{ color: 'var(--brown-300)' }}>{firstName}</em></> : 'Seu plano de desenvolvimento'}
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--brown-200)', marginTop: 8, maxWidth: 560 }}>
              Em breve seu plano será construído a partir do seu perfil DISC e do seu contexto profissional.
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
          Seu plano personalizado estará disponível em breve. Conclua o teste DISC para liberar as primeiras recomendações.
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => go('teste')}>
              <Ic.Disc s={14}/> Ir para o teste DISC
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {items.map(it => (
            <div key={it.title} className="card">
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
                Próximas ações
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {it.actions.map((a, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: 'var(--brown-700)' }} />
                    <span style={{ textDecoration: i === 0 ? 'line-through' : 'none', opacity: i === 0 ? 0.6 : 1 }}>{a}</span>
                  </label>
                ))}
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
    const labels = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme' };
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
  }, [team]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 20 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>Comparativo da sua equipe</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>
              {loading ? 'Carregando…' : (team.length ? team.length + ' colaboradores avaliados' : 'Sem colaboradores avaliados ainda')}
            </div>
          </div>
          <Mini label="Mais comum" value={dist ? dist.mostCommonLabel : '—'} sub={dist ? dist.mostCommonCount + ' colaborador(es)' : '—'} />
          <Mini label="Mais raro"  value={dist ? dist.rarestLabel    : '—'} sub={dist ? dist.rarestCount    + ' colaborador(es)' : '—'} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
            <div className="card-title" style={{ marginBottom: 2 }}>Comparativo de perfis</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Composição DISC por colaborador</div>
          </div>
          {loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Carregando equipe…</div>
          ) : team.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
              Comparações disponíveis quando você fizer parte de uma equipe com avaliações concluídas.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>Colaborador</th>
                  <th>Perfil</th>
                  <th>Composição DISC</th>
                  <th style={{ paddingRight: 24, textAlign: 'right' }}>Ações</th>
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
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{ {D:'Dominante',I:'Influente',S:'Estável',C:'Conforme'}[p.main] }</span>
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
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-title">Distribuição da equipe</div>
          <div className="card-sub">Perfis predominantes</div>
          {!dist ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
              Sem dados suficientes.
            </div>
          ) : (
            <>
              <Donut size={180} stroke={24} data={[
                { key: 'D', value: dist.pct.D, color: 'var(--disc-d)' },
                { key: 'I', value: dist.pct.I, color: 'var(--disc-i)' },
                { key: 'S', value: dist.pct.S, color: 'var(--disc-s)' },
                { key: 'C', value: dist.pct.C, color: 'var(--disc-c)' },
              ]} center={<><div className="letter" style={{ fontSize: 28 }}>{dist.total}</div><div className="label">{dist.total === 1 ? 'Pessoa' : 'Pessoas'}</div></>} />
              <div className="legend" style={{ marginTop: 18 }}>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>Dominante</span><span className="pct">{dist.counts.D}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>Influente</span><span className="pct">{dist.counts.I}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>Estável</span><span className="pct">{dist.counts.S}</span></div>
                <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>Conforme</span><span className="pct">{dist.counts.C}</span></div>
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
const DISC_LABELS = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme' };

function PerfilScreen({ go, user }) {
  const u = user || {};
  const name = u.name || '—';
  const initials = u.name
    ? u.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase()
    : '·';
  const discMain = u.discMain;
  const subtitleParts = [];
  if (u.jobTitle)    subtitleParts.push(u.jobTitle);
  if (u.companyName) subtitleParts.push(u.companyName);
  const subtitle = subtitleParts.join(' · ') || 'Sem informações de cargo cadastradas';

  // Tabela de dados profissionais: somente campos com valor real
  const profileFields = [];
  if (u.name)        profileFields.push(['Nome completo', u.name]);
  if (u.email)       profileFields.push(['E-mail', u.email]);
  if (u.companyName) profileFields.push(['Empresa', u.companyName]);
  if (u.jobTitle)    profileFields.push(['Cargo', u.jobTitle]);

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
                  <div className="badge badge-brown">Perfil {DISC_LABELS[discMain] || discMain} ({discMain})</div>
                )}
                {u.companyName && (
                  <div className="badge badge-outline">{u.companyName}</div>
                )}
              </div>
            )}
          </div>
          <button className="btn btn-secondary"><Ic.Settings s={14}/> Editar perfil</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Dados profissionais</div>
          <div className="card-sub">Contexto considerado nas análises</div>
          {profileFields.length === 0 ? (
            <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13.5 }}>
              Sem dados cadastrados. Use “Editar perfil” para preencher.
            </div>
          ) : profileFields.map(function (f, i) {
            return (
              <div key={f[0]} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '10px 0', borderBottom: i < profileFields.length - 1 ? '1px solid var(--line-soft)' : 'none', fontSize: 13.5 }}>
                <div style={{ color: 'var(--muted)' }}>{f[0]}</div>
                <div style={{ color: 'var(--ink)', fontWeight: 500 }}>{f[1]}</div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">Histórico de avaliações</div>
          <div className="card-sub">Evolução do seu perfil ao longo do tempo</div>
          <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13.5 }}>
            Suas avaliações anteriores aparecerão aqui.
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary btn-block" onClick={() => go('teste')}>
              {discMain ? 'Refazer avaliação DISC' : 'Fazer avaliação DISC'} <Ic.Arrow s={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RelatoriosScreen = RelatoriosScreen;
window.RelatorioScreen = RelatorioScreen;
window.PlanoScreen = PlanoScreen;
window.ComparacoesScreen = ComparacoesScreen;
window.PerfilScreen = PerfilScreen;
