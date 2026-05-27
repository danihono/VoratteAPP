const AUTH_ERROR_KEYS = {
  'auth/user-not-found':      'auth.error.userNotFound',
  'auth/invalid-email':       'auth.error.invalidEmail',
  'auth/wrong-password':      'auth.error.wrongPassword',
  'auth/invalid-credential':  'auth.error.invalidCred',
  'auth/too-many-requests':   'auth.error.tooMany',
  'auth/user-disabled':       'auth.error.userDisabled',
};

// Login screen — split panel: dark editorial side + light form
function LoginScreen({ authError }) {
  useLang();
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [forgotOpen, setForgotOpen] = React.useState(false);

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !pwd) { setError(t('auth.error.fillBoth')); return; }
    setError('');
    setLoading(true);
    try {
      // LOCAL = persiste após fechar o navegador; SESSION = só dura enquanto a aba estiver aberta
      await window.fbSetPersistence(remember);
      await window.fbLogin(email, pwd);
      // auth.onAuthStateChanged em app.jsx cuida do redirect automaticamente
    } catch (err) {
      const key = AUTH_ERROR_KEYS[err.code];
      setError(key ? t(key) : t('auth.error.generic'));
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
            {t('login.eyebrow')}
          </div>
          <h2 dangerouslySetInnerHTML={{ __html: t('login.headline') }} />
          <p>
            {t('login.lede')}
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-form">
          <h3>{t('login.formTitle')}</h3>
          <div className="sub">{t('login.formSub')}</div>

          {authError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: 13, marginBottom: 4 }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field">
              <label>{t('login.emailLabel')}</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label>{t('login.passwordLabel')}</label>
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
                {t('login.remember')}
              </label>
              <button
                type="button"
                className="forgot"
                onClick={() => setForgotOpen(true)}
                style={{ background: 'transparent', padding: 0, cursor: 'pointer' }}
              >
                {t('login.forgot')}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 8 }}
              disabled={loading}
            >
              {loading ? t('login.submitting') : <><span>{t('login.submit')}</span> <Ic.Arrow s={16} /></>}
            </button>

          </form>

          <div className="signup-row">
            {t('login.signupRow')} <a>{t('login.signupLink')}</a>
          </div>

          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--line-soft)', fontSize: 11, color: 'var(--muted-soft)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span><Ic.Lock s={12}/> {t('login.secure')}</span>
            <span>{t('login.copyright')}</span>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10.5, color: 'var(--muted-soft)', letterSpacing: '0.04em' }}>
            {t('app.devCredit')}
          </div>
        </div>
      </div>

      {forgotOpen && (
        <ForgotPasswordModal
          initialEmail={email}
          onClose={() => setForgotOpen(false)}
        />
      )}
    </div>
  );
}

// Modal de redefinição de senha — usa firebase.auth().sendPasswordResetEmail via window.fbResetPassword
function ForgotPasswordModal({ initialEmail, onClose }) {
  useLang();
  const [email, setEmail] = React.useState(initialEmail || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) { setError(t('forgot.errorEmptyEmail')); return; }
    setError('');
    setLoading(true);
    try {
      await window.fbResetPassword(email);
      setSent(true);
    } catch (err) {
      const key = AUTH_ERROR_KEYS[err.code];
      setError(key ? t(key) : t('auth.error.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(21, 9, 10, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          width: '100%', maxWidth: 460, padding: 28,
          background: 'var(--paper)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{t('forgot.title')}</h3>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
              {t('forgot.lede')}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label={t('forgot.close')}
            style={{ flexShrink: 0 }}
          >
            <Ic.Close s={16} />
          </button>
        </div>

        {sent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <div
              style={{ padding: '12px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', fontSize: 13, lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: t('forgot.sent', { email: email }) }}
            />
            <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
              {t('forgot.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <div className="field">
              <label>{t('forgot.emailLabel')}</label>
              <input
                className="input"
                type="email"
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? t('forgot.sending') : t('forgot.submit')}
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={onClose} disabled={loading}>
              {t('forgot.close')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
