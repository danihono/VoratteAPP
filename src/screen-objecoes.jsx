// Tratamento de Objeções — consome o Motor de Negociação 4.0 (window.resolverNegociacao).
// Entrada: perfil DISC do vendedor + objeção + quadrante Kraljic. O OBJETIVO não é
// mais escolha — é DERIVADO de objeção × quadrante (matriz de inferência) e exibido
// como resultado (primário + secundário). Diagnóstico/risco/estratégia/alavanca/frase/
// próxima-ação vêm do objetivo primário; o secundário entra como bloco de reforço.
// Nada é hardcoded nem inventado por IA — tudo sai da base canônica da Vorätte.

function ObjecoesScreen({ go }) {
  const objecoes = window.MOTOR_OBJECOES || [];
  const kraljic = window.MOTOR_KRALJIC || {};
  const disc = window.MOTOR_DISC || {};

  const [perfil, setPerfil] = React.useState('D');
  const [objecaoId, setObjecaoId] = React.useState('OBJ_01');
  const [quadrante, setQuadrante] = React.useState('alavancagem');

  if (!window.resolverNegociacao) {
    return <div className="card">Motor de negociação não carregado. Verifique se <code>src/motor-data.jsx</code> e <code>src/motor-engine.jsx</code> estão no HTML.</div>;
  }

  const r = window.resolverNegociacao({
    perfilDISC: perfil,
    objecaoId: objecaoId,
    quadranteKraljic: quadrante,
  });

  const grupos = ['Preço', 'Valor', 'Custos', 'Capacidade', 'Contrato e Governança'];
  const quads = ['alavancagem', 'estrategico', 'gargalo', 'nao_criticos'];
  const objSel = (window.MOTOR_OBJECOES_BY_ID || {})[objecaoId] || {};

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

  const op = r.objetivoPrimario;
  const os = r.objetivoSecundario;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div>
        <div className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Tratamento de Objeções</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
          Copiloto do Comprador
        </div>
      </div>

      {/* Controles — perfil + objeção + quadrante. O objetivo deixou de ser entrada. */}
      <div className="card">
        <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

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

          <div style={{ gridColumn: '1 / -1' }}>
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

        </div>
      </div>

      {/* Resultado */}
      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--ink-soft)' }}>
            “{objSel.texto}”
          </span>
        </div>

        {/* Objetivo DERIVADO (primário + secundário) — é a saída calculada, não a entrada. */}
        {op && (
          <div style={{ marginTop: 14, borderRadius: 12, background: 'var(--paper-warm)', border: '1px solid var(--line)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <Ic.Target s={16} />
              <span style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
                Objetivo da negociação
              </span>
              <span style={{
                fontSize: 10.5, letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 700,
                color: 'var(--brown-700)', background: 'var(--brown-50)', border: '1px solid var(--brown-200)',
                borderRadius: 999, padding: '2px 9px',
              }}>
                Derivado da matriz
              </span>
            </div>
            <div className="m-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderLeft: '3px solid var(--brown-400)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
                  Primário · {op.codigo}
                </div>
                <div className="serif" style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{op.nome}</div>
              </div>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
                  Secundário · {os.codigo}
                </div>
                <div className="serif" style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink-soft)', lineHeight: 1.3 }}>{os.nome}</div>
              </div>
            </div>
          </div>
        )}

        <Campo icon={<Ic.Eye s={16} />} label="Diagnóstico comportamental" texto={r.diagnostico} />
        <Campo icon={<Ic.Shield s={16} />} label="Risco para o comprador" texto={r.risco} />
        <Campo icon={<Ic.Plan s={16} />} label="Estratégia recomendada" texto={r.estrategia} />
        {op && <Campo icon={<Ic.Sparkle s={16} />} label="Alavanca principal" texto={r.alavanca} />}

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

        {/* Reforço — contribuição do objetivo secundário (complemento, não substituição) */}
        {r.reforco && r.reforco.nome && (
          <div style={{ marginTop: 16, borderRadius: 12, background: 'var(--paper)', border: '1px dashed var(--line)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Ic.Plus s={16} />
              <span style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
                Reforço · {r.reforco.nome}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)' }}>Estratégia complementar:</strong> {r.reforco.estrategia}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)' }}>Próxima ação complementar:</strong> {r.reforco.proximaAcao}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nota — como o objetivo é derivado (substitui a antiga legenda de origem). */}
      <div className="card" style={{ background: 'var(--ink)', color: 'var(--brown-50)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brown-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic.Bulb s={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 15, fontWeight: 600 }}>Como o objetivo é definido</div>
            <p style={{ fontSize: 12.5, color: 'var(--brown-200)', marginTop: 4, lineHeight: 1.7, marginBottom: 0 }}>
              Você não escolhe o objetivo — ele é <strong style={{ color: 'var(--brown-50)' }}>derivado automaticamente</strong> da combinação <strong style={{ color: 'var(--brown-50)' }}>objeção × quadrante Kraljic</strong> pela matriz de inferência da Vorätte, que retorna um objetivo primário e um secundário. O perfil DISC do vendedor adapta apenas a <strong style={{ color: 'var(--brown-50)' }}>frase sugerida</strong>. Toda a recomendação sai da base de conhecimento — nada é inventado por IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ObjecoesScreen = ObjecoesScreen;
