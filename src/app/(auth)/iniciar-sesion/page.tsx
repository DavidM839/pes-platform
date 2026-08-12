import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-navy-500">
        Accede a tu portal para consultar solicitudes y cotizaciones.
      </p>

      {params.error === 'sin-configurar' && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase aún no está configurado. Completa <code className="font-mono">.env.local</code> y
          ejecuta los scripts SQL para habilitar el portal y el panel administrativo. Mientras tanto
          puedes recorrer la parte pública del sitio.
        </div>
      )}

      {params.error === 'cuenta-inactiva' && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Tu cuenta está inactiva. Comunícate con el equipo de PES.
        </div>
      )}

      <LoginForm next={params.next} />

      <p className="mt-8 text-center text-sm text-navy-500">
        Nuevo cliente?{' '}
        <Link href="/registro" className="font-semibold text-navy-800 hover:text-navy-600">
          Crear cuenta
        </Link>{' '}
        o{' '}
        <Link href="/solicitar" className="font-semibold text-gold-700 hover:text-gold-700">
          solicitar servicio
        </Link>
      </p>
    </div>
  );
}
