# Portfolio Site Setup Prompt

Use this prompt to scaffold a new artist/creative portfolio that matches the architecture of this repo:
**Astro v6 + GitHub Pages + Pages CMS**.

---

## Instructions for the model

**Before writing a single file, determine which mode applies:**

- **Fresh repo** — no `src/` directory, no `astro.config.mjs`, or the user explicitly says "start from scratch". Follow the scaffold instructions below.
- **Existing repo** — any Astro source files already exist. **Follow the "Adapting an existing repo" audit process first.** Only create or rewrite files that fail a compliance check; preserve all content (artist names, copy, project data, styles) that already complies.

For a fresh repo: adapt all placeholder names (artist name, site URL, nav items) to the brief given by the user. If no brief is given, ask for: artist name, site URL (for `astro.config.mjs`), and which top-level pages they want beyond Projects.

---

## Adapting an existing repo

When the repo already has Astro source files, run the following audit before touching anything. Read each listed file, evaluate it against the compliance criteria, and collect all findings. Then apply only the minimal edits needed — **do not rewrite files that already comply, and never discard existing text content, styles, or project data.**

### Step 1 — Read everything first

Read these files in full before making any changes:

```
astro.config.mjs
package.json
tsconfig.json
src/content.config.ts          (may not exist yet)
src/utils.ts                   (may not exist yet)
.pages.yml                     (may not exist yet)
.github/workflows/deploy.yml   (may not exist yet)
public/CNAME                   (may not exist yet)
src/layouts/BaseLayout.astro
src/components/Header.astro
src/components/Footer.astro
src/components/ProjectCard.astro
src/components/GalleryItem.astro
src/pages/index.astro
src/pages/projects/[id].astro
src/content/projects/*.md      (read at least one to inspect frontmatter)
src/content/pages/*.md         (read at least one)
```

If any file is missing, note it as **"must create"**. Then proceed through Steps 2–9.

---

### Step 2 — `package.json`

| Check | Compliant if… | Fix |
|---|---|---|
| `"type": "module"` present | yes | add it |
| `astro` version | `^6.x` in `dependencies` | bump if `^4` or `^5`; warn if `^7+` (check breaking changes) |
| `engines.node` | `>=22.12.0` | add the `engines` field |
| scripts | `dev`, `build`, `preview`, `astro` all present | add any missing ones |
| No extra frameworks | no `@astrojs/react`, `@astrojs/vue`, etc. unless the user's code uses them | do not remove adapters the user added intentionally |

---

### Step 3 — `astro.config.mjs`

| Check | Compliant if… | Fix |
|---|---|---|
| `site` set | any `https://` URL | leave value as-is if already set; add placeholder if missing |
| `base` set | `'/'` for root, `'/repo-name'` for sub-path | add if missing; never change an existing value without asking |
| No `output: 'server'` or SSR adapter | absent or `output: 'static'` | warn the user — SSR breaks GitHub Pages static hosting |
| `// @ts-check` at top | present | add if missing |

---

### Step 4 — `tsconfig.json`

| Check | Compliant if… | Fix |
|---|---|---|
| `extends` points to Astro preset | `"astro/tsconfigs/strict"` or `"astro/tsconfigs/base"` | add `extends` if the file is empty `{}`; do not change if the user has custom `compilerOptions` |

---

### Step 5 — `src/content.config.ts`

This is the most common breakage point in Astro v6 migrations.

| Check | Compliant if… | Fix |
|---|---|---|
| File exists at `src/content.config.ts` | yes | create it (see reference content in Key files section) |
| NOT at `src/content/config.ts` | the old path is absent | move it and delete the old file |
| Uses `glob` loader from `astro/loaders` | `loader: glob(...)` present | rewrite from legacy `type: 'content'` if needed |
| `z` imported from `astro/zod` | `import { z } from 'astro/zod'` | fix import source if it says `'zod'` standalone |
| Schema fields match actual `.md` frontmatter | every key used in `.md` files is in the zod schema | add missing fields; use `.optional()` for fields not present in all files |
| Schema fields match `.pages.yml` fields | every field in `.pages.yml` has a matching zod entry | sync them — the source of truth is the `.md` files as they exist on disk |

---

### Step 6 — `src/utils.ts`

| Check | Compliant if… | Fix |
|---|---|---|
| File exists | yes | create with exact content from Key files section |
| Exports `assetUrl(path)` | yes | add if missing |
| Exports `pageUrl(path)` | yes | add if missing |
| Both strip trailing slash from `BASE_URL` | `BASE_URL.replace(/\/$/, '')` | fix if they concatenate `BASE_URL` directly |

