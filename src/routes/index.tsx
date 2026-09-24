import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { ArrowDown, ArrowRight, Quote } from "lucide-react";
import { org, programs, stories, values } from "@/data/site";
import { belonging, heroFloat, heroMain, programImages } from "@/lib/images";
import { ActionLink, SectionLabel } from "@/components/site/kit";
import {
  DepthPanel,
  ParallaxImage,
  Reveal,
  RevealLines,
  PageTransition,
} from "@/components/site/motion";
import { CTASection } from "@/components/site/CTASection";
import { LatestFromBlog } from "@/components/blog/LatestFromBlog";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Unity Welcome Settlement Agency — Settlement Support for Newcomers in Canada",
      },
      {
        name: "description",
        content:
          "Unity Welcome Settlement Agency helps refugees, immigrants and multicultural communities settle, learn, work and belong in Canada — housing, language, employment, legal and wellness support.",
      },
      {
        property: "og:title",
        content: "Unity Welcome Settlement Agency — Settlement Support for Newcomers",
      },
      {
        property: "og:description",
        content:
          "Housing, language, employment, legal and wellness support for newcomers and multicultural communities across Canada.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:image", content: absoluteUrl(heroMain) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: absoluteUrl(heroMain) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: org.name,
          description: org.mission,
          telephone: org.phone,
          email: org.email,
          areaServed: "Canada",
        }),
      },
    ],
  }),
  component: HomePage,
});

