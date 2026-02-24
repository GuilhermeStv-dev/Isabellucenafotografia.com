-- Views consolidadas para dashboards de Web Vitals
-- Pré-requisito: tabela public.web_vitals criada via supabase/web_vitals.sql

create or replace view public.vw_web_vitals_daily_route_metric as
select
  date_trunc('day', created_at)::date as dia,
  coalesce(nullif(pathname, ''), '/') as rota,
  name as metrica,
  count(*) as amostras,
  round(avg(value)::numeric, 3) as media,
  round(percentile_cont(0.75) within group (order by value)::numeric, 3) as p75
from public.web_vitals
where value is not null
group by 1, 2, 3;

create or replace view public.vw_web_vitals_core_route_p75_7d as
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
from p
group by rota;

create or replace view public.vw_web_vitals_weekly_regression as
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
 and prev.rk = 2;
