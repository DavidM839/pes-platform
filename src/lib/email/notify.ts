import { deliver, rfqRecipients } from './client';
import { clientAckEmail, internalRfqEmail, type RfqEmailData } from './rfq-templates';

/**
 * Notificación de una solicitud de cotización recién creada.
 *
 * Envía dos correos:
 *   1. Interno → a RFQ_NOTIFICATION_EMAIL (o al correo de contacto de PES),
 *      con TODOS los datos que capturó el formulario y un enlace al panel.
 *   2. Acuse   → al correo del cliente, con su enlace de seguimiento.
 *
 * Nunca lanza excepciones: si el correo falla, la solicitud ya quedó guardada
 * en la base de datos y solo se registra el error en los logs del servidor.
 */
export async function notifyNewRequest(
  data: RfqEmailData,
  options?: { internalTo?: string | null },
): Promise<{ internal: boolean; client: boolean }> {
  const result = { internal: false, client: false };

  try {
    const to = rfqRecipients(options?.internalTo);
    const mail = internalRfqEmail(data);
    const replyTo = data.contact_email || data.client_email || undefined;

    const sent = await deliver({
      to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo,
    });
    result.internal = sent.ok;

    if (!sent.ok && !sent.skipped) {
      console.error('[email] No se pudo notificar la solicitud %s', data.request_number);
    }
  } catch (err) {
    console.error('[email] Error inesperado en la notificación interna:', err);
  }

  const clientEmail = data.contact_email || data.client_email;
  if (clientEmail) {
    try {
      const ack = clientAckEmail(data);
      const sent = await deliver({
        to: [clientEmail],
        subject: ack.subject,
        html: ack.html,
        text: ack.text,
      });
      result.client = sent.ok;
    } catch (err) {
      console.error('[email] Error inesperado en el acuse al cliente:', err);
    }
  }

  return result;
}

export type { RfqEmailData };
