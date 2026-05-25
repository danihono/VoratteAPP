const AUTH_ERRORS = {
  'auth/user-not-found':      'E-mail não encontrado.',
  'auth/invalid-email':       'E-mail inválido.',
  'auth/wrong-password':      'Senha incorreta.',
  'auth/invalid-credential':  'E-mail ou senha incorretos.',
  'auth/too-many-requests':   'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/user-disabled':       'Conta desativada. Fale com seu administrador.',
};

// Login screen — split panel: dark editorial side + light form
function LoginScreen({ authError }) {
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !pwd) { setError('Preencha e-mail e senha.'); return; }
    setError('');
    setLoading(true);
    try {
      await window.fbLogin(email, pwd);
      // auth.onAuthStateChanged em app.jsx cuida do redirect automaticamente
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell page-enter">
      {/* Dark editorial side */}
      <div className="login-side" onKeyDown={e => e.key === 'Enter' && handleLogin(e)}>
        <div className="login-logo-stage">
          <img className="login-logo-large" src="assets/voratte-png.webp" alt="Vorätte" />
        </div>

        <div className="login-headline">
          <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--brown-300)', marginBottom: 20, fontWeight: 600 }}>
            Plataforma executiva
          </div>
          <h2>
            Inteligência comportamental aplicada à <em>compras estratégicas.</em>
          </h2>
          <p>
            Mapeie perfis DISC, cruze com a matriz de Kraljic e gere relatórios
            executivos prontos para a sua mesa de negociação.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-form">
          <h3>Acesse sua conta</h3>
          <div className="sub">Bem-vindo de volta. Entre para continuar.</div>

          {authError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: 13, marginBottom: 4 }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field">
              <label>E-mail corporativo</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPwd ? 'text' : 'password'}
                  value={pwd}
                  onChange={e => { setPwd(e.target.value); setError(''); }}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
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

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div className="row">
              <label className="checkbox-row">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Lembrar de mim
              </label>
              <a className="forgot">Esqueci minha senha</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Entrando…' : <><span>Entrar na plataforma</span> <Ic.Arrow s={16} /></>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              ou
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <button type="button" className="btn btn-secondary btn-block" style={{ padding: '12px 20px' }}>
              <Ic.Shield s={16} /> Acessar via SSO corporativo
            </button>
          </form>

          <div className="signup-row">
            Sua empresa ainda não usa a Vorätte? <a>Solicitar demonstração</a>
          </div>

          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--line-soft)', fontSize: 11, color: 'var(--muted-soft)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span><Ic.Lock s={12}/> Conexão criptografada</span>
            <span>© 2026 Vorätte</span>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10.5, color: 'var(--muted-soft)', letterSpacing: '0.04em' }}>
            Desenvolvido por Daniel Honorato
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
