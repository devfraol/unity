import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { boardMembers, org, values } from "@/data/site";
import { boardPhotos, team } from "@/lib/images";
import { PageHeader, SectionLabel } from "@/components/site/kit";
import { PageTransition, ParallaxImage, Reveal } from "@/components/site/motion";
import { CTASection } from "@/components/site/CTASection";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Unity Welcome — Building an Inclusive, Compassionate Community" },
      {
        name: "description",
        content:
          "Unity Welcome Settlement Agency empowers refugees, immigrants and vulnerable communities to build new lives with dignity, opportunity and belonging. Meet our mission, values and board.",
      },
      { property: "og:title", content: "About Unity Welcome Settlement Agency" },
      {
        property: "og:description",
        content:
          "Our vision, mission, values and the board members guiding Unity Welcome Settlement Agency.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/about") },
      { property: "og:image", content: absoluteUrl(team) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: absoluteUrl(team) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="About us"
        title="Building an inclusive, compassionate community"
        lead={org.aboutLead}
      />

      <section className="container-page">
        <ParallaxImage
          src={team}
          alt="Unity Welcome staff and volunteers meeting together"
          className="aspect-[16/9] w-full rounded-sm"
          distance={30}
        />
      </section>

      <section className="container-page py-24 md:py-32">
        <figure className="mx-auto max-w-4xl text-center">
          <Quote className="mx-auto size-8 text-clay" aria-hidden="true" />
          <blockquote className="display-serif mt-8 text-ink">
            “{org.leadershipQuote}”
          </blockquote>
          <figcaption className="mt-8 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {org.leadershipQuoteAuthor}
          </figcaption>
        </figure>
      </section>

      <section className="border-y border-border py-24 md:py-32" aria-labelledby="mission-heading">
        <div className="container-page grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel>What drives us</SectionLabel>
            <h2 id="mission-heading" className="display-lg mt-6 text-ink">
              Mission, vision, focus
            </h2>
          </div>
          <div className="space-y-14 lg:col-span-8">
            {[
              { label: "Mission", body: org.mission },
              { label: "Vision", body: org.vision },
              { label: "Focus", body: org.focus },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.06}>
                <div className="grid gap-4 border-t border-border pt-8 md:grid-cols-[9rem_1fr] md:gap-10">
                  <h3 className="label-eyebrow text-clay">{item.label}</h3>
                  <p className="display-serif text-ink">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-24 md:py-32" aria-labelledby="values-heading">
        <SectionLabel>Our core values</SectionLabel>
        <h2 id="values-heading" className="display-lg mt-6 max-w-2xl text-ink">
          Principles that guide our work
        </h2>
        <ul className="mt-14">
          {values.map((value, i) => (
            <Reveal key={value.name} delay={i * 0.03}>
              <li className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-t border-border py-7 last:border-b md:grid-cols-[5rem_16rem_1fr]">
                <span className="numeral text-sm text-clay">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-lg font-bold tracking-tight text-ink">{value.name}</h3>
                <p className="col-span-2 text-sm leading-relaxed text-muted-foreground md:col-span-1">
                  {value.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <section
        id="board-members"
        className="bg-cream-deep/60 py-24 md:py-32"
        aria-labelledby="board-heading"
      >
        <div className="container-page">
          <SectionLabel>Leadership</SectionLabel>
          <h2 id="board-heading" className="display-lg mt-6 max-w-2xl text-ink">
            Meet our board members
          </h2>
          <p className="body-lead mt-7 max-w-2xl">
            Our board members bring diverse expertise and a shared commitment to empowering
            newcomers and building inclusive communities.
          </p>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {boardMembers.map((member, i) => (
              <Reveal key={member.name} delay={i * 0.05}>
                <li>
                  <div className="mask-arch aspect-[4/5] w-full bg-cream">
                    <img
                      src={boardPhotos[member.photo]}
                      alt={`Portrait of ${member.name}, board member`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-5 text-base font-bold tracking-tight text-ink">
                    {member.name}
                  </h3>
                  <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    Board member
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        eyebrow="Get involved"
        title="Ready to make an impact?"
        body="Whether you want to volunteer, partner with us, or simply learn more about our work, your support can help build a more inclusive community."
        primaryLabel="Contact us"
        primaryTo="/contact"
        secondaryLabel="See our programs"
        secondaryTo="/programs"
      />
    </PageTransition>
  );
}
