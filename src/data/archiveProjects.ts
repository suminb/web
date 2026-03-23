import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const archivedProjectsPath = path.join(
  process.cwd(),
  "data",
  "archived_projects.yml",
);

/** `[start, end]`; `end === null` means ongoing. Use `[y, y]` for a single calendar year. */
export type ProjectYearRange = [number, number | null];

export type ArchiveProject = {
  title: string;
  url?: string;
  year: ProjectYearRange;
  type: string;
  tags: string[];
  description: string;
};

function normalizeEndYear(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string" && raw.toLowerCase() === "none") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  throw new Error(
    `year end must be a finite number, null, or None; got ${String(raw)}`,
  );
}

/**
 * Parse YAML `year`: a finite number becomes `[n, n]`; otherwise `[start, end|null]` with exactly two elements.
 */
export function parseProjectYearRange(raw: unknown, context: string): ProjectYearRange {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return [raw, raw];
  }
  if (!Array.isArray(raw) || raw.length !== 2) {
    throw new Error(
      `${context}: year must be a finite number or a two-element array [start, end|null]`,
    );
  }
  const start = raw[0];
  if (typeof start !== "number" || !Number.isFinite(start)) {
    throw new Error(`${context}: year range must start with a finite number`);
  }
  return [start, normalizeEndYear(raw[1])];
}

function loadArchivedProjects(): ArchiveProject[] {
  const text = fs.readFileSync(archivedProjectsPath, "utf8");
  const data = yaml.load(text);
  if (!Array.isArray(data)) {
    throw new Error("data/archived_projects.yml must be a YAML list of projects");
  }
  return (data as Record<string, unknown>[]).map((row, i) => ({
    ...row,
    year: parseProjectYearRange(row.year, `archived_projects.yml[${i}]`),
    tags: Array.isArray(row.tags) ? row.tags : [],
  })) as ArchiveProject[];
}

function yearSortKey(year: ProjectYearRange): number {
  const [a, b] = year;
  if (b === null) {
    return Math.max(a, new Date().getFullYear());
  }
  return Math.max(a, b);
}

export function formatProjectYearRange(year: ProjectYearRange): string {
  const [a, b] = year;
  if (b === null) return `${a}–present`;
  if (a === b) return String(a);
  return `${a}–${b}`;
}

export const formatArchiveYear = formatProjectYearRange;

/** ISO date for `<time datetime>`: end year, or start when ongoing. */
export function projectYearDatetime(year: ProjectYearRange): string {
  const [a, b] = year;
  const y = b === null ? a : b;
  return `${y}-01-01`;
}

/** Tags for chips: YAML order preserved, deduped case-insensitively, capped. */
export function archiveProjectTags(p: ArchiveProject, max = 8): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of p.tags) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

export const archiveProjects: ArchiveProject[] = loadArchivedProjects();

export function sortedArchiveProjects(): ArchiveProject[] {
  return [...archiveProjects].sort((a, b) => {
    const dy = yearSortKey(b.year) - yearSortKey(a.year);
    if (dy !== 0) return dy;
    return a.title.localeCompare(b.title);
  });
}
