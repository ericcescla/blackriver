import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, Menu, X, Check, Download, MoveUpRight } from 'lucide-react'
import FlowArtwork from './components/FlowArtwork.jsx'
import ProjectVisual from './components/ProjectVisual.jsx'
import { api } from './api.js'
import { defaultServices } from './services.js'


const projects = [
  { id: 'orbit', title: 'Monitoreo remoto', subtitle: 'Tus espacios, a la vista.', category: 'Videovigilancia', type: 'Seguridad / Supervisión remota', tags: ['Cámaras IP', 'Acceso remoto'], description: 'Ejemplo de una solución para consultar cámaras y revisar el estado de un sistema desde dispositivos autorizados.', challenge: 'Supervisar distintos espacios con acceso organizado y permisos definidos.', solution: 'Configuración de cámaras IP, perfiles de acceso y una vista centralizada de los equipos.', stack: ['Cámaras IP', 'Redes', 'Permisos'] },
  { id: 'nexo', title: 'Seguridad para comercios', subtitle: 'Cada acceso cuenta.', category: 'Videovigilancia', type: 'Comercios / Cámaras de seguridad', tags: ['CCTV', 'Grabación'], description: 'Ejemplo de una instalación orientada a entradas, zonas de atención y áreas de circulación de un comercio.', challenge: 'Definir la cobertura adecuada según la distribución y el uso del local.', solution: 'Planificación de puntos de cámara y configuración de grabación según las necesidades del espacio.', stack: ['CCTV', 'Cámaras IP', 'Grabadores'] },
  { id: 'pulse', title: 'Mantenimiento técnico', subtitle: 'Un sistema preparado.', category: 'Soporte técnico', type: 'Soporte / Revisión de equipos', tags: ['Diagnóstico', 'Mantenimiento'], description: 'Ejemplo de una revisión técnica para detectar problemas de conexión, imagen o grabación.', challenge: 'Identificar fallas y definir las tareas necesarias para recuperar el funcionamiento.', solution: 'Inspección de equipos, comprobación de conexiones y ajustes de configuración.', stack: ['Diagnóstico', 'Conectividad', 'Configuración'] },
]

function Brand({ footer = false }) {
  return <a className={`brand ${footer ? 'brand-footer' : ''}`} href="#inicio" aria-label="Rubén Rodríguez, ir al inicio"><svg viewBox="0 0 38 34" fill="none" aria-hidden="true"><path d="M3 7h11c10 0 5 20 19 20M3 17h8c10 0 6-10 15-10h7M3 27h8c10 0 6-10 15-10h7" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" /></svg><span>Rubén Rodríguez<span className="brand-period">.</span></span></a>
}

function Dialog({ open, onClose, titleId, children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = previousOverflow }
  }, [open])
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby={titleId} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose() } }}><button className="dialog-close icon-button" aria-label="Cerrar ventana" onClick={onClose}><X size={21} /></button>{children}</dialog>
}

