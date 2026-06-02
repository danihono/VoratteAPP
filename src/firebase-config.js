// ====================== FIREBASE CONFIG ======================
// Substitua os valores abaixo pelos do seu projeto Firebase.
// Console: https://console.firebase.google.com → Configurações do projeto → Seus apps → SDK config
//
// IMPORTANTE: após preencher, não commite este arquivo com as chaves reais em repos públicos.

const firebaseConfig = {
  apiKey:            "AIzaSyAeMc2-zGJ5ZgfA34AV-lZaXgXetO7n0wY",
  authDomain:        "voratte-3fc9f.firebaseapp.com",
  projectId:         "voratte-3fc9f",
  storageBucket:     "voratte-3fc9f.firebasestorage.app",
  messagingSenderId: "809155242230",
  appId:             "1:809155242230:web:9c7ba8f38a3e500ddb24d7",
};

firebase.initializeApp(firebaseConfig);

window.auth = firebase.auth();
window.db   = firebase.firestore();

// ====================== AUTH HELPERS ======================

window.fbLogin = function(email, password) {
  return window.auth.signInWithEmailAndPassword(email, password);
};

window.fbLogout = function() {
  // Limpa caches de sessão que vivem em módulos JSX (não persistem entre páginas,
  // mas vazariam entre dois logins na mesma aba sem refresh).
  if (typeof window.clearGestorTeamCache === 'function') window.clearGestorTeamCache();
  return window.auth.signOut();
};

// Envia email de redefinição de senha via Firebase Auth (nativo, sem EmailJS)
window.fbResetPassword = function(email) {
  return window.auth.sendPasswordResetEmail(email);
};

// LOCAL = sessão persiste após fechar o navegador; SESSION = só dura a aba aberta
window.fbSetPersistence = function(remember) {
  var P = firebase.auth.Auth.Persistence;
  return window.auth.setPersistence(remember ? P.LOCAL : P.SESSION);
};

// Atualiza campos do próprio perfil em /users/{uid} (regras: self-update permitido)
window.fbUpdateUserProfile = function(uid, data) {
  return window.db.collection('users').doc(uid).update(data);
};

