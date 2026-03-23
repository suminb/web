/**
 * Client-side tag filter for /projects.html (?tag=…).
 * Keeps DOM updates in one place so behavior is unit-testable.
 */

export function parseProjectTagsAttribute(attr: string | null): string[] {
  if (attr == null || attr === "") return [];
  try {
    const parsed = JSON.parse(attr) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

export function projectMatchesTagFilter(
  projectTags: string[],
  activeTag: string
): boolean {
  const needle = activeTag.toLowerCase();
  return projectTags.some((t) => t.toLowerCase() === needle);
}

/** Subset of Document used by {@link applyProjectsTagFilter} (mockable in tests). */
export type ProjectsTagFilterHost = Pick<
  Document,
  "getElementById" | "querySelectorAll"
>;

export function applyProjectsTagFilter(
  root: ProjectsTagFilterHost,
  activeTag: string | null
): void {
  if (!activeTag) return;

  const bar = root.getElementById("tag-filter-bar");
  const label = root.getElementById("tag-filter-label");
  if (bar) bar.hidden = false;
  if (label) label.textContent = activeTag;

  root.querySelectorAll("[data-tags]").forEach((el) => {
    const tags = parseProjectTagsAttribute(el.getAttribute("data-tags"));
    if (!projectMatchesTagFilter(tags, activeTag)) {
      (el as HTMLElement).style.display = "none";
    }
  });
}
