# Configurando o envio de email da Vorätte — Passo a passo para LEIGOS

Este guia explica como ativar o envio de email de convite (que o admin manda pra novos gestores e alunos). É 100% gratuito até 200 emails por mês.

**Tempo total:** 15–20 minutos.
**Você vai precisar de:** o email da empresa Vorätte que vai mandar os convites (ex: `convites@voratte.com.br` ou um Gmail dedicado) e a senha dele.

---

## Por que precisamos disso?

Quando o admin cadastra um novo gestor ou aluno na plataforma, o sistema cria a conta dele e oferece um botão **"Enviar convite por email"**. O EmailJS é o serviço que efetivamente entrega esse email — pense nele como o carteiro digital entre a Vorätte e a caixa de entrada do destinatário.

Sem configurar isso, o botão simplesmente avisa "EmailJS não configurado" e nada acontece. O resto da plataforma funciona normalmente — só o envio automatizado de email fica desligado.

---

## PARTE 1 — Criar a conta EmailJS

### Passo 1.1 — Abrir o site

Acesse **https://www.emailjs.com** no navegador.

### Passo 1.2 — Clicar em "Sign Up Free"

No canto superior direito tem um botão azul/verde escrito **"Sign Up Free"**. Clique nele.

### Passo 1.3 — Preencher cadastro

A página vai pedir:
- **Email:** o seu email pessoal de admin Vorätte (não precisa ser o mesmo que vai enviar os convites)
- **Password:** crie uma senha forte (anota numa caderno físico ou gerenciador de senhas)
- Aceite os termos

Clique em **"Sign Up"**.

### Passo 1.4 — Confirmar email

O EmailJS vai mandar um email de confirmação. Abra a caixa de entrada, encontre o email do EmailJS e clique no link de confirmação. **Se não chegar em 2 minutos, olha a pasta de Spam.**

Depois de confirmar, você é redirecionado pro painel (dashboard) do EmailJS.

---

## PARTE 2 — Conectar um email para enviar os convites

Esta é a parte onde você diz pro EmailJS: "use ESTE email da Vorätte pra mandar os convites". Esse email é o "remetente" que vai aparecer pro destinatário.

### Passo 2.1 — Ir em "Email Services"

No menu lateral esquerdo do painel, clique em **"Email Services"** (Serviços de Email).

### Passo 2.2 — Clicar em "Add New Service"

Botão grande no centro da tela, escrito **"Add New Service"** (Adicionar novo serviço).

### Passo 2.3 — Escolher o provedor de email

Vai abrir uma lista com vários logos: Gmail, Outlook, Yahoo, SMTP, etc. Escolha conforme o email da Vorätte:

- Se a Vorätte usa **Gmail / Google Workspace** (qualquer email @gmail.com OU email da empresa hospedado no Google) → clique em **"Gmail"**
- Se usa **Outlook / Office 365 / Microsoft 365** → clique em **"Outlook"**
- Se usa outro provedor (Hostgator, Locaweb, UOL, etc) → clique em **"Other SMTP"** (a configuração é mais complicada — veja Apêndice B no final)

**Recomendado:** Gmail é o mais simples. Se a Vorätte ainda não tem um email "no-reply" dedicado, crie um Gmail novo só pra isso: `voratte.convites@gmail.com` por exemplo. Isso evita misturar emails pessoais com automáticos.

### Passo 2.4 — Dar um nome ao serviço

Aparece um campo **"Name"** (Nome). Pode escrever **"Vorätte Convites"** ou qualquer coisa identificável. Isso é só pra você se localizar dentro do EmailJS — não aparece pro destinatário.

### Passo 2.5 — IMPORTANTE: anotar o "Service ID"

Logo abaixo do Nome aparece um campo **"Service ID"** que o EmailJS gerou automaticamente — algo tipo `service_a1b2c3d`.

📋 **COPIE esse Service ID e cole num bloco de notas.** Você vai precisar dele no final.

### Passo 2.6 — Conectar a conta de email (Gmail)

Clique no botão **"Connect Account"** (Conectar conta). Abre uma janelinha do Google pedindo:

1. Pra entrar no email da Vorätte que vai enviar os convites (digite o email e a senha)
2. Pra **autorizar o EmailJS a enviar emails em nome dessa conta** — clique em **"Allow"** / **"Permitir"**

Se o Google reclamar que "este aplicativo não foi verificado" (porque o EmailJS é um app externo), clique em **"Avançado"** → **"Acessar EmailJS (não seguro)"** — é seguro, só uma tela padrão do Google pra apps de terceiros.

### Passo 2.7 — Salvar

Volte na tela do EmailJS e clique em **"Create Service"** (Criar serviço).

Pronto, agora seu Gmail está conectado ao EmailJS.

---

## PARTE 3 — Criar o modelo (template) do email

Isso ensina o EmailJS o "formato" do email que ele vai mandar. Como nosso código já gera o HTML completo, o template aqui só precisa de uma configuração mínima.

