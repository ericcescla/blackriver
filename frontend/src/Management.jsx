import { useEffect, useState } from 'react'
import { api } from './api.js'

const states = ['Pendiente', 'En curso', 'Completado', 'Cancelado']
const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
const sections = {
  clientes: { resource: 'clients', title: 'Clientes', singular: 'cliente', initial: { name: '', email: '', phone: '', company: '', address: '', notes: '' }, fields: [
    ['name', 'Nombre', 'text', 100, true], ['email', 'Email', 'email', 180], ['phone', 'Teléfono', 'tel', 50], ['company', 'Empresa', 'text', 150], ['address', 'Dirección', 'text', 250], ['notes', 'Notas del cliente', 'textarea', 3000],
  ] },
  encargos: { resource: 'orders', title: 'Encargos', singular: 'encargo', initial: { title: '', clientId: '', description: '', status: 'Pendiente', dueDate: '', amount: 0, hardwareItems: [], notes: '' }, fields: [
    ['title', 'Título del encargo', 'text', 150, true], ['dueDate', 'Fecha prevista', 'date'], ['amount', 'Importe (ARS)', 'number'], ['description', 'Descripción del trabajo', 'textarea', 3000], ['notes', 'Notas del encargo', 'textarea', 3000],
  ] },
  hardware: { resource: 'hardware', title: 'Hardware', singular: 'equipo', initial: { name: '', category: 'Cámara IP', brand: '', model: '', serial: '', stock: 0, cost: 0, notes: '' }, fields: [
    ['name', 'Nombre del equipo', 'text', 100, true], ['category', 'Categoría', 'text', 80, true], ['brand', 'Marca', 'text', 100], ['model', 'Modelo', 'text', 100], ['serial', 'Número de serie (opcional)', 'text', 100], ['stock', 'Unidades registradas', 'integer', null, true], ['cost', 'Costo unitario (ARS)', 'number'], ['notes', 'Notas del equipo', 'textarea', 3000],
  ] },
}

