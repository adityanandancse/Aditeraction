# CLAUDE.md

Guidance for AI coding agents working in this repository.

## pending.md
Whenever a change introduces something only AB can provide or do (content, secrets, decisions, measurements, dashboard actions), add it to pending.md under the right section. When a change resolves an item, tick it. Never put secrets or keys in pending.md.

## Blog
Posts are Markdown files in content/blog/, one per post; the file name is the URL slug (/blog/<file-name>). Frontmatter: title, description, date (YYYY-MM-DD) are required; updated, tags, image, imageAlt, draft are optional. content/blog/example-post.md is the formatting reference. Post images go in public/media/blog/<slug>/. `draft: true` posts show in dev only. scripts/blog-plugin.ts compiles posts at build time and src/lib/blog.ts reads them; the list, sitemap, RSS (/blog/rss.xml) and llms.txt update on their own. Never invent facts, clients or numbers in a post.