---

### Step 7 — Scan all `.astro` files for URL compliance

Search every file under `src/` for these patterns and fix each occurrence:

| Bad pattern | Correct replacement | Notes |
|---|---|---|
| `href="/"` | `href={pageUrl('/')}` | add `import { pageUrl } from '../utils'` (adjust depth) |
| `href="/projects/..."` | `href={pageUrl('/projects/...')}` | same |
| `href="/about"`, `href="/contact"`, etc. | `href={pageUrl('/about/')}` etc. | add trailing slash |
| `src="/uploads/..."` | `src={assetUrl('/uploads/...')}` | add `import { assetUrl } from '../utils'` |
| `<Image src="/uploads/..."` from `astro:assets` | `<img src={assetUrl(...)}` | CMS uploads live in `public/` — must be plain `<img>` |
| `href={\`/projects/${id}\`}` (template literal) | `href={pageUrl(\`/projects/${id}/\`)}` | |

After fixing, verify `utils.ts` is imported in every component that uses these helpers.

---

### Step 8 — `.pages.yml`

| Check | Compliant if… | Fix |
|---|---|---|
| File exists at repo root | yes | create from Key files section, then sync fields to match actual content collections |
| `media.input: public/uploads` | yes | correct if different |
| `media.output: /uploads` | yes | correct if different |
| Each collection in `content.config.ts` has a matching block in `.pages.yml` | yes | add missing collection/file blocks |
| Field names match the zod schema keys exactly | yes | rename mismatches; the `.md` frontmatter keys are the canonical names |
| Singleton pages use `type: file` | yes | fix `type: collection` used on a single file |
| Collection entries use `type: collection` | yes | fix `type: file` used on a folder |
| `format: yaml-frontmatter` on all blocks | yes | add if missing |

> **Content preservation rule:** when syncing `.pages.yml` to match the schema, never remove a field that exists in actual `.md` files — only add or rename to align.

---

### Step 9 — `.github/workflows/deploy.yml`

| Check | Compliant if… | Fix |
|---|---|---|
| File exists | yes | create from Key files section |
| Triggers on `push: branches: [main]` | yes | check if the repo uses `master` instead and adjust |
| All three `permissions` set | `contents: read`, `pages: write`, `id-token: write` | add missing permissions |
| `actions/checkout@v4` | v4 | update if v3 or lower |
| `actions/setup-node@v4` with `node-version: 22` | yes | update node version if <22 |
| `actions/upload-pages-artifact@v3` | v3 | update if older |
| `actions/deploy-pages@v4` | v4 | update if older |
| `concurrency.cancel-in-progress: false` | yes | add if missing |
| Build output path is `dist/` | yes | correct if e.g. `build/` or `out/` |

---

### Step 10 — `public/CNAME`

| Check | Compliant if… | Fix |
|---|---|---|
| File is at `public/CNAME` | yes | move if at repo root or `dist/CNAME` |
| Contains one bare domain line | `example.com` (no `https://`) | strip protocol if present |
| Domain matches `site` in `astro.config.mjs` | yes | flag mismatch for the user to resolve |

If no custom domain is used, `CNAME` should not exist — do not create it.

---

### Step 11 — Content `.md` files

Read one or two files from each collection and verify:

| Check | Compliant if… | Fix |
|---|---|---|
| Projects have a `sort: <number>` field | yes | add `sort: 1` (incrementing) to files that are missing it; do not change files that already have it |
| `gallery` items use `/uploads/...` paths | yes | flag any absolute external URLs — they won't work offline or in CMS |
| Frontmatter keys match the zod schema exactly | yes | rename stray keys (e.g. `image:` → `gallery:`) |
| Body content is present | yes | leave body untouched — never rewrite copy |

---

### Step 12 — Report and summarise

After all edits, output a compact summary:

```
✅ Compliant (unchanged): <list files>
🔧 Fixed: <list files + one-line description of what changed>
🆕 Created: <list files>
⚠️  Needs manual action: <list items the model cannot resolve automatically>
```

Common "needs manual action" items:
- "Set **Source → GitHub Actions** in GitHub repo Settings → Pages"
- "Install the Pages CMS GitHub App at pagescms.org"
- "Verify `site` URL in `astro.config.mjs` matches your actual domain"
- "Run `npm install` after `package.json` changes"
- "Push to `main` to trigger the first deploy"

---

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro v6 (`astro@^6`) |
| Output | Static (`output: 'static'` — the default, no adapter needed) |
| Hosting | GitHub Pages via GitHub Actions |
| CMS | Pages CMS (`.pages.yml` at repo root) |
| Language | TypeScript (strict-ish; `tsconfig.json` `extends: "astro/tsconfigs/strict"`) |
| Styles | Plain CSS in `src/styles/global.css`, imported in `BaseLayout` |
| Node | `>=22.12.0` (set in `package.json` `engines` field) |

