alter table public.fotos
  add column if not exists placeholder text default null;

comment on column public.fotos.placeholder is
  'Base64 de thumbnail minúsculo (≈20px) gerado no upload. '
  'Exibido com CSS blur enquanto a imagem real carrega.';