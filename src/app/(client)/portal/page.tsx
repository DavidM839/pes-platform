import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, ClipboardList, FileText, PlusCircle, ReceiptText } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { MetricRow } from '@/components/ui/stat-card';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableWrapper, Td, Th, Thead, Tr } from '@/components/ui/table';
import { RequestCard } from '@/components/request/request-card';
import { DisclaimerNotice } from '@/components/request/disclaimer-notice';
import { SERVICE_LABELS } from '@/lib/constants';
import { formatDateShort, formatGallons } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { getMyClientProfile } from '@/lib/supabase/queries';
import type { ServiceRequest } from '@/types';

export const metadata: Metadata = { title: 'Resumen' };

export default async function ClientDashboard() {
  const profile = await getMyClientProfile();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('service_requests')
    .select(
      'id, request_number, service_type, quantity_gal, quantity_unknown, preferred_date, status, urgency, address_line, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(8);

  const list = (requests ?? []) as ServiceRequest[];

  const { count: activas } = await supabase
    .from('service_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['solicitud_recibida', 'verificando_disponibilidad', 'cotizacion_enviada', 'cambios_solicitados']);

  const { count: pendientes } = await supabase
    .from('quotations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent');

  const { count: aprobadas } = await supabase
    .from('service_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['cotizacion_aprobada', 'servicio_programado']);

  const { count: completados } = await supabase
    .from('service_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'servicio_completado');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {profile?.full_name?.split(' ')[0] ?? 'bienvenido'}
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            Este es el resumen de tus solicitudes con Panama Energy Solutions.
          </p>
        </div>
        <ButtonLink href="/portal/solicitudes/nueva">
          <PlusCircle className="h-4 w-4" aria-hidden />
          Nueva solicitud
        </ButtonLink>
      </div>

      <MetricRow
        metrics={[
          { label: 'Activas', value: activas ?? 0, href: '/portal/solicitudes' },
          { label: 'Cotiz. pendientes', value: pendientes ?? 0, href: '/portal/cotizaciones', accent: (pendientes ?? 0) > 0 },
          { label: 'Aprobadas', value: aprobadas ?? 0 },
          { label: 'Completados', value: completados ?? 0 },
        ]}
      />

      {(pendientes ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gold-200 bg-gold-50 px-5 py-4">
          <p className="text-sm text-gold-900">
            Tienes {pendientes} {pendientes === 1 ? 'cotización pendiente' : 'cotizaciones pendientes'} de respuesta.
          </p>
          <ButtonLink href="/portal/cotizaciones" size="sm">Revisar ahora</ButtonLink>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes recientes</CardTitle>
          <Link href="/portal/solicitudes" className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-500">
            Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </CardHeader>

        {list.length === 0 ? (
          <EmptyState
            title="Aún no tienes solicitudes"
            description="Envía tu primera solicitud de diésel o agua potable y nuestro equipo te responderá con una cotización."
            actionLabel="Crear solicitud"
            actionHref="/portal/solicitudes/nueva"
          />
        ) : (
          <>
            {/* Movil: tarjetas */}
            <div className="space-y-3 p-4 md:hidden">
              {list.map((r) => (
                <RequestCard key={r.id} request={r} href={`/portal/solicitudes/${r.id}`} />
              ))}
            </div>

            {/* Escritorio: tabla */}
            <TableWrapper className="hidden md:block">
              <Table>
                <Thead>
                  <tr>
                    <Th>Número</Th>
                    <Th>Servicio</Th>
                    <Th>Cantidad</Th>
                    <Th>Fecha solicitada</Th>
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
                      </Td>
                      <Td>{SERVICE_LABELS[r.service_type]}</Td>
                      <Td>{r.quantity_unknown ? 'Por definir' : formatGallons(r.quantity_gal)}</Td>
                      <Td>{formatDateShort(r.preferred_date)}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td className="text-right">
                        <Link href={`/portal/solicitudes/${r.id}`} className="text-sm font-medium text-navy-700 hover:text-navy-500">
                          Ver detalles
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </>
        )}
      </Card>

      <DisclaimerNotice />
    </div>
  );
}
