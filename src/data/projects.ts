import { site, overrides } from './site';

export interface Project {
  name: string;
  title: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  updated: Date;
  featured: boolean;
  image: string | null;
  order: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

const SAMPLE: GitHubRepo[] = [
  {
    name: 'example-project',
    description:
      'Sample card shown because GitHub could not be reached during this build. Real projects appear once the site builds on GitHub.',
    html_url: `https://github.com/${site.githubUser}`,
    homepage: null,
    language: 'TypeScript',
    topics: [site.topic, 'demo'],
    stargazers_count: 0,
    pushed_at: new Date().toISOString(),
    fork: false,
    archived: false,
  },
];

async function fetchRepos(): Promise<{ repos: GitHubRepo[]; ok: boolean }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-site-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const repos: GitHubRepo[] = [];
  try {
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(
        `https://api.github.com/users/${site.githubUser}/repos?per_page=100&page=${page}&sort=pushed`,
        { headers },
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const batch = (await res.json()) as GitHubRepo[];
      repos.push(...batch);
      if (batch.length < 100) break;
    }
    return { repos, ok: true };
  } catch (err) {
    console.warn(`[projects] Could not fetch repos (${(err as Error).message}); using sample data.`);
    return { repos: SAMPLE, ok: false };
  }
}

function prettify(name: string) {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getProjects(): Promise<{ projects: Project[]; live: boolean }> {
  const { repos, ok } = await fetchRepos();

  const projects = repos
    .filter((r) => (r.topics ?? []).includes(site.topic) && !overrides[r.name]?.hidden)
    .map((r): Project => {
      const o = overrides[r.name] ?? {};
      return {
        name: r.name,
        title: o.title ?? prettify(r.name),
        description: o.blurb ?? r.description ?? '',
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        topics: (r.topics ?? []).filter((t) => t !== site.topic),
        stars: r.stargazers_count,
        updated: new Date(r.pushed_at),
        featured: o.featured ?? false,
        image: o.image ?? null,
        order: o.order ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.order - b.order ||
        b.updated.getTime() - a.updated.getTime(),
    );

  return { projects, live: ok };
}
