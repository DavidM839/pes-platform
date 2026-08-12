import { MessageCircle } from 'lucide-react';
import { waMessages, whatsappLink } from '@/lib/whatsapp';

/** Boton flotante presente en la pagina pública. */
export function WhatsAppFab({ number }: { number?: string | null }) {
  return (
    <a
      href={whatsappLink(waMessages.general(), number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp"
      className="no-print fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center bg-[#0B5C29] text-white shadow-panel transition-colors hover:bg-[#084520]"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
