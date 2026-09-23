import { useEffect, useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { ActionButton } from "@/components/site/kit";
import { createComment, getApprovedComments } from "@/services/comment-service";
import type { Comment } from "@/types/database";

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setLoading(true);
    getApprovedComments(postId)
      .then(setComments)
      .catch(() => setError("Comments could not be loaded right now."))
      .finally(() => setLoading(false));
  }, [postId]);
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || body.trim().length < 4) {
      setError("Please add your name and a comment before posting.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await createComment({
        post_id: postId,
        name: name.trim(),
        email: email.trim(),
        content: body.trim(),
      });
      setName("");
      setEmail("");
      setBody("");
      setNotice("Your comment has been submitted and is awaiting moderation.");
    } catch {
      setError("Your comment could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  const field =
    "w-full border-b border-border bg-transparent py-3 text-ink outline-none placeholder:text-muted-foreground focus-visible:border-primary";
  return (
    <section className="border-t border-border pt-14" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="heading-md flex items-center gap-3 text-ink">
        <MessageCircle className="size-5 text-clay" aria-hidden="true" />
        Comments ({comments.length})
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Comments are reviewed before they are visible publicly.
      </p>
      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading comments…</p>
      ) : (
        comments.length > 0 && (
          <ul className="mt-10 space-y-8">
            {comments.map((comment) => (
              <li key={comment.id} className="border-t border-border pt-6">
                <p className="text-sm font-semibold text-ink">{comment.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {comment.content}
                </p>
              </li>
            ))}
          </ul>
        )
      )}
      <form onSubmit={handleSubmit} className="mt-10 grid gap-6 md:max-w-2xl" noValidate>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="label-eyebrow text-clay">
              Name
            </label>
            <input
              id="comment-name"
              className={field}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="label-eyebrow text-clay">
              Email
            </label>
            <input
              id="comment-email"
              type="email"
              className={field}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              required
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-body" className="label-eyebrow text-clay">
            Comment
          </label>
          <textarea
            id="comment-body"
            className={`${field} min-h-28 resize-y`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            required
            disabled={submitting}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
        <div>
          <ActionButton type="submit" variant="outline" disabled={submitting}>
            {submitting ? "Submitting…" : "Post comment"}
          </ActionButton>
        </div>
      </form>
    </section>
  );
}
