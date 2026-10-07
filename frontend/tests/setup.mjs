import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, isAbsolute } from 'node:path'
import { createServer } from 'vite'
import { createApp } from '../../backend/app.js'

export default async function setup() {
  const dataDir = await mkdtemp(join(tmpdir(), 'rr-browser-'))
  const backend = createApp({ username: 'admin', password: 'browser-test-password', dataDir, publicOrigin: 'http://127.0.0.1:5188' }).listen(3000, '127.0.0.1')
  let frontend
  const cleanup = async () => {
    if (frontend) await frontend.close()
    backend.closeAllConnections()
    await new Promise(resolve => backend.close(resolve))
    const location = relative(tmpdir(), dataDir)
    if (!isAbsolute(location) && !location.startsWith('..') && location.startsWith('rr-browser-')) await rm(dataDir, { recursive: true, force: true })
  }
  try {
    await new Promise((resolve, reject) => { backend.once('listening', resolve); backend.once('error', reject) })
    frontend = await createServer({ server: { host: '127.0.0.1', port: 5188, strictPort: true }, logLevel: 'error' })
    await frontend.listen()
    return cleanup
  } catch (error) { await cleanup(); throw error }
}
