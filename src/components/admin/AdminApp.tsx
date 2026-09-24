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
import { uploadBlogImage } from "@/services/media-service";
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
    : "Not published";
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
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${status === "published" || status === "approved" ? "bg-primary/10 text-primary" : status === "pending" ? "bg-gold/20 text-foreground" : status === "spam" || status === "rejected" || status === "archived" ? "bg-muted text-muted-foreground" : "bg-clay/10 text-clay"}`}
  >
    {status}
  </span>
);

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
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
      <div className="grid min-h-screen place-items-center bg-muted/30 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-clay" />
          Opening secure CMS…
        </div>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-clay">
            Content studio
          </p>
        </div>
      </div>
      <nav className="space-y-6" aria-label="CMS navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map(([to, label, Icon]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobile(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${path === to ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside
        className={`${mobile ? "fixed inset-y-0 left-0 z-50 flex" : "hidden md:flex"} w-72 flex-col border-r bg-background p-5 shadow-xl shadow-foreground/5 md:shadow-none`}
      >
        {navigation}
        <ProfileArea profile={profile} logout={logout} />
      </aside>
      {mobile && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
          className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[1px] md:hidden"
        />
      )}
      <div className="md:pl-72">
        <header className="flex h-16 items-center border-b bg-background px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Signed in as</span>
            <span className="rounded-full bg-muted px-3 py-1.5 font-medium">
              {profile.full_name || "Staff member"}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <Toaster richColors />
    </div>
  );
}
function ProfileArea({ profile, logout }: { profile: Profile; logout: () => void }) {
  return (
    <div className="mt-auto border-t pt-4">
      <div className="mb-3 flex items-center gap-3 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
      .then((profile) => {
        if (active && profile && ["admin", "editor"].includes(profile.role)) {
          navigate({ to: "/uw-cms", replace: true });
        }
      })
      .catch(() => {
        // Visitors without a valid session remain on the sign-in page.
      });

    return () => {
      active = false;
    };
  }, [navigate]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
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
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-ink-foreground lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-15 [background:radial-gradient(circle_at_20%_20%,var(--color-gold),transparent_30%),radial-gradient(circle_at_90%_80%,var(--color-clay),transparent_38%)]" />
        <div className="relative flex items-center gap-3">
          <img
            src={logo}
            alt="Unity Welcome"
            className="h-11 w-11 rounded-full bg-cream p-1 object-contain"
          />
          <span className="font-bold">Unity Welcome</span>
        </div>
        <div className="relative my-auto max-w-md">
          <p className="label-eyebrow text-gold">Settlement Agency</p>
          <h1 className="mt-5 font-display text-5xl leading-tight">
            Carefully sharing the stories that strengthen our community.
          </h1>
          <p className="mt-6 max-w-sm leading-7 text-ink-foreground/75">
            A secure workspace for the people who keep Unity Welcome’s resources, stories, and
            conversations current.
          </p>
        </div>
        <p className="relative text-sm text-ink-foreground/60">Unity Welcome Settlement Agency</p>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl shadow-foreground/5 sm:p-9"
        >
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <img src={logo} alt="Unity Welcome" className="h-10 w-10 object-contain" />
              <span className="font-bold">Unity Welcome</span>
            </div>
            <p className="label-eyebrow text-clay">Staff portal</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in with your authorized staff account to continue.
            </p>
          </div>
          {error && (
            <div
              role="alert"
              className="mb-5 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
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
                onClick={() => setShowPassword((value) => !value)}
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
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="label-eyebrow mb-2 text-clay">Content management</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
    {action}
  </div>
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
  <section className={`rounded-xl border bg-background p-5 shadow-sm ${className}`}>
    <h2 className="mb-3 font-semibold">{title}</h2>
    {children}
  </section>
);
const Empty = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <div className="rounded-xl border border-dashed bg-background p-8 text-center">
    <p className="font-semibold">{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
const ErrorNotice = ({ text }: { text: string }) => (
  <div
    role="alert"
    className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
  >
    {text}
  </div>
);

export function Dashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getPostsForAdmin(), getCommentsForModeration(), getCategories()])
      .then(([p, c, ca]) => {
        setPosts(p);
        setComments(c);
        setCategories(ca);
      })
      .catch(() => setError("We couldn't load the dashboard. Please refresh and try again."));
  }, []);
  if (error) return <ErrorNotice text={error} />;
  const stats = [
    ["Published posts", posts.filter((x) => x.status === "published").length],
    ["Drafts", posts.filter((x) => x.status === "draft").length],
    ["Pending comments", comments.filter((x) => x.status === "pending").length],
    ["Categories", categories.length],
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
      <div className="mb-7 rounded-xl border bg-primary px-5 py-6 text-primary-foreground shadow-sm sm:px-7">
        <p className="label-eyebrow text-primary-foreground/70">Workspace overview</p>
        <h2 className="mt-2 text-xl font-bold">
          Keep Unity Welcome’s stories useful, accurate, and ready to share.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-background p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent posts">
          {posts.length ? (
            posts.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to="/uw-cms/blog/$id/edit"
                params={{ id: p.id }}
                className="flex items-center justify-between gap-3 border-t py-3 text-sm first:border-t-0 hover:text-primary"
              >
                <span className="min-w-0 truncate font-medium">{p.title}</span>
                <StatusBadge status={p.status} />
              </Link>
            ))
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
        <Panel title="Recent comments">
          {comments.length ? (
            comments.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                to="/uw-cms/comments"
                className="block border-t py-3 first:border-t-0 hover:text-primary"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{c.content}</p>
              </Link>
            ))
          ) : (
            <Empty
              title="No comments yet"
              text="Visitor comments will appear here when they arrive."
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
        text="Create, manage and publish Unity Welcome stories."
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
          action={
            !posts.length ? (
              <Button asChild>
                <Link to="/uw-cms/blog/new">
                  <Plus />
                  Create post
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-background shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Title", "Category", "Status", "Published", "Updated", "Actions"].map((x) => (
                    <th className="px-4 py-3 font-semibold" key={x}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr className="border-t" key={p.id}>
                    <td className="max-w-64 px-4 py-4">
                      <p className="truncate font-semibold">{p.title}</p>
                      {p.featured && <span className="text-xs text-clay">Featured</span>}
                    </td>
                    <td className="px-4 py-4">{category(p.category_id)}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{fmt(p.published_at)}</td>
                    <td className="px-4 py-4 text-muted-foreground">{fmt(p.updated_at)}</td>
                    <td className="px-4 py-4">
                      <PostActions post={p} act={act} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <article className="rounded-xl border bg-background p-4 shadow-sm" key={p.id}>
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{p.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category(p.category_id)}
                      {p.featured ? " · Featured" : ""}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Updated {fmt(p.updated_at)}</p>
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
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link to="/uw-cms/blog/$id/edit" params={{ id: post.id }}>
          <PenLine />
          Edit
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
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm("Archive this post?"))
              void act(() => archivePost(post.id), "Post archived.");
          }}
        >
          <Archive />
          Archive
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          if (confirm("Delete this post permanently?"))
            void act(() => deletePost(post.id), "Post deleted.");
        }}
        aria-label={`Delete ${post.title}`}
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
      <div className="rounded-xl border bg-background p-6 text-sm text-muted-foreground">
        Loading post…
      </div>
    );
  return (
    <section>
      <Title
        title={id ? "Edit post" : "New post"}
        text="Changes are saved only when you choose an action."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Content">
            <div className="space-y-5">
              <Field label="Title" hint="Use a clear, reader-friendly headline.">
                <Input
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
          <Panel title="Media">
            <p className="mb-3 text-sm text-muted-foreground">
              Upload a cover image for this story.
            </p>
            {form.cover_image && (
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="mb-3 aspect-video w-full rounded-lg object-cover"
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
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={submit} className="h-fit rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="font-semibold">{edit ? "Edit category" : "New category"}</h2>
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
            <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
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
  const [filter, setFilter] = useState("pending");
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
  const displayed = comments.filter((c) => c.status === filter);
  return (
    <section>
      <Title title="Comments" text="Review and moderate visitor comments." />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["pending", "approved", "rejected", "spam"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
            className="capitalize"
          >
            {s}
            <span className="ml-1 opacity-70">{comments.filter((c) => c.status === s).length}</span>
          </Button>
        ))}
      </div>
      {displayed.length ? (
        <div className="space-y-3">
          {displayed.map((c) => (
            <article
              className={`rounded-xl border bg-background p-4 shadow-sm ${c.status === "pending" ? "border-gold/60" : ""}`}
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
                  <p className="mt-3 text-sm leading-6">{c.content}</p>
                </div>
                <div className="flex h-fit flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => void act(() => approveComment(c.id), "Comment approved.")}
                  >
                    <Check />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void act(() => rejectComment(c.id), "Comment rejected.")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void act(() => markCommentAsSpam(c.id), "Marked as spam.")}
                  >
                    Spam
                  </Button>
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
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadBlogImage(file);
      setUrl(result.publicUrl);
      toast.success("Image uploaded. Copy its URL into a post if needed.");
    } catch (e) {
      toast.error(userMessage(e));
    } finally {
      setUploading(false);
    }
  };
  return (
    <section>
      <Title title="Media" text="Upload approved images for blog posts." />
      <Panel title="Upload an image" className="max-w-2xl">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploading}
          onChange={(e) => void upload(e.target.files?.[0])}
        />
        <p className="mt-2 text-sm text-muted-foreground">JPEG, PNG, WebP, or GIF up to 5 MB.</p>
        {uploading && (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clay" />
            Uploading image…
          </p>
        )}
        {url && (
          <div className="mt-5 rounded-lg border bg-muted/20 p-3">
            <img
              src={url}
              alt="Uploaded image preview"
              className="max-h-80 w-full rounded-md object-contain"
            />
            <label className="mt-4 block text-xs font-semibold text-muted-foreground">
              Image URL
              <Input readOnly className="mt-1" value={url} aria-label="Uploaded image URL" />
            </label>
          </div>
        )}
      </Panel>
    </section>
  );
}
