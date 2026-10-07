export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'same-origin',
  }).catch(() => { throw new Error('No se pudo conectar. Intentá de nuevo en unos minutos.') })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'No se pudo completar la operación.')
    error.status = response.status
    throw error
  }
  return data
}
