// Geração e exportação do relatório DISC + Kraljic em PDF (impressão nativa)
// Expõe: window.buildReportData, window.generateReportHTML, window.exportReportPDF

(function () {
  // Paleta do sistema
  const C = {
    ink: '#0f0907', inkSoft: '#2a201a', muted: '#7a6b5d',
    paper: '#ffffff', paperWarm: '#fbf8f3', line: '#ebe4d8', lineSoft: '#f3ecdf',
    brown950: '#15090a', brown850: '#28180f', brown700: '#4a2c1b',
    brown500: '#8b5a2b', brown300: '#c9a17a', brown100: '#f0e3d0', brown50: '#faf5ee',
    discD: '#d83a2a', discI: '#e8b53a', discS: '#4ea868', discC: '#3a6fb5',
  };
  const DISC_COLOR = { D: C.discD, I: C.discI, S: C.discS, C: C.discC };
  const DISC_FULL  = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' };
  const DISC_LABEL = { D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme' };
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtDate(d) {
    d = d || new Date();
    return d.getDate() + ' ' + MES[d.getMonth()] + '. ' + d.getFullYear();
  }

  // ===== monta os dados do relatório a partir do usuário + resultado DISC =====
  function buildReportData(user, discResult) {
    user = user || {};
    const r = discResult || window.DISC_LAST_RESULT;
    if (!r) return null;

    const m = r.mostGraph || { D: 0, I: 0, S: 0, C: 0 };
    const totalMost = (m.D + m.I + m.S + m.C) || 1;
    const composition = ['D', 'I', 'S', 'C'].map(function (k) {
      return { key: k, full: DISC_FULL[k], color: DISC_COLOR[k],
        value: Math.round((m[k] / totalMost) * 100) };
    });
    const profile = r.profile || window.BUYER_PROFILES[r.code] || window.BUYER_PROFILES[r.main];
    const primary = profile.primary;
    const kraljic = window.calculateKraljic(r.changeGraph || m);

    return {
      name: user.name || 'Comprador',
      jobTitle: user.jobTitle || '',
      company: user.companyName || '',
      email: user.email || '',
      dateStr: fmtDate(new Date()),
      code: r.code || profile.code,
      primary: primary,
      primaryLabel: DISC_LABEL[primary],
      predominance: composition.filter(function (c) { return c.key === primary; })[0].value,
      mostGraph: m,
      leastGraph: r.leastGraph || { D: 0, I: 0, S: 0, C: 0 },
      changeGraph: r.changeGraph || { D: 0, I: 0, S: 0, C: 0 },
      composition: composition,
      profile: profile,
      kraljic: kraljic,
    };
  }

  // ===== gráfico SVG de barras: Máscara / Pressão / Real =====
  function discBarChartSVG(most, least, change) {
    const dims = ['D', 'I', 'S', 'C'];
    const dimLabel = { D: 'D · Dominância', I: 'I · Influência', S: 'S · Estabilidade', C: 'C · Conformidade' };
    const series = [
      { color: '#3f7cb8', data: most || {} },
      { color: '#cf6a3f', data: least || {} },
      { color: '#1f9d6b', data: change || {} },
    ];
    const all = [];
    dims.forEach(function (k) { series.forEach(function (s) { all.push(s.data[k] || 0); }); });
    let max = Math.max.apply(null, all.concat([0]));
    let min = Math.min.apply(null, all.concat([0]));
    max = Math.ceil(max / 2) * 2; min = Math.floor(min / 2) * 2;
    if (max === 0) max = 2;
    const range = (max - min) || 1;
    const W = 680, H = 250, padL = 34, padR = 10, padT = 12, padB = 38;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const y = function (v) { return padT + (plotH * (max - v)) / range; };
    const groupW = plotW / 4, innerPad = groupW * 0.16, barW = (groupW - innerPad * 2) / 3;

    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" xmlns="http://www.w3.org/2000/svg">';
    for (let t = min; t <= max; t += 2) {
      svg += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(t) + '" y2="' + y(t) +
        '" stroke="' + (t === 0 ? '#c9a17a' : '#ebe4d8') + '" stroke-width="' + (t === 0 ? 1.4 : 1) + '"/>';
      svg += '<text x="' + (padL - 7) + '" y="' + (y(t) + 3.3) + '" text-anchor="end" font-size="10" fill="#7a6b5d" font-family="Manrope,sans-serif">' + t + '</text>';
    }
    dims.forEach(function (k, gi) {
      const gx = padL + gi * groupW + innerPad;
      series.forEach(function (s, si) {
        const v = s.data[k] || 0;
        const bx = gx + si * barW;
        const top = v >= 0 ? y(v) : y(0);
        const h = Math.max(Math.abs(y(v) - y(0)), 0.6);
        svg += '<rect x="' + (bx + 1.5) + '" y="' + top + '" width="' + (barW - 3) + '" height="' + h + '" fill="' + s.color + '" rx="1.5"/>';
      });
      svg += '<text x="' + (padL + gi * groupW + groupW / 2) + '" y="' + (H - padB + 18) +
        '" text-anchor="middle" font-size="10.5" fill="#2a201a" font-family="Manrope,sans-serif">' + dimLabel[k] + '</text>';
    });
    svg += '</svg>';
    return svg;
  }

  // ===== matriz de Kraljic com o comprador plotado =====
  function kraljicMatrixHTML(kr) {
    const x = kr.axis.riscoSuprimento;
    const y = kr.axis.impactoFinanceiro;
    const cells = [
      { id: 'alavancagem',  dim: 'D', name: 'Alavancagem' },
      { id: 'estrategico',  dim: 'I', name: 'Estratégico' },
      { id: 'nao_criticos', dim: 'C', name: 'Não-críticos' },
      { id: 'gargalo',      dim: 'S', name: 'Gargalo' },
    ];
    let html = '<div class="kmatrix">';
    cells.forEach(function (c) {
      const mine = kr.dominantQuadrant === c.id;
      html += '<div class="kq' + (mine ? ' kq-mine' : '') + '">' +
        '<div class="kq-tile" style="background:' + DISC_COLOR[c.dim] + '">' + c.dim + '</div>' +
        '<div class="kq-name">' + c.name + '</div>' +
        '<div class="kq-dim">DISC ' + c.dim + (mine ? ' · você' : '') + '</div>' +
        '</div>';
    });
    html += '<div class="kdot" style="left:' + x + '%;top:' + (100 - y) + '%"></div>';
    html += '</div>';
    return html;
  }

  function listHTML(items, warn) {
    return '<ul class="rlist' + (warn ? ' rlist-warn' : '') + '">' +
      (items || []).map(function (it) { return '<li>' + esc(it) + '</li>'; }).join('') + '</ul>';
  }

  function sectionLabel(num, label) {
    return '<div class="seclabel"><span class="secnum">' + num + '</span>' +
      '<span class="secline"></span><span class="sectext">' + esc(label) + '</span></div>';
  }

  // ===== CSS do documento de impressão =====
  function reportCSS() {
    return "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap');"
      + '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
      + '@page{size:A4;margin:0;}'
      + 'body{font-family:Manrope,sans-serif;color:' + C.ink + ';background:' + C.paper + ';font-size:11px;line-height:1.5;}'
      + '.serif{font-family:Fraunces,Georgia,serif;}'
      + '.page{width:210mm;min-height:297mm;padding:16mm 18mm;}'
      + '.cover{width:210mm;height:297mm;padding:24mm 22mm;display:flex;flex-direction:column;'
      + 'background:linear-gradient(135deg,' + C.brown950 + ' 0%,' + C.brown850 + ' 55%,' + C.brown700 + ' 100%);'
      + 'color:' + C.brown50 + ';page-break-after:always;}'
      + '.cover-logo{height:26px;}'
      + '.cover-tag{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:' + C.brown300 + ';margin-top:7px;font-weight:600;}'
      + '.cover-eyebrow{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:' + C.brown300 + ';font-weight:600;}'
      + '.cover-title{font-family:Fraunces,serif;font-size:46px;font-weight:400;line-height:1.05;margin-top:12px;}'
      + '.cover-title em{font-style:italic;color:' + C.brown300 + ';}'
      + '.cover-meta{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:20px 36px;}'
      + '.cm-k{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:' + C.brown300 + ';font-weight:600;}'
      + '.cm-v{font-family:Fraunces,serif;font-size:21px;font-weight:500;margin-top:3px;}'
      + '.cm-s{color:' + C.brown300 + ';margin-top:1px;font-size:10px;}'
      + '.section{padding:11mm 0;border-bottom:1px solid ' + C.lineSoft + ';page-break-inside:avoid;}'
      + '.section:last-of-type{border-bottom:none;}'
      + '.seclabel{display:flex;align-items:center;gap:12px;margin-bottom:16px;}'
      + '.secnum{font-family:Fraunces,serif;font-size:30px;font-weight:400;color:' + C.brown300 + ';}'
      + '.secline{flex:1;height:1px;background:' + C.line + ';}'
      + '.sectext{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:' + C.muted + ';font-weight:600;}'
      + 'h2.rtitle{font-family:Fraunces,serif;font-size:23px;font-weight:500;line-height:1.2;margin-bottom:8px;}'
      + 'h2.rtitle em{font-style:italic;}'
      + '.rlead{font-size:12px;color:' + C.inkSoft + ';line-height:1.6;margin-bottom:14px;}'
      + '.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}'
      + '.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}'
      + '.comp-row{margin-bottom:9px;}'
      + '.comp-head{display:flex;justify-content:space-between;font-size:11px;font-weight:600;margin-bottom:3px;}'
      + '.comp-bar{height:9px;border-radius:6px;background:' + C.brown50 + ';overflow:hidden;}'
      + '.comp-bar > span{display:block;height:100%;border-radius:6px;}'
      + '.card{background:' + C.paperWarm + ';border:1px solid ' + C.line + ';border-radius:10px;padding:14px 16px;}'
      + '.card-k{font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:' + C.muted + ';font-weight:700;margin-bottom:6px;}'
      + '.card-h{font-family:Fraunces,serif;font-size:14px;font-weight:600;margin-bottom:8px;}'
      + '.card-t{font-size:11px;color:' + C.inkSoft + ';line-height:1.55;}'
      + '.rlist{list-style:none;}'
      + '.rlist li{position:relative;padding:4px 0 4px 15px;font-size:11px;color:' + C.inkSoft + ';}'
      + '.rlist li:before{content:"";position:absolute;left:0;top:10px;width:5px;height:5px;border-radius:50%;background:' + C.brown500 + ';}'
      + '.rlist-warn li:before{background:' + C.discD + ';}'
      + '.legend{display:flex;gap:18px;justify-content:center;margin-top:8px;font-size:10px;color:' + C.inkSoft + ';}'
      + '.legend span.sw{width:11px;height:11px;border-radius:3px;display:inline-block;vertical-align:-1px;margin-right:5px;}'
      + '.kwrap{display:flex;gap:18px;align-items:center;}'
      + '.kmatrix{position:relative;width:118mm;height:78mm;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;}'
      + '.kq{border:1px solid ' + C.line + ';padding:11px;display:flex;flex-direction:column;gap:3px;background:' + C.paper + ';}'
      + '.kq-mine{background:' + C.brown50 + ';border-color:' + C.brown300 + ';}'
      + '.kq-tile{width:26px;height:26px;border-radius:6px;color:#fff;font-family:Fraunces,serif;font-weight:600;font-size:14px;display:flex;align-items:center;justify-content:center;}'
      + '.kq-name{font-family:Fraunces,serif;font-size:14px;font-weight:600;}'
      + '.kq-dim{font-size:9px;color:' + C.muted + ';font-weight:600;}'
      + '.kdot{position:absolute;width:22px;height:22px;border-radius:50%;background:' + C.brown700 + ';'
      + 'border:3px solid ' + C.paper + ';box-shadow:0 0 0 3px ' + C.brown700 + ';transform:translate(-50%,-50%);}'
      + '.kaxis-y,.kaxis-x{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:' + C.muted + ';font-weight:600;}'
      + '.statline{display:flex;gap:10px;margin:10px 0;}'
      + '.stat{flex:1;background:' + C.paperWarm + ';border:1px solid ' + C.line + ';border-radius:9px;padding:10px 12px;}'
      + '.stat-k{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:' + C.muted + ';font-weight:700;}'
      + '.stat-v{font-family:Fraunces,serif;font-size:19px;font-weight:600;margin-top:2px;}'
      + '.rfoot{padding:8mm 18mm;display:flex;justify-content:space-between;font-size:9px;color:' + C.muted + ';}'
      + '.tag{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;'
      + 'padding:3px 9px;border-radius:999px;background:' + C.brown700 + ';color:' + C.brown50 + ';}';
  }

  // ===== documento HTML completo =====
  function generateReportHTML(data, logoSrc) {
    const p = data.profile;
    const kr = data.kraljic;
    const docTitle = 'Relatório DISC — ' + data.name;

    // Capa
    const cover =
      '<div class="cover">' +
        '<div>' +
          (logoSrc ? '<img class="cover-logo" src="' + logoSrc + '" alt="Vorätte"/>' : '<div class="serif" style="font-size:22px;color:' + C.brown50 + '">Vorätte</div>') +
          '<div class="cover-tag">DISC · Compras &amp; Negociação</div>' +
        '</div>' +
        '<div style="flex:1"></div>' +
        '<div class="cover-eyebrow">Relatório executivo · Vorätte</div>' +
        '<h1 class="cover-title">Perfil de Comprador<br/><em>DISC &amp; Matriz de Kraljic</em></h1>' +
        '<div class="cover-meta">' +
          '<div><div class="cm-k">Profissional</div><div class="cm-v">' + esc(data.name) + '</div>' +
            (data.jobTitle ? '<div class="cm-s">' + esc(data.jobTitle) + '</div>' : '') + '</div>' +
          '<div><div class="cm-k">Empresa</div><div class="cm-v">' + esc(data.company || '—') + '</div>' +
            (data.email ? '<div class="cm-s">' + esc(data.email) + '</div>' : '') + '</div>' +
          '<div><div class="cm-k">Perfil DISC</div><div class="cm-v" style="color:' + DISC_COLOR[data.primary] + '">' +
            esc(data.code) + ' · ' + esc(data.primaryLabel) + '</div>' +
            '<div class="cm-s">' + data.predominance + '% de predominância</div></div>' +
          '<div><div class="cm-k">Emitido em</div><div class="cm-v">' + esc(data.dateStr) + '</div>' +
            '<div class="cm-s">Vorätte · plataforma DISC</div></div>' +
        '</div>' +
      '</div>';

    // 01 — Análise comportamental
    const comp = data.composition.map(function (c) {
      return '<div class="comp-row"><div class="comp-head"><span>' + c.full + ' (' + c.key + ')</span>' +
        '<span>' + c.value + '%</span></div><div class="comp-bar"><span style="width:' + c.value + '%;background:' + c.color + '"></span></div></div>';
    }).join('');
    const sec01 =
      '<div class="section">' + sectionLabel('01', 'Análise comportamental') +
        '<h2 class="rtitle">Perfil <em style="color:' + DISC_COLOR[data.primary] + '">' + esc(p.label) + '</em></h2>' +
        '<p class="rlead">' + esc(p.buyerType) + '. Sua dimensão predominante é <strong>' +
          esc(data.primaryLabel) + ' (' + data.primary + ')</strong>, com ' + data.predominance + '% de composição.</p>' +
        comp +
      '</div>';

    // 02 — Os 3 cenários
    const sec02 =
      '<div class="section">' + sectionLabel('02', 'Máscara · Pressão · Real') +
        '<h2 class="rtitle">Como você se comporta em três cenários</h2>' +
        '<p class="rlead">Máscara é como você se apresenta; Pressão é como age sob estresse de negociação; Real é o perfil autêntico que governa sua decisão de compra.</p>' +
        discBarChartSVG(data.mostGraph, data.leastGraph, data.changeGraph) +
        '<div class="legend">' +
          '<span><span class="sw" style="background:#3f7cb8"></span>Máscara (apresentação)</span>' +
          '<span><span class="sw" style="background:#cf6a3f"></span>Pressão (estresse)</span>' +
          '<span><span class="sw" style="background:#1f9d6b"></span>Real (decisão)</span>' +
        '</div>' +
      '</div>';

    // 03 — Perfil de comprador detalhado
    const sec03 =
      '<div class="section">' + sectionLabel('03', 'Perfil de comprador') +
        '<h2 class="rtitle">O que move e o que trava sua decisão</h2>' +
        '<div class="card" style="margin-bottom:12px"><div class="card-k">Estilo de decisão</div>' +
          '<div class="card-t">' + esc(p.decisionStyle) + '</div></div>' +
        '<div class="grid2">' +
          '<div><div class="card-h">O que move a compra</div>' + listHTML(p.motivators) + '</div>' +
          '<div><div class="card-h">O que trava a decisão</div>' + listHTML(p.fears, true) + '</div>' +
        '</div>' +
      '</div>';

    // 04 — Matriz de Kraljic
    const sec04 =
      '<div class="section">' + sectionLabel('04', 'Matriz de Kraljic') +
        '<h2 class="rtitle">Seu posicionamento estratégico</h2>' +
        '<p class="rlead">Derivado do seu perfil DISC real, o ponto marca como você tende a se posicionar diante dos fornecedores.</p>' +
        '<div class="kwrap">' +
          '<div><div class="kaxis-y" style="margin-bottom:4px">↑ Impacto financeiro</div>' +
            kraljicMatrixHTML(kr) +
            '<div class="kaxis-x" style="margin-top:4px">Risco de suprimento →</div></div>' +
          '<div style="flex:1">' +
            '<div class="tag">' + esc(kr.positionLabel) + '</div>' +
            '<div class="statline" style="flex-direction:column;gap:8px;margin-top:10px">' +
              '<div class="stat"><div class="stat-k">Impacto financeiro</div><div class="stat-v">' + kr.axis.impactoFinanceiro + '</div></div>' +
              '<div class="stat"><div class="stat-k">Risco de suprimento</div><div class="stat-v">' + kr.axis.riscoSuprimento + '</div></div>' +
            '</div>' +
            '<div class="card" style="margin-top:8px"><div class="card-k">Postura de compra</div>' +
              '<div class="card-t">' + esc(kr.buyerPosture) + '</div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 05 — Saída completa Kraljic
    const sec05 =
      '<div class="section">' + sectionLabel('05', 'Leitura completa do quadrante') +
        '<h2 class="rtitle">Comprador <em>' + esc(kr.label) + '</em></h2>' +
        '<div class="grid2" style="margin-bottom:12px">' +
          '<div><div class="card-h">O que você quer do fornecedor</div>' + listHTML(kr.whatHeWants) + '</div>' +
          '<div><div class="card-h">O que evitar com você</div>' + listHTML(kr.whatToAvoid, true) + '</div>' +
        '</div>' +
        '<div class="grid2">' +
          '<div class="card"><div class="card-k">Poder de negociação</div><div class="card-t">' + esc(kr.negotiationLeverage) + '</div></div>' +
          '<div class="card"><div class="card-k">Foco da proposta</div><div class="card-t">' + esc(kr.proposalFocus) + '</div></div>' +
          '<div class="card"><div class="card-k">Estilo de contrato</div><div class="card-t">' + esc(kr.contractStyle) + '</div></div>' +
          '<div class="card"><div class="card-k">Risco para o vendedor</div><div class="card-t">' + esc(kr.riskForVendor) + '</div></div>' +
        '</div>' +
      '</div>';

    // 06 — Como te abordar
    const sec06 =
      '<div class="section">' + sectionLabel('06', 'Recomendações de abordagem') +
        '<h2 class="rtitle">Como uma negociação flui melhor com você</h2>' +
        '<div style="margin-bottom:12px"><div class="card-h">Abordagem recomendada</div>' + listHTML(p.salesApproach) + '</div>' +
        '<div class="grid3">' +
          '<div class="card"><div class="card-k">Tom ideal</div><div class="card-t">' + esc(p.pitchTone) + '</div></div>' +
          '<div class="card"><div class="card-k">Fechamento</div><div class="card-t">' + esc(p.closingStrategy) + '</div></div>' +
          '<div class="card"><div class="card-k">Objeções</div><div class="card-t">' + esc(p.objectionHandling) + '</div></div>' +
        '</div>' +
      '</div>';

    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>' +
      '<title>' + esc(docTitle) + '</title><style>' + reportCSS() + '</style></head><body>' +
      cover +
      '<div class="page">' + sec01 + sec02 + sec03 + sec04 + sec05 + sec06 + '</div>' +
      '<div class="rfoot"><span>Relatório gerado em ' + esc(data.dateStr) + ' · Vorätte</span>' +
      '<span>' + esc(data.name) + ' · DISC ' + esc(data.code) + '</span></div>' +
      '</body></html>';
  }

  // converte a logo para dataURL base64 (evita problemas de caminho na impressão)
  function loadLogo() {
    return fetch('assets/voratte-logo.webp')
      .then(function (res) { return res.blob(); })
      .then(function (blob) {
        return new Promise(function (resolve) {
          const fr = new FileReader();
          fr.onload = function () { resolve(fr.result); };
          fr.onerror = function () { resolve(null); };
          fr.readAsDataURL(blob);
        });
      })
      .catch(function () { return null; });
  }

  // imprime o HTML num iframe oculto (diálogo nativo → "Salvar como PDF")
  function printViaIframe(html) {
    const existing = document.getElementById('voratte-print-frame');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'voratte-print-frame';
    // tamanho real, fora da tela — renderização de impressão mais confiável que 0×0
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:0;';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win.document;
    doc.open();
    doc.write(html);
    doc.close();

    let done = false;
    function finish() {
      if (done) return;
      done = true;
      try { win.focus(); win.print(); } catch (e) { console.error('Erro ao imprimir:', e); }
      win.onafterprint = function () { setTimeout(function () { iframe.remove(); }, 200); };
      // fallback de limpeza
      setTimeout(function () {
        if (document.getElementById('voratte-print-frame')) iframe.remove();
      }, 120000);
    }

    if (win.document.fonts && win.document.fonts.ready) {
      win.document.fonts.ready.then(function () { setTimeout(finish, 350); });
      setTimeout(finish, 2500); // garante mesmo se fonts.ready travar
    } else {
      setTimeout(finish, 900);
    }
  }

  // ===== ponto de entrada — exporta o relatório =====
  function exportReportPDF(data) {
    if (!data) {
      alert('Faça o teste DISC antes de gerar o relatório.');
      return;
    }
    loadLogo().then(function (logoSrc) {
      printViaIframe(generateReportHTML(data, logoSrc));
    });
  }

  window.buildReportData = buildReportData;
  window.generateReportHTML = generateReportHTML;
  window.exportReportPDF = exportReportPDF;
  window.vorattePrintHTML = printViaIframe;
  window.voratteLoadLogo = loadLogo;
})();
