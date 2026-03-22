import { describe, it, expect } from "vitest";
import { formatFeaturedYear, featuredYearDatetime } from "./homeProjects";

describe("formatFeaturedYear", () => {
  it("formats a single year", () => {
    expect(formatFeaturedYear(2023)).toBe("2023");
  });

  it("formats a range with end year", () => {
    expect(formatFeaturedYear([2020, 2023])).toBe("2020–2023");
  });

  it("formats an ongoing range (null end)", () => {
    expect(formatFeaturedYear([2021, null])).toBe("2021–present");
  });

  it("collapses a range where start equals end", () => {
    expect(formatFeaturedYear([2022, 2022])).toBe("2022");
  });
});

describe("featuredYearDatetime", () => {
  it("returns ISO date for a single year", () => {
    expect(featuredYearDatetime(2023)).toBe("2023-01-01");
  });

  it("uses the end year for a range", () => {
    expect(featuredYearDatetime([2020, 2024])).toBe("2024-01-01");
  });

  it("uses the start year when end is null (ongoing)", () => {
    expect(featuredYearDatetime([2021, null])).toBe("2021-01-01");
  });
});
