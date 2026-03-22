import { describe, it, expect } from "vitest";
import {
  formatArchiveYear,
  archiveProjectTags,
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
