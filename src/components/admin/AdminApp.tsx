import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  FileText,
  Tags,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
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

const nav = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/blog", "Posts", FileText],
  ["/admin/categories", "Categories", Tags],
  ["/admin/comments", "Comments", MessageSquare],
  ["/admin/media", "Media", ImageIcon],
] as const;
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const fmt = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "—");
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";
const sanitizeContent = sanitizeRichHtml;

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
          navigate({ to: "/admin/login", replace: true });
      })
      .catch(() => {
        setProfile(null);
        navigate({ to: "/admin/login", replace: true });
      });
  }, [navigate]);
  if (profile === undefined)
    return <div className="min-h-screen grid place-items-center">Loading secure CMS…</div>;
  if (!profile) return null;
  const logout = async () => {
    try {
      await signOut();
      navigate({ to: "/admin/login" });
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside
        className={`${mobile ? "fixed inset-y-0 left-0 z-50" : "hidden md:flex"} w-64 flex-col border-r bg-background p-4`}
      >
        <div className="mb-8 text-xl font-bold">
          Unity <span className="text-clay">CMS</span>
        </div>
        <nav className="space-y-1">
          {nav.map(([to, label, Icon]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobile(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${path === to ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t pt-4">
          <p className="text-sm font-semibold">{profile.full_name || "Staff member"}</p>
          <p className="mb-3 text-xs capitalize text-muted-foreground">{profile.role}</p>
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>
      {mobile && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <div className="md:pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile(true)}>
            <Menu />
          </Button>
          <p className="ml-auto text-sm text-muted-foreground">
            Signed in as {profile.full_name || profile.role}
          </p>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
      </div>
      <Toaster richColors />
    </div>
  );
}

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      const p = await getCurrentProfile();
      if (!p || !["admin", "editor"].includes(p.role)) {
        await signOut();
        throw new Error("Your account is not authorized for the CMS.");
      }
      toast.success("Welcome back.");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm"
      >
        <p className="text-sm font-semibold text-clay">UNITY WELCOME</p>
        <h1 className="mt-2 text-2xl font-bold">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your authorized staff account to access the CMS.
        </p>
        <label className="mt-6 block text-sm font-medium">
          Email
          <Input
            type="email"
            className="mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <Input
            type="password"
            className="mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <Button className="mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <Toaster richColors />
    </div>
  );
}

export function Dashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]),
    [comments, setComments] = useState<Comment[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getPostsForAdmin(), getCommentsForModeration(), getCategories()])
      .then(([p, c, ca]) => {
        setPosts(p);
        setComments(c);
        setCategories(ca);
      })
      .catch((e) => setError(errorText(e)));
  }, []);
  if (error) return <ErrorNotice text={error} />;
  const stats = [
    ["Total Posts", posts.length],
    ["Published", posts.filter((x) => x.status === "published").length],
    ["Drafts", posts.filter((x) => x.status === "draft").length],
    ["Pending Comments", comments.filter((x) => x.status === "pending").length],
    ["Categories", categories.length],
  ];
  return (
    <section>
      <Title title="Dashboard" text="Your publishing overview." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([l, v]) => (
          <div key={String(l)} className="rounded-lg border bg-background p-5">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-2 text-3xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent posts">
          {posts.slice(0, 5).map((p) => (
            <div className="flex justify-between border-b py-3 text-sm" key={p.id}>
              <span>{p.title}</span>
              <span className="capitalize text-muted-foreground">{p.status}</span>
            </div>
          ))}
        </Panel>
        <Panel title="Recent comments">
          {comments.slice(0, 5).map((c) => (
            <div className="border-b py-3 text-sm" key={c.id}>
              <b>{c.name}</b>
              <p className="line-clamp-1 text-muted-foreground">{c.content}</p>
            </div>
          ))}
        </Panel>
      </div>
    </section>
  );
}
const Title = ({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
    {action}
  </div>
);
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border bg-background p-5">
    <h2 className="font-semibold">{title}</h2>
    {children}
  </div>
);
const ErrorNotice = ({ text }: { text: string }) => (
  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-destructive">
    {text}
  </div>
);
export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all");
  const load = () =>
    Promise.all([getPostsForAdmin(), getCategories()])
      .then(([p, c]) => {
        setPosts(p);
        setCategories(c);
      })
      .catch((e) => toast.error(errorText(e)));
  useEffect(() => {
    void load();
  }, []);
  const filtered = posts.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );
  const category = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "Uncategorized";
  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      load();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <section>
      <Title
        title="Posts"
        text="Create, publish, and organize your stories."
        action={
          <Button asChild>
            <Link to="/admin/blog/new">
              <Plus /> New post
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search posts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {["draft", "published", "archived"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              {["Title", "Category", "Status", "Featured", "Published", "Updated", "Actions"].map(
                (x) => (
                  <th className="p-3 font-medium" key={x}>
                    {x}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr className="border-b" key={p.id}>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{category(p.category_id)}</td>
                <td className="p-3 capitalize">{p.status}</td>
                <td className="p-3">{p.featured ? "Yes" : "—"}</td>
                <td className="p-3">{fmt(p.published_at)}</td>
                <td className="p-3">{fmt(p.updated_at)}</td>
                <td className="p-3 flex gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/blog/$id/edit" params={{ id: p.id }}>
                      Edit
                    </Link>
                  </Button>
                  {p.status !== "published" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => act(() => publishPost(p.id), "Post published.")}
                    >
                      Publish
                    </Button>
                  )}
                  {p.status !== "archived" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Archive this post?"))
                          act(() => archivePost(p.id), "Post archived.");
                      }}
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this post permanently?"))
                        act(() => deletePost(p.id), "Post deleted.");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
  const [form, setForm] = useState<FormState>(blank),
    [categories, setCategories] = useState<Category[]>([]),
    [loading, setLoading] = useState(!!id),
    [saving, setSaving] = useState(false),
    [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => toast.error(errorText(e)));
    if (id)
      getPostByIdForAdmin(id)
        .then((p) => {
          if (!p) {
            toast.error("Post not found.");
            nav({ to: "/admin/blog" });
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
        .catch((e) => toast.error(errorText(e)));
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
      toast.error(errorText(e));
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
        content: sanitizeContent(form.content),
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
      nav({ to: "/admin/blog" });
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <p>Loading post…</p>;
  return (
    <section>
      <Title
        title={id ? "Edit post" : "New post"}
        text="Changes are saved only when you choose an action."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <label className="block text-sm font-medium">
            Title
            <Input
              className="mt-1"
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </label>
          <label className="block text-sm font-medium">
            Slug
            <Input
              className="mt-1"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
            />
          </label>
          <label className="block text-sm font-medium">
            Excerpt
            <Textarea
              className="mt-1"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">Content</label>
          <RichTextEditor value={form.content} onChange={(v) => set("content", v)} />
          <label className="block text-sm font-medium">
            SEO title
            <Input
              className="mt-1"
              value={form.seo_title}
              onChange={(e) => set("seo_title", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            SEO description
            <Textarea
              className="mt-1"
              value={form.seo_description}
              onChange={(e) => set("seo_description", e.target.value)}
            />
          </label>
        </div>
        <aside className="space-y-5 rounded-lg border bg-background p-5">
          <label className="block text-sm font-medium">
            Category
            <select
              className="mt-1 w-full rounded-md border p-2"
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
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={form.featured} onCheckedChange={(v) => set("featured", !!v)} />{" "}
            Featured post
          </label>
          <div>
            <p className="text-sm font-medium">Cover image</p>
            {form.cover_image && (
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="mt-2 aspect-video w-full rounded object-cover"
              />
            )}
            <Input
              className="mt-2"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => upload(e.target.files?.[0])}
            />
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, or GIF; max 5 MB.</p>
          </div>
          <div className="space-y-2">
            <Button className="w-full" disabled={saving} onClick={() => save("draft")}>
              {saving ? "Saving…" : "Save draft"}
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              disabled={saving}
              onClick={() => save("published")}
            >
              Publish
            </Button>
            {id && (
              <Button
                className="w-full"
                variant="outline"
                disabled={saving}
                onClick={() => save("archived")}
              >
                Archive
              </Button>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
export function Categories() {
  const [items, setItems] = useState<Category[]>([]),
    [form, setForm] = useState({ name: "", slug: "", description: "" }),
    [edit, setEdit] = useState<string | null>(null);
  const load = () =>
    getCategories()
      .then(setItems)
      .catch((e) => toast.error(errorText(e)));
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
      load();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <section>
      <Title title="Categories" text="Organize posts with clear, reusable categories." />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-lg border bg-background p-5">
          <h2 className="font-semibold">{edit ? "Edit category" : "New category"}</h2>
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: edit ? f.slug : slugify(e.target.value),
              }))
            }
          />
          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
          />
          <Textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
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
        </form>
        <div className="rounded-lg border bg-background">
          {items.map((c) => (
            <div className="flex items-center justify-between border-b p-4" key={c.id}>
              <div>
                <b>{c.name}</b>
                <p className="text-sm text-muted-foreground">
                  {c.slug}
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
                  onClick={() => {
                    if (confirm("Delete this category? Posts will remain uncategorized."))
                      deleteCategory(c.id)
                        .then(() => {
                          toast.success("Category deleted.");
                          load();
                        })
                        .catch((e) =>
                          toast.error(
                            "This category could not be deleted. It may still be in use.",
                          ),
                        );
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Comments() {
  const [comments, setComments] = useState<Comment[]>([]),
    [posts, setPosts] = useState<BlogPost[]>([]),
    [filter, setFilter] = useState("pending");
  const load = () =>
    Promise.all([getCommentsForModeration(), getPostsForAdmin()])
      .then(([c, p]) => {
        setComments(c);
        setPosts(p);
      })
      .catch((e) => toast.error(errorText(e)));
  useEffect(() => {
    void load();
  }, []);
  const act = (fn: () => Promise<unknown>, msg: string) =>
    fn()
      .then(() => {
        toast.success(msg);
        load();
      })
      .catch((e) => toast.error(errorText(e)));
  return (
    <section>
      <Title title="Comments" text="Review comments before they are visible publicly." />
      <div className="mb-4 flex gap-2">
        {["pending", "approved", "rejected", "spam"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {comments
          .filter((c) => c.status === filter)
          .map((c) => (
            <article className="rounded-lg border bg-background p-4" key={c.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <b>{c.name}</b>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {fmt(c.created_at)} ·{" "}
                    {posts.find((p) => p.id === c.post_id)?.title || "Deleted post"}
                  </span>
                  <p className="mt-2">{c.content}</p>
                </div>
                <div className="flex h-fit flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => act(() => approveComment(c.id), "Comment approved.")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => act(() => rejectComment(c.id), "Comment rejected.")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => act(() => markCommentAsSpam(c.id), "Marked as spam.")}
                  >
                    Spam
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this comment permanently?"))
                        act(() => deleteComment(c.id), "Comment deleted.");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </article>
          ))}
      </div>
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
      toast.error(errorText(e));
    } finally {
      setUploading(false);
    }
  };
  return (
    <section>
      <Title title="Media" text="Upload approved images for blog posts." />
      <div className="max-w-xl rounded-lg border bg-background p-6">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploading}
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <p className="mt-2 text-sm text-muted-foreground">JPEG, PNG, WebP, or GIF up to 5 MB.</p>
        {uploading && <p className="mt-3 text-sm">Uploading…</p>}
        {url && (
          <>
            <img src={url} alt="Uploaded image" className="mt-5 max-h-80 rounded object-contain" />
            <Input readOnly className="mt-3" value={url} />
          </>
        )}
      </div>
    </section>
  );
}