---

## File tree to create

```
.github/
  workflows/
    deploy.yml          ← GitHub Actions: build + deploy to Pages
.pages.yml              ← Pages CMS config (collections + media)
public/
  favicon.svg
  favicon.ico
  CNAME                 ← custom domain if applicable (one line, no protocol)
  uploads/              ← Pages CMS media lands here (git-tracked)
src/
  content.config.ts     ← Astro v6 content layer (glob loaders + zod schemas)
  utils.ts              ← assetUrl() and pageUrl() helpers
  styles/
    global.css
  layouts/
    BaseLayout.astro
  components/
    Header.astro
    Footer.astro
    ProjectCard.astro
    Gallery.astro
    GalleryItem.astro
  pages/
    index.astro
    about.astro
    contact.astro
    imprint.astro
    projects/
      index.astro
      [id].astro
  content/
    projects/           ← one .md per project (yaml-frontmatter)
    pages/
      about.md
      contact.md
      imprint.md
astro.config.mjs
package.json
tsconfig.json
```

---

## Key files — full content

### `package.json`

```json
{
  "name": "SITE_SLUG",
  "type": "module",
  "version": "0.0.1",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^6.3.8"
  }
}
```

### `astro.config.mjs`

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://YOUR_DOMAIN',
  base: '/',
});
```

> `base: '/'` is correct for a custom domain or an org GitHub Pages site at the root.
> For a project Pages site (`username.github.io/repo-name`), set `base: '/repo-name'`.

### `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

### `src/utils.ts`

```ts
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function assetUrl(path: string): string {
  return `${base}${path}`;
}

export function pageUrl(path: string): string {
  return `${base}${path}`;
}
```

> Every internal `href` and every media `src` that comes from `/uploads/...` must go through these helpers so the `base` prefix is prepended correctly. Never hardcode `/` links — always call `pageUrl()` or `assetUrl()`.

### `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const galleryItemSchema = z.object({
  type: z.enum(['image', 'video']),
  src: z.string(),
  caption: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    sort: z.number(),
    year: z.number().optional(),
    tagline: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    summary: z.string().optional(),
    gallery: z.array(galleryItemSchema).optional().default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { projects, pages };
```

> **Astro v6 note:** `content.config.ts` must live at `src/content.config.ts`, NOT at the project root. The glob loader replaces the legacy `src/content/config.ts` location.

### `.pages.yml`

```yaml
media:
  input: public/uploads
  output: /uploads

content:
  - name: projects
    label: Projects
    type: collection
    path: src/content/projects
    format: yaml-frontmatter
    filename: "{primary}.md"
    fields:
      - name: title
        label: Title
        type: string
        required: true
      - name: sort
        label: Sort Order
        type: number
        required: true
      - name: year
        label: Year
        type: number
      - name: tagline
        label: Tagline
        type: string
      - name: tags
        label: Tags
        type: string
        list: true
      - name: summary
        label: Summary
        type: text
      - name: gallery
        label: Gallery
        type: object
        list:
          collapsible:
            collapsed: true
            summary: "{fields.type}: {fields.caption}"
        fields:
          - name: type
            label: Type
            type: select
            options:
              values:
                - image
                - video
          - name: src
            label: File
            type: image
          - name: caption
            label: Caption
            type: string
      - name: body
        label: Content
        type: rich-text

  - name: about
    label: About
    type: file
    path: src/content/pages/about.md
    format: yaml-frontmatter
    fields:
      - name: title
        label: Title
        type: string
        required: true
      - name: body
        label: Content
        type: rich-text

  - name: contact
    label: Contact
    type: file
    path: src/content/pages/contact.md
    format: yaml-frontmatter
    fields:
      - name: title
        label: Title
        type: string
        required: true
      - name: body
        label: Content
        type: rich-text

  - name: imprint
    label: Imprint
    type: file
    path: src/content/pages/imprint.md
    format: yaml-frontmatter
    fields:
      - name: title
        label: Title
        type: string
        required: true
      - name: body
        label: Content
        type: rich-text
```

> Add one `type: file` block per additional singleton page. Match `path` exactly to where the `.md` file lives in `src/content/pages/`.

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Astro site
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> In the GitHub repo settings → Pages, set Source to **GitHub Actions** (not a branch).

---

## Components

### `src/layouts/BaseLayout.astro`

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'ARTIST_BIO_LINE' } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title} — ARTIST_NAME</title>
    <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}/favicon.svg`} />
  </head>
  <body>
    <Header />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

