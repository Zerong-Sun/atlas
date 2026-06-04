-- Remove paywall / quota schema (all features open access)
drop policy if exists "subscriptions_own" on subscriptions;
drop policy if exists "usage_quotas_own" on usage_quotas;

drop table if exists usage_quotas;
drop table if exists subscriptions;

alter table profiles drop column if exists free_reading_used;
