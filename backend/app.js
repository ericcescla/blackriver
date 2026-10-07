import express from 'express'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createStore } from './store.js'
import { createSecurity } from './security.js'
import authRoutes from './routes/auth.routes.js'
import managementRoutes from './routes/management.routes.js'

const statuses = ['Nueva', 'En seguimiento', 'Resuelta']
const text = (value, max, min = 0) => typeof value === 'string' && value.trim().length >= min && value.length <= max

export function createApp(options = {}) {
  const app = express()
  const store = createStore(options.dataDir || process.env.DATA_DIR || fileURLToPath(new URL('./data/', import.meta.url)))
  const security = createSecurity({ username: options.username || process.env.ADMIN_USERNAME, password: options.password || process.env.ADMIN_PASSWORD, secure: options.secure ?? process.env.COOKIE_SECURE === 'true', demo: options.demo ?? process.env.DEMO_MODE === 'true' })
  const submissions = new Map()
  const publicOrigin = options.publicOrigin || process.env.PUBLIC_ORIGIN || 'http://localhost:5173'
  app.disable('x-powered-by')
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store')
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (!req.is('application/json')) return res.status(415).json({ error: 'Se requiere JSON.' })
      if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ error: 'Origen no permitido.' })
      if (req.get('origin')) {
        try { if (new URL(req.get('origin')).host !== req.get('host') && req.get('origin') !== publicOrigin) return res.status(403).json({ error: 'Origen no permitido.' }) }
        catch { return res.status(403).json({ error: 'Origen no permitido.' }) }
      }
    }
    next()
  })
  app.use(express.json({ limit: '16kb' }))
  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRoutes(security))
  app.get('/api/services', async (req, res) => res.json({ services: (await store.read()).services }))
  app.post('/api/inquiries', async (req, res) => {
    const now = Date.now()
    for (const [key, entry] of submissions) if (entry.until <= now) submissions.delete(key)
    const limit = submissions.get(req.ip) || { count: 0, until: now + 3600_000 }
    if (limit.count >= 10) return res.status(429).json({ error: 'Límite de consultas alcanzado. Intentá más tarde.' })
    const body = req.body || {}
    if (!text(body.name, 100, 1) || !text(body.email, 180, 3) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || !text(body.message, 3000, 15) || !text(body.company ?? '', 150) || !text(body.services ?? '', 300) || !text(body.budget ?? '', 100)) return res.status(400).json({ error: 'Revisá los datos: nombre, email y descripción (mínimo 15 caracteres) son obligatorios.' })
    limit.count++; submissions.set(req.ip, limit)
    const inquiry = { id: randomUUID(), name: body.name.trim(), email: body.email.trim(), company: (body.company || '').trim(), message: body.message.trim(), services: body.services || 'Por definir', budget: body.budget || 'Por definir', status: 'Nueva', notes: '', createdAt: new Date().toISOString() }
    await store.update(data => data.inquiries.unshift(inquiry))
    res.status(201).json({ id: inquiry.id })
  })
  app.use('/api/admin', security.require)
  app.use('/api/admin', managementRoutes(store))
  app.get('/api/admin/inquiries', async (req, res) => res.json({ inquiries: (await store.read()).inquiries }))
  app.patch('/api/admin/inquiries/:id', async (req, res) => {
    if (!statuses.includes(req.body?.status) || !text(req.body?.notes, 3000)) return res.status(400).json({ error: 'Estado o notas inválidos.' })
    const result = await store.update(data => {
      const item = data.inquiries.find(x => x.id === req.params.id)
      if (!item) return null
      item.status = req.body.status; item.notes = req.body.notes; return item
    })
    if (!result) return res.status(404).json({ error: 'Consulta no encontrada.' })
    res.json(result)
  })
  app.put('/api/admin/services', async (req, res) => {
    const services = req.body?.services
    if (!Array.isArray(services) || services.length !== 4 || services.some(x => !x || !text(x.title, 80, 1) || !text(x.description, 1500, 15) || !Array.isArray(x.tags) || x.tags.length > 5 || x.tags.some(t => !text(t, 50, 1)))) return res.status(400).json({ error: 'Completá los cuatro servicios con título, descripción y hasta cinco etiquetas.' })
    const clean = services.map((x, i) => ({ number: String(i + 1).padStart(2, '0'), title: x.title.trim(), description: x.description.trim(), tags: x.tags.map(t => t.trim()) }))
    await store.update(data => { data.services = clean })
    res.json({ services: clean })
  })
  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' })
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande.' })
    console.error(error)
    res.status(500).json({ error: 'No se pudo completar la operación.' })
  })
  return app
}