// Marca o usuário como ativo gravando o timestamp do servidor em users/{uid}.lastSeen.
// Chamado a cada login bem-sucedido — permite ao admin distinguir gestor/aluno que já
// usou a plataforma (Ativo) de quem só foi convidado e nunca entrou (Convidado).
window.fbTouchLastSeen = function(uid) {
  if (!uid) return Promise.resolve();
  return window.db.collection('users').doc(uid).update({
    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

// ====================== FIRESTORE HELPERS ======================

window.fbGetUserProfile = async function(uid) {
  const snap = await window.db.collection('users').doc(uid).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};

window.fbGetDiscResult = async function(uid) {
  const snap = await window.db.collection('disc_results').doc(uid).get();
  if (!snap.exists) return null;
  return snap.data();
};

// Retorna lista de membros no shape exato do GESTOR_TEAM usado pelas telas do gestor.
// Faz queries paralelas para buscar disc_result de cada membro.
window.fbGetTeamMembers = async function(gestorId) {
  const snap = await window.db.collection('users')
    .where('gestorId', '==', gestorId)
    .where('role', '==', 'aluno')
    .get();

  const members = await Promise.all(snap.docs.map(async function(doc) {
    var user = doc.data();
    var discSnap = await window.db.collection('disc_results').doc(doc.id).get();
    var disc = discSnap.exists ? discSnap.data() : null;

    var lastDate = '—';
    if (disc && disc.completedAt) {
      try {
        lastDate = disc.completedAt.toDate().toLocaleDateString('pt-BR');
      } catch(e) { lastDate = '—'; }
    }

    return {
      id:      doc.id,
      name:    user.name || '—',
      role:    user.jobTitle || '—',   // jobTitle = cargo profissional (ex: "Comprador Sênior")
      email:   user.email || '',
      d:       disc ? (disc.d || 0) : 0,
      i:       disc ? (disc.i || 0) : 0,
      s:       disc ? (disc.s || 0) : 0,
      c:       disc ? (disc.c || 0) : 0,
      main:    disc ? (disc.main || '—') : '—',
      status:  user.discCompleted ? 'done' : (user.invited ? 'invited' : 'pending'),
      last:    lastDate,
      reports: user.reportCount || 0,
    };
  }));

  return members;
};

window.fbGetAllUsers = async function(limit) {
  var q = window.db.collection('users').limit(limit || 100);
  var snap = await q.get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

window.fbGetAllCompanies = async function() {
  var snap = await window.db.collection('companies').get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

window.fbGetAllGestores = async function() {
  var snap = await window.db.collection('users')
    .where('role', '==', 'gestor')
    .get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

window.fbGetReportsByUser = async function(uid) {
  var snap = await window.db.collection('reports')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

// Reports onde userId pertence ao time do gestor.
// Firestore 'in' tem limite 10 — quebra em chunks e ordena no cliente.
window.fbGetReportsByTeam = async function(uids) {
  if (!uids || !uids.length) return [];
  var chunks = [];
  for (var i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
  var snaps = await Promise.all(chunks.map(function (group) {
    return window.db.collection('reports').where('userId', 'in', group).get();
  }));
  var rows = [];
  snaps.forEach(function (snap) {
    snap.docs.forEach(function (doc) { rows.push({ id: doc.id, ...doc.data() }); });
  });
  rows.sort(function (a, b) {
    var ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    var tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });
  return rows;
};

window.fbGetAllReports = async function(limit) {
  var snap = await window.db.collection('reports')
    .orderBy('createdAt', 'desc')
    .limit(limit || 100)
    .get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

window.fbGetAllDiscResults = async function(limit) {
  var snap = await window.db.collection('disc_results')
    .orderBy('completedAt', 'desc')
    .limit(limit || 500)
    .get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

window.fbSaveReport = async function(report, docId) {
  var payload = Object.assign({
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, report || {});
  if (docId) {
    await window.db.collection('reports').doc(docId).set(payload);
    return docId;
  }
  var ref = await window.db.collection('reports').add(payload);
  return ref.id;
};

window.fbSaveDiscResult = async function(uid, result) {
  await window.db.collection('disc_results').doc(uid).set({
    userId:      uid,
    d:           result.d,
    i:           result.i,
    s:           result.s,
    c:           result.c,
    main:        result.main,
    code:        result.code || result.main,
    // Os 3 gráficos do DISC (Máscara / Pressão / Real)
    mostGraph:   result.mostGraph   || null,
    leastGraph:  result.leastGraph  || null,
    changeGraph: result.changeGraph || null,
    answers:     result.answers || [],
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await window.db.collection('users').doc(uid).update({
    discCompleted: true,
    discMain:      result.main,
  });
};

// Cria usuário no Firebase Auth SEM fazer logout do admin atual (REST API)
window.fbCreateUser = async function(email, password) {
  var API_KEY = 'AIzaSyAeMc2-zGJ5ZgfA34AV-lZaXgXetO7n0wY';
  var res = await fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, returnSecureToken: false }),
    }
  );
  var data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.localId; // uid do novo usuário
};

// Grava doc /users/{uid} com os dados fornecidos
window.fbCreateUserDoc = async function(uid, data) {
  await window.db.collection('users').doc(uid).set(Object.assign({
    discCompleted: false,
    invited:       false,
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }, data));
};

// Atualiza campos de uma empresa em /companies/{id} (admin only — regras em firestore.rules)
window.fbUpdateCompany = function(companyId, data) {
  return window.db.collection('companies').doc(companyId).update(data);
};

// Cria documento em /companies — usado pelo modal de cadastro de empresa
window.fbCreateCompany = async function(data) {
  var payload = Object.assign({
    userCount: 0,
    managerCount: 0,
    completedPct: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, data);
  var ref = await window.db.collection('companies').add(payload);
  return Object.assign({ id: ref.id }, payload);
};

// Gestores filtrados por empresa — alimenta o dropdown do CriarAlunoModal
window.fbGetGestoresByCompany = async function(companyId) {
  if (!companyId) return [];
  var snap = await window.db.collection('users')
    .where('role', '==', 'gestor')
    .where('companyId', '==', companyId)
    .get();
  return snap.docs.map(function(doc) { return Object.assign({ id: doc.id }, doc.data()); });
};

// Incrementa userCount / managerCount da empresa quando vincula gestor/aluno
window.fbIncrementCompanyCounter = async function(companyId, field) {
  if (!companyId || !field) return;
  try {
    await window.db.collection('companies').doc(companyId).update({
      [field]: firebase.firestore.FieldValue.increment(1)
    });
  } catch (e) { /* contador é "best effort" — não bloqueia o cadastro */ }
};

// Marca um usuário como convidado (após enviar email de convite)
window.fbMarkInvited = async function(uid) {
  if (!uid) return;
  try {
    await window.db.collection('users').doc(uid).update({ invited: true });
  } catch (e) { /* não bloqueia o fluxo se falhar */ }
};
