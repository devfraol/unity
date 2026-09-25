export type RichHtmlSanitizerOptions = {
  /** Clipboard images are not imported into CMS storage, so omit them on paste. */
  allowImages?: boolean;
};

const allowedElements = new Set([
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

function isSafeUrl(value: string, allowedProtocols: string[]): boolean {
  try {
    return allowedProtocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function hasStyle(element: Element, property: string, value: RegExp): boolean {
  return value.test(
    element.getAttribute("style")?.match(new RegExp(`${property}\\s*:\\s*([^;]+)`, "i"))?.[1] ?? "",
  );
}

/**
 * Reduces rich article HTML to the semantic model supported by the editor and
 * public article renderer. This intentionally discards clipboard styling,
 * classes, Office metadata, and unsupported elements.
 */
export function sanitizeRichHtml(html: string, options: RichHtmlSanitizerOptions = {}): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body
    .querySelectorAll("script, style, template, iframe, object, embed, form, input, button")
    .forEach((element) => element.remove());

  // Office and Google Docs commonly use styled spans instead of semantic tags.
  // Retain only bold/italic meaning before unwrapping their generated markup.
  Array.from(doc.body.querySelectorAll("span, font"))
    .reverse()
    .forEach((element) => {
      const isBold = hasStyle(element, "font-weight", /bold|[5-9]00/) || element.tagName === "B";
      const isItalic = hasStyle(element, "font-style", /italic|oblique/);
      if (isBold || isItalic) {
        const wrapper = doc.createElement(isBold ? "strong" : "em");
        if (isBold && isItalic) {
          const emphasis = doc.createElement("em");
          emphasis.replaceChildren(...Array.from(element.childNodes));
          wrapper.append(emphasis);
        } else {
          wrapper.replaceChildren(...Array.from(element.childNodes));
        }
        element.replaceWith(wrapper);
      }
    });

  Array.from(doc.body.querySelectorAll("p, div")).forEach((element) => {
    const className = element.getAttribute("class") ?? "";
    const style = element.getAttribute("style") ?? "";
    const heading = `${className} ${style}`.match(/(?:mso)?heading\s*([1-6])/i);
    if (heading?.[1]) {
      const level = Math.min(Math.max(Number(heading[1]), 2), 4);
      const replacement = doc.createElement(`h${level}`);
      replacement.replaceChildren(...Array.from(element.childNodes));
      element.replaceWith(replacement);
    } else if (
      element.tagName === "DIV" &&
      !element.querySelector("p, div, ul, ol, blockquote, h1, h2, h3, h4, h5, h6")
    ) {
      const replacement = doc.createElement("p");
      replacement.replaceChildren(...Array.from(element.childNodes));
      element.replaceWith(replacement);
    }
  });

  Array.from(doc.body.querySelectorAll("*"))
    .reverse()
    .forEach((element) => {
      if (
        !allowedElements.has(element.tagName) ||
        (element.tagName === "IMG" && options.allowImages === false)
      ) {
        element.replaceWith(...Array.from(element.childNodes));
        return;
      }

      Array.from(element.attributes).forEach((attribute) => {
        const value = attribute.value.trim();
        const allowedAttribute =
          (element.tagName === "A" &&
            attribute.name === "href" &&
            isSafeUrl(value, ["https:", "http:", "mailto:"])) ||
          (element.tagName === "IMG" &&
            attribute.name === "src" &&
            isSafeUrl(value, ["https:", "http:"])) ||
          (element.tagName === "IMG" && attribute.name === "alt");
        if (!allowedAttribute) element.removeAttribute(attribute.name);
      });
    });

  return doc.body.innerHTML;
}

/** Converts a text-only clipboard payload into safe, readable article HTML. */
export function plainTextToRichHtml(text: string): string {
  const doc = new DOMParser().parseFromString("", "text/html");
  const fragment = doc.createDocumentFragment();
  const paragraphs = text.replace(/\r\n?/g, "\n").split(/\n{2,}/);

  paragraphs.forEach((paragraph) => {
    const p = doc.createElement("p");
    paragraph.split("\n").forEach((line, index) => {
      if (index) p.append(doc.createElement("br"));
      let position = 0;
      for (const match of line.matchAll(/https?:\/\/[^\s<]+|mailto:[^\s<]+/gi)) {
        const url = match[0];
        const start = match.index ?? 0;
        p.append(doc.createTextNode(line.slice(position, start)));
        if (isSafeUrl(url, ["https:", "http:", "mailto:"])) {
          const link = doc.createElement("a");
          link.href = url;
          link.textContent = url;
          p.append(link);
        } else {
          p.append(doc.createTextNode(url));
        }
        position = start + url.length;
      }
      p.append(doc.createTextNode(line.slice(position)));
    });
    fragment.append(p);
  });

  doc.body.append(fragment);
  return doc.body.innerHTML;
}
