// SVG donut chart used across screens
function Donut({ size = 220, stroke = 28, data, center }) {
  // data: [{key, value, color}]
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((a, b) => a + b.value, 0);
  let offset = 0;
  // start at top (-90deg)
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const len = frac * C;
    const seg = {
      ...d,
      dasharray: `${len} ${C - len}`,
      dashoffset: -offset,
    };
    offset += len;
    return seg;
  });
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3ecdf" strokeWidth={stroke} />
        {segments.map((s, i) => (
          <circle
            key={s.key}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {center && <div className="donut-center">{center}</div>}
    </div>
  );
}

window.Donut = Donut;
