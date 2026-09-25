import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Archive,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PenLine,
  Plus,
  ShieldCheck,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import logo from "@/assets/UWSA_LOGO-03.png";
import { signInWithPassword, signOut } from "@/lib/supabase/auth";
import { getCurrentProfile } from "@/lib/supabase/admin";
import {
  createPost,
  updatePost,
  getPostsForAdmin,
  getPostByIdForAdmin,
  publishPost,
  archivePost,
  deletePost,
} from "@/services/blog-service";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category-service";
import {
  approveComment,
  deleteComment,
  getCommentsForModeration,
  markCommentAsSpam,
  rejectComment,
} from "@/services/comment-service";
import {
  deleteBlogImage,
  listBlogImages,
  uploadBlogImage,
  type MediaImage,
} from "@/services/media-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { RichTextEditor } from "./RichTextEditor";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import type { BlogPost, Category, Comment, Profile } from "@/types/database";

const navGroups = [
  { label: "Overview", items: [["/uw-cms", "Dashboard", LayoutDashboard]] },
  {
    label: "Content",
    items: [
      ["/uw-cms/blog", "Blog posts", FileText],
      ["/uw-cms/categories", "Categories", Tags],
      ["/uw-cms/media", "Media", ImageIcon],
    ],
  },
  { label: "Engagement", items: [["/uw-cms/comments", "Comments", MessageSquare]] },
] as const;
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const fmt = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "—";
const userMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("authorized")) return "This account is not authorized to access the CMS.";
  if (
    message.includes("sign in") ||
    message.includes("credential") ||
    message.includes("authentication")
  )
    return "We couldn't sign you in with those credentials.";
  if (message.includes("network") || message.includes("temporarily unavailable"))
    return "The service is temporarily unavailable. Please try again.";
  return "We couldn't complete that request. Please try again.";
};
const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex rounded-sm border px-2 py-0.5 text-[11px] font-semibold capitalize ${status === "published" || status === "approved" ? "border-primary/20 bg-primary/10 text-primary" : status === "pending" ? "border-gold/50 bg-gold/15 text-foreground" : status === "draft" ? "border-clay/20 bg-clay/10 text-clay" : "border-border bg-muted text-muted-foreground"}`}
  >
    {status}
  </span>
);

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    getCurrentProfile()
      .then((p) => {
        setProfile(p);
        if (!p || !["admin", "editor"].includes(p.role))
          navigate({ to: "/uw-cms/login", replace: true });
      })
      .catch(() => {
        setProfile(null);
        navigate({ to: "/uw-cms/login", replace: true });
      });
  }, [navigate]);
  if (profile === undefined)
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-sm text-muted-foreground">
        Opening secure CMS…
      </div>
    );
  if (!profile) return null;
  const logout = async () => {
    try {
      await signOut();
      navigate({ to: "/uw-cms/login" });
    } catch {
      toast.error("We couldn't sign you out. Please try again.");
    }
  };
  const navigation = (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <img src={logo} alt="Unity Welcome" className="h-9 w-9 object-contain" />
        <div>
          <p className="text-sm font-bold tracking-tight">Unity Welcome</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-clay">CMS</p>
        </div>
      </div>
      <nav className="space-y-6" aria-label="CMS navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(([to, label, Icon]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobile(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${path === to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
  return (
    <div className="min-h-screen bg-cream text-foreground">
      <aside
        className={`${mobile ? "fixed inset-y-0 left-0 z-50 flex" : "hidden md:fixed md:inset-y-0 md:left-0 md:flex"} w-60 flex-col border-r bg-background p-4`}
      >
        {navigation}
        <ProfileArea profile={profile} logout={logout} />
      </aside>
      {mobile && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
          className="fixed inset-0 z-40 bg-ink/30 md:hidden"
        />
      )}
      <div className="md:pl-60">
        <div className="flex h-14 items-center border-b bg-background px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <span className="ml-2 text-sm font-semibold">Unity Welcome CMS</span>
        </div>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
      <Toaster richColors />
    </div>
  );
}
function ProfileArea({ profile, logout }: { profile: Profile; logout: () => void }) {
  return (
    <div className="mt-auto border-t pt-4">
      <div className="mb-3 flex items-center gap-3 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {(profile.full_name || "S").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile.full_name || "Staff member"}</p>
          <p className="text-xs capitalize text-muted-foreground">{profile.role}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={logout}
      >
        <LogOut />
        Sign out
      </Button>
    </div>
  );
}

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getCurrentProfile()
      .then((p) => {
        if (active && p && ["admin", "editor"].includes(p.role))
          navigate({ to: "/uw-cms", replace: true });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [navigate]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Enter your email and password.");
    setError("");
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      const p = await getCurrentProfile();
      if (!p || !["admin", "editor"].includes(p.role)) {
        await signOut();
        throw new Error("not authorized");
      }
      navigate({ to: "/uw-cms" });
    } catch (err) {
      setError(userMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-2">
      <aside className="hidden border-r bg-ink p-12 text-ink-foreground lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Unity Welcome"
            className="h-10 w-10 rounded-full bg-cream p-1 object-contain"
          />
          <span className="font-semibold">Unity Welcome</span>
        </div>
        <div className="my-auto max-w-lg border-l-2 border-gold pl-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
            Settlement Agency
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.08]">
            A careful home for community stories.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-ink-foreground/70">
            Secure tools for the team that keeps Unity Welcome’s resources, stories, and
            conversations current.
          </p>
        </div>
        <p className="text-xs text-ink-foreground/55">Unity Welcome Settlement Agency</p>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="mb-9">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <img src={logo} alt="Unity Welcome" className="h-10 w-10 object-contain" />
              <span className="font-semibold">Unity Welcome</span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-clay">
              Staff portal
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in with your authorized staff account to continue.
            </p>
          </div>
          {error && (
            <div
              role="alert"
              className="mb-5 flex gap-2 border-l-2 border-destructive bg-destructive/5 p-3 text-sm text-destructive"
            >
              <X className="mt-0.5 shrink-0" size={16} />
              {error}
            </div>
          )}
          <label className="block text-sm font-semibold" htmlFor="admin-email">
            Email
            <Input
              id="admin-email"
              type="email"
              className="mt-2 h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="mt-5 block text-sm font-semibold" htmlFor="admin-password">
            Password
            <div className="relative mt-2">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className="h-11 pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </label>
          <Button className="mt-7 h-11 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
            <ChevronRight aria-hidden="true" />
          </Button>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} aria-hidden="true" />
            Secure staff access
          </p>
        </form>
      </main>
      <Toaster richColors />
    </div>
  );
}

const Title = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b pb-5">
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
    </div>
    {action}
  </header>
);
const Panel = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`border bg-background ${className}`}>
    <div className="border-b px-5 py-3">
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);
const Empty = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <div className="border border-dashed bg-background px-6 py-10 text-center">
    <p className="font-semibold">{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
const ErrorNotice = ({ text }: { text: string }) => (
  <div
    role="alert"
    className="border-l-2 border-destructive bg-destructive/5 p-4 text-sm text-destructive"
  >
    {text}
  </div>
);

export function Dashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getPostsForAdmin(), getCommentsForModeration()])
      .then(([p, c]) => {
        setPosts(p);
        setComments(c);
      })
      .catch(() => setError("We couldn't load the dashboard. Please refresh and try again."));
  }, []);
  if (error) return <ErrorNotice text={error} />;
  const pending = comments.filter((c) => c.status === "pending");
  const stats = [
    ["Published", posts.filter((p) => p.status === "published").length],
    ["Drafts", posts.filter((p) => p.status === "draft").length],
    ["Pending comments", pending.length],
    ["Posts with images", posts.filter((p) => p.cover_image).length],
  ];
  return (
    <section>
      <Title
        title="Dashboard"
        text="Overview of your website content and activity."
        action={
          <Button asChild>
            <Link to="/uw-cms/blog/new">
              <Plus />
              New post
            </Link>
          </Button>
        }
      />
      <div className="mb-7 flex flex-col justify-between gap-4 border-l-2 border-clay bg-background px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold">Welcome back</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage Unity Welcome’s content, stories and community activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/uw-cms/comments">Manage comments</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/uw-cms/media">Upload media</Link>
          </Button>
        </div>
      </div>
      <div className="grid border border-b-0 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="border-b px-5 py-4 xl:border-r xl:last:border-r-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Panel title="Recent posts">
          {posts.length ? (
            <div className="divide-y">
              {posts.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to="/uw-cms/blog/$id/edit"
                  params={{ id: p.id }}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary"
                >
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" className="h-10 w-14 shrink-0 object-cover" />
                  ) : (
                    <div className="grid h-10 w-14 shrink-0 place-items-center bg-muted text-muted-foreground">
                      <FileText size={15} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Updated {fmt(p.updated_at)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No posts yet"
              text="Create your first story to start building the blog."
              action={
                <Button size="sm" asChild>
                  <Link to="/uw-cms/blog/new">
                    <Plus />
                    Create post
                  </Link>
                </Button>
              }
            />
          )}
        </Panel>
        <Panel title="Comments requiring attention">
          {pending.length ? (
            <div className="divide-y">
              {pending.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to="/uw-cms/comments"
                  className="block py-3 first:pt-0 last:pb-0 hover:text-primary"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <span className="text-xs text-muted-foreground">{fmt(c.created_at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.content}</p>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Nothing needs review"
              text="New visitor comments will appear here for moderation."
            />
          )}
        </Panel>
      </div>
    </section>
  );
}

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [error, setError] = useState("");
  const load = () =>
    Promise.all([getPostsForAdmin(), getCategories()])
      .then(([p, c]) => {
        setPosts(p);
        setCategories(c);
        setError("");
      })
      .catch(() => setError("We couldn't load posts. Please try again."));
  useEffect(() => {
    void load();
  }, []);
  const filtered = posts.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (categoryId === "all" || p.category_id === categoryId) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );
  const category = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "Uncategorized";
  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      void load();
    } catch (e) {
      toast.error(userMessage(e));
    }
  };
  return (
    <section>
      <Title
        title="Blog posts"
        text="Manage and publish Unity Welcome stories."
        action={
          <Button asChild>
            <Link to="/uw-cms/blog/new">
              <Plus />
              New post
            </Link>
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search posts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 sm:max-w-sm"
          aria-label="Search posts"
        />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {["draft", "published", "archived"].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <ErrorNotice text={error} />
      ) : !filtered.length ? (
        <Empty
          title={posts.length ? "No matching posts" : "No posts yet"}
          text={
            posts.length
              ? "Try changing your search or filters."
              : "Create your first story to start building the blog."
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden border bg-background md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Post", "Category", "Status", "Featured", "Published", "Actions"].map((x) => (
                    <th className="px-4 py-3 font-semibold" key={x}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr className="border-b last:border-0" key={p.id}>
                    <td className="max-w-sm px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.cover_image ? (
                          <img src={p.cover_image} alt="" className="h-10 w-14 object-cover" />
                        ) : (
                          <div className="h-10 w-14 bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.title}</p>
                          {p.excerpt && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {p.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{category(p.category_id)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.featured ? "Yes" : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(p.published_at)}</td>
                    <td className="px-4 py-3">
                      <PostActions post={p} act={act} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <article className="border bg-background p-4" key={p.id}>
                <div className="flex gap-3">
                  {p.cover_image && (
                    <img src={p.cover_image} alt="" className="h-12 w-16 object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold">{p.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {category(p.category_id)} · {fmt(p.published_at)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4">
                  <PostActions post={p} act={act} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
function PostActions({
  post,
  act,
}: {
  post: BlogPost;
  act: (fn: () => Promise<unknown>, message: string) => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/uw-cms/blog/$id/edit" params={{ id: post.id }} aria-label={`Edit ${post.title}`}>
          <PenLine />
        </Link>
      </Button>
      {post.status !== "published" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void act(() => publishPost(post.id), "Post published.")}
        >
          Publish
        </Button>
      )}
      {post.status !== "archived" && (
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Archive ${post.title}`}
          onClick={() => {
            if (confirm("Archive this post?"))
              void act(() => archivePost(post.id), "Post archived.");
          }}
        >
          <Archive />
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        aria-label={`Delete ${post.title}`}
        onClick={() => {
          if (confirm("Delete this post permanently?"))
            void act(() => deletePost(post.id), "Post deleted.");
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string;
  featured: boolean;
  seo_title: string;
  seo_description: string;
};
const blank: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "",
  featured: false,
  seo_title: "",
  seo_description: "",
};
export function PostEditor({ id }: { id?: string }) {
  const nav = useNavigate();
  const [form, setForm] = useState<FormState>(blank);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => toast.error(userMessage(e)));
    if (id)
      getPostByIdForAdmin(id)
        .then((p) => {
          if (!p) {
            toast.error("Post not found.");
            nav({ to: "/uw-cms/blog" });
            return;
          }
          setForm({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt || "",
            content: p.content,
            cover_image: p.cover_image || "",
            category_id: p.category_id || "",
            featured: p.featured,
            seo_title: p.seo_title || "",
            seo_description: p.seo_description || "",
          });
          setLoading(false);
          return undefined;
        })
        .catch((e) => toast.error(userMessage(e)));
  }, [id, nav]);
  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));
  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const image = await uploadBlogImage(file);
      set("cover_image", image.publicUrl);
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error(userMessage(e));
    }
  };
  const save = async (status: "draft" | "published" | "archived") => {
    if (!form.title || !form.slug || !form.content.replace(/<[^>]*>/g, "").trim()) {
      toast.error("Title, slug, and content are required.");
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        content: sanitizeRichHtml(form.content),
        excerpt: form.excerpt || null,
        cover_image: form.cover_image || null,
        category_id: form.category_id || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };
      if (id) await updatePost(id, data);
      else await createPost(data);
      toast.success(
        status === "published"
          ? "Post published."
          : status === "archived"
            ? "Post archived."
            : "Draft saved.",
      );
      nav({ to: "/uw-cms/blog" });
    } catch (e) {
      toast.error(userMessage(e));
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="border bg-background p-6 text-sm text-muted-foreground">Loading post…</div>
    );
  return (
    <section>
      <Title
        title={id ? "Edit post" : "New post"}
        text="Write the story, then use publishing settings to save or publish it."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Panel title="Content">
            <div className="space-y-5">
              <Field label="Title">
                <Input
                  className="h-12 text-lg font-semibold"
                  value={form.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Slug" hint="Used in the public URL.">
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Excerpt" hint="A short summary for previews and sharing.">
                <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
              </Field>
              <Field label="Story content">
                <RichTextEditor value={form.content} onChange={(v) => set("content", v)} />
              </Field>
            </div>
          </Panel>
          <Panel title="SEO">
            <div className="space-y-5">
              <Field label="SEO title" hint="Optional title for search results.">
                <Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
              </Field>
              <Field label="SEO description" hint="Optional summary for search results.">
                <Textarea
                  value={form.seo_description}
                  onChange={(e) => set("seo_description", e.target.value)}
                />
              </Field>
            </div>
          </Panel>
        </div>
        <aside className="space-y-6">
          <Panel title="Publishing">
            <Field label="Category">
              <select
                className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <label className="mt-5 flex items-center gap-3 text-sm font-semibold">
              <Checkbox checked={form.featured} onCheckedChange={(v) => set("featured", !!v)} />
              Feature this post
            </label>
            <div className="mt-6 space-y-2">
              <Button className="w-full" disabled={saving} onClick={() => void save("published")}>
                {saving ? "Saving…" : "Publish post"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled={saving}
                onClick={() => void save("draft")}
              >
                Save draft
              </Button>
              {id && (
                <Button
                  className="w-full"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => void save("archived")}
                >
                  Archive post
                </Button>
              )}
            </div>
          </Panel>
          <Panel title="Cover image">
            {form.cover_image && (
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="mb-3 aspect-video w-full object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => void upload(e.target.files?.[0])}
            />
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WebP, or GIF; max 5 MB.</p>
          </Panel>
        </aside>
      </div>
    </section>
  );
}
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function Categories() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [edit, setEdit] = useState<string | null>(null);
  const load = () =>
    getCategories()
      .then(setItems)
      .catch((e) => toast.error(userMessage(e)));
  useEffect(() => {
    void load();
  }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (edit) await updateCategory(edit, { ...form, description: form.description || null });
      else await createCategory({ ...form, description: form.description || null });
      toast.success(edit ? "Category updated." : "Category created.");
      setForm({ name: "", slug: "", description: "" });
      setEdit(null);
      void load();
    } catch (e) {
      toast.error(userMessage(e));
    }
  };
  return (
    <section>
      <Title title="Categories" text="Organize posts with clear, reusable categories." />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <form onSubmit={submit} className="h-fit border bg-background p-5">
          <h2 className="text-sm font-semibold">{edit ? "Edit category" : "New category"}</h2>
          <div className="mt-5 space-y-4">
            <Field label="Name">
              <Input
                value={form.name}
                required
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: edit ? f.slug : slugify(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                required
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <Button>{edit ? "Save category" : "Create category"}</Button>
            {edit && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEdit(null);
                  setForm({ name: "", slug: "", description: "" });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        <div>
          {items.length ? (
            <div className="border bg-background">
              {items.map((c) => (
                <article
                  className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-b-0"
                  key={c.id}
                >
                  <div>
                    <h2 className="font-semibold">{c.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      /{c.slug}
                      {c.description ? ` · ${c.description}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEdit(c.id);
                        setForm({ name: c.name, slug: c.slug, description: c.description || "" });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${c.name}`}
                      onClick={() => {
                        if (confirm("Delete this category? Posts will remain uncategorized."))
                          deleteCategory(c.id)
                            .then(() => {
                              toast.success("Category deleted.");
                              void load();
                            })
                            .catch((e) => toast.error(userMessage(e)));
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title="No categories yet"
              text="Create a category to help organize your stories."
            />
          )}
        </div>
      </div>
    </section>
  );
}

export function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState("all");
  const load = () =>
    Promise.all([getCommentsForModeration(), getPostsForAdmin()])
      .then(([c, p]) => {
        setComments(c);
        setPosts(p);
      })
      .catch((e) => toast.error(userMessage(e)));
  useEffect(() => {
    void load();
  }, []);
  const act = (fn: () => Promise<unknown>, msg: string) =>
    fn()
      .then(() => {
        toast.success(msg);
        void load();
      })
      .catch((e) => toast.error(userMessage(e)));
  const displayed = filter === "all" ? comments : comments.filter((c) => c.status === filter);
  const statuses = ["all", "pending", "approved", "rejected", "spam"];
  return (
    <section>
      <Title
        title="Comments"
        text="Review visitor conversations and moderate community discussion."
      />
      <div
        className="mb-5 flex gap-1 overflow-x-auto border-b"
        role="tablist"
        aria-label="Comment status filters"
      >
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium capitalize ${filter === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {s}
            <span className="ml-1.5 text-xs opacity-70">
              {s === "all" ? comments.length : comments.filter((c) => c.status === s).length}
            </span>
          </button>
        ))}
      </div>
      {displayed.length ? (
        <div className="border bg-background">
          {displayed.map((c) => (
            <article
              className={`border-b p-5 last:border-b-0 ${c.status === "pending" ? "border-l-2 border-l-gold" : ""}`}
              key={c.id}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{c.name}</h2>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fmt(c.created_at)} ·{" "}
                    {posts.find((p) => p.id === c.post_id)?.title || "Deleted post"}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-6">{c.content}</p>
                </div>
                <div className="flex h-fit flex-wrap gap-1">
                  {c.status !== "approved" && (
                    <Button
                      size="sm"
                      onClick={() => void act(() => approveComment(c.id), "Comment approved.")}
                    >
                      <Check />
                      Approve
                    </Button>
                  )}
                  {c.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void act(() => rejectComment(c.id), "Comment rejected.")}
                    >
                      Reject
                    </Button>
                  )}
                  {c.status !== "spam" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void act(() => markCommentAsSpam(c.id), "Marked as spam.")}
                    >
                      Spam
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete comment from ${c.name}`}
                    onClick={() => {
                      if (confirm("Delete this comment permanently?"))
                        void act(() => deleteComment(c.id), "Comment deleted.");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={`No ${filter} comments`}
          text="Comments in this moderation state will appear here."
        />
      )}
    </section>
  );
}

export function Media() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const load = () =>
    listBlogImages()
      .then(setImages)
      .catch(() => setError("We couldn't load the media library. Please try again."));
  useEffect(() => {
    void load();
  }, []);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadBlogImage(file);
      toast.success("Image uploaded.");
      void load();
    } catch (e) {
      toast.error(userMessage(e));
    } finally {
      setUploading(false);
    }
  };
  const remove = async (image: MediaImage) => {
    if (!confirm(`Delete ${image.name}? This cannot be undone.`)) return;
    try {
      await deleteBlogImage(image.path);
      toast.success("Image deleted.");
      void load();
    } catch (e) {
      toast.error(userMessage(e));
    }
  };
  return (
    <section>
      <Title
        title="Media"
        text="Manage approved images for blog posts."
        action={
          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus />
            {uploading ? "Uploading…" : "Upload image"}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(e) => void upload(e.target.files?.[0])}
            />
          </label>
        }
      />
      {error ? (
        <ErrorNotice text={error} />
      ) : images.length ? (
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image) => (
            <article key={image.path} className="group relative bg-background">
              <img
                src={image.publicUrl}
                alt={image.name}
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-xs text-muted-foreground">{image.name}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  aria-label={`Delete ${image.name}`}
                  onClick={() => void remove(image)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No media yet"
          text="Upload an approved image to use it in a blog post."
          action={
            <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
              <Plus />
              Upload image
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => void upload(e.target.files?.[0])}
              />
            </label>
          }
        />
      )}
    </section>
  );
}
