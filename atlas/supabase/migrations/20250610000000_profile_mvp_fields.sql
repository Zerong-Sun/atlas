-- MVP profile fields: gender for engine accuracy, interests for personalization
alter table profiles add column if not exists gender text check (gender in ('male', 'female'));
alter table profiles add column if not exists interests text[] default '{}';
