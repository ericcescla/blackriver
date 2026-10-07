import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function createStore(directory = process.env.DATA_DIR || fileURLToPath(new URL('./data/', import.meta.url))) {
  const folder = directory
  let queue = Promise.resolve()
  async function read() {
    const defaults = { inquiries: [], services: null, clients: [], orders: [], hardware: [] }
    try { return { ...defaults, ...JSON.parse(await readFile(resolve(folder, 'store.json'), 'utf8')) } }
    catch (error) { if (error.code === 'ENOENT') return defaults; throw error }
  }
  return {
    read: async () => { await queue; return read() },
    update: (change) => {
      const task = queue.then(async () => {
        const data = await read()
        const result = change(data)
        await mkdir(folder, { recursive: true })
        const temporary = resolve(folder, 'store.tmp')
        await writeFile(temporary, JSON.stringify(data, null, 2))
        await rename(temporary, resolve(folder, 'store.json'))
        return result
      })
      queue = task.catch(() => {})
      return task
    },
  }
}
