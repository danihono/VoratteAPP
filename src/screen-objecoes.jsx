// Tratamento de Objeções — consome o Motor de Negociação (window.resolverNegociacao).
// Toda a recomendação vem da base canônica (MOTOR_OBJECOES + resolverNegociacao);
// nada é hardcoded. Mostra origem (caso-exato/caso-base/composto) + confiança e os
// 5 campos do template §24 (diagnóstico, risco, estratégia, frase, próxima ação).

function ObjecoesScreen({ go }) {
  const objecoes = window.MOTOR_OBJECOES || [];
  const kraljic = window.MOTOR_KRALJIC || {};
  const slugs = (window.MOTOR_OBJETIVOS && window.MOTOR_OBJETIVOS.slugs) || {};
  const disc = window.MOTOR_DISC || {};

  const [perfil, setPerfil] = React.useState('D');
  const [objecaoId, setObjecaoId] = React.useState('OBJ_01');
  const [quadrante, setQuadrante] = React.useState('alavancagem');
  const [objetivo, setObjetivo] = React.useState('capturar_saving');

  if (!window.resolverNegociacao) {
    return <div className="card">Motor de negociação não carregado. Verifique se <code>src/motor-data.jsx</code> e <code>src/motor-engine.jsx</code> estão no HTML.</div>;
  }

  const r = window.resolverNegociacao({
    perfilDISC: perfil,
    objecaoId: objecaoId,
    quadranteKraljic: quadrante,
    objetivoComprador: objetivo,
  });

  const grupos = ['Preço', 'Valor', 'Custos', 'Capacidade', 'Contrato e Governança'];
  const quads = ['alavancagem', 'estrategico', 'gargalo', 'nao_criticos'];
  const objSel = (window.MOTOR_OBJECOES_BY_ID || {})[objecaoId] || {};

  const origemMeta = {
    'caso-exato': { label: 'Caso curado', sub: 'recomendação validada na base canônica (§20–23)', icon: 'Check', cor: 'var(--disc-s)' },
    'caso-base':  { label: 'Caso base', sub: 'caso curado aproximado — mesmo perfil e objeção', icon: 'Shield', cor: 'var(--disc-i)' },
    'composto':   { label: 'Montado pela base', sub: 'composto de fragmentos da base (§15/§18), sem texto gerado', icon: 'Sparkle', cor: 'var(--brown-700)' },
    'erro':       { label: 'Sem dados suficientes', sub: 'informe perfil e objeção', icon: 'Search', cor: 'var(--disc-d)' },
  };
  const om = origemMeta[r.origem] || origemMeta['erro'];
  const OmIcon = Ic[om.icon] || Ic.Sparkle;

  const confCor = { Alta: 'var(--disc-s)', 'Média': 'var(--disc-i)', Baixa: 'var(--disc-d)' };
  const cc = confCor[r.confianca] || 'var(--muted)';

  const selectStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--line)', background: 'var(--paper)',
    color: 'var(--ink)', fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
  };
  const labelStyle = { fontSize: 11.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 8, display: 'block' };

  function pill(active) {
    return {
      padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
      border: '1px solid ' + (active ? 'var(--brown-200)' : 'var(--line)'),
      background: active ? 'var(--paper-warm)' : 'var(--paper)',
      color: active ? 'var(--ink)' : 'var(--ink-soft)',
    };
  }

  function Campo({ icon, label, texto, tint }) {
    return (
      <div style={{ padding: '16px 0', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {icon}
          <span style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: tint ? 'var(--muted)' : 'var(--ink)' }}>{texto}</div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div>
        <div className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Tratamento de Objeções</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
          Copiloto do comprador · {objecoes.length} objeções mapeadas · respostas vindas da base Vorätte, nunca geradas por IA
        </div>
      </div>

      {/* Controles */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          <div>
            <span style={labelStyle}>Perfil DISC do vendedor</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['D', 'I', 'S', 'C'].map(p => (
                <button key={p} onClick={() => setPerfil(p)} title={(disc[p] || {}).nome}
                  style={Object.assign({ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }, pill(perfil === p))}>
                  <span className={'disc-tile disc-' + p.toLowerCase()} style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}>{p}</span>
                  <span style={{ fontSize: 12.5 }}>{(disc[p] || {}).nome}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={labelStyle}>Quadrante Kraljic da categoria</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {quads.map(q => (
                <button key={q} onClick={() => setQuadrante(q)} style={pill(quadrante === q)}>
                  {(kraljic[q] || {}).label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={labelStyle}>Objeção do vendedor</span>
            <select value={objecaoId} onChange={e => setObjecaoId(e.target.value)} style={selectStyle}>
              {grupos.map(g => (
                <optgroup key={g} label={g}>
                  {objecoes.filter(o => o.grupo === g).map(o => (
                    <option key={o.id} value={o.id}>{o.texto}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <span style={labelStyle}>Seu objetivo na negociação</span>
            <select value={objetivo} onChange={e => setObjetivo(e.target.value)} style={selectStyle}>
              {Object.keys(slugs).map(s => (
                <option key={s} value={s}>{slugs[s]}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Resultado */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--ink-soft)' }}>
              “{objSel.texto}”
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: 'inset 0 0 0 1px ' + om.cor, color: om.cor }}>
              <OmIcon s={13} />
              {om.label}
            </span>
            <span className="badge badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: cc, display: 'inline-block' }} />
              Confiança {r.confianca}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          {om.sub}{r.casoId ? ' · ' + r.casoId : ''}
        </div>

        <Campo icon={<Ic.Eye s={16} />} label="Diagnóstico comportamental" texto={r.diagnostico} />
        <Campo icon={<Ic.Shield s={16} />} label="Risco para o comprador" texto={r.risco} />
        <Campo icon={<Ic.Target s={16} />} label="Estratégia recomendada" texto={r.estrategia} />

        {/* Frase sugerida — destaque, com sotaque do perfil do vendedor */}
        <div style={{ marginTop: 16, borderRadius: 12, background: 'var(--paper-warm)', border: '1px solid var(--line)', borderLeft: '3px solid var(--disc-' + perfil.toLowerCase() + ')', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ic.Chat s={16} />
            <span style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
              Frase sugerida · para um vendedor {perfil}
            </span>
          </div>
          <div className="serif" style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink)', fontStyle: 'italic' }}>
            “{r.frase}”
          </div>
        </div>

        <Campo icon={<Ic.Arrow s={16} />} label="Próxima melhor ação" texto={r.proximaAcao} />
      </div>

      {/* Legenda de origem */}
      <div className="card" style={{ background: 'var(--ink)', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic.Bulb s={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 15, fontWeight: 600 }}>Como ler a origem da recomendação</div>
            <p style={{ fontSize: 12.5, color: 'var(--brown-200)', marginTop: 4, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--brown-50)' }}>Caso curado</strong>: combinação exata mapeada nos casos de decisão da base. ·{' '}
              <strong style={{ color: 'var(--brown-50)' }}>Caso base</strong>: caso curado próximo (mesmo perfil e objeção, outro contexto). ·{' '}
              <strong style={{ color: 'var(--brown-50)' }}>Montado pela base</strong>: combinação não mapeada, montada a partir dos blocos prontos do método (objeção §18 + Kraljic §15) — sem texto inventado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ObjecoesScreen = ObjecoesScreen;
