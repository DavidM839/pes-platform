import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { siteConfig } from '@/config/site';
import { formatPhone } from '@/lib/format';
import { waMessages, whatsappLink } from '@/lib/whatsapp';

export function PublicFooter({ whatsapp, email }: { whatsapp?: string; email?: string }) {
  const wa = whatsapp || siteConfig.whatsapp;
  const mail = email || siteConfig.email;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-navy-900 bg-white">
      <div className="pes-container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo height={42} href={null} />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-eyebrow text-gold-700">
            {siteConfig.tagline}
          </p>
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-navy-600">
            Coordinamos el suministro de diésel y agua potable por cisterna en Panamá, conectando
            tu necesidad con compañías operadoras aliadas.
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="pes-eyebrow border-b border-navy-100 pb-2">Contacto</p>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-navy-400">Correo</dt>
              <dd><a href={`mailto:${mail}`} className="text-navy-700 hover:text-navy-900">{mail}</a></dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-navy-400">WhatsApp</dt>
              <dd>
                <a
                  href={whatsappLink(waMessages.general(), wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono tabular-nums text-navy-700 hover:text-navy-900"
                >
                  {formatPhone(wa)}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-navy-400">Sitio</dt>
              <dd>
                <a href={siteConfig.url} className="text-navy-700 hover:text-navy-900">
                  {siteConfig.url.replace(/^https?:\/\//, '')}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-3">
          <p className="pes-eyebrow border-b border-navy-100 pb-2">Plataforma</p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li><Link href="/servicios" className="text-navy-700 hover:text-navy-900">Servicios</Link></li>
            <li><Link href="/como-funciona" className="text-navy-700 hover:text-navy-900">Cómo funciona</Link></li>
            <li><Link href="/solicitar" className="text-navy-700 hover:text-navy-900">Solicitar servicio</Link></li>
            <li><Link href="/privacidad" className="text-navy-700 hover:text-navy-900">Aviso de privacidad</Link></li>
            <li><Link href="/terminos" className="text-navy-700 hover:text-navy-900">Términos y condiciones</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-100">
        <div className="pes-container flex flex-col justify-between gap-2 py-5 font-mono text-[10px] uppercase tracking-wide2 text-navy-400 sm:flex-row">
          <p>&copy; {year} {siteConfig.name}</p>
          <p>Panamá, República de Panamá</p>
        </div>
      </div>
    </footer>
  );
}
