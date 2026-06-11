// Vorätte DISC Platform — main app shell with role switching + routing

// ===== Theme (light/dark) — applied to <html> via data-theme; persisted in localStorage =====
(function bootTheme() {
  try {
    var saved = localStorage.getItem('voratte-theme');
    var theme = saved === 'dark' ? 'dark' : 'light'; // default = claro
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
window.setTheme = function (theme) {
  var t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('voratte-theme', t); } catch (e) {}
  window.dispatchEvent(new CustomEvent('voratte-theme', { detail: t }));
};
window.getTheme = function () {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

// React hook que mantém o tema atual sincronizado entre componentes
function useTheme() {
  const [theme, setThemeState] = React.useState(window.getTheme());
  React.useEffect(function () {
    function onChange(e) { setThemeState(e.detail); }
    window.addEventListener('voratte-theme', onChange);
    return function () { window.removeEventListener('voratte-theme', onChange); };
  }, []);
  return [theme, function (t) { window.setTheme(t); }];
}
window.useTheme = useTheme;

// Pill toggle reutilizável (Sol / Lua) — usado na topbar
function ThemeTogglePill() {
  const [theme, setTheme] = useTheme();
  // Necessário useLang para re-renderizar labels traduzidos
  useLang();
  return (
    <div className="theme-pill" data-mode={theme} title={theme === 'dark' ? t('topbar.themeDarkActive') : t('topbar.themeLightActive')}>
      <span className="thumb" />
      <button
        className={theme === 'light' ? 'active' : ''}
        onClick={() => setTheme('light')}
        aria-label={t('topbar.themeLight')}
      >
        <Ic.Sun s={15} />
      </button>
      <button
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => setTheme('dark')}
        aria-label={t('topbar.themeDark')}
      >
        <Ic.Moon s={15} />
      </button>
    </div>
  );
}
window.ThemeTogglePill = ThemeTogglePill;

// Seletor de idioma — botão globo + popover com chips PT / ES / EN
function LangPicker() {
  const [lang, setLang] = useLang();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const langs = [
    { code: 'ptBR', short: 'PT', labelKey: 'topbar.lang.ptBR' },
    { code: 'es',   short: 'ES', labelKey: 'topbar.lang.es' },
    { code: 'en',   short: 'EN', labelKey: 'topbar.lang.en' },
  ];
  return (
    <div className="lang-wrap" ref={ref}>
      <button
        className="icon-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={t('topbar.changeLanguage')}
        aria-expanded={open}
        title={t('topbar.changeLanguage')}
      >
        <Ic.Globe s={18}/>
      </button>
      {open && (
        <div className="lang-popover" role="menu">
          {langs.map(l => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={lang === l.code}
              className={'lang-chip' + (lang === l.code ? ' active' : '')}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              <span className="lang-chip-code serif">{l.short}</span>
              <span className="lang-chip-label">{t(l.labelKey)}</span>
              {lang === l.code && <Ic.Check s={14}/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
window.LangPicker = LangPicker;

// Sidebar navs por papel — funções para t() ser resolvido no idioma atual no render
function buildNavAluno() {
  return [
    { key: 'dashboard',  label: t('nav.dashboard'),    icon: <Ic.Dashboard/>, group: t('navGroup.minhaJornada') },
    { key: 'teste',      label: t('nav.teste'),        icon: <Ic.Disc/>,      group: t('navGroup.minhaJornada') },
    { key: 'analise',    label: t('nav.analise'),      icon: <Ic.Target/>,    group: t('navGroup.minhaJornada') },
    { key: 'cruzamento', label: t('nav.cruzamento'),   icon: <Ic.Compare/>,   group: t('navGroup.minhaJornada') },
    { key: 'kraljic',    label: t('nav.kraljic'),      icon: <Ic.Kraljic/>,   group: t('navGroup.estrategia') },
    { key: 'objecoes',   label: t('nav.objecoes'),     icon: <Ic.Object/>,    group: t('navGroup.estrategia') },
    { key: 'plano',      label: t('nav.plano'),        icon: <Ic.Plan/>,      group: t('navGroup.desenvolvimento') },
    { key: 'relatorios', label: t('nav.relatorios'),   icon: <Ic.Report/>,    group: t('navGroup.documentos') },
    { key: 'perfil',     label: t('nav.perfil'),       icon: <Ic.User/>,      group: t('navGroup.conta') },
  ];
}
function buildNavGestor() {
  return [
    { key: 'dashboard',   label: t('nav.gestor.dashboard'),    icon: <Ic.Dashboard/>, group: t('navGroup.gestao') },
    { key: 'equipe',      label: t('nav.gestor.equipe'),       icon: <Ic.User/>,      group: t('navGroup.gestao') },
    { key: 'comparacoes', label: t('nav.gestor.comparacoes'),  icon: <Ic.Compare/>,   group: t('navGroup.gestao') },
    { key: 'mapa',        label: t('nav.gestor.mapa'),         icon: <Ic.Kraljic/>,   group: t('navGroup.gestao') },
    { key: 'kraljic',     label: t('nav.kraljic'),             icon: <Ic.Diamond/>,   group: t('navGroup.estrategia') },
    { key: 'objecoes',    label: t('nav.gestor.objecoes'),     icon: <Ic.Object/>,    group: t('navGroup.estrategia') },
    { key: 'relatorios',  label: t('nav.gestor.relatorios'),   icon: <Ic.Report/>,    group: t('navGroup.documentos') },
    { key: 'teste',       label: t('nav.teste'),               icon: <Ic.Disc/>,      group: t('navGroup.conta') },
    { key: 'analise',     label: t('nav.gestor.analise'),      icon: <Ic.Target/>,    group: t('navGroup.conta') },
    { key: 'perfil',      label: t('nav.perfil'),              icon: <Ic.User/>,      group: t('navGroup.conta') },
  ];
}
function buildNavAdmin() {
  return [
    { key: 'dashboard',    label: t('nav.admin.dashboard'),    icon: <Ic.Dashboard/>, group: t('navGroup.console') },
    { key: 'usuarios',     label: t('nav.admin.usuarios'),     icon: <Ic.User/>,      group: t('navGroup.console') },
    { key: 'empresas',     label: t('nav.admin.empresas'),     icon: <Ic.Kraljic/>,   group: t('navGroup.console') },
    { key: 'gestores',     label: t('nav.admin.gestores'),     icon: <Ic.Shield/>,    group: t('navGroup.console') },
    { key: 'estatisticas', label: t('nav.admin.estatisticas'), icon: <Ic.Chart/>,     group: t('navGroup.analytics') },
    { key: 'relatorios',   label: t('nav.admin.relatorios'),   icon: <Ic.Report/>,    group: t('navGroup.analytics') },
    { key: 'permissoes',   label: t('nav.admin.permissoes'),   icon: <Ic.Lock/>,      group: t('navGroup.config') },
    { key: 'perfil',       label: t('nav.admin.perfil'),       icon: <Ic.Settings/>,  group: t('navGroup.conta') },
  ];
}

function buildPageMeta() {
  return {
    perfil:     { title: t('page.perfil.title'),    sub: t('page.perfil.sub') },
    kraljic:    { title: t('page.kraljic.title'),   sub: t('page.kraljic.sub') },
    objecoes:   { title: t('page.objecoes.title'),  sub: t('page.objecoes.sub') },
    relatorio:  { title: t('page.relatorio.title'), sub: t('page.relatorio.sub') },
    aluno: {
      dashboard:  { title: t('page.aluno.dashboard.title'),   sub: t('page.aluno.dashboard.sub') },
      teste:      { title: t('page.aluno.teste.title'),       sub: t('page.aluno.teste.sub') },
      analise:    { title: t('page.aluno.analise.title'),     sub: t('page.aluno.analise.sub') },
      cruzamento: { title: t('page.aluno.cruzamento.title'),  sub: t('page.aluno.cruzamento.sub') },
      plano:      { title: t('page.aluno.plano.title'),       sub: t('page.aluno.plano.sub') },
      relatorios: { title: t('page.aluno.relatorios.title'),  sub: t('page.aluno.relatorios.sub') },
    },
    gestor: {
      dashboard:   { title: t('page.gestor.dashboard.title'),   sub: t('page.gestor.dashboard.sub') },
      equipe:      { title: t('page.gestor.equipe.title'),      sub: t('page.gestor.equipe.sub') },
      comparacoes: { title: t('page.gestor.comparacoes.title'), sub: t('page.gestor.comparacoes.sub') },
      mapa:        { title: t('page.gestor.mapa.title'),        sub: t('page.gestor.mapa.sub') },
      relatorios:  { title: t('page.gestor.relatorios.title'),  sub: t('page.gestor.relatorios.sub') },
      teste:       { title: t('page.aluno.teste.title'),        sub: t('page.aluno.teste.sub') },
      analise:     { title: t('page.gestor.analise.title'),     sub: t('page.gestor.analise.sub') },
    },
    admin: {
      dashboard:    { title: t('page.admin.dashboard.title'),    sub: t('page.admin.dashboard.sub') },
      usuarios:     { title: t('page.admin.usuarios.title'),     sub: t('page.admin.usuarios.sub') },
      empresas:     { title: t('page.admin.empresas.title'),     sub: t('page.admin.empresas.sub') },
      gestores:     { title: t('page.admin.gestores.title'),     sub: t('page.admin.gestores.sub') },
      estatisticas: { title: t('page.admin.estatisticas.title'), sub: t('page.admin.estatisticas.sub') },
      relatorios:   { title: t('page.admin.relatorios.title'),   sub: t('page.admin.relatorios.sub') },
      permissoes:   { title: t('page.admin.permissoes.title'),   sub: t('page.admin.permissoes.sub') },
    },
  };
}

function App() {
  const [lang] = useLang();
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authError, setAuthError] = React.useState('');
  const [role, setRole] = React.useState('aluno'); // 'aluno' | 'gestor' | 'admin' — fonte da verdade
  const [viewAsRole, setViewAsRole] = React.useState(null); // override apenas para admin (modo demo)
  const [route, setRoute] = React.useState('dashboard');
  const [navOpen, setNavOpen] = React.useState(false); // drawer da sidebar no mobile

  // Fecha o drawer com Escape (mobile)
  React.useEffect(function () {
    if (!navOpen) return;
    const onKey = function (e) { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return function () { window.removeEventListener('keydown', onKey); };
  }, [navOpen]);

  // Carrega perfil do Firestore a partir do usuário Firebase Auth
  const loadProfile = React.useCallback(async function (firebaseUser) {
    if (!firebaseUser) {
      setCurrentUser(null);
      setLoggedIn(false);
      return;
    }
    try {
      const profile = await window.fbGetUserProfile(firebaseUser.uid);
      if (profile) {
        setCurrentUser(profile);
        setAuthError('');
        setRole(profile.role || 'aluno');
        setLoggedIn(true);
        // Marca atividade para o admin distinguir "Ativo" de "Convidado".
        // Fire-and-forget: falha (offline/regra) não bloqueia o login.
        window.fbTouchLastSeen(firebaseUser.uid).catch(function (e) {
          console.warn('fbTouchLastSeen falhou:', e && e.message);
        });
      } else {
        await window.fbLogout();
        setAuthError(t('auth.error.notConfigured'));
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setLoggedIn(false);
    }
  }, []);

  // Re-carrega perfil sem esperar onAuthStateChanged (útil após mudanças em users/{uid})
  const refreshProfile = React.useCallback(function () {
    return loadProfile(window.auth.currentUser);
  }, [loadProfile]);

  // Escuta mudanças de autenticação Firebase e carrega perfil do Firestore
  React.useEffect(function () {
    return window.auth.onAuthStateChanged(async function (firebaseUser) {
      await loadProfile(firebaseUser);
      setAuthLoading(false);
    });
  }, [loadProfile]);

  // Mantém document.title sincronizado com o idioma
  React.useEffect(function () {
    document.title = t('app.title');
  }, [lang]);

  // Admin pode trocar a visão sem alterar role real no Firestore.
  // Selecionar o próprio role desativa o modo demo.
  const switchRole = (r) => {
    const isAdmin = currentUser && currentUser.role === 'admin';
    setViewAsRole(isAdmin && r !== currentUser.role ? r : null);
    setRoute('dashboard');
  };

  // Tela de splash enquanto Firebase verifica sessão
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--paper)', flexDirection: 'column', gap: 20 }}>
        <img src="assets/voratte-logo.webp" alt="Vorätte" style={{ width: 64, opacity: 0.7 }} />
        <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.06em' }}>{t('app.loading')}</div>
      </div>
    );
  }

  if (!loggedIn) {
    return <LoginScreen authError={authError} />;
  }

  const effectiveRole = viewAsRole || role;
  const isDemoMode = !!viewAsRole;

  const nav = effectiveRole === 'gestor' ? buildNavGestor() : effectiveRole === 'admin' ? buildNavAdmin() : buildNavAluno();
  const PAGE_META = buildPageMeta();

  // Sobrescreve título do dashboard com o nome real do usuário
  const firstName = currentUser && currentUser.name ? currentUser.name.split(' ')[0] : null;
  const baseMeta = (PAGE_META[effectiveRole] && PAGE_META[effectiveRole][route]) || PAGE_META[route] || { title: 'Vorätte', sub: '' };
  const meta = (route === 'dashboard' && firstName)
    ? { ...baseMeta, title: t('page.aluno.dashboard.greeting', { name: firstName }) }
    : baseMeta;

  // Perfil exibido na sidebar: usa dados reais quando disponível, fallback para role labels
  const roleLabel = effectiveRole === 'admin' ? t('role.adminFull')
                  : effectiveRole === 'gestor' ? t('role.gestor')
                  : t('role.aluno');
  const profile = currentUser ? {
    name:     currentUser.name || '—',
    role:     currentUser.jobTitle || roleLabel,
    initials: currentUser.name
      ? currentUser.name.split(' ').map(function(n) { return n[0]; }).join('').slice(0,2).toUpperCase()
      : '·',
  } : { name: '—', role: roleLabel, initials: '·' };

  return (
    <div className={'app-shell' + (navOpen ? ' nav-open' : '')}>
      {/* Backdrop do drawer (mobile) */}
      <div className="nav-backdrop" onClick={() => setNavOpen(false)} />
      {/* Sidebar */}
      <aside className="sidebar">
        <button
          className="sidebar-close"
          onClick={() => setNavOpen(false)}
          aria-label={t('app.closeMenu')}
        >
          <Ic.Close s={18}/>
        </button>
        <div className="sidebar-logo">
          <img src="assets/voratte-logo.webp" alt="Vorätte" />
          <div className="sidebar-tag">{t('app.brandTag').split('\n').map(function (line, i, arr) {
            return <React.Fragment key={i}>{line}{i < arr.length - 1 ? <br/> : null}</React.Fragment>;
          })}</div>
        </div>

        {(() => {
          const groups = [];
          nav.forEach(item => {
            if (!groups.length || groups[groups.length-1].group !== item.group) {
              groups.push({ group: item.group, items: [] });
            }
            groups[groups.length-1].items.push(item);
          });
          return groups.map(g => (
            <React.Fragment key={g.group}>
              <div className="nav-section-label">{g.group}</div>
              <div className="nav-items">
                {g.items.map(item => (
                  <button
                    key={item.key}
                    className={'nav-item' + (route === item.key ? ' active' : '')}
                    onClick={() => { setRoute(item.key); setNavOpen(false); }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </React.Fragment>
          ));
        })()}

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{profile.initials}</div>
            <div className="user-meta" style={{ flex: 1 }}>
              <div className="user-name">{profile.name}</div>
              <div className="user-role">{profile.role}</div>
            </div>
            <button
              onClick={() => window.fbLogout()}
              style={{ color: 'var(--brown-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6 }}
              title={t('app.logout')}
            >
              <Ic.Logout s={15}/>
            </button>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10, letterSpacing: '0.06em', color: 'var(--brown-400)', opacity: 0.7 }}>
            {t('app.devCredit')}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button
              className="nav-toggle"
              onClick={() => setNavOpen(o => !o)}
              aria-label={t('app.openMenu')}
              aria-expanded={navOpen}
            >
              <Ic.Menu s={20}/>
            </button>
            <div className="topbar-title">
              <h1>{meta.title}</h1>
              <span className="sub">{meta.sub}</span>
            </div>
          </div>
          <div className="topbar-right">
            {/* Badge avisando que o admin está navegando como outra role */}
            {isDemoMode && (
              <div
                className="topbar-demo"
                title={t('topbar.demoBadgeTitle')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 999,
                  background: 'var(--brown-100)', color: 'var(--brown-800)',
                  border: '1px solid var(--brown-200)',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                }}
              >
                <Ic.Sparkle s={12}/> {t('topbar.demoBadge')}
              </div>
            )}
            {/* Role switcher — apenas para administradores (ferramenta de demo) */}
            {currentUser && currentUser.role === 'admin' && (
              <RoleSwitcher current={effectiveRole} onChange={switchRole} />
            )}
            <LangPicker />
            <ThemeTogglePill />
            <button className="icon-btn topbar-bell"><Ic.Bell s={18}/><span className="dot"/></button>
            <div className="top-user">
              <div className="avatar">{profile.initials}</div>
              <div>
                <div className="name">{profile.name}</div>
                <div className="role">{profile.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page" key={effectiveRole + '-' + route}>
          {renderScreen(effectiveRole, route, setRoute, currentUser, refreshProfile)}
        </div>
      </main>
    </div>
  );
}

function renderScreen(role, route, go, user, refreshProfile) {
  if (role === 'aluno') {
    return ({
      dashboard:   <DashboardScreen   go={go} user={user} />,
      teste:       <DiscTestScreen    go={go} user={user} refreshProfile={refreshProfile} />,
      analise:     <AnaliseScreen     go={go} user={user} />,
      cruzamento:  <CruzamentoScreen  go={go} user={user} />,
      kraljic:     <KraljicScreen     go={go} user={user} />,
      objecoes:    <ObjecoesScreen    go={go} />,
      plano:       <PlanoScreen       go={go} user={user} />,
      relatorios:  <RelatoriosScreen  go={go} user={user} />,
      relatorio:   <RelatorioScreen   go={go} user={user} />,
      perfil:      <PerfilScreen      go={go} user={user} refreshProfile={refreshProfile} />,
    }[route] || <DashboardScreen go={go} user={user} />);
  }
  if (role === 'gestor') {
    return ({
      dashboard:   <GestorDashboard    go={go} user={user} />,
      equipe:      <GestorEquipe       go={go} user={user} />,
      comparacoes: <ComparacoesScreen  go={go} user={user} />,
      mapa:        <GestorMapa         go={go} user={user} />,
      kraljic:     <KraljicScreen      go={go} user={user} />,
      objecoes:    <ObjecoesScreen     go={go} />,
      relatorios:  <GestorRelatorios   go={go} user={user} />,
      relatorio:   <RelatorioScreen    go={go} user={user} />,
      teste:       <DiscTestScreen     go={go} user={user} refreshProfile={refreshProfile} />,
      analise:     <AnaliseScreen      go={go} user={user} />,
      perfil:      <PerfilScreen       go={go} user={user} refreshProfile={refreshProfile} />,
    }[route] || <GestorDashboard go={go} user={user} />);
  }
  if (role === 'admin') {
    return ({
      dashboard:    <AdminDashboard      go={go} user={user} />,
      usuarios:     <AdminUsuarios       go={go} />,
      empresas:     <AdminEmpresas       go={go} />,
      gestores:     <AdminGestores       go={go} />,
      estatisticas: <AdminEstatisticas   go={go} />,
      relatorios:   <RelatoriosScreen    go={go} user={user} />,
      relatorio:    <RelatorioScreen     go={go} user={user} />,
      permissoes:   <AdminPermissoes     go={go} />,
      perfil:       <PerfilScreen        go={go} user={user} refreshProfile={refreshProfile} />,
    }[route] || <AdminDashboard go={go} user={user} />);
  }
}

// Role switcher — DEMO control to navigate between the 3 views
function RoleSwitcher({ current, onChange }) {
  useLang();
  const [open, setOpen] = React.useState(false);
  const roleLabels = { aluno: t('role.aluno'), gestor: t('role.gestor'), admin: t('role.admin') };
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-secondary"
        style={{ padding: '8px 14px', fontSize: 12, gap: 8 }}
        title={t('roleSwitcher.title')}
      >
        <Ic.Sparkle s={14}/> <span className="rs-label">{t('roleSwitcher.label')} <strong>{roleLabels[current]}</strong></span>
        <Ic.Arrow s={12} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div style={{
            position: 'absolute', right: 0, top: '110%', zIndex: 51,
            minWidth: 280, background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 12, boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-soft)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
              {t('roleSwitcher.header')}
            </div>
            {[
              { k: 'aluno',  label: t('roleSwitcher.aluno.label'),  desc: t('roleSwitcher.aluno.desc') },
              { k: 'gestor', label: t('roleSwitcher.gestor.label'), desc: t('roleSwitcher.gestor.desc') },
              { k: 'admin',  label: t('roleSwitcher.admin.label'),  desc: t('roleSwitcher.admin.desc') },
            ].map(r => (
              <button key={r.k}
                onClick={() => { onChange(r.k); setOpen(false); }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 18px', gap: 8,
                  alignItems: 'center',
                  width: '100%', textAlign: 'left',
                  padding: '12px 14px',
                  background: current === r.k ? 'var(--brown-50)' : 'transparent',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.desc}</div>
                </div>
                {current === r.k && <Ic.Check s={14}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