/* ---------------------------------------------------------------- Hero */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const floatY = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-18rem] left-[-14rem] size-[42rem] rounded-full bg-gold/20 blur-[130px]"
      />

      <div className="container-page relative grid items-end gap-12 lg:grid-cols-12 lg:gap-8">
        <motion.div style={reduce ? {} : { y: textY }} className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>{org.name}</SectionLabel>
          </motion.div>

          <h1 className="display-xl mt-7 text-ink">
            <RevealLines lines={["New beginnings", "start with"]} delay={0.1} />
            <span className="block overflow-hidden">
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: "105%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 0.95, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="block text-clay italic"
                style={{ fontFamily: "var(--font-display)", textTransform: "none" }}
              >
                belonging.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="body-lead mt-9 max-w-xl"
          >
            {org.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <ActionLink to="/get-support">Get Support</ActionLink>
            <ActionLink to="/programs" variant="outline">
              Explore our programs
            </ActionLink>
          </motion.div>
        </motion.div>

        <div className="relative lg:col-span-5">
          <motion.div
            style={reduce ? {} : { y: bgY }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="mask-arch aspect-[4/5] w-full"
          >
            <img
              src={heroMain}
              alt="Newcomer families and volunteers talking together in a community hall"
              width={1200}
              height={1504}
              className="h-full w-full object-cover"
            />
          </motion.div>

          <motion.div
            style={reduce ? {} : { y: floatY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-10 -left-6 hidden w-44 overflow-hidden rounded-sm shadow-[0_24px_60px_-30px_rgba(20,37,31,0.55)] sm:block md:w-56 lg:-left-16"
          >
            <img
              src={heroFloat}
              alt="A settlement worker helping a mother complete paperwork"
              width={800}
              height={912}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </motion.div>

          <div className="absolute top-6 -left-4 hidden rounded-full bg-background/90 px-5 py-3 text-xs font-semibold tracking-tight text-ink shadow-sm backdrop-blur md:block lg:-left-10">
            Serving newcomers across Canada
          </div>
        </div>
      </div>

      <motion.div
        style={reduce ? {} : { opacity: fade }}
        className="container-page mt-16 flex items-center gap-4 text-xs tracking-[0.22em] text-muted-foreground uppercase"
      >
        <ArrowDown className="size-4 animate-bounce text-clay" aria-hidden="true" />
        Scroll to begin
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------ Welcome statement */

function WelcomeStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const reduce = useReducedMotion();

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-border py-24 md:py-36">
      <motion.p
        aria-hidden="true"
        style={reduce ? {} : { x }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[22vw] leading-none font-extrabold tracking-tighter whitespace-nowrap text-ink/[0.035] uppercase"
      >
        Welcome · Welcome
      </motion.p>

      <div className="container-page relative">
        <Reveal>
          <SectionLabel>Our vision</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="display-serif mt-8 max-w-4xl text-ink">{org.vision}</p>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="body-lead mt-8 max-w-2xl">{org.focus}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ What we do */

function WhatWeDo() {
  const [active, setActive] = useState(0);
  const current = programs[active]!;

  return (
    <section className="container-page py-24 md:py-36" aria-labelledby="what-we-do">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel>How we help</SectionLabel>
          <h2 id="what-we-do" className="display-lg mt-6 max-w-2xl text-ink">
            Support at every step
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          From your first day to lasting success, we provide the resources and guidance you need at
          every step.
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <ul className="lg:col-span-6">
          {programs.map((program, i) => {
            const isActive = i === active;
            return (
              <li key={program.slug} className="border-t border-border last:border-b">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-current={isActive}
                  className="group flex w-full items-baseline gap-6 py-6 text-left transition-colors"
                >
                  <span
                    className={`numeral text-sm transition-colors ${
                      isActive ? "text-clay" : "text-muted-foreground"
                    }`}
                  >
                    {program.number}
                  </span>
                  <span className="flex-1">
                    <span
                      className={`heading-md block transition-colors ${
                        isActive ? "text-ink" : "text-ink/45"
                      }`}
                    >
                      {program.title}
                    </span>
                    <motion.span
                      initial={false}
                      animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="block overflow-hidden text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="block pt-3 pr-6">{program.short}</span>
                    </motion.span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="lg:col-span-6">
          <div className="sticky top-28">
            <div className="mask-leaf relative aspect-[5/6] w-full bg-cream-deep">
              {programs.map((program, i) => (
                <motion.img
                  key={program.slug}
                  src={programImages[program.image]}
                  alt={program.imageAlt}
                  loading="lazy"
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.06 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-6">
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {current.summary.slice(0, 150)}…
              </p>
              <ActionLink to="/programs" variant="outline" className="shrink-0 px-5 py-3 text-xs">
                All programs
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Program story */

function ProgramSpreads() {
  return (
    <section className="bg-cream-deep/60 py-24 md:py-36" aria-labelledby="programs-heading">
      <div className="container-page">
        <SectionLabel>Programs</SectionLabel>
        <h2 id="programs-heading" className="display-lg mt-6 max-w-3xl text-ink">
          Comprehensive support for your journey
        </h2>
      </div>

      <div className="container-page mt-20 space-y-24 md:space-y-36">
        {programs.slice(0, 3).map((program, i) => (
          <DepthPanel key={program.slug} rotate={i % 2 === 0 ? 6 : -6}>
            <article
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
              }`}
            >
              <figure className="overflow-hidden rounded-sm">
                <ParallaxImage
                  src={programImages[program.image]!}
                  alt={program.imageAlt}
                  className="aspect-[4/3] w-full"
                  distance={34}
                />
              </figure>
              <div>
                <span className="numeral text-clay">{program.number}</span>
                <h3 className="heading-md mt-4 text-ink">{program.title}</h3>
                <p className="mt-5 leading-relaxed text-muted-foreground">{program.summary}</p>
                <ul className="mt-7 space-y-2 text-sm text-ink/75">
                  {program.offerings.slice(0, 3).map((o) => (
                    <li key={o} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 block size-1.5 shrink-0 rounded-full bg-clay" />
                      {o}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    to="/programs/$slug"
                    params={{ slug: program.slug }}
                    className="group/link inline-flex items-center gap-3 rounded-full border border-primary/30 px-6 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Explore this program
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          </DepthPanel>
        ))}

        <div className="text-center">
          <ActionLink to="/programs">See all six programs</ActionLink>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Values */

function Values() {
  return (
    <section className="container-page py-24 md:py-36" aria-labelledby="values-heading">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionLabel>Our core values</SectionLabel>
          <h2 id="values-heading" className="display-lg mt-6 text-ink">
            Principles that guide everything we do
          </h2>
        </div>
        <ul className="lg:col-span-8">
          {values.slice(0, 6).map((value, i) => (
            <Reveal key={value.name} delay={i * 0.04}>
              <li className="group grid grid-cols-[auto_1fr] items-baseline gap-6 border-t border-border py-7 last:border-b md:grid-cols-[5rem_14rem_1fr]">
                <span className="numeral text-sm text-clay">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-ink">{value.name}</h3>
                <p className="col-span-2 text-sm leading-relaxed text-muted-foreground md:col-span-1">
                  {value.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Belonging */

function Belonging() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <ParallaxImage
            src={belonging}
            alt="Two neighbours of different backgrounds laughing together on a front porch"
            className="mask-leaf aspect-[4/5] w-full"
            distance={44}
          />
          <div className="absolute -right-3 bottom-8 hidden max-w-[13rem] rounded-full bg-primary px-6 py-4 text-xs leading-snug font-semibold text-primary-foreground md:block">
            Integration is a two-way process
          </div>
        </div>
        <div>
          <Reveal>
            <SectionLabel>Community</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-serif mt-7 text-ink">
              Support is more than a service. It is a connection.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="body-lead mt-8">
              Our community programs create opportunities for newcomers to meet their neighbours,
              learn about local culture, and share their own traditions — enriching everyone.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10">
              <Link
                to="/programs/$slug"
                params={{ slug: "community-integration" }}
                className="inline-flex items-center gap-3 rounded-full border border-primary/30 px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Community integration
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Stories */

function StoriesTeaser() {
  const [feature, ...rest] = stories;

  return (
    <section className="surface-ink py-24 md:py-36" aria-labelledby="stories-heading">
      <div className="container-page">
        <SectionLabel tone="light">Voices from our community</SectionLabel>
        <h2 id="stories-heading" className="display-lg mt-6 max-w-3xl text-ink-foreground">
          Behind every new beginning is a story.
        </h2>

        {feature && (
          <Reveal>
            <figure className="mt-16 max-w-4xl border-t border-ink-foreground/15 pt-12">
              <Quote className="size-8 text-clay" aria-hidden="true" />
              <blockquote className="display-serif mt-6 text-ink-foreground">
                “{feature.quote}”
              </blockquote>
              <figcaption className="mt-8 text-sm text-ink-foreground/60">
                <span className="font-semibold text-ink-foreground">{feature.name}</span> ·{" "}
                {feature.role}
              </figcaption>
            </figure>
          </Reveal>
        )}

        <div className="mt-20 grid gap-10 md:grid-cols-2">
          {rest.map((story, i) => (
            <Reveal key={story.slug} delay={i * 0.08}>
              <Link
                to="/stories/$slug"
                params={{ slug: story.slug }}
                className="group block border-t border-ink-foreground/15 pt-8"
              >
                <span className="label-eyebrow text-gold">{story.category}</span>
                <h3 className="heading-md mt-4 text-ink-foreground group-hover:text-gold">
                  {story.title}
                </h3>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-foreground/60">
                  “{story.quote}”
                </p>
                <span className="mt-5 inline-block text-xs tracking-[0.2em] text-ink-foreground/50 uppercase">
                  {story.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <ActionLink to="/stories" variant="ghostLight">
            Read all stories
          </ActionLink>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Page */

function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <WelcomeStatement />
      <WhatWeDo />
      <ProgramSpreads />
      <Values />
      <Belonging />
      <StoriesTeaser />
      <LatestFromBlog />
      <CTASection />
    </PageTransition>
  );
}
