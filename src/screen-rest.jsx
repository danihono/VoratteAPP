// Relatórios list + Relatório (single report cover/page) + Plano + Comparações + Perfil

function RelatoriosScreen({ go }) {
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
                    <button className="icon-btn"><Ic.Download s={16}/></button>
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

// ============ RELATÓRIO (cover + body) ============
function RelatorioScreen({ go }) {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-ghost" onClick={() => go('relatorios')}>
          <Ic.ArrowL s={14}/> Voltar aos relatórios
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary"><Ic.Pdf s={14}/> Exportar PDF</button>
          <button className="btn btn-primary"><Ic.Download s={14}/> Baixar relatório completo</button>
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

        <div className="report-eyebrow">Relatório executivo · Voratte · v2.6</div>
        <h1 className="report-title">
          Relatório DISC<br/>
          <em>&amp; Estratégias de Compras</em>
        </h1>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 40, fontSize: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Profissional</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>Rafael Mendes</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>Comprador Sênior</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Empresa</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>ABC Indústria</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>Setor: Manufatura</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Perfil</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>Dominante · D</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>68% predominância</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brown-300)', fontWeight: 600 }}>Emitido em</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginTop: 4 }}>25 mai. 2026</div>
            <div style={{ color: 'var(--brown-300)', marginTop: 2 }}>24 páginas</div>
          </div>
        </div>
      </div>

      {/* SECTION 1 */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="01" label="Análise comportamental" />
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 36, alignItems: 'center' }}>
          <Donut size={220} stroke={26} data={DISC_DATA}
            center={<><div className="letter">D</div><div className="label">Dominante</div></>}
          />
          <div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', marginBottom: 12 }}>
              Perfil <em>Dominante</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 580 }}>
              Você é determinado, competitivo e focado em resultados. Gosta de desafios
              e busca sempre a excelência. Sua dominância representa <strong>68%</strong> do
              perfil, com influência secundária de <strong>18%</strong>.
            </p>
            <div className="legend" style={{ marginTop: 22, maxWidth: 380 }}>
              {DISC_DATA.map(d => (
                <div className="legend-row" key={d.key}>
                  <div className="sw" style={{ background: d.color }} />
                  <span>{d.key} · {d.label}</span>
                  <span className="pct">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — strengths & attention */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="02" label="Forças & Pontos de atenção" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Pontos fortes</div>
            {['Foco em resultados', 'Tomada de decisão rápida', 'Liderança natural', 'Resiliência sob pressão'].map(s => (
              <div className="list-row" key={s}><div className="bullet"/><span>{s}</span></div>
            ))}
          </div>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Pontos de atenção</div>
            {['Impaciência', 'Pode ser muito direto', 'Dificuldade em delegar', 'Sensibilidade a críticas'].map(s => (
              <div className="list-row" key={s}><div className="bullet" style={{ background: 'var(--disc-d)' }}/><span>{s}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — comm & nego */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="03" label="Comunicação & Negociação" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 36, alignItems: 'center' }}>
          <div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Seu estilo de comunicação</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 18 }}>
              Direto, claro e assertivo. Prefere conversas rápidas e focadas em resultados.
              Pouca tolerância a rodeios; respeita quem vai ao ponto.
            </p>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Seu estilo de negociação</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
              Competitivo, focado em ganho e eficiência. Busca sempre as melhores
              condições e fecha rápido quando o valor está claro.
            </p>
          </div>
          <div style={{ background: 'var(--paper-warm)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brown-100)', color: 'var(--brown-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ic.Handshake s={36}/>
            </div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500 }}>Distributiva</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Tendência primária</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Kraljic */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="04" label="Matriz de Kraljic — quadrantes ideais" />
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 36, alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[['D','Alavancagem'],['I','Estratégico'],['S','Gargalo'],['C','Não Críticos']].map(([k, l]) => (
              <div key={k} style={{ padding: 14, background: 'var(--paper-warm)', borderRadius: 10, textAlign: 'center', border: k==='D' ? '1px solid var(--brown-500)' : '1px solid var(--line)' }}>
                <div className={'disc-tile disc-' + k.toLowerCase()} style={{ width: 32, height: 32, fontSize: 16, marginBottom: 6 }}>{k}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 540 }}>
            Seu perfil tem mais aderência às estratégias de <strong>Alavancagem</strong> e
            <strong> Estratégico</strong>. Veja ao lado as recomendações por quadrante e adapte
            sua abordagem em itens de Gargalo e Não Críticos.
          </p>
        </div>
      </section>

      {/* SECTION 5 — recommendations */}
      <section className="card" style={{ padding: 36 }}>
        <SectionLabel num="05" label="Recomendações personalizadas" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Continue desenvolvendo sua escuta ativa em fornecedores críticos.',
            'Trabalhe a paciência em negociações complexas e plurianuais.',
            'Delegue mais e confie no time para itens não críticos.',
            'Mantenha o foco em relacionamentos estratégicos.',
            'Use perfis C/S do seu time para itens de Gargalo.',
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--line-soft)' : 'none' }}>
              <div className={'disc-tile disc-d'} style={{ width: 28, height: 28, fontSize: 13, borderRadius: 8 }}>{i+1}</div>
              <span style={{ fontSize: 14, color: 'var(--ink-soft)', flex: 1, alignSelf: 'center' }}>{r}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px', fontSize: 11.5, color: 'var(--muted)' }}>
        <span>Relatório gerado em 25/05/2026 · Voratte v2.6</span>
        <span>Página 1 de 24</span>
      </div>
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
