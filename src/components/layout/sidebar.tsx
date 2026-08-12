'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { signOut } from '@/lib/actions/auth';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  user: { name: string; email: string; role?: string };
  title?: string;
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Navegacion lateral sobre blanco.
 * El item activo se marca con un relleno dorado tenue, una barra dorada a la
 * izquierda y texto navy: suficiente contraste sin recurrir a fondos oscuros.
 */
function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-3">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors',
              active
                ? 'bg-mist font-semibold text-navy-900'
                : 'font-medium text-navy-600 hover:bg-mist hover:text-navy-900',
            )}
          >
            {active && (
              <span
                className="absolute inset-y-0 left-0 w-[3px] bg-gold-400"
                aria-hidden
              />
            )}
            <item.icon
              className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-navy-900' : 'text-navy-300')}
              aria-hidden
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({ user }: { user: SidebarProps['user'] }) {
  return (
    <div className="border-t border-navy-100 p-3">
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-navy-900 font-mono text-[10px] font-medium text-white">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900">{user.name}</p>
          <p className="truncate font-mono text-[10px] text-navy-400">{user.email}</p>
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="mt-0.5 flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-navy-600 transition-colors hover:bg-mist hover:text-navy-900"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 text-navy-300" aria-hidden />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

export function Sidebar({ items, user, title }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barra superior movil */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-navy-100 bg-white px-4 lg:hidden">
        <Logo height={30} href="/" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center text-navy-700 hover:bg-mist"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Cajón móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/25" onClick={() => setOpen(false)} aria-hidden />
          <aside className="relative flex h-full w-[280px] flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-navy-100 px-4">
              <Logo height={30} href="/" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center text-navy-700 hover:bg-mist"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks items={items} onNavigate={() => setOpen(false)} />
            <UserBlock user={user} />
          </aside>
        </div>
      )}

      {/* Sidebar de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-navy-100 bg-white lg:flex">
        <div className="flex h-[68px] shrink-0 items-center border-b border-navy-100 px-5">
          <Logo height={32} href="/" />
        </div>
        {title && (
          <p className="border-b border-navy-100 px-4 pb-3 pt-4 font-mono text-[10px] font-medium uppercase tracking-eyebrow text-navy-400">
            {title}
          </p>
        )}
        <NavLinks items={items} />
        <UserBlock user={user} />
      </aside>
    </>
  );
}
