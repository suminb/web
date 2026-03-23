import { describe, it, expect } from "vitest";
import {
  applyProjectsTagFilter,
  parseProjectTagsAttribute,
  projectMatchesTagFilter,
  type ProjectsTagFilterHost,
} from "./projectTagFilter";

describe("parseProjectTagsAttribute", () => {
  it("returns empty array for null or empty", () => {
    expect(parseProjectTagsAttribute(null)).toEqual([]);
    expect(parseProjectTagsAttribute("")).toEqual([]);
  });

  it("parses a valid JSON string array", () => {
    expect(parseProjectTagsAttribute('["ml","kotlin"]')).toEqual([
      "ml",
      "kotlin",
    ]);
  });

  it("filters out non-string entries", () => {
    expect(parseProjectTagsAttribute('["a",1,null,"b"]')).toEqual(["a", "b"]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseProjectTagsAttribute("{not json")).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    expect(parseProjectTagsAttribute('"hello"')).toEqual([]);
    expect(parseProjectTagsAttribute("{}")).toEqual([]);
  });
});

describe("projectMatchesTagFilter", () => {
  it("matches case-insensitively", () => {
    expect(projectMatchesTagFilter(["ML", "Kotlin"], "ml")).toBe(true);
    expect(projectMatchesTagFilter(["python"], "PYTHON")).toBe(true);
  });

  it("returns false when tag is absent", () => {
    expect(projectMatchesTagFilter(["java", "kafka"], "ml")).toBe(false);
  });

  it("returns false for empty project tags", () => {
    expect(projectMatchesTagFilter([], "anything")).toBe(false);
  });
});

describe("applyProjectsTagFilter", () => {
  function mockHost(cards: { tagsJson: string }[]): {
    host: ProjectsTagFilterHost;
    bar: { hidden: boolean };
    label: { textContent: string };
    cardStyles: { display: string }[];
  } {
    const bar = { hidden: true };
    const label = { textContent: "" };
    const cardStyles = cards.map(() => ({ display: "" }));

    const host: ProjectsTagFilterHost = {
      getElementById(id: string): HTMLElement | null {
        if (id === "tag-filter-bar") return bar as unknown as HTMLElement;
        if (id === "tag-filter-label") return label as unknown as HTMLElement;
        return null;
      },
      querySelectorAll(): NodeListOf<Element> {
        const nodes = cardStyles.map((style, i) => ({
          getAttribute(name: string) {
            return name === "data-tags" ? cards[i]!.tagsJson : null;
          },
          style,
        }));
        return nodes as unknown as NodeListOf<Element>;
      },
    };

    return { host, bar, label, cardStyles };
  }

  it("does nothing when activeTag is null or empty", () => {
    const { host, bar, label, cardStyles } = mockHost([
      { tagsJson: '["a"]' },
    ]);
    applyProjectsTagFilter(host, null);
    expect(bar.hidden).toBe(true);
    expect(label.textContent).toBe("");
    expect(cardStyles[0]!.display).toBe("");

    applyProjectsTagFilter(host, "");
    expect(bar.hidden).toBe(true);
    expect(cardStyles[0]!.display).toBe("");
  });

  it("shows bar, sets label, and hides non-matching cards", () => {
    const { host, bar, label, cardStyles } = mockHost([
      { tagsJson: '["ml","kotlin"]' },
      { tagsJson: '["java","kafka"]' },
    ]);
    applyProjectsTagFilter(host, "java");
    expect(bar.hidden).toBe(false);
    expect(label.textContent).toBe("java");
    expect(cardStyles[0]!.display).toBe("none");
    expect(cardStyles[1]!.display).toBe("");
  });

  it("keeps cards that match case-insensitively", () => {
    const { host, cardStyles } = mockHost([{ tagsJson: '["Python"]' }]);
    applyProjectsTagFilter(host, "python");
    expect(cardStyles[0]!.display).toBe("");
  });

  it("hides cards with invalid data-tags (treated as no tags)", () => {
    const { host, cardStyles } = mockHost([{ tagsJson: "not-json" }]);
    applyProjectsTagFilter(host, "ml");
    expect(cardStyles[0]!.display).toBe("none");
  });
});
