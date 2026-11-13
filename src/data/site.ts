// Edit this file to personalize the site.

export const site = {
  githubUser: 'ttorbert',
  name: 'ttorbert',
  tagline: 'Things I’m building.',
  intro:
    'A collection of projects I’m working on — tools, experiments, and apps. Everything here lives on GitHub; click through to explore the code.',
  // Repos with this GitHub topic appear on the site automatically.
  topic: 'portfolio',
  links: {
    github: 'https://github.com/ttorbert',
    // email: 'mailto:you@example.com',
    // linkedin: 'https://www.linkedin.com/in/you',
  } as Record<string, string>,
};

// Optional per-project tweaks, keyed by repo name.
//  featured: shown larger at the top
//  order:    lower numbers come first (otherwise sorted by most recently updated)
//  title / blurb / image: override what GitHub provides
//  image:    a path in /public (e.g. '/screens/my-app.png') or a full URL
//  hidden:   hide a tagged repo without removing the topic
export const overrides: Record<
  string,
  {
    featured?: boolean;
    order?: number;
    title?: string;
    blurb?: string;
    image?: string;
    hidden?: boolean;
  }
> = {
  // 'my-cool-app': { featured: true, order: 1, blurb: 'A longer description…' },
};
