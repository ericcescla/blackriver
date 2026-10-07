import { Router } from 'express'
import { randomUUID } from 'node:crypto'

const states = ['Pendiente', 'En curso', 'Completado', 'Cancelado']
const string = (x, max, min = 0) => typeof x === 'string' && x.trim().length >= min && x.length <= max
const money = x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1_000_000_000
const quantity = x => Number.isInteger(x) && x >= 0 && x <= 100_000
function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error }
function date(value) {
  if (value === '') return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}
function allocated(orders, hardwareId, exceptId) {
  return orders.filter(x => x.id !== exceptId && x.status !== 'Cancelado').reduce((sum, order) => sum + order.hardwareItems.filter(x => x.hardwareId === hardwareId).reduce((total, x) => total + x.quantity, 0), 0)
}
function snapshot(data) {
  return { clients: data.clients, orders: data.orders, hardware: data.hardware.map(item => {
    const assigned = allocated(data.orders, item.id)
    return { ...item, assigned, available: item.stock - assigned }
  }) }
}
function validate(resource, input, data, id) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.')
  if (resource === 'clients') {
    const { name, email = '', phone = '', company = '', address = '', notes = '' } = input
    if (!string(name, 100, 1) || !string(email, 180) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || !string(phone, 50) || !string(company, 150) || !string(address, 250) || !string(notes, 3000)) fail('Revisá el nombre y los datos de contacto del cliente.')
    return { name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(), address: address.trim(), notes: notes.trim() }
  }
  if (resource === 'hardware') {
    const { name, category = 'Cámara IP', brand = '', model = '', serial = '', stock, cost = 0, notes = '' } = input
    if (!string(name, 100, 1) || !string(category, 80, 1) || !string(brand, 100) || !string(model, 100) || !string(serial, 100) || !quantity(stock) || !money(cost) || !string(notes, 3000)) fail('Revisá el hardware: las unidades deben ser enteras y el costo no puede ser negativo.')
    if (serial.trim() && data.hardware.some(x => x.id !== id && x.serial.toLowerCase() === serial.trim().toLowerCase())) fail('Ya existe un equipo con ese número de serie.', 409)
    if (stock < allocated(data.orders, id)) fail('Las unidades no pueden ser menores que las ya asignadas a encargos.', 409)
    return { name: name.trim(), category: category.trim(), brand: brand.trim(), model: model.trim(), serial: serial.trim(), stock, cost: Math.round(cost * 100) / 100, notes: notes.trim() }
  }
  const { title, clientId, description = '', status = 'Pendiente', dueDate = '', amount = 0, hardwareItems = [], notes = '' } = input
  if (!string(title, 150, 1) || !string(clientId, 100, 1) || !string(description, 3000) || !states.includes(status) || !string(dueDate, 10) || !date(dueDate) || !money(amount) || !string(notes, 3000) || !Array.isArray(hardwareItems) || hardwareItems.length > 20) fail('Revisá el título, cliente, estado, fecha e importe del encargo.')
  if (!data.clients.some(x => x.id === clientId)) fail('El cliente seleccionado ya no existe.', 409)
  const seen = new Set()
  const items = hardwareItems.map(item => {
    if (!item || !string(item.hardwareId, 100, 1) || !quantity(item.quantity) || item.quantity < 1 || seen.has(item.hardwareId)) fail('Seleccioná equipos diferentes con al menos una unidad cada uno.')
    seen.add(item.hardwareId)
    const hardware = data.hardware.find(x => x.id === item.hardwareId)
    if (!hardware) fail('Uno de los equipos seleccionados ya no existe.', 409)
    if (status !== 'Cancelado' && item.quantity > hardware.stock - allocated(data.orders, item.hardwareId, id)) fail(`No hay suficientes unidades disponibles de ${hardware.name}.`, 409)
    return { hardwareId: item.hardwareId, quantity: item.quantity }
  })
  return { title: title.trim(), clientId, description: description.trim(), status, dueDate, amount: Math.round(amount * 100) / 100, hardwareItems: items, notes: notes.trim() }
}

export default function managementRoutes(store) {
  const router = Router()
  router.get('/management', async (req, res) => res.json(snapshot(await store.read())))
  for (const resource of ['clients', 'orders', 'hardware']) {
    router.get(`/${resource}`, async (req, res) => res.json({ [resource]: snapshot(await store.read())[resource] }))
    router.post(`/${resource}`, async (req, res, next) => {
      try {
        const record = await store.update(data => {
          const record = { ...validate(resource, req.body, data), id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          data[resource].unshift(record)
          return record
        })
        res.status(201).json(record)
      } catch (e) { if (e.status) res.status(e.status).json({ error: e.message }); else next(e) }
    })
    router.put(`/${resource}/:id`, async (req, res, next) => {
      try {
        const record = await store.update(data => {
          const index = data[resource].findIndex(x => x.id === req.params.id)
          if (index === -1) fail('Registro no encontrado.', 404)
          const record = { ...data[resource][index], ...validate(resource, req.body, data, req.params.id), updatedAt: new Date().toISOString() }
          data[resource][index] = record
          return record
        })
        res.json(record)
      } catch (e) { if (e.status) res.status(e.status).json({ error: e.message }); else next(e) }
    })
    router.delete(`/${resource}/:id`, async (req, res, next) => {
      try {
        await store.update(data => {
          const index = data[resource].findIndex(x => x.id === req.params.id)
          if (index === -1) fail('Registro no encontrado.', 404)
          if (resource === 'clients' && data.orders.some(x => x.clientId === req.params.id)) fail('Este cliente tiene encargos asociados. Eliminá primero esos encargos.', 409)
          if (resource === 'hardware' && data.orders.some(x => x.hardwareItems.some(item => item.hardwareId === req.params.id))) fail('Este hardware está asociado a encargos. Quitalo de los encargos antes de eliminarlo.', 409)
          data[resource].splice(index, 1)
        })
        res.json({ ok: true })
      } catch (e) { if (e.status) res.status(e.status).json({ error: e.message }); else next(e) }
    })
  }
  return router
}
