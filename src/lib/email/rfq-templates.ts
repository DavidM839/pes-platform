import { FACILITY_LABELS, SERVICE_LABELS, TIME_SLOT_LABELS } from '@/lib/constants';
import { formatDate, formatGallons, formatPhone } from '@/lib/format';
import { siteConfig } from '@/config/site';
import type { FacilityType, ServiceType } from '@/types';

/** Datos crudos de la solicitud, tal como llegan del formulario público. */
export interface RfqEmailData {
  id: string;
  request_number: string;
  access_token: string;
  is_guest: boolean;
  created_at: string;

  service_type: ServiceType;
  quantity_gal: number | null;
  quantity_unknown: boolean;
  quantity_note: string | null;

  facility_name: string;
  facility_type: FacilityType;
  province: string;
  district: string | null;
  corregimiento: string | null;
  address_line: string;
  reference_point: string | null;
  access_instructions: string | null;
  tank_capacity_gal: number | null;
  current_level_pct: number | null;

  preferred_date: string;
  preferred_time_slot: string;
  urgency: 'normal' | 'urgente';

  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  customer_comments: string | null;

  client_full_name: string | null;
  client_company: string | null;
  client_email: string | null;
  client_phone: string | null;

  attachments_count: number;
}

const NAVY = '#040B1D';
const GOLD = '#E0A402';
const MIST = '#F7F9FC';
const BORDER = '#D6DEEB';

/** Escapa el contenido antes de inyectarlo en el HTML del correo. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const dash = (v: unknown) => {
  const s = String(v ?? '').trim();
  return s === '' ? '—' : s;
};

type Row = [label: string, value: string];

/** Convierte la solicitud en secciones de pares etiqueta/valor. */
function buildSections(d: RfqEmailData): { title: string; rows: Row[] }[] {
  const location = [d.corregimiento, d.district, d.province].filter(Boolean).join(', ');
  const quantity = d.quantity_unknown
    ? `Por definir${d.quantity_note ? ` — ${d.quantity_note}` : ''}`
    : formatGallons(d.quantity_gal);

  return [
    {
      title: 'Servicio solicitado',
      rows: [
        ['Producto', SERVICE_LABELS[d.service_type] ?? d.service_type],
        ['Cantidad', quantity],
        ['Urgencia', d.urgency === 'urgente' ? 'URGENTE' : 'Normal'],
        ['Fecha preferida', formatDate(d.preferred_date)],
        ['Horario preferido', TIME_SLOT_LABELS[d.preferred_time_slot] ?? d.preferred_time_slot],
      ],
    },
    {
      title: 'Lugar de entrega',
      rows: [
        ['Instalación', d.facility_name],
        ['Tipo de instalación', FACILITY_LABELS[d.facility_type] ?? d.facility_type],
        ['Ubicación', dash(location)],
        ['Dirección', d.address_line],
        ['Punto de referencia', dash(d.reference_point)],
        ['Instrucciones de acceso', dash(d.access_instructions)],
        ['Capacidad del tanque', d.tank_capacity_gal ? formatGallons(d.tank_capacity_gal) : '—'],
        [
          'Nivel actual',
          d.current_level_pct === null || d.current_level_pct === undefined
            ? '—'
            : `${d.current_level_pct}%`,
        ],
      ],
    },
    {
      title: 'Contacto en sitio',
      rows: [
        ['Nombre', d.contact_name],
        ['Teléfono', formatPhone(d.contact_phone)],
        ['Correo', dash(d.contact_email)],
      ],
    },
    {
      title: 'Datos del cliente',
      rows: [
        ['Nombre', dash(d.client_full_name)],
        ['Empresa', dash(d.client_company)],
        ['Correo', dash(d.client_email)],
        ['Teléfono', d.client_phone ? formatPhone(d.client_phone) : '—'],
        ['Origen', d.is_guest ? 'Invitado (sin cuenta)' : 'Cliente registrado'],
      ],
    },
    {
      title: 'Adicional',
      rows: [
        ['Comentarios del cliente', dash(d.customer_comments)],
        [
          'Archivos adjuntos',
          d.attachments_count > 0
            ? `${d.attachments_count} archivo(s) — visibles en el panel`
            : 'Ninguno',
        ],
      ],
    },
  ];
}

