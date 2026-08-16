# Proceso de solicitud de cotización (RFQ) — Panama Energy Solutions

Documento de referencia para el seguimiento de solicitudes.
Última actualización: agosto de 2026.

---

## 1. Dónde queda registrada cada solicitud

Cuando un cliente completa el formulario de la web, la solicitud se guarda de
forma permanente en **tres lugares que se alimentan del mismo registro**:

| Lugar | Qué contiene | Cómo se accede |
|---|---|---|
| **Base de datos (Supabase)** | Tabla `service_requests`, un registro por solicitud con todos los campos del formulario | Panel de Supabase → Table Editor |
| **Panel de PES** | La misma solicitud, ya presentada y con su historial de estados | `www.pes.panamarinesolutions.com/admin/solicitudes` |
| **Correo electrónico** | Aviso inmediato con todos los datos capturados | Bandeja de entrada configurada (ver punto 2) |

Cada solicitud recibe un **número correlativo** con el formato `PES-00001`.
Ese número es la referencia única para dar seguimiento y aparece tanto en el
panel como en el correo y en la pantalla que ve el cliente al enviar.

**Importante:** el registro en la base de datos es independiente del correo.
Aunque el envío de correo falle, la solicitud **nunca se pierde**: queda
guardada y visible en el panel.

---

## 2. A qué correo llega la notificación

El destinatario se define con la variable de entorno **`RFQ_NOTIFICATION_EMAIL`**.
Admite varios buzones separados por coma, por ejemplo:

```
RFQ_NOTIFICATION_EMAIL=pes@panamarinesolutions.com,operaciones@panamarinesolutions.com
```

Si no se define, el sistema usa automáticamente el correo de contacto de PES
configurado en el panel, de modo que ninguna solicitud quede sin aviso.

Para verificar en cualquier momento a qué buzón está llegando, se abre la
página **`/diagnostico`** del sitio: muestra el destinatario activo, el
remitente y si el servicio de correo está correctamente configurado.

### Correos que se envían por cada solicitud

**a) Aviso interno a PES** — asunto:

> `Nueva solicitud PES-00042 · Diésel · Torre Financiera`
> (si el cliente marcó urgencia, el asunto empieza con `[URGENTE]`)

Incluye **todos** los datos que ingresó el cliente, agrupados en cinco bloques:

1. **Servicio solicitado** — producto, cantidad en galones, urgencia, fecha y horario preferidos
2. **Lugar de entrega** — instalación, tipo, provincia/distrito/corregimiento, dirección completa, punto de referencia, instrucciones de acceso, capacidad del tanque y nivel actual
3. **Contacto en sitio** — nombre, teléfono y correo de quien recibe
4. **Datos del cliente** — nombre, empresa, correo, teléfono y si es cliente registrado o invitado
5. **Adicional** — comentarios del cliente y cantidad de fotos o archivos adjuntos

Trae además un botón **"Abrir en el panel de PES"** que lleva directo a la
solicitud. El campo *responder a* del correo apunta al correo del cliente: al
darle **Responder** se le escribe a él directamente, sin copiar y pegar nada.

**b) Acuse de recibo al cliente** — confirma la recepción, resume el servicio
solicitado y le entrega un enlace de seguimiento para consultar el estado de su
solicitud sin necesidad de crear una cuenta.

---

## 3. Qué hay que configurar antes de publicar

El envío usa **Resend** (servicio de correo transaccional; plan gratuito de
3.000 correos al mes, suficiente de sobra para el volumen de RFQ).

1. Crear una cuenta en `resend.com`
2. **Domains → Add domain** → `panamarinesolutions.com` y agregar los registros
   DNS que indica (SPF, DKIM y DMARC). Este paso es el que evita que los avisos
   caigan en spam.
3. **API Keys → Create API Key** y copiar la clave
4. Cargar en el hosting (Vercel → Settings → Environment Variables):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Panama Energy Solutions <no-reply@pes.panamarinesolutions.com>
RFQ_NOTIFICATION_EMAIL=pes@panamarinesolutions.com
```

5. Volver a desplegar y hacer una solicitud de prueba

> Mientras no se cargue `RESEND_API_KEY`, el formulario **sigue funcionando con
> normalidad** y las solicitudes se guardan en la base de datos y aparecen en el
> panel; lo único que no ocurre es el envío del aviso por correo.

---

## 4. Flujo completo de una solicitud

```
Cliente completa el formulario en la web
        ↓
Se guarda en service_requests  ·  estado: "Solicitud recibida"
        ↓
        ├──→ Correo interno a PES (todos los datos + enlace al panel)
        └──→ Acuse de recibo al cliente (con enlace de seguimiento)
        ↓
PES confirma disponibilidad y precio
        ↓
Se emite la cotización desde el panel
        ↓
El cliente la aprueba en línea
        ↓
Se programa y ejecuta la entrega
        ↓
Servicio completado
```

Cada cambio de estado queda registrado con fecha y responsable en el historial
de la solicitud, dentro del panel.

---

## 5. Cómo hacer una prueba de punta a punta

1. Entrar a `www.pes.panamarinesolutions.com/solicitar`
2. Completar el formulario como invitado, con un correo real de prueba
3. Verificar los tres puntos:
   - Llega el **aviso interno** al buzón configurado, con todos los datos
   - Llega el **acuse** al correo del cliente de prueba
   - La solicitud aparece en **`/admin/solicitudes`** con su número `PES-000XX`
4. Abrir la solicitud en el panel y confirmar que los datos coinciden

Si el aviso no llega, revisar en este orden: la página `/diagnostico`, la
carpeta de spam, y el panel de Resend (sección **Logs**, que muestra cada
intento de envío y su resultado).
