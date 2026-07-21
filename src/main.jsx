// Entry do Vite — importa os módulos do app NA MESMA ORDEM do HTML antigo.
// Todos são módulos de efeito colateral: definem componentes/dados e os expõem
// em window.* (convenção do projeto). A ordem importa: dados antes de engines,
// engines antes de telas, app.jsx por último (renderiza <App/> em #root).

import './bootstrap-globals.js';   // React / ReactDOM / firebase / emailjs → window
import './firebase-config.js';     // inicializa Firebase + helpers fb*

import './icons.jsx';
import './donut.jsx';
import './i18n-strings-ptbr.jsx';
import './i18n-strings-es.jsx';
import './i18n-strings-en.jsx';
import './i18n.jsx';
import './disc-data.jsx';
import './disc-estilo.jsx';        // camada de apresentação sobre o DISC
import './kraljic-data.jsx';
import './motor-data.jsx';         // base de dados do motor antes do engine
import './motor-engine.jsx';
import './report-export.jsx';
import './email-invite.jsx';
import './screen-login.jsx';
import './screen-dashboard.jsx';
import './screen-disc.jsx';
import './screen-kraljic.jsx';
import './screen-objecoes.jsx';
import './screen-rest.jsx';
import './screen-gestor.jsx';
import './screen-admin.jsx';
import './screen-admin-relatorios.jsx';
import './app.jsx';                // por último: renderiza a aplicação
