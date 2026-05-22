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
  return window.auth.signOut();
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

window.fbGetAllReports = async function(limit) {
  var snap = await window.db.collection('reports')
    .orderBy('createdAt', 'desc')
    .limit(limit || 100)
    .get();
  return snap.docs.map(function(doc) { return { id: doc.id, ...doc.data() }; });
};

window.fbSaveDiscResult = async function(uid, result) {
  await window.db.collection('disc_results').doc(uid).set({
    userId:      uid,
    d:           result.d,
    i:           result.i,
    s:           result.s,
    c:           result.c,
    main:        result.main,
    answers:     result.answers || [],
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await window.db.collection('users').doc(uid).update({ discCompleted: true });
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