function ContactDialog({ open, onClose, services }) {
  const [brief, setBrief] = useState(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const downloadRef = useRef(null)
  const toggleService = (service) => setSelectedServices((current) => current.includes(service) ? current.filter((item) => item !== service) : [...current, service])
  useEffect(() => { if (brief) downloadRef.current?.focus() }, [brief])
  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const message = form.elements.namedItem('message')
    if (values.message.trim().length < 15) { message.setCustomValidity('Contanos un poco más: escribí al menos 15 caracteres.'); message.reportValidity(); return }
    const inquiry = { ...values, services: selectedServices.length ? selectedServices.join(', ') : 'Por definir' }
    setSending(true); setSendError('')
    try { await api('/inquiries', { method: 'POST', body: JSON.stringify(inquiry) }); setBrief(inquiry) }
    catch (error) { setSendError(error.message) }
    finally { setSending(false) }
  }
  const downloadBrief = () => {
    const content = `RUBÉN RODRÍGUEZ — CONSULTA TÉCNICA\n\nNombre: ${brief.name}\nEmail: ${brief.email}\nEmpresa: ${brief.company || 'Sin especificar'}\nServicios: ${brief.services}\nPresupuesto: ${brief.budget}\n\nLa consulta\n${brief.message}\n\nDocumento preparado desde el sitio de Rubén Rodríguez. Consulta enviada desde el formulario. Copia para tus registros.`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'ruben-rodriguez-consulta.txt'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <Dialog open={open} onClose={onClose} titleId="contact-dialog-title" className="contact-dialog">
    {brief ? <div className="brief-success"><span className="success-icon"><Check size={30} /></span><p className="eyebrow">EL PRIMER PASO ESTÁ DADO</p><h2 id="contact-dialog-title">Tu consulta técnica<br />empieza acá<span className="orange">.</span></h2><p>Tu consulta está lista, {brief.name.split(' ')[0]}. Descargala para tener los detalles de tu instalación a mano.</p><div className="brief-summary"><span>Tu consulta</span><strong>{brief.services}</strong><p>{brief.message}</p></div><p className="form-note">Tu consulta fue enviada y guardada para su seguimiento. Podés descargar una copia.</p><button ref={downloadRef} className="button button-orange" onClick={downloadBrief}>Descargar mi consulta <Download size={17} /></button><button className="text-button" onClick={() => setBrief(null)}>Preparar otra consulta <ArrowRight size={15} /></button></div> : <>
      <p className="eyebrow"><span className="small-dot" /> HABLEMOS DE TU SEGURIDAD</p><h2 id="contact-dialog-title">Una solución para<br />tu seguridad<span className="orange">.</span></h2><p className="dialog-intro">Contame qué necesitás instalar, configurar o revisar.</p>
      <form onSubmit={handleSubmit} className="contact-form"><div className="form-row"><label>Tu nombre <span>*</span><input name="name" autoComplete="name" placeholder="¿Cómo te llamás?" required maxLength={100} pattern=".*\S.*" /></label><label>Tu email <span>*</span><input name="email" type="email" autoComplete="email" placeholder="nombre@empresa.com" required maxLength={180} /></label></div><label>Empresa <span className="optional">(opcional)</span><input name="company" autoComplete="organization" placeholder="El nombre de tu empresa" maxLength={150} /></label><fieldset><legend>¿En qué puedo ayudarte?</legend><div className="service-choices">{services.map(item => item.title).map((service) => <button key={service} type="button" className={selectedServices.includes(service) ? 'choice selected' : 'choice'} aria-pressed={selectedServices.includes(service)} onClick={() => toggleService(service)}>{service}{selectedServices.includes(service) && <Check size={13} />}</button>)}</div></fieldset><label>Describí tu necesidad <span>*</span><textarea name="message" placeholder="Necesito instalar cámaras en..." rows={3} required minLength={15} maxLength={3000} onInput={(event) => event.target.setCustomValidity('')} /></label><label>Presupuesto estimado<select name="budget" defaultValue="Por definir"><option>Por definir</option><option>Menos de USD 5.000</option><option>USD 5.000 – 15.000</option><option>USD 15.000 – 30.000</option><option>Más de USD 30.000</option></select></label><button className="button button-orange form-submit" type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar mi consulta'} <ArrowUpRight size={19} /></button>{sendError && <p role="alert" className="form-note">{sendError}</p>}<p className="form-note">Generá una consulta para recibir asesoramiento con los detalles de tu instalación. Los campos con * son obligatorios.</p></form>
    </>}
  </Dialog>
}

function App() {
  const [services, setServices] = useState(defaultServices)
  useEffect(() => { api('/services').then(data => { if (data.services) setServices(data.services.map((item, i) => ({ ...item, icon: defaultServices[i].icon }))) }).catch(() => {}) }, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeService, setActiveService] = useState(0)
  const [filter, setFilter] = useState('Todos')
  const [selectedProject, setSelectedProject] = useState(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const openContact = () => { setSelectedProject(null); setContactOpen(true); setMenuOpen(false) }

  useEffect(() => { const frame = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(frame) }, [])
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle')?.focus() } }
    const closeOnResize = () => { if (window.innerWidth > 800) setMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnResize)
    return () => { window.removeEventListener('keydown', closeOnEscape); window.removeEventListener('resize', closeOnResize) }
  }, [menuOpen])

  return <div className={`site ${visible ? 'is-visible' : ''}`}>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <header className="header"><div className="container nav-container"><Brand /><button className="menu-toggle icon-button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button><nav className={`navigation ${menuOpen ? 'is-open' : ''}`} id="main-navigation" aria-label="Navegación principal">{[['Servicios', '#servicios'], ['Proyectos', '#proyectos'], ['Sobre Rubén', '#nosotros']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<button className="button button-dark nav-cta" onClick={openContact}>Hablemos <ArrowUpRight size={17} /></button></nav></div></header>
    <main id="contenido">
      <section className="hero container" id="inicio"><div className="hero-copy"><div className="hero-eyebrow"><span className="status-dot" /> TÉCNICO INTERNACIONAL EN SEGURIDAD.</div><h1>Rubén <em>Rodríguez.</em><br />Seguridad en<br /><span className="transform-word">cámaras web<span className="orange">.</span></span></h1><p className="hero-description">Técnico internacional en seguridad y cámaras web.<br className="desktop-break" /> Instalación, configuración y soporte para cuidar<br className="desktop-break" /> tus espacios y conectar tus cámaras.</p><div className="hero-actions"><button className="button button-orange" onClick={openContact}>Consultá por tu sistema <ArrowUpRight size={19} /></button><a className="text-link" href="#proyectos">Explorá las soluciones <ArrowDown size={16} /></a></div><div className="hero-bottom-note"><span className="tiny-river">↳</span><span>Atención técnica para cada etapa de tu instalación.</span></div></div><FlowArtwork /><a className="hero-scroll" href="#servicios" aria-label="Descubrir los servicios"><ArrowDown size={16} /><span>SEGUÍ EXPLORANDO</span></a><div className="hero-index">CÁMARAS + REDES + SEGURIDAD <span>© 2026</span></div></section>
      <section className="stack-strip" aria-label="áreas de trabajo"><div className="container stack-inner"><p>Tu espacio.<br /><strong>Tu seguridad.</strong></p>{['Cámaras IP', 'CCTV', 'Redes', 'Acceso remoto', 'Soporte'].map((area) => <div className="tech-wordmark" key={area}>{area}</div>)}</div></section>
      <section className="services-section section-pad container" id="servicios"><div className="section-heading"><div><p className="eyebrow"><span className="small-dot" /> SERVICIOS TÉCNICOS</p><h2>Tu seguridad.<br />El punto de partida<span className="orange">.</span></h2></div><p className="section-description">Cada espacio tiene necesidades propias.<br />La configuración empieza por entender<br />qué querés proteger.</p></div><div className="services-layout"><div className="services-statement"><span className="statement-asterisk">✳</span><p>Analizo tu espacio.<br />Te ayudo a<br /><em>protegerlo.</em></p><a href="#contacto" className="text-link">Hablemos de tu instalación <ArrowUpRight size={17} /></a><div className="statement-footnote">ATENCIÓN PERSONAL.<br />CRITERIO TÉCNICO.</div></div><div className="service-list">{services.map((service, index) => { const Icon = service.icon; const expanded = activeService === index; return <article className={`service-item ${expanded ? 'expanded' : ''}`} key={service.number}><button className="service-toggle" onClick={() => setActiveService(expanded ? null : index)} aria-expanded={expanded} aria-controls={`service-panel-${index}`} id={`service-button-${index}`}><span className="service-number">{service.number}</span><Icon size={23} strokeWidth={1.5} /><span className="service-title">{service.title}</span><span className="service-expand">{expanded ? <Minus size={18} /> : <Plus size={18} />}</span></button><div id={`service-panel-${index}`} role="region" aria-labelledby={`service-button-${index}`} aria-hidden={!expanded} inert={!expanded} className={`service-panel ${expanded ? 'service-panel--expanded' : 'service-panel--collapsed'}`}><div className="service-panel-inner"><div className="service-panel-content"><p>{service.description}</p><div className="tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div></div></article> })}</div></div></section>
      <section className="projects-section section-pad" id="proyectos"><div className="container"><div className="section-heading"><div><p className="eyebrow"><span className="small-dot" /> SOLUCIONES DE SEGURIDAD</p><h2>Distintos espacios.<br />Soluciones a medida<span className="orange">.</span></h2></div><div className="project-heading-aside"><p className="section-description">Ejemplos de aplicación para tu sistema.<br />Explorá las soluciones técnicas.</p><div className="project-filters" aria-label="Filtrar proyectos">{['Todos', 'Videovigilancia', 'Soporte técnico'].map((category) => <button key={category} aria-pressed={filter === category} className={filter === category ? 'filter-button active' : 'filter-button'} onClick={() => setFilter(category)}>{category}</button>)}</div></div></div><div className="project-grid" aria-live="polite">{projects.filter((project) => filter === 'Todos' || project.category === filter).map((project) => <article key={project.id} className="project-card"><div className="project-art-wrap"><ProjectVisual type={project.id} /><span className="project-concept" id={`project-concept-${project.id}`}>EJEMPLO DE SOLUCIÓN</span><span className="project-open" aria-hidden="true"><ArrowUpRight size={24} /></span></div><div className="project-info"><div><span className="project-type" id={`project-type-${project.id}`}>{project.type}</span><h3>{project.title}<span> — {project.subtitle}</span></h3></div><ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" /></div><div className="tags project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button type="button" className="project-card-button" onClick={() => setSelectedProject(project)} aria-label={`Ver proyecto ${project.title}`} aria-describedby={`project-concept-${project.id} project-type-${project.id}`} aria-haspopup="dialog" /></article>)}</div><div className="projects-foot"><span>Cada instalación empieza con una consulta.</span><button className="text-link" onClick={openContact}>Hablemos de lo que necesitás <ArrowUpRight size={17} /></button></div></div></section>
      <section className="about-section section-pad container" id="nosotros"><div className="about-art" aria-hidden="true"><div className="about-art-label">RUBÉN RODRÍGUEZ<span>SEGURIDAD Y CÁMARAS WEB.</span></div><div className="river-lines">{Array.from({ length: 11 }, (_, i) => <div key={i} style={{ '--line': i }} />)}</div><div className="about-art-bottom"><span>ATENCIÓN CON<br />CRITERIO TÉCNICO.</span><ArrowUpRight size={48} strokeWidth={1} /></div></div><div className="about-copy"><p className="eyebrow"><span className="small-dot" /> CONOCÉ A RUBÉN</p><h2>Tu seguridad merece<br /><em>atención técnica.</em></h2><p>Soy Rubén Rodríguez, técnico internacional en seguridad y cámaras web. Mi trabajo se centra en la instalación, configuración y mantenimiento de sistemas de cámaras para hogares, comercios y empresas.</p><p>Te acompaño a elegir una solución acorde a tu espacio y a entender cómo usarla. Desde la revisión inicial hasta el soporte técnico, cada paso busca una instalación práctica y bien configurada.</p><div className="about-values"><div><span>01 /</span><strong>Personas primero</strong><p>Escuchar y entender qué necesitás proteger.</p></div><div><span>02 /</span><strong>Calidad en cada detalle</strong><p>De la conexión a la configuración final.</p></div><div><span>03 /</span><strong>Acompañamiento técnico</strong><p>Orientación para usar y mantener tu sistema.</p></div></div></div></section>
      <section className="process-section container"><div className="process-header"><p className="eyebrow">UN CAMINO CLARO, DE PRINCIPIO A FIN</p><h2>Así preparo tu solución de seguridad.</h2></div><div className="process-grid">{[['01', 'Evaluación', 'Reviso tus necesidades, el espacio y los equipos disponibles.'], ['02', 'Planificación', 'Defino la ubicación de cámaras, conexiones y configuración del sistema.'], ['03', 'Instalación', 'Instalo y configuro los equipos, y compruebo imagen, conexión y grabación.'], ['04', 'Soporte', 'Te explico el uso del sistema y las tareas de mantenimiento recomendadas.']].map(([number, title, text]) => <div className="process-step" key={number}><div className="process-step-top"><span>{number}</span><ArrowRight size={19} /></div><h3>{title}</h3><p>{text}</p></div>)}</div></section>
      <section className="contact-section" id="contacto"><div className="container contact-inner"><div><p className="eyebrow"><span className="small-dot" /> EL PRIMER PASO PARA CUIDAR TU ESPACIO</p><h2>¿Revisamos<br />tu <em>seguridad?</em></h2><p>Contame qué necesitás. Encontremos una solución para tus cámaras.</p></div><button className="contact-circle" onClick={openContact}><ArrowUpRight size={48} strokeWidth={1.4} /><span>Consultá por<br />tus cámaras</span></button></div><div className="container contact-bottom"><span><span className="status-dot" /> CONSULTAS TÉCNICAS</span><span>SEGURIDAD Y CÁMARAS WEB.</span></div></section>
    </main>
    <footer className="footer container"><div className="footer-top"><div><Brand footer /><p>Técnico internacional en seguridad y cámaras web.</p></div><div className="footer-links"><a href="#servicios">Servicios</a><a href="#proyectos">Proyectos</a><a href="#nosotros">Sobre Rubén</a><a href="/admin">Administración</a><button onClick={openContact}>Contacto <ArrowUpRight size={14} /></button></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Rubén Rodríguez. Todos los derechos reservados.</span><span>Instalación, configuración y soporte técnico.</span><a href="#inicio">Volver arriba <MoveUpRight size={14} /></a></div></footer>
    <Dialog open={!!selectedProject} onClose={() => setSelectedProject(null)} titleId="project-dialog-title" className="project-dialog">{selectedProject && <><div className="project-dialog-art"><ProjectVisual type={selectedProject.id} compact /></div><div className="project-dialog-content"><p className="eyebrow">EJEMPLO DE SOLUCIÓN / {selectedProject.type}</p><h2 id="project-dialog-title">{selectedProject.title}<span className="orange">.</span></h2><p className="project-dialog-subtitle">{selectedProject.description}</p><div className="project-detail-grid"><div><h3>El desafío</h3><p>{selectedProject.challenge}</p></div><div><h3>La propuesta</h3><p>{selectedProject.solution}</p></div></div><div className="tags">{selectedProject.stack.map((tag) => <span key={tag}>{tag}</span>)}</div><p className="form-note">Ejemplo ilustrativo de una solución técnica. No representa un cliente ni una instalación realizada.</p><button className="button button-dark" onClick={openContact}>Consultar por esta solución <ArrowUpRight size={18} /></button></div></>}</Dialog>
    <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} services={services} />
  </div>
}

export default App
