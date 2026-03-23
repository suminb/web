import { describe, it, expect } from "vitest";
import {
  archiveProjects,
  formatArchiveYear,
  archiveProjectTags,
  sortedArchiveProjects,
  type ArchiveProject,
} from "./archiveProjects";

describe("formatArchiveYear", () => {
  it("formats a single calendar year as [y, y]", () => {
    expect(formatArchiveYear([2020, 2020])).toBe("2020");
  });

  it("formats a year range", () => {
    expect(formatArchiveYear([2018, 2021])).toBe("2018–2021");
  });

  it("formats ongoing (null end)", () => {
    expect(formatArchiveYear([2019, null])).toBe("2019–present");
  });

  it("collapses a range where start equals end", () => {
    expect(formatArchiveYear([2019, 2019])).toBe("2019");
  });
});

describe("archiveProjectTags", () => {
  const project: ArchiveProject = {
    title: "Test",
    year: [2020, 2020],
    type: "open source",
    tags: ["Python", "JavaScript", "web", "data visualization"],
    description: "",
  };

  it("returns tags in list order", () => {
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
      tags: ["Python", "python", "web"],
    };
    expect(archiveProjectTags(p)).toEqual(["Python", "web"]);
  });

  it("caps at the specified max", () => {
    const p: ArchiveProject = {
      ...project,
      tags: ["A", "B", "C", "D", "E", "F"],
    };
    expect(archiveProjectTags(p, 4)).toEqual(["A", "B", "C", "D"]);
  });

  it("returns empty array when no tags", () => {
    const p: ArchiveProject = { ...project, tags: [] };
    expect(archiveProjectTags(p)).toEqual([]);
  });
});

/** Locks chip/tag output for every archived row in data/projects.yml. */
describe("projects.yml (archived) regression", () => {
  it("exposes every project with the fields archive pages need", () => {
    expect(archiveProjects.length).toBeGreaterThan(0);
    for (const p of archiveProjects) {
      expect(p.title, `project title`).toMatch(/\S/);
      expect(p.type, `${p.title} type`).toMatch(/\S/);
      expect(p.description, `${p.title} description`).toBeDefined();
      expect(Array.isArray(p.tags), `${p.title} tags`).toBe(true);
      expect(Array.isArray(p.year) && p.year.length === 2, `${p.title} year`).toBe(
        true,
      );
      expect(typeof p.year[0]).toBe("number");
    }
  });

  it("sortedArchiveProjects is stable (year desc, then title)", () => {
    const sorted = sortedArchiveProjects();
    expect(sorted.length).toBe(archiveProjects.length);
    const titles = new Set(sorted.map((p) => p.title));
    expect(titles.size).toBe(archiveProjects.length);
  });

  it("archiveProjectTags output per project (snapshot)", () => {
    const byName = Object.fromEntries(
      [...archiveProjects]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((p) => [p.title, archiveProjectTags(p)]),
    );
    expect(byName).toMatchSnapshot();
  });
});
