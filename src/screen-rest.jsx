// Relatórios list + Relatório (single report cover/page) + Plano + Comparações + Perfil

function RelatoriosScreen({ go, user }) {
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

  const rows = [
    { name: 'Relatório DISC completo', date: '25/05/2026', type: 'Completo', status: 'Pronto' },
    { name: 'Relatório Matriz de Kraljic', date: '20/05/2026', type: 'Estratégico', status: 'Pronto' },
    { name: 'Relatório de Objeções', date: '16/05/2026', type: 'Negociação', status: 'Pronto' },
    { name: 'Comparativo de Perfis · Time Compras', date: '15/05/2026', type: 'Comparação', status: 'Pronto' },
    { name: 'Plano de Desenvolvimento Pessoal', date: '10/05/2026', type: 'Desenvolvimento', status: 'Em revisão' },
    { name: 'Avaliação DISC · 1º semestre', date: '02/04/2026', type: 'Avaliação', status: 'Arquivado' },
  ];
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <input className="input" placeholder="Buscar relatórios..." style={{ paddingLeft: 38 }} />
            <Ic.Search s={16} />
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
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Relatório</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ic.Pdf s={16}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>24 páginas · 4.2 MB</div>
                    </div>
                  </div>
                </td>
                <td>{r.date}</td>
                <td><span className="badge badge-outline">{r.type}</span></td>
                <td>
                  <span style={{
                    fontSize: 11.5, fontWeight: 600,
                    color: r.status === 'Pronto' ? 'var(--brown-700)' : r.status === 'Em revisão' ? '#a87139' : 'var(--muted)',
                  }}>
                    ● {r.status}
                  </span>
                </td>
                <td style={{ paddingRight: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    <button className="icon-btn" onClick={() => go('relatorio')}><Ic.Eye s={16}/></button>
                    <button className="icon-btn" onClick={handleExport} title="Baixar PDF"><Ic.Download s={16}/></button>
                    <button className="icon-btn"><Ic.More s={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
        <span>Mostrando 6 de 18 relatórios</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}><Ic.ArrowL s={12}/></button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>1</button>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>2</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>3</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}><Ic.Arrow s={12}/></button>
        </div>
      </div>
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
          <img src="assets/voratte-logo.webp" alt="Voratte" style={{ height: 24 }} />
          <div className="login-tag">DISC<br/>Compras &amp; Negociação</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="report-eyebrow">Relatório executivo · Voratte</div>
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
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>Voratte · DISC</div>
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
        <span>Relatório gerado em {data.dateStr} · Voratte</span>
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
function PlanoScreen({ go }) {
  const items = [
    { icon: <Ic.Chat s={20}/>, title: 'Comunicação', sub: 'Desenvolver escuta ativa e empatia', pct: 60,
      actions: ['Praticar escuta ativa em 3 reuniões/semana', 'Pedir feedback após cada negociação', 'Ler 1 livro sobre comunicação não-violenta'] },
    { icon: <Ic.Handshake s={20}/>, title: 'Negociação', sub: 'Aprimorar estratégias de concessão', pct: 40,
      actions: ['Mapear BATNA antes de cada negociação', 'Documentar concessões e contrapartidas', 'Treinamento avançado de negociação ganha-ganha'] },
    { icon: <Ic.Shield s={20}/>, title: 'Gestão de conflitos', sub: 'Trabalhar paciência e diplomacia', pct: 30,
      actions: ['Pausar 5 segundos antes de responder em conflitos', 'Mediar 2 conflitos da equipe por mês', 'Sessões com coach focado em diplomacia'] },
    { icon: <Ic.Sparkle s={20}/>, title: 'Liderança', sub: 'Inspirar e desenvolver sua equipe', pct: 50,
      actions: ['Delegar uma decisão estratégica por semana', '1:1 quinzenal com cada subordinado', 'Plano de carreira para 100% da equipe'] },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--ink), var(--brown-900))', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>
              Trilha personalizada · 6 meses
            </div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', marginTop: 8 }}>
              Seu plano de desenvolvimento, <em style={{ color: 'var(--brown-300)' }}>Rafael</em>
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--brown-200)', marginTop: 8, maxWidth: 560 }}>
              Construído a partir do seu perfil DISC e do seu contexto em Compras Sênior.
              Foco: equilibrar firmeza com escuta para potencializar resultados em itens estratégicos.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 56, fontWeight: 500, color: 'var(--brown-50)', letterSpacing: '-0.03em', lineHeight: 1 }}>45%</div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--brown-400)', fontWeight: 600, marginTop: 6 }}>Progresso geral</div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

