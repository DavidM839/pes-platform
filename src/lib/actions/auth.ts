'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, profileSchema, recoverSchema, registerSchema } from '@/lib/validations/auth';
import { siteConfig } from '@/config/site';
import type { ActionResult } from '@/types';

function fieldErrors(e: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = e.flatten().fieldErrors;
  const cleaned: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat)) if (v) cleaned[k] = v;
  return cleaned;
}

/** Traduce los errores de Supabase Auth al espanol. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
  if (m.includes('password')) return 'La contraseña no cumple los requisitos minimos.';
  return 'No pudimos completar la operacion. Intenta de nuevo.';
}

export async function signIn(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos ingresados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: translateAuthError(error.message) };

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single();

  const next = String(formData.get('next') ?? '');
  revalidatePath('/', 'layout');
  redirect(next || (profile?.role === 'admin' ? '/admin' : '/portal'));
}

export async function signUp(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    full_name: String(formData.get('full_name') ?? '').trim(),
    company_name: String(formData.get('company_name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    confirm_password: String(formData.get('confirm_password') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos ingresados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const { email, password, full_name, company_name, phone } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, company_name: company_name || null, phone, role: 'client' },
      emailRedirectTo: `${siteConfig.url}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: translateAuthError(error.message) };

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordReset(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = recoverSchema.safeParse({ email: String(formData.get('email') ?? '').trim() });
  if (!parsed.success) {
    return { ok: false, error: 'Ingresa un correo valido.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteConfig.url}/auth/callback?type=recovery`,
  });

  // Respuesta identica exista o no la cuenta, para no revelar correos registrados.
  return {
    ok: true,
    message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
  };
}

export async function updateProfile(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    full_name: String(formData.get('full_name') ?? '').trim(),
    company_name: String(formData.get('company_name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos ingresados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión expiró. Inicia sesión de nuevo.' };

  const { full_name, company_name, phone } = parsed.data;

  const [u, c] = await Promise.all([
    supabase.from('users').update({ full_name, phone }).eq('id', user.id),
    supabase
      .from('client_profiles')
      .update({ full_name, company_name: company_name || null, phone })
      .eq('user_id', user.id),
  ]);

  if (u.error || c.error) return { ok: false, error: 'No pudimos guardar los cambios.' };

  revalidatePath('/portal/perfil');
  return { ok: true, message: 'Perfil actualizado correctamente.' };
}