### `src/components/Header.astro`

```astro
---
import { pageUrl } from '../utils';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const path = Astro.url.pathname;

function isActive(href: string) {
  const full = base + href;
  if (href === '/') return path === full || path === base + '';
  return path.startsWith(full);
}
---

<header class="site-header">
  <div class="container">
    <a href={pageUrl('/')} class="logo">ARTIST_NAME</a>
    <nav>
      <ul class="site-nav">
        <li><a href={pageUrl('/projects/')} aria-current={isActive('/projects/') ? 'page' : undefined}>Work</a></li>
        <li><a href={pageUrl('/about/')} aria-current={isActive('/about/') ? 'page' : undefined}>About</a></li>
        <li><a href={pageUrl('/contact/')} aria-current={isActive('/contact/') ? 'page' : undefined}>Contact</a></li>
      </ul>
    </nav>
  </div>
</header>
```

### `src/components/Footer.astro`

```astro
---
import { pageUrl } from '../utils';
---

<footer class="site-footer">
  <div class="container">
    <span>© {new Date().getFullYear()} ARTIST_NAME</span>
    <a href={pageUrl('/imprint/')}>Imprint</a>
  </div>
</footer>
```

### `src/components/ProjectCard.astro`

```astro
---
import type { CollectionEntry } from 'astro:content';
import { assetUrl, pageUrl } from '../utils';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
const { title, year, tagline, tags, summary, gallery } = project.data;
const thumb = gallery?.[0];
const href = pageUrl(`/projects/${project.id}/`);
---

<a href={href} class="project-card">
  <div class={`project-card__thumb${!thumb ? ' placeholder' : ''}`}>
    {thumb
      ? <img src={assetUrl(thumb.src)} alt={thumb.caption || title} loading="lazy" />
      : <span>No image</span>
    }
  </div>
  <div class="project-card__body">
    <div class="project-card__meta">
      {year && <span>{year}</span>}
      {tags && tags.length > 0 && <span>{tags[0]}</span>}
    </div>
    <h3 class="project-card__title">{title}</h3>
    {tagline && <p class="project-card__tagline">{tagline}</p>}
    {summary && <p class="project-card__summary">{summary}</p>}
    {tags && tags.length > 1 && (
      <ul class="tags">
        {tags.slice(1).map(tag => <li class="tag">{tag}</li>)}
      </ul>
    )}
  </div>
</a>

<style>
  .project-card { display: block; }
  .project-card__summary {
    font-size: 0.875rem;
    color: var(--color-muted);
    margin-top: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
```

### `src/components/Gallery.astro`

```astro
---
import GalleryItem from './GalleryItem.astro';

interface Props {
  items: Array<{ type: 'image' | 'video'; src: string; caption?: string }>;
}
const { items } = Astro.props;
---

{items && items.length > 0 && (
  <section class="gallery">
    <h2 class="gallery__heading">Gallery</h2>
    <div class="gallery__grid">
      {items.map(item => <GalleryItem item={item} />)}
    </div>
  </section>
)}
```

### `src/components/GalleryItem.astro`

```astro
---
import { assetUrl } from '../utils';

interface Props {
  item: { type: 'image' | 'video'; src: string; caption?: string };
}
const { item } = Astro.props;
const resolvedSrc = assetUrl(item.src);
---

<figure class="gallery-item">
  {item.type === 'video' ? (
    <video controls preload="metadata">
      <source src={resolvedSrc} />
      Your browser does not support video playback.
    </video>
  ) : (
    <img src={resolvedSrc} alt={item.caption || ''} loading="lazy" />
  )}
  {item.caption && <figcaption>{item.caption}</figcaption>}
</figure>
```

---

## Pages

### `src/pages/index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getCollection } from 'astro:content';
import { pageUrl } from '../utils';

const projects = await getCollection('projects');
const featured = projects.sort((a, b) => a.data.sort - b.data.sort).slice(0, 4);
---

<BaseLayout title="Portfolio">
  <section class="hero container">
    <h1>HERO_HEADLINE</h1>
    <p>HERO_SUBLINE</p>
  </section>

  <section class="section container">
    <div class="section-header">
      <h2>Selected Work</h2>
      <a href={pageUrl('/projects/')}>All projects →</a>
    </div>
    <div class="project-grid">
      {featured.map(project => <ProjectCard project={project} />)}
    </div>
  </section>
</BaseLayout>
```

### `src/pages/projects/index.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
const sorted = projects.sort((a, b) => a.data.sort - b.data.sort);
---

