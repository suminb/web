import { describe, it, expect } from "vitest";
import {
  archiveProjects,
  formatArchiveYear,
  archiveProjectTags,
  sortedArchiveProjects,
  type ArchiveProject,
} from "./archiveProjects";

describe("formatArchiveYear", () => {
  it("formats a single year", () => {
    expect(formatArchiveYear(2020)).toBe("2020");
  });

  it("formats a year range", () => {
    expect(formatArchiveYear([2018, 2021])).toBe("2018–2021");
  });

  it("collapses a range where start equals end", () => {
    expect(formatArchiveYear([2019, 2019])).toBe("2019");
  });
});

describe("archiveProjectTags", () => {
  const project: ArchiveProject = {
    name: "Test",
    year: 2020,
    type: "open source",
    languages: ["Python", "JavaScript"],
    keywords: ["web", "data visualization"],
    description: "",
  };

  it("returns languages first, then keywords", () => {
    expect(archiveProjectTags(project)).toEqual([
      "Python",
      "JavaScript",
      "web",
      "data visualization",
    ]);
  });

  it("deduplicates case-insensitively", () => {
    const p: ArchiveProject = {
      ...project,
      languages: ["Python"],
      keywords: ["python", "web"],
    };
    expect(archiveProjectTags(p)).toEqual(["Python", "web"]);
  });

  it("caps at the specified max", () => {
    const p: ArchiveProject = {
      ...project,
      languages: ["A", "B", "C"],
      keywords: ["D", "E", "F"],
    };
    expect(archiveProjectTags(p, 4)).toEqual(["A", "B", "C", "D"]);
  });

  it("returns empty array when no languages or keywords", () => {
    const p: ArchiveProject = {
      ...project,
      languages: [],
      keywords: [],
    };
    expect(archiveProjectTags(p)).toEqual([]);
  });
});

/**
 * Locks chip/tag output for every row in data/archived_projects.yml. After
 * consolidating languages+keywords into tags, this snapshot should still pass
 * once tag lists match the old merged order (or you update the snapshot on purpose).
 */
describe("archived_projects.yml regression", () => {
  it("exposes every project with the fields archive pages need", () => {
    expect(archiveProjects.length).toBeGreaterThan(0);
    for (const p of archiveProjects) {
      expect(p.name, `project name`).toMatch(/\S/);
      expect(p.type, `${p.name} type`).toMatch(/\S/);
      expect(p.description, `${p.name} description`).toBeDefined();
      expect(Array.isArray(p.languages), `${p.name} languages`).toBe(true);
      expect(Array.isArray(p.keywords), `${p.name} keywords`).toBe(true);
      expect(
        typeof p.year === "number" || Array.isArray(p.year),
        `${p.name} year`,
      ).toBe(true);
    }
  });

  it("sortedArchiveProjects is stable (year desc, then name)", () => {
    const sorted = sortedArchiveProjects();
    expect(sorted.length).toBe(archiveProjects.length);
    const names = new Set(sorted.map((p) => p.name));
    expect(names.size).toBe(archiveProjects.length);
  });

  it("archiveProjectTags output per project (snapshot)", () => {
    const byName = Object.fromEntries(
      [...archiveProjects]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => [p.name, archiveProjectTags(p)]),
    );
    expect(byName).toMatchSnapshot();
  });
});