### Passo 3.1 — Ir em "Email Templates"

No menu lateral esquerdo, clique em **"Email Templates"**.

### Passo 3.2 — Clicar em "Create New Template"

Botão grande no centro, **"Create New Template"** (Criar novo template).

### Passo 3.3 — Preencher os campos do template

Vai aparecer um formulário com várias abas. Preencha exatamente assim:

**Aba "Settings":**
- **Template Name:** `Convite Vorätte` (ou qualquer nome — só pra você se localizar)
- **Template ID:** vai aparecer já preenchido, algo tipo `template_x1y2z3`. 📋 **COPIE esse Template ID e cole no seu bloco de notas.**

**Aba "Content"** (a mais importante):

- **To Email** (Para):

  ```
  {{to_email}}
  ```

  ⚠️ **Copie exatamente isso, com as duas chaves dos lados.** Significa "o email do destinatário vem da plataforma".

- **From Name** (Nome do remetente):

  ```
  Vorätte
  ```

- **From Email** (Email do remetente): deixe **"Use Default Email Address"** marcado (vai usar o Gmail que você conectou na Parte 2).

- **Reply To** (Responder para): pode deixar vazio ou usar `{{to_email}}` — qualquer um serve.

- **Subject** (Assunto):

  ```
  {{subject}}
  ```

  ⚠️ Exatamente isso, com chaves. Nosso código manda um assunto bonito automaticamente ("Bem-vindo(a) à Vorätte · Seu acesso à plataforma DISC").

- **Content** (Conteúdo):

  Esse é o **passo mais importante**.

  **1. Primeiro**, encima do editor tem um botão pra alternar entre "Text" e "HTML". **Clique em "HTML"**. O editor muda pra modo código.

  **2. Apague TUDO** que estiver dentro do editor (ele já vem com texto exemplo).

  **3. Cole exatamente isto, sem mudar nada:**

  ```
  {{{html_message}}}
  ```

  ⚠️ **OBSERVE:** são **TRÊS** chaves de cada lado, não duas. As três chaves dizem ao EmailJS "não escape este HTML, renderize ele do jeito que veio". Se você usar duas, o destinatário recebe o código bruto em vez do email bonito.

### Passo 3.4 — Salvar o template

Clique em **"Save"** (Salvar) no canto superior direito.

---

## PARTE 4 — Pegar a Public Key

Última credencial que falta.

### Passo 4.1 — Ir em "Account"

No menu lateral esquerdo, clique em **"Account"** (Conta).

### Passo 4.2 — Achar "Public Key"

Na aba **"General"** tem uma seção chamada **"API Keys"**. Você vê uma chave chamada **"Public Key"**, algo tipo `7Ks9_aBcDeFgHiJkL`.

📋 **COPIE essa Public Key e cole no seu bloco de notas.**

Você NÃO precisa da "Private Key" — nosso código só usa a Public Key (ela é segura ficar visível no navegador).

---

## PARTE 5 — Colocar as 3 credenciais na plataforma

Agora você deve ter no seu bloco de notas:

1. **Public Key** — ex: `7Ks9_aBcDeFgHiJkL`
2. **Service ID** — ex: `service_a1b2c3d`
3. **Template ID** — ex: `template_x1y2z3`

Hora de colar essas 3 coisas no código da Vorätte.

### Passo 5.1 — Abrir o arquivo `src/email-invite.jsx`

Use VSCode, Notepad++ ou qualquer editor de texto.

### Passo 5.2 — Localizar o bloco `EMAILJS_CONFIG`

Procure (Ctrl+F) por **`EMAILJS_CONFIG`**. Você vai encontrar esse bloco perto do topo:

```js
window.EMAILJS_CONFIG = window.EMAILJS_CONFIG || {
  publicKey:  'COLOQUE_AQUI',
  serviceId:  'COLOQUE_AQUI',
  templateId: 'COLOQUE_AQUI',
  loginUrl:   'https://voratte-3fc9f.web.app',
};
```

### Passo 5.3 — Substituir os "COLOQUE_AQUI"

Troque cada `'COLOQUE_AQUI'` pelas suas credenciais reais. **Mantenha as aspas simples ao redor.** Fica algo tipo:

```js
window.EMAILJS_CONFIG = window.EMAILJS_CONFIG || {
  publicKey:  '7Ks9_aBcDeFgHiJkL',
  serviceId:  'service_a1b2c3d',
  templateId: 'template_x1y2z3',
  loginUrl:   'https://voratte-3fc9f.web.app',
};
```

⚠️ **NÃO mude o `loginUrl`** — esse é o link que o destinatário vai clicar pra entrar na plataforma. Já está apontando pro site oficial em produção.

### Passo 5.4 — Salvar o arquivo

Ctrl+S. Só isso.

---

## PARTE 6 — Publicar (deploy) a mudança

Você editou o arquivo localmente. Pra o site público em `voratte-3fc9f.web.app` enxergar as credenciais novas, precisa fazer deploy.