function rowsHtml(rows: Row[]): string {
  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:9px 14px;border-bottom:1px solid ${BORDER};font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#456694;width:38%;vertical-align:top;">${esc(label)}</td>
          <td style="padding:9px 14px;border-bottom:1px solid ${BORDER};font-size:14px;color:${NAVY};font-weight:500;vertical-align:top;">${esc(value)}</td>
        </tr>`,
    )
    .join('');
}

/** Correo interno: una RFQ nueva con absolutamente todos los datos capturados. */
export function internalRfqEmail(d: RfqEmailData): { subject: string; html: string; text: string } {
  const sections = buildSections(d);
  const base = siteConfig.url.replace(/\/$/, '');
  const adminUrl = `${base}/admin/solicitudes/${d.id}`;
  const urgent = d.urgency === 'urgente';

  const subject = `${urgent ? '[URGENTE] ' : ''}Nueva solicitud ${d.request_number} · ${
    SERVICE_LABELS[d.service_type] ?? d.service_type
  } · ${d.facility_name}`;

  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${MIST};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid ${BORDER};">

        <tr>
          <td style="background:${NAVY};padding:26px 28px;">
            <p style="margin:0;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${GOLD};">Panama Energy Solutions</p>
            <h1 style="margin:10px 0 0;font-size:21px;line-height:1.25;color:#ffffff;font-weight:600;">Nueva solicitud de cotización</h1>
            <p style="margin:8px 0 0;font-size:13px;color:#AEBED6;">
              ${esc(d.request_number)} · recibida el ${esc(formatDate(d.created_at))}
            </p>
          </td>
        </tr>

        ${
          urgent
            ? `<tr><td style="background:${GOLD};padding:10px 28px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${NAVY};">Marcada como urgente por el cliente</td></tr>`
            : ''
        }

        ${sections
          .map(
            (s) => `
        <tr>
          <td style="padding:22px 28px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#264873;border-bottom:2px solid ${GOLD};display:inline-block;padding-bottom:5px;">${esc(s.title)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${BORDER};">
              ${rowsHtml(s.rows)}
            </table>
          </td>
        </tr>`,
          )
          .join('')}

        <tr>
          <td style="padding:28px;">
            <a href="${esc(adminUrl)}" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;padding:14px 26px;font-size:14px;font-weight:600;">Abrir en el panel de PES</a>
            <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#456694;">
              La solicitud ya quedó registrada en la base de datos (tabla <strong>service_requests</strong>)
              y es visible en <strong>Panel → Solicitudes</strong>. Responde a este correo para
              contactar directamente al cliente.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:${MIST};border-top:1px solid ${BORDER};padding:16px 28px;font-size:11px;color:#456694;">
            Notificación automática de ${esc(siteConfig.name)} · ${esc(base.replace(/^https?:\/\//, ''))}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `NUEVA SOLICITUD DE COTIZACIÓN — ${d.request_number}`,
    `Recibida: ${formatDate(d.created_at)}`,
    urgent ? 'MARCADA COMO URGENTE' : '',
    '',
    ...sections.flatMap((s) => [
      s.title.toUpperCase(),
      ...s.rows.map(([l, v]) => `  ${l}: ${v}`),
      '',
    ]),
    `Ver en el panel: ${adminUrl}`,
  ]
    .filter((l) => l !== '')
    .join('\n');

  return { subject, html, text };
}

/** Acuse de recibo para el cliente, con su enlace de seguimiento. */
export function clientAckEmail(d: RfqEmailData): { subject: string; html: string; text: string } {
  const base = siteConfig.url.replace(/\/$/, '');
  const trackUrl = d.is_guest
    ? `${base}/s/${d.access_token}`
    : `${base}/portal/solicitudes/${d.id}`;
  const service = SERVICE_LABELS[d.service_type] ?? d.service_type;
  const quantity = d.quantity_unknown ? 'Por definir' : formatGallons(d.quantity_gal);
  const subject = `Recibimos tu solicitud ${d.request_number} · ${siteConfig.name}`;

  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${MIST};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BORDER};">

        <tr>
          <td style="background:${NAVY};padding:26px 28px;">
            <p style="margin:0;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${GOLD};">${esc(siteConfig.tagline)}</p>
            <h1 style="margin:10px 0 0;font-size:21px;color:#ffffff;font-weight:600;">Recibimos tu solicitud</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 28px 0;">
            <p style="margin:0;font-size:15px;line-height:1.65;color:${NAVY};">
              Hola ${esc(d.contact_name.split(' ')[0] || 'buen día')}, gracias por escribirnos.
              Tu solicitud <strong>${esc(d.request_number)}</strong> ya está en nuestro sistema y
              nuestro equipo confirmará disponibilidad y precio para enviarte la cotización.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;border-top:1px solid ${BORDER};">
              ${rowsHtml([
                ['Servicio', service],
                ['Cantidad', quantity],
                ['Entrega en', d.facility_name],
                ['Fecha preferida', formatDate(d.preferred_date)],
              ])}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 28px;">
            <a href="${esc(trackUrl)}" style="display:inline-block;background:${GOLD};color:${NAVY};text-decoration:none;padding:14px 26px;font-size:14px;font-weight:700;">Ver el estado de mi solicitud</a>
            <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#456694;">
              Las solicitudes están sujetas a confirmación de disponibilidad, precio y horario por parte de PES.
              ¿Necesitas ayuda? Escríbenos a
              <a href="mailto:${esc(siteConfig.email)}" style="color:#815503;">${esc(siteConfig.email)}</a>.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:${MIST};border-top:1px solid ${BORDER};padding:16px 28px;font-size:11px;color:#456694;">
            ${esc(siteConfig.name)} · ${esc(siteConfig.address)}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Recibimos tu solicitud ${d.request_number}`,
    '',
    `Servicio: ${service}`,
    `Cantidad: ${quantity}`,
    `Entrega en: ${d.facility_name}`,
    `Fecha preferida: ${formatDate(d.preferred_date)}`,
    '',
    `Sigue el estado aquí: ${trackUrl}`,
    '',
    'Las solicitudes están sujetas a confirmación de disponibilidad, precio y horario por parte de PES.',
    `${siteConfig.name} · ${siteConfig.email}`,
  ].join('\n');

  return { subject, html, text };
}
