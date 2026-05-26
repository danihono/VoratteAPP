// ====================== EMAIL DE CONVITE — VORÄTTE ======================
// Gera o HTML do email de boas-vindas (paleta brown, logo, Fraunces/Manrope)
// e envia via EmailJS (https://www.emailjs.com). Tudo client-side.
//
// Configuração: preencher window.EMAILJS_CONFIG abaixo com as 3 chaves do
// painel do EmailJS (Public Key, Service ID, Template ID). O template deve
// ter Content-Type HTML e corpo `{{{html_message}}}` (3 chaves = não escapa).
//
// Reutiliza window.voratteLoadLogo() de report-export.jsx (deve carregar antes).

(function () {
  // ====== CONFIG — preencher após criar conta em emailjs.com ======
  window.EMAILJS_CONFIG = window.EMAILJS_CONFIG || {
    publicKey:  'YtffgRSQk1LvWL54h',
    serviceId:  'service_j9u34l6',
    templateId: 'template_tr2rcts',
    loginUrl:   'https://voratte-3fc9f.web.app',
  };

  // ====== PALETA INLINE — clientes de email não suportam CSS variables ======
  var C = {
    ink:      '#15090a',
    inkSoft:  '#2a201a',
    paper:    '#fbf8f3',
    white:    '#ffffff',
    brown50:  '#faf5ee',
    brown100: '#f0e3d0',
    brown700: '#4a2c1b',
    brown850: '#28180f',
    brown950: '#15090a',
    muted:    '#7a6b5d',
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ====== TEMPLATE HTML do email ======
  window.buildInviteEmailHTML = function (opts) {
    opts = opts || {};
    var name        = esc(opts.name        || '');
    var email       = esc(opts.email       || '');
    var password    = esc(opts.password    || '');
    var role        = opts.role  || 'aluno';
    var companyName = esc(opts.companyName || '');
    var gestorName  = esc(opts.gestorName  || '');
    var loginUrl    = opts.loginUrl  || window.EMAILJS_CONFIG.loginUrl;
    var logoBase64  = opts.logoBase64 || null;

    var roleLabel = role === 'gestor' ? 'Gestor(a)' : (role === 'admin' ? 'Administrador(a)' : 'Aluno(a)');
    var companyLine = companyName ? ' na <strong>' + companyName + '</strong>' : '';
    var teamLine  = (role === 'aluno' && gestorName)
      ? ' Você foi vinculado(a) ao gestor <strong>' + gestorName + '</strong>.'
      : '';

    var header = logoBase64
      ? '<img src="' + logoBase64 + '" alt="Vorätte" style="height:38px;display:block;margin:0 auto;">'
      : '<div style="font-family:Fraunces,Georgia,serif;font-size:26px;color:' + C.brown50 + ';letter-spacing:0.02em;text-align:center;">Vorätte</div>';

    return [
      '<!DOCTYPE html><html lang="pt-BR"><head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>Bem-vindo(a) à Vorätte</title>',
      '<style>@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap");</style>',
      '</head>',
      '<body style="margin:0;padding:0;background:' + C.paper + ';font-family:Manrope,Arial,sans-serif;color:' + C.ink + ';">',

      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.paper + ';">',
      '<tr><td align="center" style="padding:40px 20px;">',

      '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:' + C.white + ';border-radius:14px;overflow:hidden;border:1px solid ' + C.brown100 + ';">',

      // Header escuro com logo
      '<tr><td align="center" style="padding:40px 32px;background:linear-gradient(135deg, ' + C.brown950 + ' 0%, ' + C.brown850 + ' 55%, ' + C.brown700 + ' 100%);">',
      header,
      '</td></tr>',

      // Saudação
      '<tr><td style="padding:40px 36px 8px;">',
      '<h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:30px;margin:0 0 14px;line-height:1.2;color:' + C.ink + ';">Bem-vindo(a), ' + name + '.</h1>',
      '<p style="font-size:14.5px;line-height:1.65;color:' + C.inkSoft + ';margin:0;">',
      'Sua conta como <strong>' + roleLabel + '</strong>' + companyLine + ' foi criada na plataforma <strong>Vorätte DISC</strong>.' + teamLine,
      ' Use as credenciais abaixo para acessar:',
      '</p>',
      '</td></tr>',

      // Caixa de credenciais
      '<tr><td style="padding:24px 36px 8px;">',
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.brown100 + ';border-radius:10px;">',
      '<tr><td style="padding:22px 24px;">',
      '<div style="font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:' + C.muted + ';font-weight:600;margin-bottom:6px;">E-mail</div>',
      '<div style="font-size:15px;font-weight:600;color:' + C.ink + ';margin-bottom:18px;font-family:Manrope,monospace;word-break:break-all;">' + email + '</div>',
      '<div style="font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:' + C.muted + ';font-weight:600;margin-bottom:6px;">Senha</div>',
      '<div style="font-size:15px;font-weight:600;color:' + C.ink + ';font-family:Manrope,monospace;word-break:break-all;">' + password + '</div>',
      '</td></tr>',
      '</table>',
      '</td></tr>',

      // CTA
      '<tr><td align="center" style="padding:24px 36px 36px;">',
      '<a href="' + loginUrl + '" style="display:inline-block;background:' + C.brown700 + ';color:' + C.white + ';padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.02em;">Acessar plataforma &rarr;</a>',
      '<p style="margin:18px 0 0;font-size:11.5px;color:' + C.muted + ';line-height:1.5;">Recomendamos trocar sua senha após o primeiro login.<br>Em caso de dúvidas, responda este email.</p>',
      '</td></tr>',

      // Footer
      '<tr><td style="padding:24px 36px;background:' + C.paper + ';border-top:1px solid ' + C.brown100 + ';text-align:center;">',
      '<div style="font-family:Fraunces,Georgia,serif;font-size:17px;color:' + C.ink + ';letter-spacing:0.02em;">Vorätte</div>',
      '<div style="font-size:11px;color:' + C.muted + ';margin-top:4px;">Plataforma de avaliação DISC · voratte.com.br</div>',
      '</td></tr>',

      '</table>',
      '</td></tr></table>',
      '</body></html>'
    ].join('');
  };

  // ====== INIT EmailJS (idempotente) ======
  function initEmailJS() {
    if (!window.emailjs) return false;
    var cfg = window.EMAILJS_CONFIG;
    if (!cfg || !cfg.publicKey || cfg.publicKey === 'COLOQUE_AQUI') return false;
    if (window._emailjsInitialized) return true;
    try {
      window.emailjs.init({ publicKey: cfg.publicKey });
      window._emailjsInitialized = true;
      return true;
    } catch (e) { return false; }
  }

  // ====== ENVIO ======
  window.sendInviteEmail = async function (opts) {
    opts = opts || {};
    if (!window.emailjs) {
      throw new Error('EmailJS não carregou — verifique a tag <script> da CDN no HTML.');
    }
    var cfg = window.EMAILJS_CONFIG;
    if (!cfg || cfg.publicKey === 'COLOQUE_AQUI' || cfg.serviceId === 'COLOQUE_AQUI' || cfg.templateId === 'COLOQUE_AQUI') {
      throw new Error('EmailJS não configurado. Preencha publicKey/serviceId/templateId em src/email-invite.jsx');
    }
    initEmailJS();

    var logoBase64 = null;
    if (window.voratteLoadLogo) {
      try { logoBase64 = await window.voratteLoadLogo(); } catch (e) { logoBase64 = null; }
    }

    var html = window.buildInviteEmailHTML({
      name:        opts.name,
      email:       opts.email,
      password:    opts.password,
      role:        opts.role,
      companyName: opts.companyName,
      gestorName:  opts.gestorName,
      loginUrl:    cfg.loginUrl,
      logoBase64:  logoBase64,
    });

    return window.emailjs.send(cfg.serviceId, cfg.templateId, {
      to_email:     opts.email,
      to_name:      opts.name,
      subject:      'Bem-vindo(a) à Vorätte · Seu acesso à plataforma DISC',
      html_message: html,
    });
  };

  // Verifica se o EmailJS está pronto para uso (UI usa para esconder/mostrar botão)
  window.isEmailJSConfigured = function () {
    var cfg = window.EMAILJS_CONFIG;
    return !!(window.emailjs && cfg
      && cfg.publicKey  && cfg.publicKey  !== 'COLOQUE_AQUI'
      && cfg.serviceId  && cfg.serviceId  !== 'COLOQUE_AQUI'
      && cfg.templateId && cfg.templateId !== 'COLOQUE_AQUI');
  };
})();
