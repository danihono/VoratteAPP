// ===== i18n engine — espelha o padrão do tema (bootTheme/setTheme/getTheme/useTheme) =====
// Idiomas suportados: ptBR (default), es, en
// Persiste em localStorage('voratte-lang'); reflete em <html lang="pt-BR" | "es" | "en">.

(function bootLang() {
  try {
    var saved = localStorage.getItem('voratte-lang');
    var allowed = { ptBR: 1, es: 1, en: 1 };
    var lang = allowed[saved] ? saved : 'ptBR';
    var htmlLang = lang === 'ptBR' ? 'pt-BR' : lang;
    document.documentElement.setAttribute('lang', htmlLang);
    // Guarda o código interno em data-lang para componentes lerem rápido (sem normalizar de "pt-BR")
    document.documentElement.setAttribute('data-lang', lang);
  } catch (e) {
    document.documentElement.setAttribute('lang', 'pt-BR');
    document.documentElement.setAttribute('data-lang', 'ptBR');
  }
})();

window.I18N = {
  ptBR: window.I18N_PTBR || {},
  es:   window.I18N_ES   || {},
  en:   window.I18N_EN   || {},
};

window.getLang = function () {
  var code = document.documentElement.getAttribute('data-lang');
  return (code === 'es' || code === 'en') ? code : 'ptBR';
};

window.setLang = function (lang) {
  var allowed = { ptBR: 1, es: 1, en: 1 };
  var l = allowed[lang] ? lang : 'ptBR';
  var htmlLang = l === 'ptBR' ? 'pt-BR' : l;
  document.documentElement.setAttribute('lang', htmlLang);
  document.documentElement.setAttribute('data-lang', l);
  try { localStorage.setItem('voratte-lang', l); } catch (e) {}
  window.dispatchEvent(new CustomEvent('voratte-lang', { detail: l }));
};

// Resolve uma chave; cai em ptBR se faltar no idioma atual, depois na própria chave.
window.t = function (key, vars) {
  var lang = window.getLang();
  var dict = window.I18N[lang] || {};
  var fb   = window.I18N.ptBR  || {};
  var s = dict[key];
  if (s === undefined) s = fb[key];
  if (s === undefined) {
    if (typeof console !== 'undefined' && console.warn) console.warn('[i18n] missing key:', key);
    return key;
  }
  if (vars && typeof s === 'string') {
    for (var k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k)) {
        s = s.split('{' + k + '}').join(vars[k]);
      }
    }
  }
  return s;
};

// Atalho para chaves que armazenam arrays (listas de motivadores, objeções, etc.)
window.tList = function (key) {
  var v = window.t(key);
  return Array.isArray(v) ? v : [];
};

// Hook React — re-renderiza componentes ao trocar de idioma
function useLang() {
  const [lang, setLangState] = React.useState(window.getLang());
  React.useEffect(function () {
    function onChange(e) { setLangState(e.detail); }
    window.addEventListener('voratte-lang', onChange);
    return function () { window.removeEventListener('voratte-lang', onChange); };
  }, []);
  return [lang, function (l) { window.setLang(l); }];
}
window.useLang = useLang;
