# Cambios aplicados — solicitud del cliente (agosto 2026)

## 0. Conflictos de merge sin resolver (bloqueante)

El proyecto llegó con **17 conflictos de Git en 9 archivos** (`<<<<<<< HEAD`).
No compilaba. Se resolvieron todos tomando la rama con los cambios nuevos.
Verificado con `npm run typecheck` y `npm run build`.

## 1. Descripción de los servicios
Se eliminó todo el lenguaje de intermediación. Ya no se dice que PES "coordina"
con compañías aliadas: se comunica que **PES presta directamente el servicio** y
que cuenta con aliados que **asisten y apoyan** sus operaciones cuando es
necesario. Archivos: home, servicios, cómo funciona, términos, privacidad,
ayuda, layout de acceso y metadatos SEO.

## 2. Proceso de cotización — NUEVO
No existía ningún envío de correo. Se implementó (`src/lib/email/`):
- Aviso interno con **todos** los datos del formulario y enlace directo al panel
- Acuse de recibo al cliente con enlace de seguimiento
- Configurable con `RESEND_API_KEY`, `EMAIL_FROM`, `RFQ_NOTIFICATION_EMAIL`
- `/diagnostico` muestra a qué buzón está llegando cada solicitud

Documentación completa en **`docs/PROCESO-COTIZACIONES.md`**.

## 3. URL
Dominio final `www.pes.panamarinesolutions.com` en configuración, `.env.example`
y `DEPLOY.md`. Se agregaron `robots.txt` y `sitemap.xml`.

## 4 y 8. Fotografías
- `hero-principal.jpg` y `diesel/hero.jpg` eran **el mismo archivo**: la foto real
  aparecía dos veces. Se eliminó el duplicado.
- La foto real fuerte queda **solo en el hero**.
- Las fotos de "Nuestra Operación" se conservan (autorizadas por el cliente).
- La cabecera de la sección de diésel pasa a una imagen genérica profesional.
- **Todas las imágenes se escalaron con superresolución FSRCNN**: el hero pasó de
  640×360 a 1920×1080. Antes se pixelaba a ancho completo.

## 5. Diseño e interfaz
- Tipografía: **Sora** para titulares y rótulos de marca, **Inter** para texto,
  formularios y panel. Antes todo era Inter.
- Titulares con tracking más cerrado y mayor tamaño.
- Íconos: familia única (Lucide) con **grosor de trazo unificado en 1.75**.
- Se sustituyó el ícono `Cross` (cruz religiosa) por `ShieldAlert` en
  "Operaciones críticas".

## 6. Sección de contacto
Eliminado el bloque "Sitio" con la dirección web del pie de página.

## 7. Sectores que atendemos
La rejilla era de 8 columnas: los rótulos se cortaban. Ahora es flexible y
centrada, la última fila no queda colgando, y todas las celdas comparten
diámetro de círculo, tamaño de ícono y altura de rótulo.

## 9. Imagen principal / Hero
Hero a sangre con la fotografía a pantalla completa (`min-h-[86vh]`), degradado
mucho más suave para que el camión se vea, titular más grande y ficha técnica
sobre panel translúcido.

---

## Pendiente del lado del cliente
1. Contratar Resend y verificar el dominio (ver `docs/PROCESO-COTIZACIONES.md`)
2. Cargar las tres variables de entorno de correo
3. Apuntar el DNS del subdominio
4. **No llegaron los screenshots de referencia del hero** mencionados en el correo
5. Convendría 1–2 fotos genéricas más de diésel para reforzar esa sección
