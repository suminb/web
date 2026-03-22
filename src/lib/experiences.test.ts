import { describe, it, expect } from "vitest";
import { truncatePlain } from "./experiences";

describe("truncatePlain", () => {
  it("returns text unchanged when within the limit", () => {
    expect(truncatePlain("Hello world", 20)).toBe("Hello world");
  });

  it("returns text unchanged when exactly at the limit", () => {
    expect(truncatePlain("Hello", 5)).toBe("Hello");
  });

  it("truncates text that exceeds the limit and appends ellipsis", () => {
    expect(truncatePlain("Hello world", 5)).toBe("Hello…");
  });

  it("strips HTML tags", () => {
    expect(truncatePlain("<p>Hello</p>", 20)).toBe("Hello");
  });

  it("strips markdown special characters", () => {
    expect(truncatePlain("# Hello **world**", 20)).toBe("Hello world");
  });

  it("collapses multiple whitespace characters into a single space", () => {
    expect(truncatePlain("Hello   world", 20)).toBe("Hello world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(truncatePlain("  Hello  ", 20)).toBe("Hello");
  });

  it("returns an empty string for empty input", () => {
    expect(truncatePlain("", 10)).toBe("");
  });

  it("handles text containing both HTML and markdown", () => {
    expect(truncatePlain("<p>**bold** and `code`</p>", 30)).toBe(
      "bold and code",
    );
  });
});
