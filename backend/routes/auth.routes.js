import { Router } from 'express'

export default function authRoutes(security) {
  const router = Router()
  router.post('/login', (req, res) => security.login(req, res))
  router.get('/me', security.require, (req, res) => res.json({ username: req.session.username }))
  router.post('/logout', security.require, (req, res) => security.logout(req, res))
  return router
}
