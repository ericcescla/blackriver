import './project-visuals.css'

export default function ProjectVisual({ type = 'orbit', compact = false }) {
  const labels = { orbit: 'MONITOREO REMOTO', nexo: 'SEGURIDAD PARA COMERCIOS', pulse: 'MANTENIMIENTO TÉCNICO' }
  return <div className={`pv-art pv-art-${type}${compact ? ' pv-art-compact' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 600 400" width="100%" height="100%" fill="none">
      <rect x="70" y="65" width="460" height="270" rx="20" fill="#f6f5f1" stroke="#d6d2cb" />
      <text x="98" y="102" fontSize="14" fontFamily="sans-serif" fill="#333">{labels[type]}</text>
      <rect x="98" y="124" width="404" height="180" rx="12" fill="#252d32" />
      <path d="M118 147h24m-24 0v24m364-24h-24m24 0v24M118 280h24m-24 0v-24m364 24h-24m24 0v-24" stroke="#f58245" strokeWidth="3" />
      <rect x="206" y="176" width="148" height="72" rx="18" fill="#e9e5de" />
      <circle cx="280" cy="212" r="25" fill="#3e4c56" />
      <circle cx="280" cy="212" r="13" fill="#849da7" />
      <path d="m354 192 39-17v73l-39-17M265 248v23h-38m38 0h44" stroke="#e9e5de" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="466" cy="146" r="5" fill="#f58245" />
    </svg>
  </div>
}
