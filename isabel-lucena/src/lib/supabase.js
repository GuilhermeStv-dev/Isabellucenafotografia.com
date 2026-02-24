// src/lib/supabase.js
// ─────────────────────────────────────────────────────
// Substitua os valores abaixo pelos do seu projeto Supabase
// Você encontra em: supabase.com → seu projeto → Settings → API
// ─────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;  // ← cole aqui

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Helpers de Storage ───────────────────────────────

/** Faz upload de um arquivo e retorna a URL pública */
export async function uploadFoto(file, categoria) {
  const ext = file.name.split('.').pop();
  const nome = `${categoria}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('fotos')
    .upload(nome, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('fotos').getPublicUrl(nome);
  return data.publicUrl;
}

/** Deleta uma foto do Storage pela URL pública */
export async function deleteFotoStorage(url) {
  // Extrai o path relativo da URL pública
  const path = url.split('/fotos/')[1];
  if (!path) return;
  await supabase.storage.from('fotos').remove([path]);
}
