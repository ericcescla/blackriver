# Backend

Express con rutas en `routes/`, autenticación en `security.js` y almacenamiento en `store.js`.

Copiá `.env.example` a `.env`, configurá una contraseña de administrador de al menos 12 caracteres y ejecutá `npm.cmd run dev`. Consultá el [README del proyecto](../README.md) para iniciar el frontend y configurar producción.

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Consultar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/services` | Servicios públicos; `null` indica usar los valores iniciales del frontend |
| POST | `/api/inquiries` | Registrar consulta pública |
| GET | `/api/admin/inquiries` | Listar consultas, requiere sesión |
| PATCH | `/api/admin/inquiries/:id` | Actualizar `status` y `notes`, requiere sesión |
| PUT | `/api/admin/services` | Publicar los cuatro servicios, requiere sesión |
| GET | `/api/admin/management` | Clientes, encargos e inventario con disponibilidad |
| GET / POST | `/api/admin/clients` | Listar o crear clientes |
| PUT / DELETE | `/api/admin/clients/:id` | Editar o eliminar clientes |
| GET / POST | `/api/admin/orders` | Listar o crear encargos |
| PUT / DELETE | `/api/admin/orders/:id` | Editar o eliminar encargos |
| GET / POST | `/api/admin/hardware` | Listar o crear equipos |
| PUT / DELETE | `/api/admin/hardware/:id` | Editar o eliminar equipos |

Las rutas de gestión requieren sesión, también en modo demo. Se guardan en el mismo archivo que las consultas y los servicios; los archivos anteriores se adaptan al leerlos sin borrar sus datos. Cada encargo referencia un `clientId` y una lista `hardwareItems` con `{ hardwareId, quantity }`. Los estados son Pendiente, En curso, Completado y Cancelado. Los importes y costos se expresan en ARS.

Las asignaciones de stock se comprueban dentro de la operación de guardado para evitar sobreasignaciones en solicitudes simultáneas. Los encargos cancelados no consumen disponibilidad; los completados mantienen sus equipos asignados. Un equipo o cliente asociado a un encargo no se puede eliminar (409). Las ediciones envían el registro completo con PUT.

Las operaciones de escritura reciben JSON. Las rutas privadas responden 401 si no hay una sesión válida. El formulario tiene validación y límite de diez consultas por IP por hora; el acceso permite diez intentos fallidos por IP cada quince minutos. Las sesiones duran ocho horas. Las cookies son HttpOnly y SameSite=Strict; en producción con HTTPS se debe activar `COOKIE_SECURE`.

`npm.cmd test` comprueba autenticación, cierre de sesión, validación, protección de origen, límites de acceso, publicación de servicios y persistencia tras reinicio.
