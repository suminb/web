import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const archivedProjectsPath = path.join(
  process.cwd(),
  "data",
  "archived_projects.yml",
);

export type ArchiveYear = number | [number, number];

export type ArchiveProject = {
  name: string;
  url?: string;
  year: ArchiveYear;
  type: string;
  tags: string[];
  description: string;
};

function loadArchivedProjects(): ArchiveProject[] {
  const text = fs.readFileSync(archivedProjectsPath, "utf8");
  const data = yaml.load(text);
  if (!Array.isArray(data)) {
    throw new Error("data/archived_projects.yml must be a YAML list of projects");
  }
  return (data as ArchiveProject[]).map((row) => ({
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
  }));
}

function yearSortKey(year: ArchiveYear): number {
  return Array.isArray(year) ? Math.max(year[0], year[1]) : year;
}

export function formatArchiveYear(year: ArchiveYear): string {
  if (Array.isArray(year)) {
    return year[0] === year[1] ? String(year[0]) : `${year[0]}–${year[1]}`;
  }
  return String(year);
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
    return a.name.localeCompare(b.name);
  });
}
