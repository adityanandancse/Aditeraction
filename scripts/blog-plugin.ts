// Vite plugin: compiles blog posts (content/blog/*.md) at build time.
//
// Each Markdown file is exposed as two modules, consumed by src/lib/blog.ts via
// import.meta.glob:
//   {file}.md?meta → default export: the post's metadata (frontmatter + slug +
//                    reading time). Small, so every post's meta is bundled eagerly.
//   {file}.md?html → default export: the rendered HTML string. Loaded lazily, so
//                    each post body is its own chunk.
//
// Markdown is parsed here, in Node, so neither `marked` nor `gray-matter` ships to
// the browser or the Worker. A post with bad frontmatter fails the build with the
// file name. Drafts (`draft: true`) render in `vite dev` only: in a production
// build both modules export null, so no draft text reaches the bundle.
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { Marked } from "marked";
import type { Plugin } from "vite";
import type { PostMeta } from "../src/lib/blog";

const POST_ID = /\/content\/blog\/([^/]+)\.md\?(meta|html)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SITE_ORIGIN = "https://aditeraction.com";
const WORDS_PER_MINUTE = 220;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function toIsoDate(value: unknown, field: string, file: string, required: boolean): string | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${file}: frontmatter "${field}" is required (YYYY-MM-DD)`);
    return undefined;
  }
  // YAML parses an unquoted 2026-11-15 as a Date (UTC midnight).
  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  if (!ISO_DATE.test(iso) || Number.isNaN(Date.parse(iso))) {
    throw new Error(`${file}: frontmatter "${field}" must be a date like 2026-11-15, got "${iso}"`);
  }
  return iso;
}

function requiredText(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${file}: frontmatter "${field}" is required`);
  }
  return value.trim();
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function renderMarkdown(source: string): string {
  const usedIds = new Set<string>();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      // h2/h3… get a stable id so sections can be linked to.
      heading({ tokens, depth }) {
        const text = tokens.map((t) => ("text" in t ? t.text : t.raw)).join("");
        const base =
          text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "section";
        let id = base;
        for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
        usedIds.add(id);
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
      // External links open in a new tab; links to our own site stay relative.
      link({ href, title, tokens }) {
        const internal = href.startsWith(SITE_ORIGIN);
        const url = internal ? href.slice(SITE_ORIGIN.length) || "/" : href;
        const external = /^https?:\/\//.test(url);
        const attrs =
          (title ? ` title="${esc(title)}"` : "") +
          (external ? ' target="_blank" rel="noopener noreferrer"' : "");
        return `<a href="${esc(url)}"${attrs}>${this.parser.parseInline(tokens)}</a>`;
      },
      image({ href, title, text }) {
        const t = title ? ` title="${esc(title)}"` : "";
        return `<img src="${esc(href)}" alt="${esc(text)}"${t} loading="lazy" decoding="async">`;
      },
    },
  });
  return marked.parse(source, { async: false });
}

export function blogPlugin(): Plugin {
  let isBuild = false;

  return {
    name: "aditeraction:blog",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    load(id) {
      const match = POST_ID.exec(id);
      if (!match) return null;
      const [, slug, kind] = match as unknown as [string, string, "meta" | "html"];
      const path = id.slice(0, id.indexOf("?"));
      const file = `content/blog/${slug}.md`;
      this.addWatchFile(path);

      if (!SLUG.test(slug)) {
        throw new Error(`${file}: file name must be lowercase-with-hyphens (it becomes the URL)`);
      }

      const { data, content } = matter(readFileSync(path, "utf8"));
      const draft = data.draft === true;
      if (draft && isBuild) return "export default null;";

      if (kind === "html") return `export default ${JSON.stringify(renderMarkdown(content))};`;

      const words = content.split(/\s+/).filter(Boolean).length;
      const meta: PostMeta = {
        slug,
        title: requiredText(data.title, "title", file),
        description: requiredText(data.description, "description", file),
        date: toIsoDate(data.date, "date", file, true) as string,
        updated: toIsoDate(data.updated, "updated", file, false),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        image: optionalText(data.image),
        imageAlt: optionalText(data.imageAlt),
        minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        draft,
      };
      return `export default ${JSON.stringify(meta)};`;
    },
  };
}
