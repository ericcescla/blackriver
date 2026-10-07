import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function createSecurity({ username = 'admin', password, secure = false, demo = false }) {
  if (!demo && (!username || username.length > 100 || !password || password.length < 12 || password.length > 256)) throw new Error('Configurá ADMIN_USERNAME y ADMIN_PASSWORD (entre 12 y 256 caracteres) en backend/.env.')
  const salt = randomBytes(32)
  const hash = demo ? null : scryptSync(password, salt, 64)
  const sessions = new Map()
  const attempts = new Map()
  const cookie = (token, age) => `rr_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${age}${secure ? '; Secure' : ''}`
  return {
    login(req, res) {
      const now = Date.now()
      if (!demo) {
      const previous = attempts.get(req.ip)
      const entry = previous && previous.until > now ? previous : { count: 0, until: now + 15 * 60_000 }
      for (const [key, item] of attempts) if (item.until <= now) attempts.delete(key)
      if (entry.count >= 10) return res.status(429).json({ error: 'Demasiados intentos. Esperá 15 minutos.' })
      entry.count++; attempts.set(req.ip, entry)
      const supplied = typeof req.body?.password === 'string' ? req.body.password : ''
      if (supplied.length > 256 || !timingSafeEqual(hash, scryptSync(supplied, salt, 64)) || req.body?.username !== username) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
      attempts.delete(req.ip)
      }
      for (const [key, session] of sessions) if (session.expires <= now) sessions.delete(key)
      const token = randomBytes(32).toString('hex')
      sessions.set(token, { username, expires: now + 8 * 3600_000 })
      res.setHeader('Set-Cookie', cookie(token, 8 * 3600))
      res.json({ username })
    },
    require(req, res, next) {
      const token = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('rr_session='))?.slice(11)
      const session = sessions.get(token)
      if (!session || session.expires <= Date.now()) { sessions.delete(token); return res.status(401).json({ error: 'Iniciá sesión para continuar.' }) }
      req.session = session; req.sessionToken = token; next()
    },
    logout(req, res) { sessions.delete(req.sessionToken); res.setHeader('Set-Cookie', cookie('', 0)); res.json({ ok: true }) },
  }
}