<BaseLayout title="Projects">
  <div class="container">
    <section class="projects-page">
      <h1>Work</h1>
      <div class="project-grid">
        {sorted.map(project => <ProjectCard project={project} />)}
      </div>
    </section>
  </div>
</BaseLayout>
```

### `src/pages/projects/[id].astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Gallery from '../../components/Gallery.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map(project => ({
    params: { id: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
const { title, year, tagline, tags, gallery } = project.data;
---

<BaseLayout title={title}>
  <div class="container">
    <header class="project-header">
      <p class="project-header__eyebrow">
        {year && <span>{year}</span>}
        {year && tags && tags.length > 0 && <span> · </span>}
        {tags && tags.map((t, i) => <span>{i > 0 ? ', ' : ''}{t}</span>)}
      </p>
      <h1>{title}</h1>
      {tagline && <p class="project-header__tagline">{tagline}</p>}
    </header>
    <div class="prose"><Content /></div>
    <Gallery items={gallery} />
  </div>
</BaseLayout>
```

### `src/pages/about.astro` (and contact.astro / imprint.astro — same pattern)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry, render } from 'astro:content';

const page = await getEntry('pages', 'about'); // change slug per page
if (!page) return Astro.redirect('/404');
const { Content } = await render(page);
---

<BaseLayout title={page.data.title}>
  <div class="container">
    <article class="page-content">
      <h1>{page.data.title}</h1>
      <div class="prose"><Content /></div>
    </article>
  </div>
</BaseLayout>
```

---

## Content seed files

### `src/content/pages/about.md`

```md
---
title: About
---

Write bio here.
```

Create the same pattern for `contact.md` and `imprint.md`.

### `src/content/projects/example-project.md`

```md
---
title: Example Project
sort: 1
year: 2024
tagline: One-line description
tags:
  - medium
summary: Short paragraph shown on cards.
gallery: []
---

Full project description in Markdown.
```

---

## Patterns & gotchas

### BASE_URL / asset paths
- `import.meta.env.BASE_URL` is `'/'` when `base: '/'` in config, or `'/repo-name/'` for sub-path deployments.
- Always strip the trailing slash: `BASE_URL.replace(/\/$/, '')` before concatenating paths.
- Use `assetUrl()` for everything in `public/uploads/` and `pageUrl()` for all internal hrefs.
- Never use `<Image>` from `astro:assets` for CMS-uploaded media — those files are in `public/` and must stay as plain `<img>` tags with `assetUrl()`.

### Content collections (Astro v6 glob loader)
- `src/content.config.ts` — this exact path, not `src/content/config.ts`.
- Use `loader: glob(...)` — the new Content Layer API. Do not use `type: 'content'` (legacy).
- `project.id` from glob loader equals the filename slug (no extension), which is what `[id].astro` routes on.
- `getEntry('pages', 'about')` — the second arg is the filename without extension.

### Pages CMS
- `.pages.yml` must be at the repository root.
- `media.input: public/uploads` — CMS writes files there; `media.output: /uploads` — the public path prefix.
- Each singleton page needs its own `type: file` block. Collections use `type: collection`.
- `format: yaml-frontmatter` matches Astro's default `.md` format.
- `filename: "{primary}.md"` uses the title field as the slug for new collection entries.

### GitHub Pages
- Set **Source → GitHub Actions** in repo Settings → Pages (not "Deploy from a branch").
- The workflow uses `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`.
- `CNAME` file belongs in `public/` so Astro copies it to `dist/` on every build.
- `permissions: { contents: read, pages: write, id-token: write }` are all required.
- `concurrency.cancel-in-progress: false` prevents a mid-deploy cancellation from leaving Pages in a broken state.

### Active nav state
The `isActive()` helper in `Header.astro` compares `Astro.url.pathname` against `base + href` — this is needed because `BASE_URL` may be a sub-path.

---

## Checklist after scaffolding

- [ ] Replace all `ARTIST_NAME`, `SITE_SLUG`, `YOUR_DOMAIN`, `HERO_HEADLINE`, `HERO_SUBLINE`, `ARTIST_BIO_LINE` placeholders.
- [ ] Add `public/CNAME` with your custom domain (one line, no `https://`), or remove it if using the default `*.github.io` URL.
- [ ] Update `astro.config.mjs` `site` and `base` to match the actual domain / path.
- [ ] Push to `main` and verify the Actions workflow completes without errors.
- [ ] Connect Pages CMS at [pagescms.org](https://pagescms.org) by installing the GitHub App on the repo.
- [ ] Add at least one real project `.md` with a `sort` value so the index page renders.
