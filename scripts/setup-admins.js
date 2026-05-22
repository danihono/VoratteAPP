#!/usr/bin/env node
/**
 * Voratte — setup-admins.js
 * Cria os usuários admin no Firebase Auth + doc no Firestore.
 * Rode UMA VEZ: node scripts/setup-admins.js
 * Pode deletar este arquivo depois que rodar com sucesso.
 */

const { execSync } = require('child_process');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const PROJECT_ID = 'voratte-3fc9f';
const API_KEY    = 'AIzaSyAeMc2-zGJ5ZgfA34AV-lZaXgXetO7n0wY';
const ROOT       = path.join(__dirname, '..');

const ADMINS = [
  {
    email:    'danielboy200627@gmail.com',
    password: 'dani2006',
    name:     'Daniel',
    jobTitle: 'Admin Voratte',
  },
  // Adicione o segundo admin aqui quando tiver os dados:
  // { email: '...', password: '...', name: '...', jobTitle: 'Admin Voratte' },
];
// ────────────────────────────────────────────────────────────────────────────

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'POST', headers }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve(raw); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function patch(url, body, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': 'Bearer ' + token,
    };
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'PATCH', headers }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve(raw); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function deploy(label) {
  process.stdout.write('  📋 ' + label + '... ');
  try {
    execSync('firebase deploy --only firestore:rules', { cwd: ROOT, stdio: 'pipe' });
    console.log('ok');
  } catch(e) {
    console.log('erro');
    throw new Error('firebase deploy falhou: ' + e.stderr?.toString());
  }
}

function openRules() {
  const bak = path.join(ROOT, 'firestore.rules.bak');
  const rules = path.join(ROOT, 'firestore.rules');
  if (!fs.existsSync(bak)) fs.copyFileSync(rules, bak);
  fs.writeFileSync(rules, `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{doc=**} { allow read, write: if request.auth != null; }
  }
}`);
  deploy('Abrindo regras temporárias');
}

function restoreRules() {
  const bak = path.join(ROOT, 'firestore.rules.bak');
  const rules = path.join(ROOT, 'firestore.rules');
  if (fs.existsSync(bak)) { fs.copyFileSync(bak, rules); fs.unlinkSync(bak); }
  deploy('Restaurando regras de segurança');
}

async function getToken(email, password) {
  // tenta criar; se já existe, faz login
  let r = await post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );
  if (r.error?.message === 'EMAIL_EXISTS') {
    r = await post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
  }
  if (r.error) throw new Error(r.error.message);
  return { uid: r.localId, token: r.idToken };
}

function firestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string')  fields[k] = { stringValue: v };
    if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    if (typeof v === 'number')  fields[k] = { integerValue: String(v) };
  }
  return fields;
}

async function writeDoc(uid, token, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const r = await patch(url, { fields: firestoreFields(data) }, token);
  if (r.error) throw new Error(r.error.message || JSON.stringify(r.error));
}

async function main() {
  console.log('\n🚀 Voratte — Setup de Admins\n');

  try {
    openRules();
    console.log('  ⏳ Aguardando propagação das regras...');
    await sleep(5000);

    for (const adm of ADMINS) {
      console.log(`\n👤 ${adm.email}`);
      try {
        const { uid, token } = await getToken(adm.email, adm.password);
        console.log(`  ✅ Auth OK — uid: ${uid}`);
        await writeDoc(uid, token, {
          name:          adm.name,
          email:         adm.email,
          role:          'admin',
          jobTitle:      adm.jobTitle,
          discCompleted: false,
          companyName:   'Voratte',
        });
        console.log(`  ✅ Doc Firestore criado`);
      } catch(err) {
        console.error(`  ❌ Erro:`, err.message);
      }
    }

    console.log('');
    restoreRules();
    console.log('\n✅ Setup concluído! Você já pode logar em https://voratte-3fc9f.web.app');
    console.log('   (Este script pode ser deletado)\n');

  } catch(err) {
    console.error('\n❌ Erro fatal:', err.message);
    try { restoreRules(); } catch(_) {}
    process.exit(1);
  }
}

main();
