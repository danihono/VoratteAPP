// Bootstrap de globais — DEVE ser o primeiro import de src/main.jsx.
// Os módulos do app seguem a convenção histórica de compartilhar tudo via
// window.* (React, firebase, componentes, helpers). Este arquivo materializa
// as dependências npm nesses globais antes de qualquer outro módulo rodar.

import React from 'react';
import * as ReactDOM from 'react-dom/client';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import emailjs from '@emailjs/browser';

window.React = React;
window.ReactDOM = ReactDOM;   // expõe createRoot (react-dom/client)
window.firebase = firebase;
window.emailjs = emailjs;
