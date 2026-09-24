import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { programs } from "@/data/site";
import { programImages } from "@/lib/images";
import { PageHeader } from "@/components/site/kit";
import { PageTransition, ParallaxImage, Reveal } from "@/components/site/motion";
import { CTASection } from "@/components/site/CTASection";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/programs/")({
  head: () => ({
    meta: [
      { title: "Programs & Services — Unity Welcome Settlement Agency" },
      {
        name: "description",
        content:
          "Settlement assistance, language and skills training, community integration, legal and documentation support, mental health and wellness, and employment services for newcomers in Canada.",
      },
      { property: "og:title", content: "Programs & Services — Unity Welcome" },
      {
        property: "og:description",
        content: "Six programs supporting newcomers from arrival to lasting success across Canada.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/programs") },
      { property: "og:image", content: absoluteUrl(programImages["settlement"]!) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: absoluteUrl(programImages["settlement"]!) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/programs") }],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Our services"
        title="Comprehensive support for your journey"
        lead="From your first day to lasting success, we provide a full range of services designed to help you build a new life with confidence and dignity."
      />

      <section className="container-page pb-24 md:pb-32">
        <ul className="space-y-20 md:space-y-28">
          {programs.map((program, i) => (
            <Reveal key={program.slug}>
              <li>
                <Link
                  to="/programs/$slug"
                  params={{ slug: program.slug }}
                  className={`group grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                    i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                  }`}
                >
                  <figure className="overflow-hidden rounded-sm">
                    <ParallaxImage
                      src={programImages[program.image]!}
                      alt={program.imageAlt}
                      className="aspect-[4/3] w-full"
                      distance={28}
                    />
                  </figure>
                  <div>
                    <span className="numeral text-clay">{program.number}</span>
                    <h2 className="display-serif mt-3 text-ink">{program.title}</h2>
                    <p className="mt-5 leading-relaxed text-muted-foreground">{program.summary}</p>
                    <span className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-primary">
                      Explore this program
                      <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <CTASection
        eyebrow="Need help getting started?"
        title="Our team can guide you to the right service."
        body="Reach out today and we will help you find the support you need."
        primaryLabel="Get Support"
        primaryTo="/get-support"
        secondaryLabel="Contact us"
        secondaryTo="/contact"
      />
    </PageTransition>
  );
}
