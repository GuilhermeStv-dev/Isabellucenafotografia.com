alter table public.fotos enable row level security;

drop policy if exists fotos_select_public on public.fotos;
create policy fotos_select_public
on public.fotos
for select
to anon
using (ativo = true);

drop policy if exists fotos_select_authenticated on public.fotos;
create policy fotos_select_authenticated
on public.fotos
for select
to authenticated
using (true);

drop policy if exists fotos_insert_authenticated on public.fotos;
create policy fotos_insert_authenticated
on public.fotos
for insert
to authenticated
with check (true);

drop policy if exists fotos_update_authenticated on public.fotos;
create policy fotos_update_authenticated
on public.fotos
for update
to authenticated
using (true)
with check (true);

drop policy if exists fotos_delete_authenticated on public.fotos;
create policy fotos_delete_authenticated
on public.fotos
for delete
to authenticated
using (true);