export default function Management({ section, onExpired }) {
  const config = sections[section]
  const [data, setData] = useState({ clients: [], orders: [], hardware: [] })
  const [loaded, setLoaded] = useState(false)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const handleError = e => { if (e.status === 401) onExpired(); else setError(e.message) }
  async function load() {
    setError('')
    try { setData(await api('/admin/management')); setLoaded(true) }
    catch (e) { handleError(e) }
  }
  useEffect(() => { load() }, [])
  useEffect(() => { setDraft(null); setSearch(''); setFilter('Todos'); setNotice(''); setError('') }, [section])
  const change = (field, value) => setDraft(current => ({ ...current, [field]: value }))
  const clientName = id => data.clients.find(x => x.id === id)?.name || 'Cliente no disponible'
  const hardwareName = id => data.hardware.find(x => x.id === id)?.name || 'Equipo no disponible'
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      const body = { ...draft }
      for (const field of config.fields) if (['number', 'integer'].includes(field[2])) body[field[0]] = Number(body[field[0]])
      if (section === 'encargos') body.hardwareItems = body.hardwareItems.map(x => ({ ...x, quantity: Number(x.quantity) }))
      await api(`/admin/${config.resource}${draft.id ? `/${draft.id}` : ''}`, { method: draft.id ? 'PUT' : 'POST', body: JSON.stringify(body) })
      setDraft(null); await load(); setNotice('Registro guardado.')
    } catch (e) { handleError(e) } finally { setBusy(false) }
  }
  async function remove(item) {
    if (!window.confirm(`¿Eliminar ${item.name || item.title}? Esta acción elimina el registro.`)) return
    setBusy(true); setError(''); setNotice('')
    try { await api(`/admin/${config.resource}/${item.id}`, { method: 'DELETE', body: '{}' }); if (draft?.id === item.id) setDraft(null); await load(); setNotice('Registro eliminado.') }
    catch (e) { handleError(e) } finally { setBusy(false) }
  }
  function edit(item) { setDraft({ ...item, hardwareItems: item.hardwareItems?.map(x => ({ ...x })) }); setError(''); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function changeEquipment(index, field, value) { change('hardwareItems', draft.hardwareItems.map((item, i) => i === index ? { ...item, [field]: value } : item)) }
  const records = data[config.resource].filter(item => {
    const searchable = [item.name, item.title, item.email, item.phone, item.company, item.brand, item.model, item.serial, item.description, item.notes, item.clientId && clientName(item.clientId)].filter(Boolean).join(' ').toLowerCase()
    return searchable.includes(search.toLowerCase()) && (section !== 'encargos' || filter === 'Todos' || item.status === filter)
  })
  return <section aria-label={config.title}>
    <div className="admin-header admin-section-heading"><div><h2>{config.title}</h2><p>{section === 'clientes' ? 'Datos de contacto y clientes asociados a tus trabajos.' : section === 'encargos' ? 'Trabajos por cliente, fechas, importes y equipos asignados.' : 'Inventario de cámaras, grabadores y otros equipos.'}</p></div><button className="button button-orange" disabled={!loaded || busy || (section === 'encargos' && !data.clients.length)} onClick={() => { setDraft({ ...config.initial, hardwareItems: [] }); setNotice(''); setError('') }}>Nuevo {config.singular}</button></div>
    {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}
    {!loaded ? <div className="admin-card"><p>{error ? 'No se pudieron cargar los registros.' : 'Cargando registros…'}</p>{error && <button className="button button-dark" onClick={load}>Reintentar</button>}</div> : <>
      {section === 'encargos' && !data.clients.length && <p className="admin-notice">Creá primero un cliente desde la sección Clientes para registrar un encargo.</p>}
      {section === 'hardware' && <p className="admin-muted">Disponibles = unidades registradas menos unidades asignadas a encargos. Los encargos completados conservan sus equipos asignados; cancelarlos o eliminarlos libera esas unidades.</p>}
      <div className="admin-stats"><div className="admin-card"><span>Total de {config.title.toLowerCase()}</span><strong>{data[config.resource].length}</strong></div>{section === 'encargos' && <><div className="admin-card"><span>Trabajos en curso</span><strong>{data.orders.filter(x => x.status === 'En curso').length}</strong></div><div className="admin-card"><span>Pendientes</span><strong>{data.orders.filter(x => x.status === 'Pendiente').length}</strong></div></>}{section === 'hardware' && <><div className="admin-card"><span>Unidades disponibles</span><strong>{data.hardware.reduce((sum, x) => sum + x.available, 0)}</strong></div><div className="admin-card"><span>Unidades asignadas</span><strong>{data.hardware.reduce((sum, x) => sum + x.assigned, 0)}</strong></div></>}</div>
      {draft && <form className="admin-card management-form" onSubmit={save}><h3>{draft.id ? 'Editar' : 'Nuevo'} {config.singular}</h3><fieldset disabled={busy}><div className="management-fields">
        {section === 'encargos' && <><label>Cliente<select value={draft.clientId} onChange={e => change('clientId', e.target.value)} required><option value="">Seleccionar cliente</option>{data.clients.map(x => <option key={x.id} value={x.id}>{x.name}{x.company ? ` · ${x.company}` : ''}</option>)}</select></label><label>Estado del encargo<select value={draft.status} onChange={e => change('status', e.target.value)}>{states.map(x => <option key={x}>{x}</option>)}</select></label></>}
        {config.fields.map(([field, label, type, max, required]) => <label key={field}>{label}{type === 'textarea' ? <textarea value={draft[field]} onChange={e => change(field, e.target.value)} rows={3} maxLength={max} required={required} /> : <input type={type === 'integer' ? 'number' : type} value={draft[field]} onChange={e => change(field, e.target.value)} maxLength={max || undefined} required={required} {...(['number', 'integer'].includes(type) ? { min: 0, max: type === 'integer' ? 100000 : 1000000000, step: type === 'integer' ? 1 : '0.01' } : {})} />}</label>)}
      </div>
      {section === 'encargos' && <div className="equipment-editor"><h4>Hardware del encargo</h4><p className="admin-muted">Podés asignar hasta 20 equipos diferentes.</p>{draft.hardwareItems.map((item, index) => <div className="equipment-row" key={index}><label>Equipo {index + 1}<select required value={item.hardwareId} onChange={e => changeEquipment(index, 'hardwareId', e.target.value)}><option value="">Seleccionar equipo</option>{data.hardware.map(x => <option key={x.id} value={x.id}>{x.name} · {x.available} disponibles</option>)}</select></label><label>Cantidad {index + 1}<input type="number" min={1} max={100000} step={1} required value={item.quantity} onChange={e => changeEquipment(index, 'quantity', e.target.value)} /></label><button type="button" className="button" onClick={() => change('hardwareItems', draft.hardwareItems.filter((_, i) => i !== index))}>Quitar equipo {index + 1}</button></div>)}<button type="button" className="button button-dark" disabled={!data.hardware.length || draft.hardwareItems.length >= 20} onClick={() => change('hardwareItems', [...draft.hardwareItems, { hardwareId: '', quantity: 1 }])}>Agregar hardware</button></div>}
      <div className="admin-actions management-form-actions"><button className="button button-orange">{busy ? 'Guardando…' : `Guardar ${config.singular}`}</button><button type="button" className="button" onClick={() => setDraft(null)}>Cancelar edición</button></div></fieldset></form>}
      <div className="admin-toolbar"><label>Buscar {config.title.toLowerCase()}<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o detalles" /></label>{section === 'encargos' && <label>Filtrar encargos<select value={filter} onChange={e => setFilter(e.target.value)}>{['Todos', ...states].map(x => <option key={x}>{x}</option>)}</select></label>}<button className="button button-dark" disabled={busy} onClick={load}>Actualizar registros</button></div>
      <div className="admin-inquiries management-records">{records.map(item => <article className="admin-card management-record" key={item.id}><div className="inquiry-heading"><h3>{item.name || item.title}</h3>{item.status && <span className="admin-badge">{item.status}</span>}</div>
        {section === 'clientes' && <><p>{item.company || 'Cliente particular'}</p>{item.email && <p><a href={`mailto:${item.email}`}>{item.email}</a></p>}{item.phone && <p>Teléfono: {item.phone}</p>}{item.address && <p>Dirección: {item.address}</p>}<p className="admin-muted">{data.orders.filter(x => x.clientId === item.id).length} encargo(s)</p></>}
        {section === 'encargos' && <><p><strong>Cliente:</strong> {clientName(item.clientId)}</p><p><strong>Fecha prevista:</strong> {item.dueDate ? item.dueDate.split('-').reverse().join('/') : 'Sin definir'}</p><p><strong>Importe:</strong> {money(item.amount)}</p>{item.description && <p className="management-text">{item.description}</p>}{item.hardwareItems.length > 0 && <ul>{item.hardwareItems.map(x => <li key={x.hardwareId}>{hardwareName(x.hardwareId)} · {x.quantity} unidad(es)</li>)}</ul>}</>}
        {section === 'hardware' && <><p>{item.category} · {[item.brand, item.model].filter(Boolean).join(' ') || 'Sin marca o modelo'}</p>{item.serial && <p>Serie: {item.serial}</p>}<div className="hardware-counts"><span>Registradas <strong>{item.stock}</strong></span><span>Asignadas <strong>{item.assigned}</strong></span><span>Disponibles <strong>{item.available}</strong></span></div><p>Costo unitario: {money(item.cost)}</p></>}
        {item.notes && <p className="management-text admin-muted">{item.notes}</p>}<div className="admin-actions record-actions"><button className="button button-dark" disabled={busy} onClick={() => edit(item)}>Editar {config.singular}</button><button className="button delete-button" disabled={busy} onClick={() => remove(item)}>Eliminar {config.singular}</button></div>
      </article>)}</div>{!records.length && <div className="admin-card"><p>{data[config.resource].length ? 'No hay registros que coincidan con la búsqueda.' : `Todavía no hay ${config.title.toLowerCase()}.`}</p></div>}
    </>}
  </section>
}
