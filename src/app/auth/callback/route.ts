import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Callback de confirmación de correo y recuperacion de contraseña. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
        return NextResponse.redirect(`${origin}${next || (data?.role === 'admin' ? '/admin' : '/portal')}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/iniciar-sesion?error=enlace-invalido`);
}
