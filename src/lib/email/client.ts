/**
 * Envío de correo transaccional. Solo servidor: usa RESEND_API_KEY, que
 * nunca debe exponerse al navegador. Este módulo se importa únicamente
 * desde Server Actions.
 *
 * Se usa la API HTTP de Resend directamente con `fetch` para no añadir
 * dependencias al bundle: el SDK oficial hace exactamente esta llamada.
 * Si prefieres otro proveedor (SendGrid, Postmark, SES) solo hay que
 * reescribir `deliver()`; el resto del sistema no cambia.
 *
 * Variables de entorno:
 *   RESEND_API_KEY            Clave de la API (sin ella, el envío se omite).
 *   EMAIL_FROM                Remitente verificado. Ej: "PES <no-reply@pes.panamarinesolutions.com>"
 *   RFQ_NOTIFICATION_EMAIL    Destinatario(s) internos, separados por coma.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface EmailMessage {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailResult {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

/** Remitente configurado. Debe pertenecer a un dominio verificado en Resend. */
export function emailFrom(): string {
  return (
    process.env.EMAIL_FROM ||
    'Panama Energy Solutions <no-reply@pes.panamarinesolutions.com>'
  );
}

/**
 * Buzones internos que reciben cada RFQ.
 * Acepta varios separados por coma. Si no se define, cae al correo de
 * contacto público para que nunca se pierda una solicitud.
 */
export function rfqRecipients(fallback?: string | null): string[] {
  const raw =
    process.env.RFQ_NOTIFICATION_EMAIL ||
    fallback ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    'pes@panamarinesolutions.com';

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Envía un correo. Nunca lanza: devuelve el resultado para registrarlo. */
export async function deliver(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      '[email] RESEND_API_KEY no configurada: se omitió el envío de "%s" a %s',
      message.subject,
      message.to.join(', '),
    );
    return { ok: false, skipped: true, error: 'RESEND_API_KEY no configurada' };
  }

  if (!message.to.length) {
    return { ok: false, skipped: true, error: 'Sin destinatarios' };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom(),
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      // El correo no debe bloquear la respuesta al cliente más de la cuenta.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] Falló el envío (%s): %s', res.status, body.slice(0, 500));
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.error('[email] Error de red al enviar correo:', err);
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
