// Vorätte DISC Platform — main app shell with role switching + routing

// Different sidebar navs per role
const NAV_ALUNO = [
  { key: 'dashboard',  label: 'Início',                    icon: <Ic.Dashboard/>, group: 'Minha jornada' },
  { key: 'teste',      label: 'Teste DISC',                icon: <Ic.Disc/>,      group: 'Minha jornada' },
  { key: 'analise',    label: 'Minha análise',             icon: <Ic.Target/>,    group: 'Minha jornada' },
  { key: 'cruzamento', label: 'Cruzamento de perfis',      icon: <Ic.Compare/>,   group: 'Minha jornada' },
  { key: 'kraljic',    label: 'Matriz Kraljic',            icon: <Ic.Kraljic/>,   group: 'Estratégia' },
  { key: 'objecoes',   label: 'Objeções',                  icon: <Ic.Object/>,    group: 'Estratégia' },
  { key: 'plano',      label: 'Plano de desenvolvimento',  icon: <Ic.Plan/>,      group: 'Desenvolvimento' },
  { key: 'relatorios', label: 'Meus relatórios',           icon: <Ic.Report/>,    group: 'Documentos' },
  { key: 'perfil',     label: 'Meu perfil',                icon: <Ic.User/>,      group: 'Conta' },
];

const NAV_GESTOR = [
  { key: 'dashboard',  label: 'Painel da equipe',          icon: <Ic.Dashboard/>, group: 'Gestão' },
  { key: 'equipe',     label: 'Minha equipe',              icon: <Ic.User/>,      group: 'Gestão' },
  { key: 'comparacoes',label: 'Comparativo de perfis',     icon: <Ic.Compare/>,   group: 'Gestão' },
  { key: 'mapa',       label: 'Mapa comportamental',       icon: <Ic.Kraljic/>,   group: 'Gestão' },
  { key: 'kraljic',    label: 'Matriz Kraljic',            icon: <Ic.Diamond/>,   group: 'Estratégia' },
  { key: 'objecoes',   label: 'Biblioteca de objeções',    icon: <Ic.Object/>,    group: 'Estratégia' },
  { key: 'relatorios', label: 'Relatórios da equipe',      icon: <Ic.Report/>,    group: 'Documentos' },
  { key: 'analise',    label: 'Meu próprio DISC',          icon: <Ic.Disc/>,      group: 'Conta' },
  { key: 'perfil',     label: 'Meu perfil',                icon: <Ic.User/>,      group: 'Conta' },
];

const NAV_ADMIN = [
  { key: 'dashboard',    label: 'Visão global',            icon: <Ic.Dashboard/>, group: 'Console' },
  { key: 'usuarios',     label: 'Usuários',                icon: <Ic.User/>,      group: 'Console' },
  { key: 'empresas',     label: 'Empresas',                icon: <Ic.Kraljic/>,   group: 'Console' },
  { key: 'gestores',     label: 'Gestores',                icon: <Ic.Shield/>,    group: 'Console' },
  { key: 'estatisticas', label: 'Estatísticas globais',    icon: <Ic.Chart/>,     group: 'Analytics' },
  { key: 'relatorios',   label: 'Todos os relatórios',     icon: <Ic.Report/>,    group: 'Analytics' },
  { key: 'permissoes',   label: 'Permissões',              icon: <Ic.Lock/>,      group: 'Configuração' },
  { key: 'perfil',       label: 'Minha conta',             icon: <Ic.Settings/>,  group: 'Conta' },
];

const PAGE_META = {
  // shared
  perfil:        { title: 'Meu perfil',                    sub: 'Informações da sua conta Vorätte' },
  kraljic:       { title: 'Matriz de Kraljic',             sub: 'Analise categorias e estratégias' },
  objecoes:      { title: 'Objeções por perfil',           sub: 'Como contornar cada estilo' },
  relatorio:     { title: 'Relatório DISC completo',       sub: 'Documento executivo · 24 páginas' },

  // aluno
  aluno: {
    dashboard:   { title: 'Bem-vindo',                     sub: 'Seu painel estratégico Vorätte' },
    teste:       { title: 'Teste DISC',                    sub: 'Responda às afirmações abaixo' },
    analise:     { title: 'Análise completa do seu perfil DISC', sub: 'Entenda seu comportamento e potencial' },
    cruzamento:  { title: 'Como você lida com outros perfis',    sub: 'Estratégias para cada perfil' },
    plano:       { title: 'Plano de desenvolvimento',      sub: 'Sua trilha personalizada' },
    relatorios:  { title: 'Meus relatórios',               sub: 'Seus documentos pessoais' },
  },
  gestor: {
    dashboard:   { title: 'Painel da equipe',              sub: 'Visão consolidada do seu time' },
    equipe:      { title: 'Minha equipe',                  sub: '' },
    comparacoes: { title: 'Comparativo de perfis',         sub: 'Como sua equipe se distribui' },
    mapa:        { title: 'Mapa comportamental',           sub: 'DISC × cargo do seu time' },
    relatorios:  { title: 'Relatórios da equipe',          sub: 'Documentos dos seus colaboradores' },
    analise:     { title: 'Meu próprio perfil DISC',       sub: 'Sua análise individual' },
  },
  admin: {
    dashboard:    { title: 'Visão global Vorätte',         sub: 'Console de administração' },
    usuarios:     { title: 'Usuários',                     sub: '' },
    empresas:     { title: 'Empresas',                     sub: '' },
    gestores:     { title: 'Gestores',                     sub: '' },
    estatisticas: { title: 'Estatísticas globais',         sub: 'Indicadores de uso e comportamento' },
    relatorios:   { title: 'Todos os relatórios',          sub: '' },
    permissoes:   { title: 'Permissões',                   sub: 'Configure o que cada papel pode fazer' },
  },
};

