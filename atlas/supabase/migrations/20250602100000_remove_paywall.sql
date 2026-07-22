-- Remove paywall / quota schema (all features open access)
-- Tables may never have existed on fresh projects; drop tables only (policies cascade).
drop table if exists usage_quotas cascade;
drop table if exists subscriptions cascade;

alter table profiles drop column if exists free_reading_used;