No PowerShell, dentro da pasta do projeto, rode:

```
firebase deploy --only hosting
```

Espera 1–2 minutos. Quando aparecer `Deploy complete!`, está no ar.

---

## PARTE 7 — Testar

1. Acesse o site da Vorätte em produção: **https://voratte-3fc9f.web.app**
2. Faça login como admin (sua conta `danielboy200627@gmail.com` ou `Renato.honorato@voratte.com.br`).
3. Vai em **Empresas** → clique em **"Cadastrar empresa"** → preenche os dados → salva.
4. Vai em **Gestores** → clique em **"Cadastrar gestor"** → preenche nome/email/senha + escolhe a empresa do passo 3 → salva.
5. Na tela de sucesso vai aparecer o botão **"Enviar convite por email"** → clique nele.
6. Em poucos segundos: o botão fica verde com a mensagem "✓ Convite enviado para fulano@exemplo.com".
7. **Use um email seu pra testar antes de mandar pra cliente real.** Vai na sua caixa de entrada (e na pasta Spam, se não chegar) e confirma que o email chegou bonito, com logo Vorätte, cores marrom, botão "Acessar plataforma" funcionando.

---

## Problemas comuns e soluções

### "EmailJS não carregou"

Significa que o navegador não baixou o script EmailJS. Geralmente é problema de internet ou bloqueador de anúncios. Desative o AdBlock pro domínio voratte e recarregue a página (Ctrl+F5).

### "EmailJS não configurado"

Você não colocou as 3 credenciais ou ainda tem algum `'COLOQUE_AQUI'` no arquivo. Confira `src/email-invite.jsx` linhas 14–18.

### "Falha ao enviar: 412" ou "Gmail_API: Request had insufficient authentication scopes"

A conexão do Gmail expirou ou você não autorizou todas as permissões. Volte na Parte 2 (Email Services), apague o serviço atual, crie um novo, e na hora de "Connect Account" marque **todas as caixas** de permissão que o Google pedir.

### "Falha ao enviar: 422" ou "Recipient address is empty"

O template não está configurado certo. Volte na Parte 3.3 e confirme que o campo **"To Email"** tem exatamente `{{to_email}}` (duas chaves, sem espaços).

### O email chega mas vem com código bruto `<table>...</table>` em vez de bonito

Você usou DUAS chaves no Content em vez de TRÊS. Volte na Parte 3.3 e mude `{{html_message}}` para `{{{html_message}}}` (três chaves).

### O email chega mas o logo aparece quebrado

Alguns clientes de email (especialmente Outlook corporativo) bloqueiam imagens base64 grandes. Normalmente o destinatário só precisa clicar em **"Baixar imagens"** ou **"Mostrar conteúdo"** no topo do email. Não é bug nosso, é configuração de segurança do email do destinatário.

### O email cai no Spam

Normal no início. Conforme você manda mais emails e os destinatários marcam como "não é spam", o Gmail/Outlook vai aprendendo. Pra acelerar:
- Use um email de domínio próprio (ex: `convites@voratte.com.br`) em vez de Gmail genérico
- Configure SPF/DKIM no DNS do domínio voratte.com.br (pede pro seu provedor de domínio — Locaweb/Hostgator/etc fazem isso)

### Esgotou os 200 emails/mês grátis

A tela do admin vai mostrar "Falha ao enviar: 426" ou "Quota exceeded". Tem 3 opções:
1. Esperar o próximo mês resetar
2. Assinar plano pago do EmailJS (US$ 5/mês = 1.000 emails)
3. Mudar pra outro serviço (Resend, SendGrid, Mailgun) — exige ajustes no código

---

## Apêndice A — Onde estão suas credenciais salvas

Depois de tudo configurado, suas credenciais EmailJS ficam:

- **No painel EmailJS** — acessível a qualquer hora em https://dashboard.emailjs.com com seu email/senha de cadastro
- **No arquivo `src/email-invite.jsx`** — dentro do repositório de código
- **Em produção** — embutido no site `voratte-3fc9f.web.app` (após `firebase deploy`)

A **Public Key** é segura ficar exposta no navegador — qualquer pessoa pode ver vendo o código-fonte. A segurança real vem do EmailJS limitar quantos emails podem ser enviados por hora/dia.

---

## Apêndice B — Configurando SMTP genérico (provedores brasileiros)

Se a Vorätte usa email da Locaweb, Hostgator, UOL, KingHost ou similar, precisa usar SMTP. Na hora de adicionar o Email Service (Parte 2.3), escolha **"Other SMTP"** e preencha:

- **SMTP Server:** algo como `smtp.locaweb.com.br` (pergunta pro suporte do provedor)
- **Port:** `587` (recomendado) ou `465`
- **Username:** seu email completo (`convites@voratte.com.br`)
- **Password:** a senha do email
- **Secure Connection:** marque TLS

O resto do processo é igual.

---

Fim. Qualquer dúvida, leia este arquivo de novo com calma — cada passo está explicado.
