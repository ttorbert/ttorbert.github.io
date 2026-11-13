# Setup guide

How this site is put together, and how to set up or change each part. Everything
here can be done from the GitHub website; no local tools are needed.

- [How it works](#how-it-works)
- [1. Hosting on GitHub Pages](#1-hosting-on-github-pages)
- [2. Adding projects to the site](#2-adding-projects-to-the-site)
- [3. Overview pages](#3-overview-pages)
- [4. Images and screenshots](#4-images-and-screenshots)
- [5. Intro text, links and project tweaks](#5-intro-text-links-and-project-tweaks)
- [6. Updating the site](#6-updating-the-site)
- [7. Optional: custom domain](#7-optional-custom-domain)
- [8. Optional: private repos](#8-optional-private-repos)
- [9. Optional: working with Claude](#9-optional-working-with-claude)
- [10. Local development](#10-local-development)
- [Troubleshooting](#troubleshooting)

## How it works

```
your project repos ──(tagged "portfolio")──┐
                                            ▼
src/content/projects/*.md ──►  GitHub Actions build (Astro)  ──►  GitHub Pages
src/data/site.ts          ──►   on push, nightly, or manual        ttorbert.github.io
```

- The site is built with [Astro](https://astro.build) into plain HTML files.
- At build time it asks the GitHub API for your public repos and keeps the ones
  with the `portfolio` topic. Each becomes a card.
- A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes
  the site on every push to `main`, every night, and whenever you run it by hand.

| File or folder | What it controls |
| --- | --- |
| `src/data/site.ts` | Name, tagline, intro, header links, per-project tweaks |
| `src/content/projects/` | Overview pages, one Markdown file per project |
| `public/` | Images and other static files, served as-is |
| `src/pages/index.astro` | Home page layout |
| `src/pages/projects/[slug].astro` | Overview page layout |
| `src/components/ProjectCard.astro` | Project card layout |
| `src/layouts/Base.astro` | Page shell, fonts, colors (light and dark) |
| `.github/workflows/deploy.yml` | Build and deploy schedule |

## 1. Hosting on GitHub Pages

This is already done for `ttorbert.github.io`. To set it up again, or for a
copy of the site:

1. The repo must be named exactly `<username>.github.io` to be served at
   `https://<username>.github.io`. It must be **public** on a free GitHub plan.
2. Go to repo **Settings → Pages → Build and deployment → Source** and choose
   **GitHub Actions**.
   - Don't use "Deploy from a branch". That runs GitHub's default Jekyll build,
     which publishes the raw repo instead of the Astro site.
3. Push to `main`, or run the workflow (see [Updating the site](#6-updating-the-site)).
   The first deploy takes about a minute.

The live URL and the last deploy are shown at the top of **Settings → Pages**.

## 2. Adding projects to the site

For each **public** repo you want shown:

1. Open the repo on GitHub and click the **⚙️ gear next to "About"** in the right sidebar.
2. In **Topics**, type `portfolio` and press Enter.
3. Fill in the other fields while you're there. The card uses them:
   - **Description:** the card's summary text
   - **Website:** shown as a **Live demo** link
   - **Other topics** (e.g. `security`, `python`): shown as tags on the card
4. Click **Save changes**, then [update the site](#6-updating-the-site).

The card also shows the repo's main language, star count and last update date.
Cards are sorted with featured projects first, then by `order`, then by most
recently updated.

To remove a project, delete its `portfolio` topic, or set `hidden: true` for it in
`src/data/site.ts`.

## 3. Overview pages

An overview page is an optional, longer write-up for one project: why it
exists, what it does, results and limits. When a project has one, its card gets
an **Overview →** link, and clicking the card title opens the overview.

To add one:

1. In this repo, open `src/content/projects/_template.md` and copy its contents.
2. In `src/content/projects/`, click **Add file → Create new file**.
3. Name it **exactly after the GitHub repo**, plus `.md`, e.g. `ingest-lag-profiler.md`.
4. Paste the template, write your content in Markdown, and commit.

The page appears at `https://ttorbert.github.io/projects/<repo-name>/`.

The header at the top of the file is optional:

```yaml
---
title: My Project        # defaults to the card title
tagline: One sentence.   # defaults to the repo description
image: /screens/my-project.png   # large image under the header
---
```

The page header fills in automatically from GitHub: a **Live demo** button (if
the repo has a website), a **View code** button, language, stars, last update
and topics.

The Markdown supports headings (`##`), lists, links, **bold**, tables, quotes
(`>`), code blocks and images. See `ingest-lag-profiler.md` for a full example.

Files starting with `_` (like `_template.md`) are ignored.

## 4. Images and screenshots

1. Open the `public/screens/` folder and click **Add file → Upload files**.
2. Upload a PNG or JPG. Use lowercase names with dashes, e.g. `my-project-dashboard.png`.
3. Reference it without the `public` part:
   - In an overview page: `![Dashboard](/screens/my-project-dashboard.png)`
   - As the overview's large image: `image: /screens/my-project-dashboard.png` in the header
   - On the project's card: `image: '/screens/my-project-dashboard.png'` for that
     project in `src/data/site.ts` (see below)

Images about 1600px wide work well. Crop out anything private before uploading,
such as hostnames, IP addresses, usernames or customer names. The site is public.

## 5. Intro text, links and project tweaks

Edit `src/data/site.ts` (click the file, then the ✏️ pencil icon).

**Site text and links:**

```ts
export const site = {
  githubUser: 'ttorbert',
  name: 'ttorbert',
  tagline: 'Things I’m building.',   // the big heading
  intro: 'A collection of projects…', // the paragraph under it
  topic: 'portfolio',                 // the GitHub topic that selects repos
  links: {
    github: 'https://github.com/ttorbert',
    linkedin: 'https://www.linkedin.com/in/you',  // remove the // to enable
    email: 'mailto:you@example.com',
  },
};
```

**Per-project tweaks**, keyed by repo name:

```ts
export const overrides = {
  'ingest-lag-profiler': {
    featured: true,                          // larger card in a "Featured" section at the top
    order: 1,                                // lower numbers first
    title: 'Ingest Lag Profiler',            // replaces the name made from the repo name
    blurb: 'A different card description.',  // replaces the GitHub description
    image: '/screens/ilp-dashboard.png',     // screenshot at the top of the card
    hidden: false,                           // true hides it without removing the topic
  },
};
```

Every field is optional. A typo here (a missing quote or comma) makes the build
fail. The live site stays on the last good version, and the error is shown in
the **Actions** tab.

## 6. Updating the site

The site rebuilds automatically:

- **On every push to `main`**, including edits made on the GitHub website.
- **Every night at 09:17 UTC**, which picks up new tags, descriptions and stars.

Changes to *other* repos, such as adding the `portfolio` topic or editing a
description, don't trigger a build. To publish them right away, run it by hand:

1. Open this repo's **Actions** tab.
2. Click **Deploy to GitHub Pages** in the left sidebar.
3. Click **Run workflow** on the right, then the green **Run workflow** button.

A run takes about a minute. A green check means it's live. Refresh the site, or
hard refresh with Cmd/Ctrl+Shift+R if you still see the old version.

To change the nightly time, edit the `cron` line in `.github/workflows/deploy.yml`.
Times are in UTC.

## 7. Optional: custom domain

To serve the site at e.g. `ttorbert.dev`:

1. Buy the domain from any registrar (Cloudflare, Namecheap, Porkbun and so on).
2. At the registrar, add DNS records:
   - For the root domain (`ttorbert.dev`): four **A** records pointing to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - For `www`: a **CNAME** record pointing to `ttorbert.github.io`
3. In **Settings → Pages → Custom domain**, enter the domain and click **Save**.
4. Wait for the DNS check to pass (minutes to hours), then tick **Enforce HTTPS**.
5. Change `site` in `astro.config.mjs` to the new URL, and add a file
   `public/CNAME` containing just the domain name.

GitHub's guide: [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
To avoid domain takeover, also verify the domain under your GitHub account's
**Settings → Pages**.

## 8. Optional: private repos

Only public repos appear by default, because the build uses GitHub's built-in
workflow token, which can only read public repos. To include private ones:

1. Create a **fine-grained personal access token**: GitHub **Settings →
   Developer settings → Personal access tokens → Fine-grained tokens →
   Generate new token**.
   - Repository access: the private repos you want shown.
   - Permissions: **Metadata: Read-only**. Nothing else.
2. In this repo, go to **Settings → Secrets and variables → Actions → New
   repository secret**, name it `PORTFOLIO_TOKEN`, and paste the token.
3. The build code then needs a small change to use the token and to hide the
   **Code** link for private repos, since visitors can't open them. This isn't
   built yet; ask Claude to add it.

Everything on a card is public, so check a private repo's name, description and
topics before tagging it.

## 9. Optional: working with Claude

For Claude Code (claude.ai/code) to push changes to this repo, the **Claude
GitHub App** must have access to it:

1. Go to <https://github.com/apps/claude/installations/select_target> and pick your account.
2. Under **Repository access**, choose **Only select repositories** and add
   `ttorbert.github.io` (or choose **All repositories**). Click **Save** or **Install**.
3. Check it under repo **Settings → GitHub Apps**: **Claude** should be listed.

If pushes are still refused, reconnect GitHub from claude.ai settings → Connectors.

Claude only needs *read* access to your other public repos, for example to read
a project when drafting its overview page. It has that without the app.

## 10. Local development

Optional; only needed to preview changes on your own computer before pushing.
Requires [Node.js](https://nodejs.org) 20 or later.

```bash
git clone https://github.com/ttorbert/ttorbert.github.io
cd ttorbert.github.io
npm install
npm run dev
```

Open http://localhost:4321. Pages reload as you edit. `npm run build` creates
the production files in `dist/`.

Locally, the GitHub API may rate-limit requests without a token. To avoid it,
run `GITHUB_TOKEN=$(gh auth token) npm run dev` if you have the
[GitHub CLI](https://cli.github.com). If GitHub can't be reached at all, the site
shows a sample card and a "Preview build" notice.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| A tagged project doesn't appear | Check it's public and the topic is exactly `portfolio`, then run the workflow by hand. |
| Site shows a blank or Jekyll-style page | **Settings → Pages → Source** must be **GitHub Actions**. Then run the workflow. |
| Overview link doesn't appear on a card | The file name must match the repo name exactly, plus `.md`, in `src/content/projects/`. |
| Image doesn't show | The path starts with `/screens/`, not `/public/screens/`. Names are case-sensitive. |
| Workflow failed (red ✗) | Open the run in the **Actions** tab and read the **build** step's log. It's usually a typo in `site.ts` or an overview's header. |
| Changes don't show after a green run | Hard refresh (Cmd/Ctrl+Shift+R). GitHub Pages can cache for up to 10 minutes. |
| "Preview build: GitHub wasn't reachable" on the live site | The GitHub API failed during the build. Run the workflow again. |
