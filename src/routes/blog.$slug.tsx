import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPostBySlug, getPublishedPosts, type PublicBlogPost } from "@/services/blog-service";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { ActionLink } from "@/components/site/kit";
import { PageTransition, ParallaxImage, Reveal } from "@/components/site/motion";
import { formatPostDate, PostCard, PostMeta } from "@/components/blog/PostCards";
import { CommentSection } from "@/components/blog/CommentSection";
import { CTASection } from "@/components/site/CTASection";
import { absoluteUrl, DEFAULT_OG_IMAGE, postDescription } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      return { post: await getPostBySlug(params.slug) };
    } catch {
      return { post: null };
    }
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    const url = absoluteUrl(`/blog/${params.slug}`);
    if (!post) {
      return {
        meta: [
          { title: "Story not found — Unity Welcome Settlement Agency" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    const title = post.seo_title?.trim() || `${post.title} — Unity Welcome Settlement Agency`;
    const description = post.seo_description?.trim() || postDescription(post.excerpt, post.content);
    const image = post.cover_image ? absoluteUrl(post.cover_image) : DEFAULT_OG_IMAGE;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "article:published_time", content: post.published_at ?? post.created_at },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            url,
            datePublished: post.published_at ?? post.created_at,
            dateModified: post.updated_at,
            image,
            author: { "@type": "Person", name: post.author?.full_name || "Unity Welcome" },
            publisher: { "@type": "Organization", name: "Unity Welcome Settlement Agency" },
          }),
        },
      ],
    };
  },
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
  const { post } = Route.useLoaderData();
  const [related, setRelated] = useState<PublicBlogPost[]>([]);
  useEffect(() => {
    if (!post) return;
    getPublishedPosts()
      .then((posts) =>
        setRelated(
          posts
            .filter((item) => item.id !== post.id)
            .sort(
              (a, b) =>
                Number(b.category_id === post.category_id) -
                Number(a.category_id === post.category_id),
            )
            .slice(0, 3),
        ),
      )
      .catch(() => setRelated([]));
  }, [post]);
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
              alt={`Cover image for ${post.title}`}
              width={1600}
              height={900}
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
