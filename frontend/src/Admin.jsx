import { useEffect, useState } from 'react'
import { api } from './api.js'
import { defaultServices } from './services.js'
import './admin.css'
import Management from './Management.jsx'

const statuses = ['Nueva', 'En seguimiento', 'Resuelta']

function InquiryEditor({ inquiry, onSave, onExpired }) {
  const [status, setStatus] = useState(inquiry.status)
  const [notes, setNotes] = useState(inquiry.notes)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  async function save(event) {
    event.preventDefault(); setBusy(true); setFeedback('')
    try {
      const item = await api(`/admin/inquiries/${inquiry.id}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) })
      onSave(item); setFeedback('Cambios guardados.')
    } catch (error) { if (error.status === 401) onExpired(); setFeedback(error.message) }
    finally { setBusy(false) }
  }
  return <article className="admin-card inquiry-card">
    <div className="inquiry-heading"><div><h3>{inquiry.name}</h3><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div><span className="admin-badge">{inquiry.status}</span></div>
    <p className="admin-muted">{new Date(inquiry.createdAt).toLocaleString('es-AR')} {inquiry.company && `· ${inquiry.company}`}</p>
    <p><strong>Servicios:</strong> {inquiry.services}</p><p><strong>Presupuesto:</strong> {inquiry.budget}</p>
    <p className="inquiry-message">{inquiry.message}</p>
    <form onSubmit={save}><label>Estado<select value={status} onChange={e => setStatus(e.target.value)}>{statuses.map(x => <option key={x}>{x}</option>)}</select></label>
      <label>Notas internas<textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={3000} rows={3} placeholder="Próximos pasos, seguimiento o detalles de la visita" /></label>
      <button className="button button-dark" disabled={busy}>{busy ? 'Guardando…' : 'Guardar seguimiento'}</button><p role="status">{feedback}</p>
    </form>
  </article>
}

export default function Admin() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('consultas')
  const [inquiries, setInquiries] = useState([])
  const [services, setServices] = useState(defaultServices)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [loaded, setLoaded] = useState(false)
  const expire = () => { setUser(null); setLoaded(false); setError('Tu sesión terminó. Volvé a ingresar.') }
  useEffect(() => {
    api('/auth/me').then(setUser).catch(e => { if (e.status !== 401) setError('No se pudo conectar con el backend. Comprobá que esté iniciado.') }).finally(() => setChecking(false))
  }, [])
  async function load() {
    setError(''); setLoaded(false)
    try {
      const [data, content] = await Promise.all([api('/admin/inquiries'), api('/services')])
      setInquiries(data.inquiries); setServices(content.services || defaultServices); setLoaded(true)
    } catch (e) { if (e.status === 401) expire(); else setError(e.message) }
  }
  useEffect(() => { if (user) load() }, [user])
  async function login(event) {
    event.preventDefault(); setBusy(true); setError('')
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try { setUser(await api('/auth/login', { method: 'POST', body: JSON.stringify(values) })) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true); setError('')
    try { await api('/auth/logout', { method: 'POST', body: '{}' }); setUser(null); setInquiries([]); setLoaded(false) }
    catch (e) { if (e.status === 401) expire(); else setError(e.message) } finally { setBusy(false) }
  }
  async function saveServices(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      const clean = services.map(({ title, description, tags }) => ({ title, description, tags }))
      const result = await api('/admin/services', { method: 'PUT', body: JSON.stringify({ services: clean }) })
      setServices(result.services); setNotice('Servicios publicados. Ya se muestran en el sitio.')
    } catch (e) { if (e.status === 401) expire(); else setError(e.message) } finally { setBusy(false) }
  }
  function changeService(index, field, value) {
    setNotice(''); setServices(items => items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }
  if (checking) return <main className="admin-shell"><p role="status">Comprobando sesión…</p></main>
  if (!user) return <main className="admin-shell admin-login"><a href="/" className="admin-back">← Volver al sitio</a><section className="admin-card"><p className="eyebrow">RUBÉN RODRÍGUEZ</p><h1>Administración</h1><p className="admin-muted">Ingresá para gestionar consultas y servicios.</p>
    <form onSubmit={login}><label>Usuario<input name="username" autoComplete="username" defaultValue="admin" required maxLength={100} /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" maxLength={256} /></label><button className="button button-orange" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button></form>{error && <p className="admin-error" role="alert">{error}</p>}
  </section></main>
  const filtered = inquiries.filter(item => (filter === 'Todas' || item.status === filter) && `${item.name} ${item.email} ${item.company} ${item.message}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="admin-shell"><header className="admin-header"><div><p className="eyebrow">RUBÉN RODRÍGUEZ</p><h1>Administración</h1><p className="admin-muted">Sesión de {user.username}</p></div><div className="admin-actions"><a className="button button-dark" href="/">Ver sitio</a><button className="button" onClick={logout} disabled={busy}>Cerrar sesión</button></div></header>
    <nav className="admin-tabs" aria-label="Secciones de administración">{[['consultas', 'Consultas'], ['clientes', 'Clientes'], ['encargos', 'Encargos'], ['hardware', 'Hardware'], ['servicios', 'Servicios']].map(([key, label]) => <button key={key} aria-pressed={tab === key} onClick={() => { setTab(key); setNotice('') }}>{label}</button>)}</nav>
    {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}
    {!loaded ? <section className="admin-card"><p>{error ? 'No se pudieron cargar los datos.' : 'Cargando datos…'}</p>{error && <button className="button button-dark" onClick={load}>Reintentar</button>}</section> : <main>
      {['clientes', 'encargos', 'hardware'].includes(tab) ? <Management section={tab} onExpired={expire} /> : tab === 'consultas' ? <><div className="admin-stats">{statuses.map(status => <div className="admin-card" key={status}><span>{status}</span><strong>{inquiries.filter(x => x.status === status).length}</strong></div>)}</div>
        <div className="admin-toolbar"><label>Buscar consulta<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre, email o mensaje" /></label><label>Filtrar por estado<select value={filter} onChange={e => setFilter(e.target.value)}>{['Todas', ...statuses].map(x => <option key={x}>{x}</option>)}</select></label><button className="button button-dark" onClick={load}>Actualizar</button></div>
        <p className="admin-muted">{filtered.length} consulta(s)</p><div className="admin-inquiries">{filtered.map(item => <InquiryEditor key={item.id} inquiry={item} onExpired={expire} onSave={updated => setInquiries(items => items.map(x => x.id === updated.id ? updated : x))} />)}</div>{!filtered.length && <div className="admin-card"><h2>{inquiries.length ? 'Sin coincidencias' : 'Todavía no hay consultas'}</h2><p>Las consultas enviadas desde el formulario del sitio aparecen acá.</p></div>}
      </> : <form onSubmit={saveServices}><div className="admin-section-heading"><h2>Servicios del sitio</h2><p>Editá los títulos, descripciones y etiquetas que ven tus visitantes.</p></div><div className="admin-inquiries">{services.map((item, index) => <section className="admin-card" key={index}><h3>Servicio {index + 1}</h3><label>Título<input value={item.title} onChange={e => changeService(index, 'title', e.target.value)} required maxLength={80} /></label><label>Descripción<textarea value={item.description} onChange={e => changeService(index, 'description', e.target.value)} required minLength={15} maxLength={1500} rows={5} /></label><label>Etiquetas (separadas por comas)<input value={item.tags.join(',')} onChange={e => changeService(index, 'tags', e.target.value.split(','))} /></label></section>)}</div><button className="button button-orange" disabled={busy}>{busy ? 'Publicando…' : 'Guardar y publicar servicios'}</button></form>}
    </main>}
  </div>
}
