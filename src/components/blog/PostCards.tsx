import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { PublicBlogPost } from "@/services/blog-service";

export function formatPostDate(iso: string | null): string {
  if (!iso) return "Recently published";
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readingTime(content: string): number {
  return Math.max(
    1,
    Math.ceil(
      content
        .replace(/<[^>]*>/g, " ")
        .trim()
        .split(/\s+/).length / 200,
    ),
  );
}

export function PostMeta({
  post,
  tone = "dark",
}: {
  post: PublicBlogPost;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={`label-eyebrow flex flex-wrap items-center gap-3 ${tone === "dark" ? "text-clay" : "text-gold"}`}
    >
      <span>{post.category?.name ?? "Unity Welcome"}</span>
      <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
      <span className="text-muted-foreground">{formatPostDate(post.published_at)}</span>
      <span className="text-muted-foreground">· {readingTime(post.content)} min read</span>
    </p>
  );
}

export function FeaturedPost({ post }: { post: PublicBlogPost }) {
  return (
    <article className="grid gap-10 lg:grid-cols-12 lg:items-center">
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="group block lg:col-span-7"
        aria-label={post.title}
      >
        <div className="aspect-[16/10] overflow-hidden rounded-sm bg-cream-deep">
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={`Cover image for ${post.title}`}
              width={1200}
              height={750}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="lg:col-span-5">
        <PostMeta post={post} />
        <h3 className="display-serif mt-5 text-ink">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-clay">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
        )}
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="group mt-7 inline-flex items-center gap-3 text-sm font-semibold text-primary hover:text-clay"
        >
          Read story
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: PublicBlogPost }) {
  return (
    <article>
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
        <div className="aspect-[4/3] overflow-hidden rounded-sm bg-cream-deep">
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={`Cover image for ${post.title}`}
              width={800}
              height={600}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </div>
        <div className="mt-5">
          <PostMeta post={post} />
          <h3 className="mt-3 text-lg font-bold tracking-tight text-ink group-hover:text-clay">
            {post.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
