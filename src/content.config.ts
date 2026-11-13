import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One Markdown file per project overview page: src/content/projects/<repo-name>.md
// Files starting with "_" (like _template.md) are ignored.
const projects = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/projects',
    // Keep the filename as-is so it matches the repo name exactly.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string().optional(), // defaults to the card title
    tagline: z.string().optional(), // one line under the title; defaults to the repo description
    image: z.string().optional(), // hero image: path in /public or full URL
  }),
});

export const collections = { projects };
