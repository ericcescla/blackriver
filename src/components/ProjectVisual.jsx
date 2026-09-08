import { useId } from 'react'
import './project-visuals.css'

const OrbitGraph = () => {
  const gradientId = useId()
  return (
  <svg className="pv-orbit-graph" viewBox="0 0 340 90" fill="none">
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#987cf4" stopOpacity=".23" />
        <stop offset="100%" stopColor="#987cf4" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 22H340M0 48H340M0 74H340" stroke="#efedf5" strokeWidth="1" />
    <path d="M0 77C19 80 22 59 42 62S68 81 83 56S107 64 124 41S145 56 166 30S190 47 210 24S228 40 249 19S272 36 288 14S311 29 340 5V90H0Z" fill={`url(#${gradientId})`} />
    <path d="M0 77C19 80 22 59 42 62S68 81 83 56S107 64 124 41S145 56 166 30S190 47 210 24S228 40 249 19S272 36 288 14S311 29 340 5" stroke="#8c6beb" strokeWidth="2.6" />
  </svg>
  )
}

function Orbit() {
  return (
    <>
      <div className="pv-orbit-orb pv-orbit-orb-one" />
      <div className="pv-orbit-orb pv-orbit-orb-two" />
      <div className="pv-window pv-orbit-window">
        <aside className="pv-orbit-sidebar">
          <span className="pv-product-logo"><i /> orbit<span>®</span></span>
          <span className="pv-side-label">WORKSPACE</span>
          <span className="pv-sidebar-item pv-sidebar-active"><i /> Resumen</span>
          <span className="pv-sidebar-item"><i /> Movimientos</span>
          <span className="pv-sidebar-item"><i /> Mis tarjetas</span>
          <span className="pv-sidebar-item"><i /> Estadísticas</span>
          <span className="pv-sidebar-bottom"><i className="pv-avatar">A</i> Alex Morgan</span>
        </aside>
        <div className="pv-orbit-main">
          <div className="pv-mini-top"><span>Tu dinero, en perspectiva.</span><span className="pv-notification" /></div>
          <div className="pv-dashboard-heading"><strong>Resumen general</strong><span>Este mes⌄</span></div>
          <div className="pv-balance-row">
            <div><span className="pv-muted">Balance total</span><strong>$24,680<span>.00</span></strong><small>↗ 12.8% <span>vs. mes anterior</span></small></div>
            <span className="pv-orbit-button">+ Añadir dinero</span>
          </div>
          <OrbitGraph />
          <div className="pv-graph-days"><span>01 Jun</span><span>07 Jun</span><span>14 Jun</span><span>21 Jun</span><span>30 Jun</span></div>
          <div className="pv-transactions-title"><strong>Últimos movimientos</strong><span>Ver todos ↗</span></div>
          <div className="pv-transaction"><i className="pv-transaction-icon pv-tx-green">↙</i><div><strong>Pago recibido</strong><span>Transferencia bancaria</span></div><b>+$2,450.00</b></div>
          <div className="pv-transaction"><i className="pv-transaction-icon">a</i><div><strong>Adobe Creative Cloud</strong><span>Suscripción mensual</span></div><b>−$54.99</b></div>
        </div>
      </div>
      <div className="pv-wallet"><span className="pv-wallet-top">orbit<span>•••</span></span><span className="pv-card-chip" /><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</strong><div className="pv-wallet-bottom"><span>ALEX MORGAN</span><i /><i /></div></div>
    </>
  )
}

