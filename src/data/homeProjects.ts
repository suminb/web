import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import {
  formatProjectYearRange,
  parseProjectYearRange,
  projectYearDatetime,
  type ProjectYearRange,
} from "./archiveProjects";

const dataDir = path.join(process.cwd(), "data");
const homeProjectsPath = path.join(dataDir, "home_projects.yml");

export type FeaturedYear = ProjectYearRange;

export type FeaturedProject = {
  title: string;
  description: string;
  tags: string[];
  /** Resolved destination; empty or "#" yields a non-clickable title (see card). */
  url: string;
  cta: string;
  year?: FeaturedYear;
  workplace?: string;
};

export type MoreProject = {
  title: string;
  url: string;
  cta: string;
  tags: string[];
  description?: string;
  year?: FeaturedYear;
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
};

function parseFeaturedYear(
  raw: unknown,
  entryIndex: number,
): FeaturedYear | undefined {
  if (raw === undefined || raw === null) return undefined;
  return parseProjectYearRange(raw, `home_projects.yml[${entryIndex}]`);
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
  const url = resolveLink(row, experienceUrl, `home_projects.yml[${i}]`);
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
  const text = fs.readFileSync(homeProjectsPath, "utf8");
  const list = yaml.load(text) as unknown;
  if (!Array.isArray(list)) {
    throw new Error("data/home_projects.yml must be a YAML list of projects");
  }

  const normalized = list.map((row, i) =>
    normalizeProjectRow(row as ProjectRowRaw, i, experienceUrl),
  );

  const featuredProjects: FeaturedProject[] = [];
  const moreRaw: FeaturedProject[] = [];
  for (let i = 0; i < list.length; i++) {
    const row = list[i] as ProjectRowRaw;
    const p = normalized[i]!;
    if (row.featured === true) featuredProjects.push(p);
    else moreRaw.push(p);
  }

  return {
    featuredProjects,
    moreProjects: moreRaw.map(toMoreProject),
  };
}
