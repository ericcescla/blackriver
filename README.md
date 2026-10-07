# Rubén Rodríguez — sitio y administración

El proyecto está separado en `frontend/` (React + Vite) y `backend/` (Express). Requiere Node.js 22.12 o superior.

## Iniciar el proyecto

En una terminal PowerShell:

```powershell
cd backend
npm.cmd install
Copy-Item .env.example .env
```

La demo viene con `DEMO_MODE=true`: podés ingresar con cualquier usuario y contraseña. Para activar la validación real, establecé `DEMO_MODE=false` y completá `ADMIN_PASSWORD` con una contraseña de entre 12 y 256 caracteres. El usuario se configura con `ADMIN_USERNAME`.

```powershell
npm.cmd run dev
```

En otra terminal, desde la raíz del proyecto:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Abrí `http://localhost:5173` para el sitio o `http://localhost:5173/admin` para la administración. El frontend reenvía `/api` al backend en el puerto 3000.

## Administración

- Acceso mediante usuario y contraseña y sesión de ocho horas con cookie HttpOnly.
- Consultas recibidas desde el formulario público, con búsqueda y filtro por estado.
- Estados Nueva, En seguimiento y Resuelta, con notas internas.
- Edición y publicación de los títulos, descripciones y etiquetas de los cuatro servicios.
- Clientes con nombre, email, teléfono, empresa, dirección y notas.
- Encargos vinculados a clientes, con fecha prevista, importe en ARS, descripción y estados Pendiente, En curso, Completado y Cancelado.
- Hardware con categoría, marca, modelo, serie opcional, costo unitario y unidades registradas, asignadas y disponibles.
- Asignación de varios equipos a un encargo, con comprobación de disponibilidad al guardar.
- Cierre de sesión y comprobación de sesión al recargar.

Creá primero un cliente y los equipos necesarios; después registrá el encargo y seleccioná sus equipos. Los encargos completados conservan la asignación de hardware; cancelar o eliminar un encargo libera sus unidades. No se puede eliminar un cliente o equipo mientras esté asociado a un encargo. Los números de serie, cuando se completan, deben ser únicos.

El formulario público guarda la consulta y permite descargar una copia. No envía correos. Si el backend falla, muestra un error y conserva los campos para reintentar.

## Datos y despliegue

Los servicios, consultas, clientes, encargos y hardware se guardan en `backend/data/store.json`. La carpeta se crea al guardar por primera vez y queda fuera de Git. Usá un disco persistente y hacé copias de esa carpeta. Es un almacenamiento para una sola instancia del backend; para ejecutar varias instancias, habrá que migrarlo a una base de datos.

Las sesiones y los límites de solicitudes se mantienen en memoria. Reiniciar el backend cierra las sesiones activas, pero conserva las consultas y los servicios.

Para producción, compilá con `npm.cmd run build` dentro de `frontend/`, serví `frontend/dist/`, dirigí `/api` al backend y configurá el servidor web para que `/admin` devuelva `index.html`. Establecé `PUBLIC_ORIGIN` con la URL exacta del sitio, habilitá HTTPS y usá `COOKIE_SECURE=true`. El backend se inicia con `npm.cmd start` dentro de `backend/`.

## Verificación

```powershell
cd backend
npm.cmd test
cd ../frontend
npm.cmd run build
npm.cmd run test:e2e
```

Las pruebas de navegador usan Edge y levantan un backend con credenciales exclusivas de prueba y almacenamiento temporal. Requieren que los puertos 3000 y 5188 estén libres. Las credenciales de prueba no se usan en la aplicación normal.
