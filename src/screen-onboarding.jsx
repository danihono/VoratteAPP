// Onboarding state for first-time aluno
function AlunoOnboarding({ go }) {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none' }}>
        <div style={{
          padding: 48,
          background: 'linear-gradient(135deg, var(--brown-950) 0%, var(--brown-850) 50%, var(--brown-700) 100%)',
          color: 'var(--brown-50)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -120, top: -120, width: 500, height: 500, background: 'radial-gradient(circle, rgba(164,113,72,0.35), transparent 60%)' }} />
          <div style={{ position: 'relative', maxWidth: 720 }}>
            <div className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--brown-200)' }}>
              <Ic.Sparkle s={12}/> Bem-vindo à Voratte
            </div>
            <h1 className="serif" style={{ fontSize: 44, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05, marginTop: 18 }}>
              Olá, Rafael.<br/>
              <em style={{ color: 'var(--brown-300)' }}>Vamos descobrir seu perfil DISC?</em>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--brown-200)', marginTop: 18, lineHeight: 1.6, maxWidth: 540 }}>
              Sua avaliação leva cerca de <strong style={{ color: 'var(--brown-50)' }}>10 minutos</strong>.
              Você responde 28 cenários aplicados a Compras e Negociação, e a partir daí
              construímos seu relatório executivo personalizado, sua matriz de Kraljic
              e seu plano de desenvolvimento.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button className="btn btn-primary btn-lg" style={{ background: 'var(--brown-50)', color: 'var(--brown-900)' }} onClick={() => go('teste')}>
                Iniciar avaliação DISC <Ic.Arrow s={16}/>
              </button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--brown-50)' }}>
                Saber mais sobre o método
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="card" style={{ padding: 28 }}>
        <div className="card-title">Seu percurso na Voratte</div>
        <div className="card-sub">4 etapas para destravar todo o potencial da plataforma</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 18 }}>
          {[
            { n: 1, t: 'Responder DISC',          s: '28 cenários · 10 min',       icon: <Ic.Disc s={20}/>,    state: 'active' },
            { n: 2, t: 'Receber sua análise',     s: 'Perfil + cruzamentos',       icon: <Ic.Target s={20}/>,  state: 'locked' },
            { n: 3, t: 'Conectar com Kraljic',    s: 'Estratégia de compras',      icon: <Ic.Kraljic s={20}/>, state: 'locked' },
            { n: 4, t: 'Plano de desenvolvimento',s: 'Trilha personalizada',       icon: <Ic.Plan s={20}/>,    state: 'locked' },
          ].map(st => (
            <div key={st.n} style={{
              padding: 20, borderRadius: 12,
              background: st.state === 'active' ? 'var(--brown-50)' : 'var(--paper-warm)',
              border: '1px solid ' + (st.state === 'active' ? 'var(--brown-300)' : 'var(--line)'),
              opacity: st.state === 'locked' ? 0.55 : 1,
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: st.state === 'active' ? 'var(--brown-700)' : 'var(--paper)',
                  color: st.state === 'active' ? 'var(--brown-50)' : 'var(--brown-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: st.state === 'active' ? 'none' : 'inset 0 0 0 1px var(--line)',
                }}>
                  {st.icon}
                </div>
                {st.state === 'locked' && <Ic.Lock s={14}/>}
                {st.state === 'active' && <div className="badge badge-ink" style={{ fontSize: 10 }}>Próximo</div>}
              </div>
              <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
                Etapa {st.n}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{st.t}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{st.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic.Disc s={20}/>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>O que é o DISC?</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                O DISC é uma metodologia comportamental que mapeia 4 dimensões:
                <strong> Dominância</strong>, <strong>Influência</strong>,
                <strong> Estabilidade</strong> e <strong>Conformidade</strong> — aplicada
                ao contexto profissional de Compras.
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-50)', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic.Kraljic s={20}/>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>E a Matriz de Kraljic?</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Após sua avaliação, cruzamos seu perfil DISC com a matriz estratégica
                de Kraljic — para mostrar em quais categorias de compras seu estilo
                gera mais valor e onde adaptar a abordagem.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--ink)', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic.Shield s={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 16, fontWeight: 600 }}>Suas respostas são confidenciais</div>
            <p style={{ fontSize: 13, color: 'var(--brown-200)', marginTop: 4, lineHeight: 1.55 }}>
              Apenas você e seu gestor direto têm acesso ao seu relatório individual.
              Os dados são criptografados e estão em conformidade com a LGPD.
            </p>
          </div>
          <button className="btn btn-primary" style={{ background: 'var(--brown-50)', color: 'var(--brown-900)' }} onClick={() => go('teste')}>
            Começar agora <Ic.Arrow s={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

window.AlunoOnboarding = AlunoOnboarding;
