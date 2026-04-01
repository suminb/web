import {
  formatProjectYearRange,
  loadProjectsYamlList,
  parseProjectYearRange,
  projectYearDatetime,
  type ProjectYearRange,
} from "./archiveProjects";

export type { ProjectYearRange };

export type FeaturedProject = {
  title: string;
  description: string;
  tags: string[];
  /** Resolved destination; empty or "#" yields a non-clickable title (see card). */
  url: string;
  cta: string;
  year?: ProjectYearRange;
  workplace?: string;
};

export type MoreProject = {
  title: string;
  url: string;
  cta: string;
  tags: string[];
  description?: string;
  year?: ProjectYearRange;
  workplace?: string;
};

type ProjectRowRaw = {
  title: string;
  description?: string;
  tags?: string[];
  cta?: string;
  year?: unknown;
  workplace?: string;
  /** Omitted or YAML `null` → non-clickable when there is no `experience_slug`. */
  url?: string | null;
  experience_slug?: string;
  featured?: boolean;
  /** When true, row is only used as an archive entry (see `archiveProjects`). */
  archived?: boolean;
};

function parseFeaturedYear(
  raw: unknown,
  entryIndex: number,
): ProjectYearRange | undefined {
  if (raw === undefined || raw === null) return undefined;
  return parseProjectYearRange(raw, `projects.yml[${entryIndex}]`);
}

export const formatFeaturedYear = formatProjectYearRange;
export const featuredYearDatetime = projectYearDatetime;

function resolveLink(
  raw: { url?: string | null; experience_slug?: string },
  experienceUrl: (key: string) => string,
  context: string,
): string {
  const slug = raw.experience_slug?.trim();
  if (slug) return experienceUrl(slug);

  const u = raw.url;
  if (u === null || u === undefined) return "";
  if (typeof u !== "string") {
    throw new Error(`${context}: url must be a string or null`);
  }
  const trimmed = u.trim();
  if (trimmed === "") return "";
  return trimmed;
}

function normalizeProjectRow(
  row: ProjectRowRaw,
  i: number,
  experienceUrl: (key: string) => string,
): FeaturedProject {
  const url = resolveLink(row, experienceUrl, `projects.yml[${i}]`);
  const out: FeaturedProject = {
    title: row.title,
    description: typeof row.description === "string" ? row.description : "",
    tags: row.tags ?? [],
    url,
    cta: typeof row.cta === "string" ? row.cta : "",
  };
  const y = parseFeaturedYear(row.year, i);
  if (y !== undefined) out.year = y;
  if (row.workplace?.trim()) out.workplace = row.workplace.trim();
  return out;
}

function toMoreProject(p: FeaturedProject): MoreProject {
  const out: MoreProject = {
    title: p.title,
    url: p.url,
    tags: p.tags,
    cta: p.cta,
    year: p.year,
    workplace: p.workplace,
  };
  const d = p.description.trim();
  if (d) out.description = d;
  return out;
}

export function loadHomeProjects(experienceUrl: (key: string) => string): {
  featuredProjects: FeaturedProject[];
  moreProjects: MoreProject[];
} {
  const list = loadProjectsYamlList();

  const featuredProjects: FeaturedProject[] = [];
  const moreRaw: FeaturedProject[] = [];
  for (let i = 0; i < list.length; i++) {
    const row = list[i] as ProjectRowRaw;
    if (row.archived === true) continue;
    const p = normalizeProjectRow(row, i, experienceUrl);
    if (row.featured === true) featuredProjects.push(p);
    else moreRaw.push(p);
  }

  return {
    featuredProjects,
    moreProjects: moreRaw.map(toMoreProject),
  };
}
