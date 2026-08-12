import { redirect } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react';
import { Sidebar, type NavItem } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { getSessionUser } from '@/lib/supabase/queries';

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: ReceiptText },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/servicios', label: 'Servicios', icon: Package },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/configuración', label: 'Configuración', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/iniciar-sesion?next=/admin');
  if (user.role !== 'admin') redirect('/portal');

  const identity = { name: user.full_name || 'PES Coordinación', email: user.email };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar items={NAV} title="Panel administrativo" user={identity} />
      <div className="lg:pl-[260px]">
        <Topbar items={NAV} user={identity} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
