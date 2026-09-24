import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { contactSubjects, org } from "@/data/site";
import { ActionButton, PageHeader, SectionLabel } from "@/components/site/kit";
import { PageTransition, Reveal } from "@/components/site/motion";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Unity Welcome Settlement Agency — We Are Here to Help" },
      {
        name: "description",
        content:
          "Contact Unity Welcome Settlement Agency for settlement support, volunteering, partnerships or general questions. Call +1 (519) 722-4339 or send us a message.",
      },
      { property: "og:title", content: "Contact Unity Welcome Settlement Agency" },
      {
        property: "og:description",
        content: "Reach our team for support, volunteering or partnership enquiries.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/contact") },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
  }),
  component: ContactPage,
});

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

const fieldClass =
  "mt-2 w-full rounded-sm border border-input bg-card px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

function ContactPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "");
    const message = String(data.get("message") ?? "").trim();

    if (name.length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (!subject) next.subject = "Please choose a reason for contacting us.";
    if (message.length < 10) next.message = "Please tell us a little more (at least 10 characters).";

    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      e.currentTarget.reset();
    }
  }

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Get in touch"
        title="Let's connect."
        lead="Whether you need support, want to volunteer, or have questions about our services, we would love to hear from you."
      />

      <section className="container-page grid gap-16 pb-24 md:pb-32 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-7">
          <h2 className="heading-md text-ink">Send us a message</h2>

          {sent ? (
            <Reveal>
              <div
                role="status"
                className="mt-8 rounded-sm border border-primary/25 bg-card p-10 text-center"
              >
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-6" aria-hidden="true" />
                </span>
                <h3 className="heading-md mt-6 text-ink">Thank you — your message is ready</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Our team reads every message. For urgent settlement support, please call{" "}
                  <a href={org.phoneHref} className="font-semibold text-primary">
                    {org.phone}
                  </a>{" "}
                  or email{" "}
                  <a href={`mailto:${org.email}`} className="font-semibold text-primary">
                    {org.email}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            </Reveal>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-ink">
                    Full name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={fieldClass}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-2 text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-ink">
                    Email address <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={fieldClass}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="text-sm font-semibold text-ink">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={fieldClass}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="text-sm font-semibold text-ink">
                    Reason for contacting <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    defaultValue=""
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    className={fieldClass}
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    {contactSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p id="subject-error" className="mt-2 text-xs text-destructive">
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-semibold text-ink">
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={fieldClass}
                  placeholder="How can we help?"
                />
                {errors.message && (
                  <p id="message-error" className="mt-2 text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <ActionButton type="submit">Send message</ActionButton>
            </form>
          )}
        </div>

        <aside className="lg:col-span-5">
          <SectionLabel>Reach us directly</SectionLabel>
          <ul className="mt-8 space-y-8">
            <li className="border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-ink">Call us</h2>
              <a
                href={org.phoneHref}
                className="mt-3 flex items-center gap-3 text-lg font-medium text-primary hover:text-clay"
              >
                <Phone className="size-5" aria-hidden="true" />
                {org.phone}
              </a>
            </li>
            <li className="border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-ink">Email us</h2>
              <a
                href={`mailto:${org.email}`}
                className="mt-3 flex items-center gap-3 text-lg font-medium break-all text-primary hover:text-clay"
              >
                <Mail className="size-5 shrink-0" aria-hidden="true" />
                {org.email}
              </a>
            </li>
            <li className="border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-ink">Find our community centre</h2>
              <p className="mt-3 flex items-start gap-3 text-muted-foreground">
                <MapPin className="mt-1 size-5 shrink-0 text-clay" aria-hidden="true" />
                {org.location}
              </p>
            </li>
          </ul>
        </aside>
      </section>
    </PageTransition>
  );
}
