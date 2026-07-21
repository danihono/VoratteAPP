# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ NUNCA editar arquivos UTF-8 via PowerShell

**Todos os `src/*.jsx` deste projeto estão em UTF-8 sem BOM e contêm caracteres acentuados em português** (`ä`, `ç`, `é`, `ã`, `ê`, `í`, `ó`, `ú`, `·`, `—`, `…`).

**REGRA ABSOLUTA:** Para editar qualquer arquivo do projeto, use SEMPRE as ferramentas `Edit`, `Write` ou `NotebookEdit`. **NUNCA** use PowerShell (`Get-Content` / `Set-Content` / `-replace`) para modificar conteúdo de arquivos — o Windows PowerShell 5.1 lê o arquivo na codepage do console (cp850/cp1252) e re-escreve como UTF-8, corrompendo todos os caracteres não-ASCII (`é` → `Ã©`, `ã` → `Ã£`, `ç` → `Ã§`, etc — mojibake).

Comandos **proibidos**:

```powershell
# ❌ NUNCA
(Get-Content 'src/file.jsx' -Raw) -replace 'foo','bar' | Set-Content 'src/file.jsx' -Encoding utf8
[IO.File]::WriteAllText('src/file.jsx', $text)   # também usa default encoding
Out-File / > / Add-Content sobre arquivos do projeto
```

Se precisar fazer substituição em massa, use a ferramenta `Edit` com `replace_all: true`, ou um script Python (`open(path, 'r', encoding='utf-8')` / `open(path, 'w', encoding='utf-8')`) chamado via Bash. Bash é seguro porque preserva os bytes; PowerShell não é.

Se algum arquivo já estiver com mojibake (`Ã©`, `Â·`, `â€”`, BOM `ï»¿` no início), reverter com `git checkout <arquivo>` antes de re-aplicar as mudanças via Edit.

## Brand name

The official brand spelling is **Vorätte** (with umlaut on the `a`). Always use `Vorätte` in any user-visible text, comments, alt attributes, PDF/report content, and documentation.

Technical identifiers must stay ASCII and are NOT renamed:

- Firebase project ID: `voratte-3fc9f`
- Asset/file paths: `public/assets/voratte-logo.webp`, `uploads/logo-voratte-grande.webp`
- DOM IDs: `voratte-print-frame`
- Email domain: `voratte.com.br` / `voratte.com`

## Running locally

```bash
npm install        # primeira vez
npm run dev        # Vite dev server (HMR) — http://localhost:5173
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção localmente
npm test           # smoke tests do motor de negociação (Node, sem browser)
```

## Deploy

```bash
firebase deploy              # roda `npm run build` (predeploy) + Hosting (dist/) + Firestore rules + indexes
firebase deploy --only hosting
firebase deploy --only firestore
```

## Architecture

**Stack:** React 18 + Vite (build/bundling, JSX via `@vitejs/plugin-react`). Firebase Compat SDK e EmailJS via npm. No URL routing (navegação por estado).

**Entry point:** `index.html` → `src/main.jsx`, que importa todos os módulos **em ordem fixa** (dados antes de engines, engines antes de telas, `app.jsx` por último — ele renderiza `<App/>` em `#root`). Ao criar um arquivo novo em `src/`, adicione o import em `src/main.jsx` na posição correta da cadeia de dependências.

**Convenção de compartilhamento — `window` globals:** os arquivos de `src/` são módulos de efeito colateral: não usam `import`/`export` entre si; tudo que é compartilhado é expostos em `window`:

```js
// at the bottom of every src/*.jsx file
window.MyComponent = MyComponent;
window.SOME_DATA   = SOME_DATA;
```

`src/bootstrap-globals.js` (primeiro import do `main.jsx`) materializa as dependências npm nesses globais: `window.React`, `window.ReactDOM` (react-dom/client), `window.firebase` (compat), `window.emailjs`. Referências "bare" (`React`, `Ic`, `t`, `firebase`…) resolvem via global scope. Os módulos rodam em strict mode (ESM) — nunca atribua a variáveis não declaradas.

**Firebase:** Compat SDK via npm (`firebase/compat/app` + auth + firestore), inicializado em `src/firebase-config.js`, que expõe `window.auth`, `window.db`, `window.fbGetUserProfile`, `window.fbGetTeamMembers`, `window.fbGetAllUsers`, `window.fbGetAllCompanies`, `window.fbGetAllGestores`, `window.fbSaveDiscResult`, etc.

**Assets estáticos:** vivem em `public/` (copiados para a raiz do `dist/` no build). Referências em código usam caminhos relativos tipo `assets/voratte-logo.webp`.

