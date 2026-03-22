import { describe, it, expect, vi } from "vitest";

vi.mock("./experiences", () => ({
  isProjectDetailPageKey: vi.fn(),
  getExperienceForPage: vi.fn(),
  listExperienceDetailPageKeys: vi.fn(() => []),
  listProjectDetailPageKeys: vi.fn(() => []),
}));

import {
  experienceDetailPath,
  experienceKeyFromSlug,
  experiencePageProps,
} from "./experiencePageData";
import {
  isProjectDetailPageKey,
  getExperienceForPage,
} from "./experiences";

describe("experienceDetailPath", () => {
  it("returns a /projects/ URL for a project key", () => {
    vi.mocked(isProjectDetailPageKey).mockReturnValue(true);
    expect(experienceDetailPath("my-project")).toBe(
      "/projects/my-project.html",
    );
  });

  it("returns an /experience/ URL for a non-project key", () => {
    vi.mocked(isProjectDetailPageKey).mockReturnValue(false);
    expect(experienceDetailPath("my-experience")).toBe(
      "/experience/my-experience.html",
    );
  });
});

describe("experienceKeyFromSlug", () => {
  it("returns the slug unchanged when it is a valid string", () => {
    expect(experienceKeyFromSlug("some-slug")).toBe("some-slug");
  });

  it("throws an error when the slug is undefined", () => {
    expect(() => experienceKeyFromSlug(undefined)).toThrow(
      "Missing experience slug",
    );
  });
});

describe("experiencePageProps", () => {
  it("throws for an unknown or unpublished key", async () => {
    vi.mocked(getExperienceForPage).mockReturnValue(undefined);
    await expect(experiencePageProps("unknown-key")).rejects.toThrow(
      "Unknown or unpublished experience: unknown-key",
    );
  });

  it("returns the experience record and rendered HTML", async () => {
    vi.mocked(getExperienceForPage).mockReturnValue({
      published: true,
      parent: null,
      title: "Test Project",
      starts_at: "Jan 2020",
      ends_at: "Dec 2020",
      category: "Engineering",
      tags: ["typescript", "testing"],
      description: "# Hello\n\nThis is a **test**.",
    });

    const { exp, contentHtml } = await experiencePageProps("test-key");

    expect(exp.title).toBe("Test Project");
    expect(contentHtml).toContain("<h1");
    expect(contentHtml).toContain("Hello");
    expect(contentHtml).toContain("<strong>test</strong>");
  });
});
