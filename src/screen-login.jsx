// Login screen — split panel: dark editorial side + light form
function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('rafael.mendes@voratte.com');
  const [pwd, setPwd] = React.useState('•••••••••');
  const [remember, setRemember] = React.useState(true);
  const [showPwd, setShowPwd] = React.useState(false);

  return (
    <div className="login-shell page-enter">
      {/* Dark editorial side */}
      <div className="login-side">
        <div className="login-brand">
          <img src="assets/voratte-logo.webp" alt="Voratte" />
          <div className="login-tag">DISC<br/>Compras &amp; Negociação</div>
        </div>

        <div className="login-headline">
          <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--brown-300)', marginBottom: 20, fontWeight: 600 }}>
            Plataforma executiva · v2.6
          </div>
          <h2>
            Inteligência comportamental aplicada à <em>compras estratégicas.</em>
          </h2>
          <p>
            Mapeie perfis DISC, cruze com a matriz de Kraljic e gere relatórios
            executivos prontos para a sua mesa de negociação.
          </p>

          <div className="login-meta">
            <div><strong>2 814</strong>profissionais avaliados</div>
            <div><strong>147</strong>empresas conectadas</div>
            <div><strong>9.1</strong>NPS médio</div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-form">
          <h3>Acesse sua conta</h3>
          <div className="sub">Bem-vindo de volta. Entre para continuar.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field">
              <label>E-mail corporativo</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="field">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPwd ? 'text' : 'password'}
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute', right: 6, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 32, height: 32, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--muted)'
                  }}
                >
                  <Ic.Eye s={16} />
                </button>
              </div>
            </div>

            <div className="row">
              <label className="checkbox-row">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Lembrar de mim
              </label>
              <a className="forgot">Esqueci minha senha</a>
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={onLogin} style={{ marginTop: 8 }}>
              Entrar na plataforma <Ic.Arrow s={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              ou
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <button className="btn btn-secondary btn-block" style={{ padding: '12px 20px' }}>
              <Ic.Shield s={16} /> Acessar via SSO corporativo
            </button>
          </div>

          <div className="signup-row">
            Sua empresa ainda não usa a Voratte? <a>Solicitar demonstração</a>
          </div>

          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--line-soft)', fontSize: 11, color: 'var(--muted-soft)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span><Ic.Lock s={12}/> Conexão criptografada</span>
            <span>© 2026 Voratte</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
