---
title: Example post (formatting reference)
description: A draft that shows every element a post can use. It appears in local dev only and is never published.
date: 2026-11-15
tags: [Example]
draft: true
---

This file is a working reference. It has `draft: true`, so it shows up when you run `bun dev` and is left out of the live site. Copy it, rename the file to the URL you want (`my-post-title.md` becomes `/blog/my-post-title`), remove the `draft` line, and write.

## Frontmatter

The block between the `---` lines at the top sets the post's details.

| Field | Required | What it does |
| --- | --- | --- |
| `title` | Yes | The headline, the browser title and the social card alt text |
| `description` | Yes | Shown under the headline, in the post list and in search results. Keep it under 155 characters |
| `date` | Yes | Publish date as `YYYY-MM-DD`. Sets the order of the post list |
| `updated` | No | Date of the last real edit. Shown on the post and sent to search engines |
| `tags` | No | Short labels, for example `[Branding, D2C]` |
| `image` | No | Social card image, for example `/media/blog/my-post/card.png` (1200×630) |
| `imageAlt` | No | Alt text for that image |
| `draft` | No | `true` keeps the post off the live site |

## Headings

Start sections with `##`. The post title is already the page's only `#` heading, so don't use `#` in the body.

### Sub-sections use three hashes

Every heading gets a link anchor, so this one can be reached at `#sub-sections-use-three-hashes`.

## Text, links and lists

Plain paragraphs, **bold**, *italic* and `inline code` all work. Link to your own pages with a path, like [our services](/services), and to other sites with a full address, like [MDN](https://developer.mozilla.org). External links open in a new tab.

- Bullet lists
- Look like this
  - And can nest

1. Numbered lists
2. Work too

> A blockquote is for a line worth pulling out.

## Images

Put image files in `public/media/blog/<post-file-name>/` and reference them from the site root:

```md
![What the image shows](/media/blog/example-post/diagram.webp)
```

## Code

```ts
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

---

Anything after a `---` line on its own (with blank lines around it) is separated by a rule.
