const TAU = Math.PI * 2

function surface(u, v) {
  const radius = 124 + 15 * Math.sin(u * 3)
  const tube = 51 + 9 * Math.cos(u * 2)
  const x = (radius + tube * Math.cos(v)) * Math.cos(u)
  const y = (radius + tube * Math.cos(v)) * Math.sin(u)
  const z = tube * Math.sin(v) + 29 * Math.sin(u * 2)
  const tilt = 0.91
  const turn = -0.47
  const yy = y * Math.cos(tilt) - z * Math.sin(tilt)
  const zz = y * Math.sin(tilt) + z * Math.cos(tilt)
  return { x: x * Math.cos(turn) - yy * Math.sin(turn), y: x * Math.sin(turn) + yy * Math.cos(turn), z: zz }
}

const strips = Array.from({ length: 120 }, (_, i) => {
  const u = (i / 120) * TAU
  const points = Array.from({ length: 49 }, (_, j) => surface(u, (j / 48) * TAU))
  const depth = points.reduce((sum, point) => sum + point.z, 0) / points.length
  return { depth, path: `${points.map((p, j) => `${j ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}Z` }
}).sort((a, b) => a.depth - b.depth)

export default function FlowArtwork() {
  return (
    <div className="flow-art" aria-hidden="true">
      <div className="art-grid" />
      <div className="art-coordinates"><span>BR® — DIGITAL STUDIO</span><span>EST. PARA LO QUE VIENE</span></div>
      <svg className="flow-sculpture" viewBox="-220 -205 440 410" fill="none">
        <defs>
          <linearGradient id="flow-fill" x1="-140" y1="-140" x2="150" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff9b65" /><stop offset=".4" stopColor="#ff6236" /><stop offset="1" stopColor="#ef391a" />
          </linearGradient>
          <filter id="flow-shadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="2" dy="23" stdDeviation="16" floodColor="#c44c2c" floodOpacity=".13" /></filter>
        </defs>
        <g filter="url(#flow-shadow)">
          {strips.map((strip, i) => <path key={i} d={strip.path} fill="url(#flow-fill)" stroke={strip.depth > 0 ? '#94300e' : '#bf3c19'} strokeOpacity=".63" strokeWidth=".72" />)}
        </g>
      </svg>
      <div className="floating-note note-code"><span className="note-symbol">&lt;/&gt;</span><div>Built with purpose.<small>Diseñado para avanzar.</small></div><span className="note-dot" /></div>
      <div className="art-caption"><span className="crosshair">+</span><span>LA EVOLUCIÓN ES CONSTANTE.<br />NOSOTROS TAMBIÉN.</span><span className="art-caption-line" /></div>
    </div>
  )
}