function Nexo() {
  return (
    <>
      <span className="pv-nexo-circle" />
      <div className="pv-window pv-nexo-window">
        <div className="pv-shop-header"><strong>nexo<span>®</span></strong><nav><span>Productos</span><span>Nosotros</span><span>Journal</span></nav><span>Bolsa (0) ↗</span></div>
        <div className="pv-shop-breadcrumb">Colección / Audio / <strong>Forma One</strong></div>
        <div className="pv-shop-product">
          <div className="pv-speaker-scene"><span className="pv-shop-tag">DISEÑADO PARA TU ESPACIO</span><div className="pv-speaker"><i className="pv-speaker-controls">− &nbsp; · &nbsp; +</i><span>nexo</span></div><i className="pv-speaker-shadow" /></div>
          <div className="pv-shop-detail"><span className="pv-shop-eyebrow">AUDIO, EN SU ESENCIA</span><h3>Menos ruido.<br />Más música.</h3><p>Sonido que llena tu espacio.<br />Diseño que lo transforma.</p><div className="pv-shop-rating">★★★★★ <span>4.9 (128)</span></div><strong className="pv-shop-price">$189.00</strong><span className="pv-shop-color-label">Color — Graphite</span><div className="pv-product-colors"><i /><i /><i /></div><span className="pv-shop-buy">Añadir a la bolsa <b>↗</b></span><span className="pv-shop-shipping">Envíos gratis · 2 años de garantía</span></div>
        </div>
        <div className="pv-shop-bottom"><span>Objetos que se sienten bien.</span><span>DISEÑO CON INTENCIÓN ↗</span></div>
      </div>
      <div className="pv-nexo-note"><span className="pv-note-check">✓</span><div><strong>Buena elección.</strong><span>Tu pedido está en camino.</span></div></div>
    </>
  )
}

function Pulse() {
  return (
    <>
      <div className="pv-pulse-ring" />
      <div className="pv-window pv-pulse-window">
        <div className="pv-pulse-header"><strong><i /> pulse</strong><nav><span className="pv-pulse-nav-active">Mi agenda</span><span>Pacientes</span><span>Mensajes</span></nav><i className="pv-avatar pv-doctor">ML</i></div>
        <div className="pv-pulse-title"><div><span>MIÉRCOLES, 18 JUNIO</span><h3>Buen día, Martina <i>+</i></h3><p>Tu día, un poco más organizado.</p></div><span className="pv-pulse-add">+ Nueva consulta</span></div>
        <div className="pv-health-stats"><div><span>Consultas de hoy</span><strong>08<small>+2 esta semana</small></strong></div><div><span>Pacientes activos</span><strong>124<small>↗ 12%</small></strong></div><div><span>Siguiente consulta</span><strong>10:30<small>En 15 minutos</small></strong></div></div>
        <div className="pv-calendar-heading"><strong>Tu agenda</strong><span>‹ &nbsp; 16 – 20 de junio &nbsp; ›</span><span>Semana⌄</span></div>
        <div className="pv-calendar"><div className="pv-calendar-times"><span>09:00</span><span>10:00</span><span>11:00</span><span>12:00</span></div>{[
          { day: 'LUN', date: '16', color: 'mint', name: 'Ana García', time: '09:00 – 09:45', second: 'Lucas Ruiz' },
          { day: 'MAR', date: '17', color: 'peach', name: 'Pedro López', time: '09:30 – 10:15', second: 'Emma Torres' },
          { day: 'MIÉ', date: '18', color: 'purple', name: 'Sofía Martín', time: '10:30 – 11:15', second: 'Carlos Díaz' },
          { day: 'JUE', date: '19', color: 'mint', name: 'Diego Castro', time: '09:00 – 09:45', second: 'Laura Pérez' },
        ].map((day) => <div className={`pv-calendar-day pv-day-${day.color}`} key={day.day}><div className={`pv-day-heading ${day.day === 'MIÉ' ? 'pv-current-day' : ''}`}><span>{day.day}</span><b>{day.date}</b></div><div className="pv-appointment"><strong>{day.name}</strong><span>{day.time}</span><small>Consulta general</small></div><div className="pv-appointment pv-second-appointment"><strong>{day.second}</strong><span>11:00 – 11:45</span></div></div>)}</div>
      </div>
      <div className="pv-pulse-note"><span className="pv-note-check">✓</span><div><strong>Todo listo para tu consulta</strong><span>Recordatorio enviado a Sofía.</span></div><span className="pv-note-dot" /></div>
    </>
  )
}

export default function ProjectVisual({ type = 'orbit', compact = false }) {
  const visualType = ['orbit', 'nexo', 'pulse'].includes(type) ? type : 'orbit'
  return (
    <div className={`pv-art pv-art-${visualType}${compact ? ' pv-art-compact' : ''}`} aria-hidden="true">
      {visualType === 'orbit' ? <Orbit /> : visualType === 'nexo' ? <Nexo /> : <Pulse />}
    </div>
  )
}
