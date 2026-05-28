# Portfolio Starter for Astro + Pages CMS

This repo is an Astro v6 portfolio starter for artist or creative sites deployed to GitHub Pages and edited through Pages CMS.

It already includes:

- Astro v6 with static output
- GitHub Pages deployment via GitHub Actions
- Pages CMS configuration in `.pages.yml`
- Content collections for projects and singleton pages
- `assetUrl()` and `pageUrl()` helpers for correct `base` handling
- GLightbox for project gallery image/video overlays on detail pages

## Stack

- Astro `^6.3.8`
- TypeScript with `astro/tsconfigs/strict`
- Pages CMS
- GitHub Pages
- GLightbox `^3.3.1`
- Node `>=22.12.0`

## Commands

Run everything from the repo root:

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | Show Astro CLI help |

## Repo Structure

```text
.
├── .github/workflows/deploy.yml
├── .pages.yml
├── prompts/setup-portfolio.md
├── public/
│   ├── CNAME
│   └── uploads/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── pages/
│   │   └── projects/
│   ├── content.config.ts
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── utils.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Content Model

Projects live in `src/content/projects/*.md` and support these frontmatter fields:

- `title`
- `sort`
- `year`
- `tagline`
- `tags`
- `summary`
- `gallery`

Singleton pages live in `src/content/pages/`:

- `about.md`
- `contact.md`
- `imprint.md`

Media uploaded through Pages CMS goes into `public/uploads/` and should be referenced as `/uploads/...` in frontmatter. The site resolves those paths through `src/utils.ts` so they still work if `base` changes.

## GLightbox Gallery

Project detail pages load GLightbox for gallery media.

- The dependency is installed as `glightbox`
- The stylesheet is imported in `src/pages/projects/[id].astro`
- The lightbox is initialized on the project page script using the `.glightbox` selector
- Gallery items in frontmatter can be either `image` or `video`

If you keep the current gallery UX, keep the GLightbox dependency. If you replace the gallery behavior, update both the project page script and the gallery item markup.

## Using the Setup Prompt in This Repo

This repo includes a reusable setup and migration prompt at `prompts/setup-portfolio.md`.

Use it when you want an AI coding agent to scaffold a new portfolio repo in this format or audit an existing Astro portfolio for compliance with this architecture.

### For this repo

This repository is already an existing Astro repo, so the prompt should be used in `Existing repo` mode.

When you use the prompt against this repo, tell the model to:

1. Read `prompts/setup-portfolio.md`
2. Treat the repo as an existing project, not a fresh scaffold
3. Run the audit process before editing files
4. Preserve existing copy, project data, and styles unless something fails the compliance checks

Example request:

```text
Use prompts/setup-portfolio.md to audit this repo in existing-repo mode.
Check the Astro, Pages CMS, and GitHub Pages setup for compliance.
Apply only minimal fixes and preserve the existing content and styling.
```

### For a new repo based on this one

If you clone this repository or reuse the prompt elsewhere:

1. Copy or reference `prompts/setup-portfolio.md`
2. Tell the model whether the target is a fresh repo or an existing repo
3. If it is a fresh repo, provide the artist name, site URL, and required top-level pages
4. After generation, update `astro.config.mjs`, `public/CNAME`, and the content files with the real project details

The prompt is written to enforce the key constraints of this architecture:

- Astro v6 content collections at `src/content.config.ts`
- Pages CMS config at `.pages.yml`
- GitHub Pages deployment through `.github/workflows/deploy.yml`
- Base-aware internal links and asset URLs
- Markdown-backed projects and singleton pages

## Deployment Notes

Before publishing a clone of this repo, verify:

1. `astro.config.mjs` has the correct `site` and `base`
2. `public/CNAME` matches the real custom domain, or remove it if unused
3. GitHub Pages is set to `Source -> GitHub Actions`
4. Pages CMS is connected to the repo at [app.pagescms.org](https://app.pagescms.org/)

## Development Notes

- Prefer editing content in `src/content/` and media in `public/uploads/`
- Keep internal links and uploaded asset paths going through the URL helpers
- Keep project entries sorted with the numeric `sort` field
- Use plain `<img>` and `<video>` for CMS-managed media in `public/`
