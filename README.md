# Blackriver

Portafolio de una empresa de IT, desarrollado con React y Vite. Diseño responsive en español, tipografía incluida en el proyecto e ilustraciones creadas con SVG y CSS.

## Desarrollo

Requiere Node.js 22.12 o superior.

```bash
npm install
npm run dev
```

Abrir la dirección local que imprime Vite. En PowerShell con restricciones de scripts, usar `npm.cmd` en lugar de `npm`.

## Producción

```bash
npm run build
npm run preview
```

La carpeta `dist/` contiene el sitio estático listo para alojar.

## Contenido y funciones

- Servicios con paneles desplegables.
- Proyectos filtrables y ventanas de detalle.
- Navegación móvil, enlaces internos y soporte para movimiento reducido.
- Formulario con validación y descarga de un brief de proyecto en formato TXT.
- Modales nativos con cierre por Escape y gestión de foco.

Los tres proyectos son conceptos ficticios, identificados en la interfaz. Reemplazar los datos de `projects` y `services` en `src/App.jsx` por la información real de Blackriver.

El formulario funciona en el navegador: **no envía correos ni transmite datos a un servidor**. Para recibir consultas, conectar `ContactDialog` a un endpoint propio o servicio de formularios y actualizar el mensaje de confirmación. No hay direcciones de correo ni redes sociales inventadas.

La paleta y los estilos están en `src/styles.css`. Las ilustraciones de proyectos están en `src/components/ProjectVisual.jsx` y su CSS. La escultura de portada está en `src/components/FlowArtwork.jsx`.

## Pruebas de navegador

```bash
npm run test:e2e
```

La configuración usa Microsoft Edge instalado localmente. Para otro navegador compatible, establecer `PLAYWRIGHT_CHANNEL` (por ejemplo, `chrome`). Las pruebas comprueban filtros, servicios, modales, navegación móvil, descarga del brief y ausencia de desbordamiento horizontal entre 320 y 1440 px.

Para probar un servidor ya iniciado, establecer `PLAYWRIGHT_BASE_URL` con su dirección (por ejemplo, `http://127.0.0.1:5187`).
