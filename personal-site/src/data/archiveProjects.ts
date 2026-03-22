import projectsJson from "../../../projects.json";

export type ArchiveYear = number | [number, number];

export type ArchiveProject = {
  name: string;
  url?: string;
  year: ArchiveYear;
  type: string;
  languages: string[];
  keywords: string[];
  description: string;
};

function yearSortKey(year: ArchiveYear): number {
  return Array.isArray(year) ? Math.max(year[0], year[1]) : year;
}

export function formatArchiveYear(year: ArchiveYear): string {
  if (Array.isArray(year)) {
    return year[0] === year[1] ? String(year[0]) : `${year[0]}–${year[1]}`;
  }
  return String(year);
}

/** Tags for chips: languages first, then keywords (deduped, capped). */
export function archiveProjectTags(p: ArchiveProject, max = 8): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...p.languages, ...p.keywords]) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

export const archiveProjects: ArchiveProject[] = projectsJson as ArchiveProject[];

export function sortedArchiveProjects(): ArchiveProject[] {
  return [...archiveProjects].sort((a, b) => {
    const dy = yearSortKey(b.year) - yearSortKey(a.year);
    if (dy !== 0) return dy;
    return a.name.localeCompare(b.name);
  });
}
