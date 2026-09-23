import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getFeaturedPosts, getPublishedPosts, type PublicBlogPost } from "@/services/blog-service";
import { SectionLabel } from "@/components/site/kit";
import { Reveal } from "@/components/site/motion";
import { FeaturedPost, PostCard } from "@/components/blog/PostCards";

export function LatestFromBlog() {
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([getFeaturedPosts(), getPublishedPosts()])
      .then(([featured, published]) =>
        setPosts(
          featured.length
            ? [
                ...featured,
                ...published.filter((post) => !featured.some((item) => item.id === post.id)),
              ]
            : published,
        ),
      )
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  const [featured, ...secondary] = posts;
  return (
    <section className="container-page py-24 md:py-36" aria-labelledby="latest-heading">
      <div className="flex flex-col gap-6 border-t border-border pt-10 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel>Latest from Unity Welcome</SectionLabel>
          <h2 id="latest-heading" className="display-lg mt-6 max-w-2xl text-ink">
            Stories, updates and community perspectives
          </h2>
        </div>
        <Link
          to="/blog"
          className="group inline-flex items-center gap-3 text-sm font-semibold text-primary hover:text-clay"
        >
          View all stories
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
      {loading ? (
        <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Loading the latest stories…
        </p>
      ) : failed ? (
        <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          We could not load stories right now. Please try again soon.
        </p>
      ) : featured ? (
        <>
          <div className="mt-14">
            <FeaturedPost post={featured} />
          </div>
          {secondary.slice(0, 3).length > 0 && (
            <ul className="mt-16 grid gap-12 md:grid-cols-3">
              {secondary.slice(0, 3).map((post, i) => (
                <Reveal key={post.slug} delay={i * 0.06}>
                  <li>
                    <PostCard post={post} />
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Our newsroom is being prepared. Until the first article is published, you can read real
          accounts from the people we support on our{" "}
          <Link to="/stories" className="font-semibold text-primary hover:text-clay">
            community stories
          </Link>{" "}
          page.
        </p>
      )}
    </section>
  );
}
