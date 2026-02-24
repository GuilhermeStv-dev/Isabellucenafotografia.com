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
  // generate a more robust unique name to avoid collisions
  const nome = `${categoria}/${Date.now()}-${Math.floor(Math.random()*1e6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from('fotos')
    // allow upsert so repeated uploads with same name don't blow up
    .upload(nome, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.error('upload failed', { nome, error });
    throw error;
  }
  console.log('upload succeeded', { nome, data });

  return supabase.storage.from('fotos').getPublicUrl(nome).data.publicUrl;
}

/** Deleta uma foto do Storage pela URL pública */
export async function deleteFotoStorage(url) {
  // Extrai o path relativo da URL pública
  const path = url.split('/fotos/')[1];
  if (!path) return;
  await supabase.storage.from('fotos').remove([path]);
}
