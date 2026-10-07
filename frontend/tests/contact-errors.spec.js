import { test, expect } from '@playwright/test'

test('failed inquiry submission preserves the form for retry', async ({ page }) => {
  await page.route('**/api/inquiries', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'No se pudo guardar. Intentá nuevamente.' }) }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Hablemos', exact: true }).click()
  await page.getByLabel('Tu nombre').fill('Cliente')
  await page.getByLabel('Tu email').fill('cliente@example.com')
  await page.getByLabel('Describí tu necesidad').fill('Necesito cámaras para el frente de mi casa.')
  await page.getByRole('button', { name: 'Enviar mi consulta' }).click()
  await expect(page.getByRole('alert')).toContainText('No se pudo guardar')
  await expect(page.getByLabel('Describí tu necesidad')).toHaveValue('Necesito cámaras para el frente de mi casa.')
  await expect(page.getByRole('button', { name: 'Enviar mi consulta' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Descargar mi consulta' })).toHaveCount(0)
  await page.unroute('**/api/inquiries')
  await page.getByRole('button', { name: 'Enviar mi consulta' }).click()
  await expect(page.getByText('Tu consulta fue enviada y guardada', { exact: false })).toBeVisible()
})
