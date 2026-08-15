'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/contacto', label: 'Contacto' },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white">
      <div className="pes-container flex h-[68px] items-center justify-between gap-6">
        <Logo height={34} priority />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'border-b-2 pb-1 font-mono text-[11px] uppercase tracking-wide2 transition-colors',
                  active ? 'border-gold-400 text-navy-900' : 'border-transparent text-navy-600 hover:text-navy-900',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/iniciar-sesion"
            className="font-mono text-[11px] uppercase tracking-wide2 text-navy-600 hover:text-navy-900"
          >
            Iniciar sesión
          </Link>
          <ButtonLink href="/solicitar" size="sm">Solicitar cotización</ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center text-navy-900 hover:bg-mist lg:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn('border-t border-navy-100 bg-white lg:hidden', open ? 'block' : 'hidden')}>
        <nav className="pes-container flex flex-col divide-y divide-navy-100 py-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3.5 font-mono text-[12px] uppercase tracking-wide2 text-navy-700"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 py-4">
            <ButtonLink href="/solicitar" fullWidth onClick={() => setOpen(false)}>
              Solicitar servicio
            </ButtonLink>
            <ButtonLink href="/iniciar-sesion" variant="secondary" fullWidth onClick={() => setOpen(false)}>
              Iniciar sesión
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
