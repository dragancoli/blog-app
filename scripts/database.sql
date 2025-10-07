create table users
(
    id            serial
        primary key,
    username      varchar(255) not null
        unique,
    email         varchar(255) not null
        unique,
    password_hash varchar(255) not null,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP,
    bio           text,
    avatar_url    text,
    updated_at    timestamp with time zone default CURRENT_TIMESTAMP
);

alter table users
    owner to postgres;

create table posts
(
    id             serial
        primary key,
    title          varchar(255)                       not null,
    content        text                               not null,
    author_id      integer                            not null
        constraint fk_author
            references users
            on delete cascade,
    created_at     timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at     timestamp with time zone default CURRENT_TIMESTAMP,
    comments_count integer                  default 0 not null,
    image_url      text
);

alter table posts
    owner to postgres;

create table comments
(
    id         serial
        primary key,
    post_id    integer not null
        references posts
            on delete cascade,
    user_id    integer not null
        references users
            on delete cascade,
    parent_id  integer
        references comments
            on delete cascade,
    content    text    not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP
);

alter table comments
    owner to postgres;

create index idx_comments_post_id
    on comments (post_id);

create index idx_comments_post_parent
    on comments (post_id, parent_id);

create index idx_comments_user_id
    on comments (user_id);

create function trigger_set_timestamp() returns trigger
    language plpgsql
as
$$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

alter function trigger_set_timestamp() owner to postgres;

create trigger set_timestamp
    before update
    on posts
    for each row
execute procedure trigger_set_timestamp();

create trigger comments_set_timestamp
    before update
    on comments
    for each row
execute procedure trigger_set_timestamp();

create function increment_comments_count() returns trigger
    language plpgsql
as
$$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

alter function increment_comments_count() owner to postgres;

create trigger trg_comments_inc
    after insert
    on comments
    for each row
execute procedure increment_comments_count();

create function decrement_comments_count() returns trigger
    language plpgsql
as
$$
BEGIN
  UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

alter function decrement_comments_count() owner to postgres;

create trigger trg_comments_dec
    after delete
    on comments
    for each row
execute procedure decrement_comments_count();

create function user_set_timestamp() returns trigger
    language plpgsql
as
$$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

alter function user_set_timestamp() owner to postgres;

create trigger trg_users_set_timestamp
    before update
    on users
    for each row
execute procedure user_set_timestamp();