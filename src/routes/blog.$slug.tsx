import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPostBySlug, getPublishedPosts, type PublicBlogPost } from "@/services/blog-service";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { ActionLink } from "@/components/site/kit";
import { PageTransition, ParallaxImage, Reveal } from "@/components/site/motion";
import { formatPostDate, PostCard, PostMeta } from "@/components/blog/PostCards";
import { CommentSection } from "@/components/blog/CommentSection";
import { CTASection } from "@/components/site/CTASection";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Story — Unity Welcome Settlement Agency` },
      { name: "robots", content: "index,follow" },
      { property: "og:url", content: `/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  component: BlogPostPage,
});
function PostNotFound() {
  return (
    <div className="container-page py-44 text-center">
      <h1 className="display-lg text-ink">Story not found</h1>
      <p className="body-lead mt-6">This article is not available.</p>
      <div className="mt-10 flex justify-center">
        <ActionLink to="/blog">Back to all stories</ActionLink>
      </div>
    </div>
  );
}
function BlogPostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<PublicBlogPost | null | undefined>(undefined);
  const [related, setRelated] = useState<PublicBlogPost[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setPost(undefined);
    setFailed(false);
    Promise.all([getPostBySlug(slug), getPublishedPosts()])
      .then(([nextPost, posts]) => {
        setPost(nextPost);
        setRelated(
          nextPost
            ? posts
                .filter((item) => item.id !== nextPost.id)
                .sort(
                  (a, b) =>
                    Number(b.category_id === nextPost.category_id) -
                    Number(a.category_id === nextPost.category_id),
                )
                .slice(0, 3)
            : [],
        );
      })
      .catch(() => {
        setFailed(true);
        setPost(null);
      });
  }, [slug]);
  if (post === undefined)
    return (
      <div className="container-page py-44 text-center text-muted-foreground">Loading story…</div>
    );
  if (failed) {
    return (
      <div className="container-page py-44 text-center text-muted-foreground">
        We could not load this story right now. Please try again soon.
      </div>
    );
  }
  if (!post) return <PostNotFound />;
  return (
    <PageTransition>
      <article>
        <header className="container-page pt-36 pb-12 md:pt-44 md:pb-16">
          <PostMeta post={post} />
          <h1 className="display-lg mt-6 max-w-4xl text-ink">{post.title}</h1>
          {post.excerpt && <p className="body-lead mt-7 max-w-2xl">{post.excerpt}</p>}
          <p className="mt-8 text-sm text-muted-foreground">
            By {post.author?.full_name || "Unity Welcome"} · {formatPostDate(post.published_at)}
          </p>
        </header>
        {post.cover_image && (
          <div className="container-page">
            <ParallaxImage
              src={post.cover_image}
              alt=""
              className="aspect-[16/9] w-full rounded-sm"
              distance={30}
            />
          </div>
        )}
        <div className="container-page py-20 md:py-28">
          <div
            className="blog-content mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(post.content) }}
          />
          <div className="mx-auto mt-20 max-w-2xl">
            <CommentSection postId={post.id} />
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section
          className="border-t border-border py-20 md:py-28"
          aria-labelledby="related-stories"
        >
          <div className="container-page">
            <h2 id="related-stories" className="label-eyebrow text-clay">
              Related stories
            </h2>
            <ul className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.06}>
                  <li>
                    <PostCard post={item} />
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CTASection />
    </PageTransition>
  );
}
