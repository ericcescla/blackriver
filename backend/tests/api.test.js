import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from '../app.js'

test('demo accepts arbitrary credentials and keeps session logout working', async t => {
  const server = createApp({ demo: true }).listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/api`
  for (const password of ['cualquiera', '1', '']) {
    const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'demo', password }) })
    assert.equal(login.status, 200)
    const cookie = login.headers.get('set-cookie').split(';')[0]
    assert.equal((await fetch(base + '/auth/me', { headers: { Cookie: cookie } })).status, 200)
    assert.equal((await fetch(base + '/auth/logout', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: '{}' })).status, 200)
    assert.equal((await fetch(base + '/auth/me', { headers: { Cookie: cookie } })).status, 401)
  }
})

test('authentication, inquiry persistence, validation and service publishing', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'rr-api-'))
  const options = { username: 'admin', password: 'test-password-12345', dataDir: directory }
  let server
  async function start() {
    server = createApp(options).listen(0, '127.0.0.1')
    await new Promise(resolve => server.once('listening', resolve))
    return `http://127.0.0.1:${server.address().port}/api`
  }
  let base = await start()
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }) })
  let cookie = ''
  const request = (path, method = 'GET', body, headers = {}) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie, ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  assert.equal((await request('/admin/inquiries')).status, 401)
  assert.equal((await request('/auth/login', 'POST', { username: 'admin', password: 'wrong' })).status, 401)
  const login = await request('/auth/login', 'POST', { username: 'admin', password: options.password })
  assert.equal(login.status, 200)
  assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/)
  cookie = login.headers.get('set-cookie').split(';')[0]
  assert.equal((await request('/auth/me')).status, 200)
  assert.equal((await request('/inquiries', 'POST', { name: 'Invalid' })).status, 400)
  const body = { name: 'María García', email: 'maria@example.com', message: 'Necesito cámaras para la entrada de mi comercio.', services: 'CCTV' }
  assert.equal((await request('/inquiries', 'POST', body, { Origin: 'https://untrusted.example' })).status, 403)
  const submissions = await Promise.all(Array.from({ length: 4 }, () => request('/inquiries', 'POST', body)))
  assert.ok(submissions.every(x => x.status === 201))
  const id = (await submissions[0].json()).id
  assert.equal((await (await request('/admin/inquiries')).json()).inquiries.length, 4)
  assert.equal((await request(`/admin/inquiries/${id}`, 'PATCH', { status: 'Invalid', notes: '' })).status, 400)
  assert.equal((await request(`/admin/inquiries/${id}`, 'PATCH', { status: 'En seguimiento', notes: 'Coordinar visita' })).status, 200)
  assert.equal((await request('/admin/inquiries/missing', 'PATCH', { status: 'Nueva', notes: '' })).status, 404)
  assert.equal((await request('/admin/services', 'PUT', { services: [] })).status, 400)
  assert.equal((await request('/admin/services', 'PUT', { services: [null, null, null, null] })).status, 400)
  const services = Array.from({ length: 4 }, (_, i) => ({ title: `Servicio ${i + 1}`, description: 'Descripción de prueba para un servicio técnico.', tags: ['CCTV'] }))
  assert.equal((await request('/admin/services', 'PUT', { services })).status, 200)
  assert.equal((await (await request('/services')).json()).services[0].title, 'Servicio 1')
  await new Promise(resolve => server.close(resolve))
  base = await start()
  assert.equal((await request('/admin/inquiries')).status, 401)
  const relogin = await request('/auth/login', 'POST', { username: 'admin', password: options.password })
  cookie = relogin.headers.get('set-cookie').split(';')[0]
  const persisted = (await (await request('/admin/inquiries')).json()).inquiries
  assert.equal(persisted.length, 4)
  assert.equal(persisted.find(x => x.id === id).notes, 'Coordinar visita')
  assert.equal((await (await request('/services')).json()).services[0].title, 'Servicio 1')
  assert.equal((await request('/auth/logout', 'POST', {})).status, 200)
  assert.equal((await request('/admin/inquiries')).status, 401)
})

test('missing credentials fail closed and repeated login failures are limited', async t => {
  assert.throws(() => createApp({ username: 'admin', password: 'short' }), /ADMIN_PASSWORD/)
  const server = createApp({ username: 'admin', password: 'test-password-12345' }).listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}`
  for (let i = 0; i < 10; i++) assert.equal((await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"password":"bad"}' })).status, 401)
  assert.equal((await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 429)
})
