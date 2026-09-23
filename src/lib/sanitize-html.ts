/**
 * Removes markup and attributes not produced by the CMS rich-text editor before
 * rendering stored article HTML on the public site.
 */
export function sanitizeRichHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const allowed = new Set([
    "P",
    "BR",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "STRONG",
    "B",
    "EM",
    "I",
    "A",
    "UL",
    "OL",
    "LI",
    "BLOCKQUOTE",
    "IMG",
  ]);

  doc.body.querySelectorAll("*").forEach((element) => {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const value = attribute.value.trim();
      const allowedAttribute =
        (element.tagName === "A" && attribute.name === "href" && /^https?:/i.test(value)) ||
        (element.tagName === "IMG" && attribute.name === "src" && /^https?:/i.test(value)) ||
        (element.tagName === "IMG" && attribute.name === "alt");
      if (!allowedAttribute) element.removeAttribute(attribute.name);
    });
  });

  return doc.body.innerHTML;
}