const ROLE_PROFILES = {
  aluno:    { name: '', role: 'Aluno',    initials: '·' },
  gestor:   { name: '', role: 'Gestor',   initials: '·' },
  admin:    { name: '', role: 'Admin Vorätte', initials: '·' },
};

const ROLE_LABELS = {
  aluno:    'Aluno',
  gestor:   'Gestor',
  admin:    'Admin',
};

function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authError, setAuthError] = React.useState('');
  const [role, setRole] = React.useState('aluno'); // 'aluno' | 'gestor' | 'admin' — fonte da verdade
  const [viewAsRole, setViewAsRole] = React.useState(null); // override apenas para admin (modo demo)
  const [route, setRoute] = React.useState('dashboard');

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
      } else {
        await window.fbLogout();
        setAuthError('Conta não configurada. Fale com o administrador.');
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
        <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.06em' }}>Carregando…</div>
      </div>
    );
  }

  if (!loggedIn) {
    return <LoginScreen authError={authError} />;
  }

  const effectiveRole = viewAsRole || role;
  const isDemoMode = !!viewAsRole;

  const nav = effectiveRole === 'gestor' ? NAV_GESTOR : effectiveRole === 'admin' ? NAV_ADMIN : NAV_ALUNO;

  // Sobrescreve título do dashboard com o nome real do usuário
  const firstName = currentUser && currentUser.name ? currentUser.name.split(' ')[0] : null;
  const baseMeta = (PAGE_META[effectiveRole] && PAGE_META[effectiveRole][route]) || PAGE_META[route] || { title: 'Vorätte', sub: '' };
  const meta = (route === 'dashboard' && firstName)
    ? { ...baseMeta, title: 'Olá, ' + firstName }
    : baseMeta;

  // Perfil exibido na sidebar: usa dados reais quando disponível, fallback para ROLE_PROFILES
  const roleProfile = ROLE_PROFILES[effectiveRole] || ROLE_PROFILES.aluno;
  const profile = currentUser ? {
    name:     currentUser.name || roleProfile.name || '—',
    role:     currentUser.jobTitle || roleProfile.role,
    initials: currentUser.name
      ? currentUser.name.split(' ').map(function(n) { return n[0]; }).join('').slice(0,2).toUpperCase()
      : roleProfile.initials,
  } : roleProfile;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="assets/voratte-logo.webp" alt="Vorätte" />
          <div className="sidebar-tag">DISC<br/>Compras</div>
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
                    onClick={() => setRoute(item.key)}
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
              title="Sair"
            >
              <Ic.Logout s={15}/>
            </button>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10, letterSpacing: '0.06em', color: 'var(--brown-400)', opacity: 0.7 }}>
            Desenvolvido por Daniel Honorato
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{meta.title}</h1>
            <span className="sub">{meta.sub}</span>
          </div>
          <div className="topbar-right">
            {/* Badge avisando que o admin está navegando como outra role */}
            {isDemoMode && (
              <div
                title="Você está visualizando o sistema como outra role. Dados salvos vão para sua conta admin."
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 999,
                  background: 'var(--brown-100)', color: 'var(--brown-800)',
                  border: '1px solid var(--brown-200)',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                }}
              >
                <Ic.Sparkle s={12}/> Modo demo · dados salvam na sua conta
              </div>
            )}
            {/* Role switcher — apenas para administradores (ferramenta de demo) */}
            {currentUser && currentUser.role === 'admin' && (
              <RoleSwitcher current={effectiveRole} onChange={switchRole} />
            )}
            <button className="icon-btn"><Ic.Bell s={18}/><span className="dot"/></button>
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
      perfil:      <PerfilScreen      go={go} user={user} />,
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
      analise:     <AnaliseScreen      go={go} user={user} />,
      perfil:      <PerfilScreen       go={go} user={user} />,
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
      perfil:       <PerfilScreen        go={go} user={user} />,
    }[route] || <AdminDashboard go={go} user={user} />);
  }
}

// Role switcher — DEMO control to navigate between the 3 views
function RoleSwitcher({ current, onChange }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-secondary"
        style={{ padding: '8px 14px', fontSize: 12, gap: 8 }}
        title="Trocar visão (demo)"
      >
        <Ic.Sparkle s={14}/> Visão: <strong>{ROLE_LABELS[current]}</strong>
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
              Demo · alternar visão
            </div>
            {[
              { k: 'aluno',  label: 'Aluno',         desc: 'Visão do aluno · pode fazer o DISC' },
              { k: 'gestor', label: 'Gestor',        desc: 'Visão da equipe' },
              { k: 'admin',  label: 'Administrador', desc: 'Visão global Vorätte' },
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
