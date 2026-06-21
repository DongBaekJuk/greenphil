-- GreenPhil community schema
-- 기능 단위: Supabase Auth 사용자를 공개 프로필, 게시글, 댓글, 좋아요, 신고 데이터와 연결합니다.

create type public.post_kind as enum ('one_line', 'post');
create type public.content_status as enum ('active', 'review', 'hidden');
create type public.report_target_type as enum ('post', 'comment');

-- 기능 단위: 로그인 사용자별 공개 프로필입니다. auth.users는 직접 노출하지 않고 이 테이블을 화면에 사용합니다.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  provider text,
  activity_level integer not null default 1,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 기능 단위: 한마디와 게시글을 같은 테이블에 저장하되 kind로 화면 포맷을 분리합니다.
create table public.posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind public.post_kind not null,
  title text,
  content text not null,
  filtered_content text not null,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  report_count integer not null default 0,
  view_count bigint not null default 0,
  status public.content_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_required_for_post check (kind = 'one_line' or nullif(btrim(title), '') is not null),
  constraint posts_title_empty_for_one_line check (kind = 'post' or title is null)
);

-- 기능 단위: 댓글은 게시글 상세 팝업에서 작성/조회합니다.
create table public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  filtered_content text not null,
  like_count integer not null default 0,
  report_count integer not null default 0,
  status public.content_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 기능 단위: 좋아요는 중복을 막고, 트리거가 카운트를 posts/comments에 반영합니다.
create table public.post_likes (
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comment_likes (
  comment_id bigint not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- 기능 단위: 신고 데이터는 추후 누적 게시글 취합 및 학습 데이터 후보로 사용합니다.
create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  target_id bigint not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

-- 기능 단위: 마이페이지의 스크랩 목록 확장 여지를 남깁니다.
create table public.scraps (
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index posts_kind_created_at_idx on public.posts (kind, created_at desc);
create index posts_popular_idx on public.posts (kind, created_at desc, like_count desc);
create index posts_author_idx on public.posts (author_id, created_at desc);
create index comments_post_idx on public.comments (post_id, created_at asc);
create index comments_author_idx on public.comments (author_id, created_at desc);
create index reports_target_idx on public.reports (target_type, target_id);

-- 기능 단위: updated_at을 공통으로 갱신합니다.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

create trigger comments_set_updated_at before update on public.comments
for each row execute function public.set_updated_at();

-- 기능 단위: Supabase Auth 가입 직후 public.profiles row를 자동 생성합니다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, provider)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'nickname', ''),
      split_part(new.email, '@', 1),
      'GreenPhil user'
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_app_meta_data ->> 'provider', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 기능 단위: 좋아요/댓글/신고 카운트를 목록 조회용 컬럼에 반영합니다.
create or replace function public.refresh_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_post_id bigint;
begin
  affected_post_id = coalesce(new.post_id, old.post_id);
  update public.posts
  set like_count = (select count(*) from public.post_likes where post_id = affected_post_id)
  where id = affected_post_id;
  return null;
end;
$$;

create trigger post_likes_refresh_count
after insert or delete on public.post_likes
for each row execute function public.refresh_post_like_count();

create or replace function public.refresh_comment_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_comment_id bigint;
begin
  affected_comment_id = coalesce(new.comment_id, old.comment_id);
  update public.comments
  set like_count = (select count(*) from public.comment_likes where comment_id = affected_comment_id)
  where id = affected_comment_id;
  return null;
end;
$$;

create trigger comment_likes_refresh_count
after insert or delete on public.comment_likes
for each row execute function public.refresh_comment_like_count();

create or replace function public.refresh_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_post_id bigint;
begin
  affected_post_id = coalesce(new.post_id, old.post_id);
  update public.posts
  set comment_count = (
    select count(*) from public.comments
    where post_id = affected_post_id and status in ('active', 'review')
  )
  where id = affected_post_id;
  return null;
end;
$$;

create trigger comments_refresh_post_count
after insert or update of status or delete on public.comments
for each row execute function public.refresh_post_comment_count();

create or replace function public.apply_report_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.target_type = 'post' then
    update public.posts
    set
      report_count = (select count(*) from public.reports where target_type = 'post' and target_id = new.target_id),
      status = case
        when (select count(*) from public.reports where target_type = 'post' and target_id = new.target_id) >= 5
          then 'review'::public.content_status
        else status
      end
    where id = new.target_id;

    update public.profiles
    set report_count = report_count + 1
    where id = (select author_id from public.posts where id = new.target_id);
  else
    update public.comments
    set
      report_count = (select count(*) from public.reports where target_type = 'comment' and target_id = new.target_id),
      status = case
        when (select count(*) from public.reports where target_type = 'comment' and target_id = new.target_id) >= 5
          then 'review'::public.content_status
        else status
      end
    where id = new.target_id;

    update public.profiles
    set report_count = report_count + 1
    where id = (select author_id from public.comments where id = new.target_id);
  end if;

  return new;
end;
$$;

create trigger reports_apply_count
after insert on public.reports
for each row execute function public.apply_report_count();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.comment_likes enable row level security;
alter table public.reports enable row level security;
alter table public.scraps enable row level security;

-- 기능 단위: 읽기는 공개, 쓰기는 로그인 사용자와 본인 소유 데이터 중심으로 제한합니다.
create policy "profiles are readable" on public.profiles
for select using (true);

create policy "users can create own profile" on public.profiles
for insert with check (auth.uid() = id);

create policy "users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "posts are readable" on public.posts
for select using (status in ('active', 'review'));

create policy "authenticated users can create posts" on public.posts
for insert with check (auth.uid() = author_id);

create policy "users can update own posts" on public.posts
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "users can delete own posts" on public.posts
for delete using (auth.uid() = author_id);

create policy "comments are readable" on public.comments
for select using (status in ('active', 'review'));

create policy "authenticated users can create comments" on public.comments
for insert with check (auth.uid() = author_id);

create policy "users can update own comments" on public.comments
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "users can delete own comments" on public.comments
for delete using (auth.uid() = author_id);

create policy "post likes are readable" on public.post_likes
for select using (true);

create policy "users can like posts" on public.post_likes
for insert with check (auth.uid() = user_id);

create policy "users can unlike posts" on public.post_likes
for delete using (auth.uid() = user_id);

create policy "comment likes are readable" on public.comment_likes
for select using (true);

create policy "users can like comments" on public.comment_likes
for insert with check (auth.uid() = user_id);

create policy "users can unlike comments" on public.comment_likes
for delete using (auth.uid() = user_id);

create policy "users can create reports" on public.reports
for insert with check (auth.uid() = reporter_id);

create policy "users can read own reports" on public.reports
for select using (auth.uid() = reporter_id);

create policy "scraps are readable by owner" on public.scraps
for select using (auth.uid() = user_id);

create policy "users can create scraps" on public.scraps
for insert with check (auth.uid() = user_id);

create policy "users can delete own scraps" on public.scraps
for delete using (auth.uid() = user_id);
