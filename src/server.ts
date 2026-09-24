import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getPublishedPosts } from "./services/blog-service";
import { SITE_URL } from "./lib/seo";
import { programs, stories } from "./data/site";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const staticSitemapPaths = [
  "/",
  "/about",
  "/programs",
  "/get-support",
  "/resources",
  "/blog",
  "/stories",
  "/contact",
];

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!,
  );
}

async function sitemapResponse(): Promise<Response> {
  const posts = await getPublishedPosts();
  const urls = [
    ...staticSitemapPaths.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: undefined })),
    ...programs.map((program) => ({
      loc: `${SITE_URL}/programs/${encodeURIComponent(program.slug)}`,
      lastmod: undefined,
    })),
    ...stories.map((story) => ({
      loc: `${SITE_URL}/stories/${encodeURIComponent(story.slug)}`,
      lastmod: undefined,
    })),
    ...posts.map((post) => ({
      loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastmod: post.updated_at || post.published_at || undefined,
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ loc, lastmod }) =>
        `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}</url>`,
    )
    .join("\n")}\n</urlset>`;
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (new URL(request.url).pathname === "/sitemap.xml") return await sitemapResponse();
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
