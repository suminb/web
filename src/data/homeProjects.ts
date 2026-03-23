import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const dataDir = path.join(process.cwd(), "data");
const homeProjectsPath = path.join(dataDir, "home_projects.yml");

/** Single year, or [start, end]; `end === null` means ongoing. */
export type FeaturedYear = number | [number, number | null];

export type FeaturedProject = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  cta: string;
  year?: FeaturedYear;
  workplace?: string;
};

export type MoreProject = {
  title: string;
  href: string;
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
  href?: string;
  experience_slug?: string;
  featured?: boolean;
};

function normalizeEndYear(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string" && raw.toLowerCase() === "none") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  throw new Error(
    `featured project year end must be a number, null, or None; got ${String(raw)}`,
  );
}

function parseFeaturedYear(raw: unknown, entryIndex: number): FeaturedYear | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (Array.isArray(raw)) {
    if (raw.length < 1 || raw.length > 2) {
      throw new Error(
        `home_projects.yml entry ${entryIndex}: year array must be [start] or [start, end]`,
      );
    }
    const start = raw[0];
    if (typeof start !== "number" || !Number.isFinite(start)) {
      throw new Error(
        `home_projects.yml entry ${entryIndex}: year range must start with a number`,
      );
    }
    if (raw.length === 1) return [start, null];
    return [start, normalizeEndYear(raw[1])];
  }
  throw new Error(
    `home_projects.yml entry ${entryIndex}: year must be a number or [start, end?]`,
  );
}

export function formatFeaturedYear(year: FeaturedYear): string {
  if (Array.isArray(year)) {
    const [a, b] = year;
    if (b == null) return `${a}–present`;
    if (a === b) return String(a);
    return `${a}–${b}`;
  }
  return String(year);
}

/** `datetime` for <time> (uses end year, or start if ongoing / single). */
export function featuredYearDatetime(year: FeaturedYear): string {
  if (Array.isArray(year)) {
    const [a, b] = year;
    const y = b == null ? a : b;
    return `${y}-01-01`;
  }
  return `${year}-01-01`;
}

function resolveLink(
  raw: { href?: string; experience_slug?: string },
  experienceUrl: (key: string) => string,
  context: string,
): string {
  if (raw.experience_slug) return experienceUrl(raw.experience_slug);
  if (raw.href !== undefined && raw.href !== "") return raw.href;
  throw new Error(`${context}: set either href or experience_slug`);
}

function normalizeProjectRow(
  row: ProjectRowRaw,
  i: number,
  experienceUrl: (key: string) => string,
): FeaturedProject {
  const href = resolveLink(row, experienceUrl, `home_projects.yml[${i}]`);
  const out: FeaturedProject = {
    title: row.title,
    description: typeof row.description === "string" ? row.description : "",
    tags: row.tags ?? [],
    href,
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
    href: p.href,
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
