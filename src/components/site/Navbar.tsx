import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, org } from "@/data/site";
import { ActionLink } from "./kit";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/UWSA_LOGO-03.png";

function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
      aria-label={`${org.name} — home`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 place-items-center rounded-full transition-colors",
          tone === "dark" ? "bg-cream" : "bg-cream/90",
        )}
      >
        <img
          src={logoAsset}
          alt="UWSA logo"
          className="size-8 object-contain"
        />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block text-[0.95rem] font-extrabold tracking-tight",
            tone === "dark" ? "text-ink" : "text-ink-foreground",
          )}
        >
          Unity Welcome
        </span>
        <span
          className={cn(
            "block text-[0.6rem] mt-1 font-semibold tracking-[0.2em] uppercase",
            tone === "dark" ? "text-muted-foreground" : "text-ink-foreground/60",
          )}
        >
          Settlement Agency
        </span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border/70 bg-background/80 py-2.5 backdrop-blur-xl"
            : "py-5",
        )}
      >
        <div className="container-page flex items-center justify-between gap-6">
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="link-underline text-[0.9rem] font-medium text-ink/75 transition-colors hover:text-ink data-[status=active]:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={org.phoneHref}
              className="flex items-center gap-2 text-[0.85rem] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone className="size-4" aria-hidden="true" />
              {org.phone}
            </a>
            <ActionLink to="https://donate.stripe.com/test_3cI4gz5ph7LN83d5Ob1ck00
" variant="primary" className="px-6 py-3">
              Donate
            </ActionLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="grid size-11 place-items-center rounded-full border border-border text-ink transition-colors hover:bg-primary hover:text-primary-foreground lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface-ink fixed inset-0 z-[60] flex flex-col overflow-y-auto lg:hidden"
          >
            <div className="container-page flex items-center justify-between py-5">
              <Wordmark tone="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-ink-foreground/25 text-ink-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="container-page flex flex-1 flex-col justify-center py-10">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-ink-foreground/10"
                  >
                    <Link
                      to={item.to}
                      className="block py-4 text-3xl font-extrabold tracking-tight text-ink-foreground uppercase"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10 space-y-4">
                <ActionLink to="/get-support" variant="clay" className="w-full justify-between">
                  Get Support
                </ActionLink>
                <a
                  href={org.phoneHref}
                  className="flex items-center gap-2 text-sm text-ink-foreground/70"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {org.phone}
                </a>
                <p className="max-w-sm text-sm text-ink-foreground/55">{org.vision}</p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