// ============ COMPARAÇÕES ============
function ComparacoesScreen({ go }) {
  const team = [
    { name: 'Rafael Mendes', role: 'Comprador Sênior', d: 68, i: 18, s: 8, c: 6, main: 'D' },
    { name: 'Júlia Cordeiro', role: 'Comprador Pleno', d: 22, i: 54, s: 16, c: 8, main: 'I' },
    { name: 'Bruno Tavares', role: 'Coordenador', d: 12, i: 14, s: 58, c: 16, main: 'S' },
    { name: 'Helena Antunes', role: 'Especialista', d: 8, i: 12, s: 18, c: 62, main: 'C' },
    { name: 'Marcos Vianna', role: 'Comprador Júnior', d: 34, i: 28, s: 22, c: 16, main: 'D' },
    { name: 'Carolina Reis', role: 'Gerente de Compras', d: 28, i: 38, s: 24, c: 10, main: 'I' },
  ];
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 20 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>Time Compras · ABC Indústria</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>6 colaboradores avaliados · atualizado em 25/05</div>
          </div>
          <Mini label="Mais comum" value="Influente" sub="2 colaboradores" />
          <Mini label="Mais raro" value="Conforme" sub="1 colaborador" />
          <Mini label="Compatibilidade" value="84%" sub="Alto alinhamento" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
            <div className="card-title" style={{ marginBottom: 2 }}>Comparativo de perfis</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Composição DISC por colaborador</div>
          </div>
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
                <tr key={i}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--brown-400), var(--brown-700))' }}>
                        {p.name.split(' ').map(n => n[0]).join('').slice(0,2)}
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
        </div>

        <div className="card">
          <div className="card-title">Distribuição da equipe</div>
          <div className="card-sub">Perfis predominantes</div>
          <Donut size={180} stroke={24} data={[
            { key: 'D', value: 33, color: 'var(--disc-d)' },
            { key: 'I', value: 33, color: 'var(--disc-i)' },
            { key: 'S', value: 17, color: 'var(--disc-s)' },
            { key: 'C', value: 17, color: 'var(--disc-c)' },
          ]} center={<><div className="letter" style={{ fontSize: 28 }}>6</div><div className="label">Pessoas</div></>} />
          <div className="legend" style={{ marginTop: 18 }}>
            <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-d)' }}/><span>Dominante</span><span className="pct">2</span></div>
            <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-i)' }}/><span>Influente</span><span className="pct">2</span></div>
            <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-s)' }}/><span>Estável</span><span className="pct">1</span></div>
            <div className="legend-row"><div className="sw" style={{ background: 'var(--disc-c)' }}/><span>Conforme</span><span className="pct">1</span></div>
          </div>
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
function PerfilScreen({ go }) {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brown-400), var(--brown-700))', color: 'var(--brown-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, letterSpacing: '0.02em' }}>
            RM
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em' }}>Rafael Mendes</h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Comprador Sênior · ABC Indústria · há 4 anos na plataforma</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div className="badge badge-brown">Perfil Dominante (D)</div>
              <div className="badge badge-outline">Compras estratégicas</div>
              <div className="badge badge-outline">Manufatura</div>
            </div>
          </div>
          <button className="btn btn-secondary"><Ic.Settings s={14}/> Editar perfil</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Dados profissionais</div>
          <div className="card-sub">Contexto considerado nas análises</div>
          {[
            ['Nome completo', 'Rafael Mendes da Costa'],
            ['E-mail', 'rafael.mendes@voratte.com'],
            ['Empresa', 'ABC Indústria S.A.'],
            ['Setor', 'Manufatura · Bens de capital'],
            ['Área de atuação', 'Compras estratégicas'],
            ['Cargo', 'Comprador Sênior'],
            ['Nível de experiência', '7+ anos'],
            ['Objetivo profissional', 'Coordenação de Compras em 24 meses'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '10px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 13.5 }}>
              <div style={{ color: 'var(--muted)' }}>{k}</div>
              <div style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Histórico de avaliações</div>
          <div className="card-sub">Evolução do seu perfil ao longo do tempo</div>
          {[
            ['Maio 2026', 'D · 68%', 'Atual'],
            ['Outubro 2025', 'D · 64%', '+4 pts em D'],
            ['Maio 2025', 'D · 62%', '+2 pts em I'],
            ['Outubro 2024', 'D · 58%', '+1 pt em S'],
          ].map(([d, p, n], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--line-soft)' : 'none', fontSize: 13.5 }}>
              <div style={{ color: 'var(--muted)' }}>{d}</div>
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{p}</div>
              <div className="badge badge-brown" style={{ fontSize: 10 }}>{n}</div>
            </div>
          ))}

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary btn-block" onClick={() => go('teste')}>
              Refazer avaliação DISC <Ic.Arrow s={14}/>
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
