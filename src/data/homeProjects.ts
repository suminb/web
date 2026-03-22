import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const dataDir = path.join(process.cwd(), "data");

/** Single year, or [start, end]; `end === null` means ongoing. */
export type FeaturedYear = number | [number, number | null];

export type FeaturedProject = {
  title: string;
  blurb: string;
  tags: string[];
  href: string;
  cta: string;
  year?: FeaturedYear;
  workplace?: string;
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
        `featured_projects.yml entry ${entryIndex}: year array must be [start] or [start, end]`,
      );
    }
    const start = raw[0];
    if (typeof start !== "number" || !Number.isFinite(start)) {
      throw new Error(
        `featured_projects.yml entry ${entryIndex}: year range must start with a number`,
      );
    }
    if (raw.length === 1) return [start, null];
    return [start, normalizeEndYear(raw[1])];
  }
  throw new Error(
    `featured_projects.yml entry ${entryIndex}: year must be a number or [start, end?]`,
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

export type MoreProject = {
  title: string;
  href: string;
  description?: string;
  tags: string[];
};

type FeaturedRaw = {
  title: string;
  blurb: string;
  tags: string[];
  cta: string;
  year?: unknown;
  workplace?: string;
  href?: string;
  experience_slug?: string;
};

type MoreRaw = {
  title: string;
  description?: string;
  tags?: string[];
  href?: string;
  experience_slug?: string;
};

function resolveLink(
  raw: { href?: string; experience_slug?: string },
  experienceUrl: (key: string) => string,
  context: string,
): string {
  if (raw.experience_slug) return experienceUrl(raw.experience_slug);
  if (raw.href !== undefined && raw.href !== "") return raw.href;
  throw new Error(`${context}: set either href or experience_slug`);
}

export function loadFeaturedProjects(
  experienceUrl: (key: string) => string,
): FeaturedProject[] {
  const file = path.join(dataDir, "featured_projects.yml");
  const data = yaml.load(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error("data/featured_projects.yml must be a YAML list");
  }
  return (data as FeaturedRaw[]).map((row, i) => {
    const out: FeaturedProject = {
      title: row.title,
      blurb: row.blurb,
      tags: row.tags ?? [],
      href: resolveLink(row, experienceUrl, `featured_projects.yml entry ${i}`),
      cta: row.cta,
    };
    const y = parseFeaturedYear(row.year, i);
    if (y !== undefined) out.year = y;
    if (row.workplace?.trim()) out.workplace = row.workplace.trim();
    return out;
  });
}

export function loadMoreProjects(
  experienceUrl: (key: string) => string,
): MoreProject[] {
  const file = path.join(dataDir, "more_projects.yml");
  const data = yaml.load(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error("data/more_projects.yml must be a YAML list");
  }
  return (data as MoreRaw[]).map((row, i) => {
    const href = resolveLink(row, experienceUrl, `more_projects.yml entry ${i}`);
    const out: MoreProject = {
      title: row.title,
      href,
      tags: row.tags ?? [],
    };
    if (row.description?.trim()) out.description = row.description.trim();
    return out;
  });
}
