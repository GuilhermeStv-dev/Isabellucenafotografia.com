// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Nome do bucket (deve ser igual ao criado no Supabase) ───
const BUCKET = 'Fotos';

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