**Routing:** `useState`-based inside `App` in `app.jsx`. The function `renderScreen(role, route, go, user)` dispatches the right component. No URL changes on navigation.

**Roles:** `'aluno'` | `'alunoNew'` | `'gestor'` | `'admin'`. Set from Firestore `users/{uid}.role` on login. `alunoNew` = aluno with `discCompleted: false`.

**Auth flow:** `auth.onAuthStateChanged` in `app.jsx` is the single source of truth. `LoginScreen` calls `window.fbLogin()` and returns — the listener handles the state change automatically. `onLogin` prop no longer exists on `LoginScreen`.

**Gestor team data:** `useGestorTeam(gestorId)` hook in `screen-gestor.jsx` uses a module-level promise cache (`_gestorTeamFetch`) so multiple gestor screens share one Firestore query per session.

## Firestore data model

```
/users/{uid}          role, jobTitle, name, email, companyId, companyName,
                      gestorId, discCompleted, invited, discMain,
                      reportCount, teamSize, teamCompletedCount
/companies/{id}       name, sector, plan, since, userCount, managerCount, completedPct
/disc_results/{uid}   d, i, s, c, main, answers[], completedAt   (doc ID = user uid)
/reports/{id}         userId, companyId, title, type, createdAt
```

`role` on a user doc = platform role (`aluno`/`gestor`/`admin`). `jobTitle` = professional title shown in UI ("Comprador Sênior"). Never conflate the two.

## Design system

- **Palette:** `--brown-50` … `--brown-950` + `--ink` (`#15090a`) + `--paper` (`#fbf8f3`). All UI is monochromatic brown.
- **DISC colors** (only in charts/badges, never in UI chrome): `--disc-d` red, `--disc-i` yellow, `--disc-s` green, `--disc-c` blue.
- **Typography:** `Fraunces` (serif) for titles/numbers, `Manrope` (sans) for everything else. Use `.serif` class to apply Fraunces.
- **Key CSS classes:** `.card`, `.btn .btn-primary/.btn-secondary/.btn-ghost`, `.badge .badge-brown/.badge-outline`, `.disc-tile .disc-d/.disc-i/.disc-s/.disc-c`, `.tabs > .tab.active`, `.tbl`, `.progress > span`, `.stat / .stat-label / .stat-value`.

## Icons

All icons live in `src/icons.jsx` as `Ic.*` components. Usage: `<Ic.Dashboard s={18}/>` where `s` = size in px. Never import external icon libraries.

## Contas admin fixas da plataforma

Existem 2 administradores globais permanentes (acesso total: todas as empresas, usuários, relatórios):

| # | E-mail | Status |
|---|--------|--------|
| 1 | danielboy200627@gmail.com | ativo |
| 2 | Renato.honorato@voratte.com.br | ativo |

Esses usuários devem existir no Firebase Auth **e** ter um documento em `/users/{uid}` com `role: "admin"`. As senhas ficam exclusivamente no Firebase Console — nunca em código ou neste arquivo.

## DISC test flow

The 24-question forced-choice DISC test is fully wired. Question bank, buyer
profiles and the scoring engine live in `src/disc-data.jsx` (browser-runnable
port of the canonical `disc-questions.ts` / `disc-engine.ts` at the repo root —
the `.ts` files remain reference-only; the app runs the `.jsx` port). It
exposes `window.DISC_QUESTIONS`, `window.BUYER_PROFILES`,
`window.BUYER_TYPE_TABLE`, `window.calculateDisc`. `DiscTestScreen` computes the
result, saves it via `fbSaveDiscResult` and stashes it in
`window.DISC_LAST_RESULT`; `AnaliseScreen` reads that global or reloads from
Firestore. `disc-data.jsx` must be imported before `screen-disc.jsx` in `src/main.jsx`.

## Report PDF export

`RelatorioScreen` is personalized from the user + DISC + Kraljic result. PDF
export lives in `src/report-export.jsx` (`window.buildReportData`,
`generateReportHTML`, `exportReportPDF`) — it builds a standalone A4 HTML
document (Vorätte logo embedded as base64, system colors/fonts) and prints it
through a hidden iframe (native print dialog → "Save as PDF"). No external
library. `report-export.jsx` must be imported before `screen-rest.jsx` in `src/main.jsx`.

## What is NOT implemented yet

- AI-generated narrative in reports (planned; needs a backend to hold the API key)
- SSO / Google OAuth
- Admin pagination (tables load up to 100 records)
- Email invites
- Mobile layout (desktop-only, min ~1200px)
