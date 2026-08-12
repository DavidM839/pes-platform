import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricRow } from '@/components/ui/stat-card';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/misc';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatDateShort, formatGallons, formatRelative } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import type { RequestStatus, ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Dashboard' };

async function countBy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  statuses: RequestStatus[],
) {
  const { count } = await supabase
    .from('service_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', statuses);
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [nuevas, verificando, programados, completados] = await Promise.all([
    countBy(supabase, ['solicitud_recibida']),
    countBy(supabase, ['verificando_disponibilidad']),
    countBy(supabase, ['servicio_programado']),
    countBy(supabase, ['servicio_completado']),
  ]);

  const [{ count: cotPendientes }, { count: cotAprobadas }] = await Promise.all([
    supabase.from('quotations').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('quotations').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ]);

  const { data: recent } = await supabase
    .from('service_requests')
    .select(
      'id, request_number, service_type, quantity_gal, quantity_unknown, preferred_date, status, urgency, address_line, province, created_at, client_profiles(full_name, company_name)',
    )
    .order('created_at', { ascending: false })
    .limit(10);

  const list = (recent ?? []) as unknown as (ServiceRequest & {
    client_profiles: { full_name: string; company_name: string | null } | null;
  })[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel administrativo"
        title="Dashboard"
        description="Resumen operativo de Panama Energy Solutions."
      />

      <MetricRow
        metrics={[
          { label: 'Solicitudes nuevas', value: nuevas, href: '/admin/solicitudes?estado=solicitud_recibida', accent: nuevas > 0 },
          { label: 'Verificando', value: verificando, href: '/admin/solicitudes?estado=verificando_disponibilidad' },
          { label: 'Cotiz. pendientes', value: cotPendientes ?? 0, href: '/admin/cotizaciones?estado=sent' },
          { label: 'Cotiz. aprobadas', value: cotAprobadas ?? 0, href: '/admin/cotizaciones?estado=approved' },
          { label: 'Programados', value: programados, href: '/admin/solicitudes?estado=servicio_programado' },
          { label: 'Completados', value: completados, href: '/admin/solicitudes?estado=servicio_completado' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes recientes</CardTitle>
          <Link href="/admin/solicitudes" className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-500">
            Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </CardHeader>

        {list.length === 0 ? (
          <EmptyState title="Sin solicitudes registradas" description="Las nuevas solicitudes aparecerán aquí." />
        ) : (
          <TableWrapper>
            <Table className="min-w-[880px]">
              <Thead>
                <tr>
                  <Th>Número</Th>
                  <Th>Cliente</Th>
                  <Th>Servicio</Th>
                  <Th>Cantidad</Th>
                  <Th>Ubicación</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acción</Th>
                </tr>
              </Thead>
              <tbody>
                {list.map((r) => (
                  <Tr key={r.id}>
                    <Td className="font-semibold text-navy-900">
                      {r.request_number}
                      {r.urgency === 'urgente' && <span className="ml-2"><UrgencyBadge urgency="urgente" /></span>}
                      <span className="mt-0.5 block text-xs font-normal text-navy-300">
                        {formatRelative(r.created_at)}
                      </span>
                    </Td>
                    <Td>
                      <span className="block font-medium text-navy-900">{r.client_profiles?.full_name ?? '-'}</span>
                      {r.client_profiles?.company_name && (
                        <span className="block text-xs text-navy-500">{r.client_profiles.company_name}</span>
                      )}
                    </Td>
                    <Td>{SERVICE_LABELS[r.service_type]}</Td>
                    <Td>{r.quantity_unknown ? 'Por definir' : formatGallons(r.quantity_gal)}</Td>
                    <Td className="max-w-[180px] truncate text-navy-500">{r.province}</Td>
                    <Td>{formatDateShort(r.preferred_date)}</Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td className="text-right">
                      <Link href={`/admin/solicitudes/${r.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                        Gestionar
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>
    </div>
  );
}
