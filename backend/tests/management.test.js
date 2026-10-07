import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, isAbsolute } from 'node:path'
import { createApp } from '../app.js'

test('management preserves old data, validates relations and allocates inventory atomically', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'rr-management-'))
  await writeFile(join(directory, 'store.json'), JSON.stringify({ inquiries: [{ id: 'old', name: 'Consulta existente' }], services: null }))
  let server
  let base
  let cookie
  async function start() {
    server = createApp({ demo: true, dataDir: directory }).listen(0, '127.0.0.1')
    await new Promise(resolve => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}/api`
    const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    cookie = login.headers.get('set-cookie').split(';')[0]
  }
  await start()
  t.after(async () => {
    await new Promise(resolve => server.close(resolve))
    const location = relative(tmpdir(), directory)
    if (!isAbsolute(location) && !location.startsWith('..') && location.startsWith('rr-management-')) await rm(directory, { recursive: true, force: true })
  })
  const request = (path, method = 'GET', body) => fetch(base + '/admin' + path, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  assert.equal((await fetch(base + '/admin/management')).status, 401)
  assert.deepEqual(await (await request('/management')).json(), { clients: [], orders: [], hardware: [] })
  assert.equal((await (await request('/inquiries')).json()).inquiries[0].name, 'Consulta existente')
  assert.equal((await request('/clients', 'POST', { name: ' ', email: 'bad' })).status, 400)
  const client = await (await request('/clients', 'POST', { name: 'Cliente', email: 'cliente@example.com', phone: '123' })).json()
  assert.ok(client.id)
  const hardware = await (await request('/hardware', 'POST', { name: 'Cámara', stock: 3, serial: 'CAM-1' })).json()
  assert.equal((await request('/hardware', 'POST', { name: 'Duplicada', stock: 1, serial: 'cam-1' })).status, 409)
  assert.equal((await request('/hardware', 'POST', { name: 'Negativo', stock: -1 })).status, 400)
  const order = { title: 'Instalación', clientId: client.id, hardwareItems: [{ hardwareId: hardware.id, quantity: 2 }], dueDate: '2026-10-10', amount: 15000 }
  assert.equal((await request('/orders', 'POST', { ...order, clientId: 'missing' })).status, 409)
  assert.equal((await request('/orders', 'POST', { ...order, dueDate: '2026-02-30' })).status, 400)
  assert.equal((await request('/orders', 'POST', { ...order, hardwareItems: [null] })).status, 400)
  const concurrent = await Promise.all([request('/orders', 'POST', order), request('/orders', 'POST', order)])
  assert.deepEqual(concurrent.map(x => x.status).sort(), [201, 409])
  const created = await concurrent.find(x => x.status === 201).json()
  let inventory = (await (await request('/hardware')).json()).hardware[0]
  assert.equal(inventory.available, 1)
  assert.equal(inventory.assigned, 2)
  assert.equal((await request(`/hardware/${hardware.id}`, 'PUT', { ...hardware, stock: 1 })).status, 409)
  assert.equal((await request(`/clients/${client.id}`, 'DELETE', {})).status, 409)
  assert.equal((await request(`/hardware/${hardware.id}`, 'DELETE', {})).status, 409)
  assert.equal((await request(`/orders/${created.id}`, 'PUT', { ...created, status: 'Completado' })).status, 200)
  assert.equal((await (await request('/hardware')).json()).hardware[0].available, 1)
  assert.equal((await request(`/orders/${created.id}`, 'PUT', { ...created, status: 'Cancelado' })).status, 200)
  assert.equal((await (await request('/hardware')).json()).hardware[0].available, 3)
  assert.equal((await request(`/clients/${client.id}`, 'PUT', { ...client, name: 'Cliente actualizado' })).status, 200)
  await new Promise(resolve => server.close(resolve))
  await start()
  const persisted = await (await request('/management')).json()
  assert.equal(persisted.clients[0].name, 'Cliente actualizado')
  assert.equal(persisted.orders[0].status, 'Cancelado')
  assert.equal(persisted.hardware[0].stock, 3)
  assert.equal((await request(`/orders/${created.id}`, 'DELETE', {})).status, 200)
  assert.equal((await request(`/clients/${client.id}`, 'DELETE', {})).status, 200)
  assert.equal((await request(`/hardware/${hardware.id}`, 'DELETE', {})).status, 200)
  assert.equal((await request('/orders/missing', 'PUT', order)).status, 404)
})
