# ttorbert.github.io

Portfolio site built with [Astro](https://astro.build), hosted on GitHub Pages at https://ttorbert.github.io.

**Full setup instructions: [docs/SETUP.md](docs/SETUP.md)** (hosting, adding projects, overview pages, images, custom domain, private repos, troubleshooting). Quick reference below.

## Adding a project
Add the `portfolio` topic to a public repo on GitHub. The card uses the repo's
description, website (shown as "Live demo"), language and other topics.
The site rebuilds on every push to this repo and nightly; to update it right away,
go to **Actions → Deploy to GitHub Pages → Run workflow**.

## Adding an overview page for a project
1. Copy `src/content/projects/_template.md` to `src/content/projects/<repo-name>.md`
   (the filename must match the GitHub repo name).
2. Write the overview in Markdown.
3. Put any images in `public/screens/` and reference them as `/screens/file.png`.

The project's card then gets an **Overview →** link, and the card title links to the overview page.

## Other tweaks
Edit `src/data/site.ts` to change the intro text and links, or to feature, reorder, rename or hide projects.

## Local development
```bash
npm install
npm run dev
```
