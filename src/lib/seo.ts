export const SITE_URL = "https://uwsettle.org";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.png`;

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, SITE_URL).toString();
}

export function postDescription(excerpt: string | null, content: string): string {
  const description =
    excerpt?.trim() ||
    content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  return description.slice(0, 160);
}
