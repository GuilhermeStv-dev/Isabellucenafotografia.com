// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAnonRead = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// ─── Nome do bucket (deve ser igual ao criado no Supabase) ───
export const BUCKET = 'Fotos';

export function getStoragePathFromPublicUrl(url = '') {
  const normalizado = decodeURIComponent(String(url));
  const markerPublic = `/storage/v1/object/public/${BUCKET}/`;
  const markerRender = `/storage/v1/render/image/public/${BUCKET}/`;

  const marker = normalizado.includes(markerPublic)
    ? markerPublic
    : (normalizado.includes(markerRender) ? markerRender : null);

  if (!marker) return null;

  const pathComQuery = normalizado.split(marker)[1];
  if (!pathComQuery) return null;

  return pathComQuery.split('?')[0] || null;
}

export function getTransformedFotoUrl(path, transform = {}) {
  if (!path) return '';
  return supabase.storage.from(BUCKET).getPublicUrl(path, { transform }).data.publicUrl;
}

/** Faz upload de um arquivo e retorna a URL pública */
export async function uploadFoto(file, categoria) {
  const ext = file.name.split('.').pop();
  const nome = `${categoria}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(nome, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.error('upload failed', { nome, error });
    throw error;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(nome).data.publicUrl;
}

/** Deleta uma foto do Storage pela URL pública */
export async function deleteFotoStorage(url) {
  const path = url.split(`/${BUCKET}/`)[1];
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}