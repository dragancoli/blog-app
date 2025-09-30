CREATE TABLE public.comments (
    id          SERIAL PRIMARY KEY,
    post_id     INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id   INTEGER NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER comments_set_timestamp
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_post_parent ON public.comments(post_id, parent_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

ALTER TABLE public.posts ADD COLUMN comments_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_inc
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.increment_comments_count();

CREATE TRIGGER trg_comments_dec
AFTER DELETE ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.decrement_comments_count();

/* UPIT
SELECT c.id, c.content, c.created_at, c.updated_at,
       c.parent_id, c.user_id,
       u.username AS author
FROM comments c
JOIN users u ON u.id = c.user_id
WHERE c.post_id = $1
ORDER BY c.created_at ASC;
*/
