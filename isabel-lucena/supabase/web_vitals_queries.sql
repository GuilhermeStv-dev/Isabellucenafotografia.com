-- Queries prontas para analisar Web Vitals
-- Tabela base esperada: public.web_vitals

-- 1) Resumo diário por rota e métrica (média, p75, amostras)
select
  date_trunc('day', created_at) as dia,
  coalesce(nullif(pathname, ''), '/') as rota,
  name as metrica,
  count(*) as amostras,
  round(avg(value)::numeric, 3) as media,
  round(percentile_cont(0.75) within group (order by value)::numeric, 3) as p75
from public.web_vitals
where value is not null
group by 1, 2, 3
order by dia desc, rota, metrica;

-- 2) Painel "Core Web Vitals" por rota (p75)
-- LCP <= 2500ms | INP <= 200ms | CLS <= 0.1
with base as (
  select
    coalesce(nullif(pathname, ''), '/') as rota,
    name,
    value
  from public.web_vitals
  where name in ('LCP', 'INP', 'CLS')
    and value is not null
), p75 as (
  select
    rota,
    name,
    percentile_cont(0.75) within group (order by value) as p75
  from base
  group by rota, name
)
select
  rota,
  round(max(case when name = 'LCP' then p75 end)::numeric, 2) as lcp_p75_ms,
  round(max(case when name = 'INP' then p75 end)::numeric, 2) as inp_p75_ms,
  round(max(case when name = 'CLS' then p75 end)::numeric, 4) as cls_p75,
  case
    when max(case when name = 'LCP' then p75 end) <= 2500
      and max(case when name = 'INP' then p75 end) <= 200
      and max(case when name = 'CLS' then p75 end) <= 0.1
    then 'ok'
    else 'atencao'
  end as status
from p75
group by rota
order by status desc, rota;

-- 3) Tendência de 14 dias por métrica
select
  date_trunc('day', created_at) as dia,
  name as metrica,
  round(percentile_cont(0.75) within group (order by value)::numeric, 3) as p75,
  count(*) as amostras
from public.web_vitals
where created_at >= now() - interval '14 days'
  and value is not null
  and name in ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')
group by 1, 2
order by dia asc, metrica;

-- 4) Regressão da semana atual vs semana anterior
with weekly as (
  select
    date_trunc('week', created_at) as semana,
    name,
    percentile_cont(0.75) within group (order by value) as p75
  from public.web_vitals
  where value is not null
    and name in ('LCP', 'INP', 'CLS')
    and created_at >= now() - interval '21 days'
  group by 1, 2
), ranked as (
  select
    semana,
    name,
    p75,
    row_number() over (partition by name order by semana desc) as rk
  from weekly
)
select
  atual.name as metrica,
  round(atual.p75::numeric, 3) as p75_semana_atual,
  round(prev.p75::numeric, 3) as p75_semana_anterior,
  round((atual.p75 - prev.p75)::numeric, 3) as delta,
  case
    when atual.name = 'CLS' and (atual.p75 - prev.p75) > 0.01 then 'regrediu'
    when atual.name in ('LCP', 'INP') and (atual.p75 - prev.p75) > 50 then 'regrediu'
    else 'ok'
  end as status
from ranked atual
join ranked prev
  on atual.name = prev.name
 and atual.rk = 1
 and prev.rk = 2
order by metrica;

-- 5) Top rotas mais críticas (últimos 7 dias)
with p as (
  select
    coalesce(nullif(pathname, ''), '/') as rota,
    name,
    percentile_cont(0.75) within group (order by value) as p75
  from public.web_vitals
  where created_at >= now() - interval '7 days'
    and value is not null
    and name in ('LCP', 'INP', 'CLS')
  group by 1, 2
)
select
  rota,
  max(case when name = 'LCP' then round(p75::numeric, 2) end) as lcp_p75,
  max(case when name = 'INP' then round(p75::numeric, 2) end) as inp_p75,
  max(case when name = 'CLS' then round(p75::numeric, 4) end) as cls_p75
from p
group by rota
order by
  (coalesce(max(case when name = 'LCP' then p75 end), 0) / 2500.0)
+ (coalesce(max(case when name = 'INP' then p75 end), 0) / 200.0)
+ (coalesce(max(case when name = 'CLS' then p75 end), 0) / 0.1) desc
limit 10;
