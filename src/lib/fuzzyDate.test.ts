import { describe, it, expect } from "vitest";
import { FuzzyDate } from "./fuzzyDate";

describe("FuzzyDate constructor", () => {
  it("parses an exact date", () => {
    const d = new FuzzyDate("2026-03-24");
    expect(d.year).toBe(2026);
    expect(d.month).toBe(3);
    expect(d.day).toBe(24);
  });

  it("parses a month-only date", () => {
    const d = new FuzzyDate("2026-03-??");
    expect(d.year).toBe(2026);
    expect(d.month).toBe(3);
    expect(d.day).toBeNull();
  });

  it("parses a year-only date", () => {
    const d = new FuzzyDate("2026-??-??");
    expect(d.year).toBe(2026);
    expect(d.month).toBeNull();
    expect(d.day).toBeNull();
  });

  it("throws on invalid format", () => {
    expect(() => new FuzzyDate("2026-03")).toThrow();
    expect(() => new FuzzyDate("26-03-24")).toThrow();
    expect(() => new FuzzyDate("not-a-date")).toThrow();
    expect(() => new FuzzyDate("")).toThrow();
  });

  it("throws when day is known but month is unknown", () => {
    expect(() => new FuzzyDate("2026-??-24")).toThrow();
  });

  it("throws on invalid month value", () => {
    expect(() => new FuzzyDate("2026-00-01")).toThrow();
    expect(() => new FuzzyDate("2026-13-01")).toThrow();
  });

  it("throws on invalid day value", () => {
    expect(() => new FuzzyDate("2026-03-00")).toThrow();
    expect(() => new FuzzyDate("2026-03-32")).toThrow();
    expect(() => new FuzzyDate("2026-02-31")).toThrow(); // Feb has at most 28/29 days
    expect(() => new FuzzyDate("2026-02-29")).toThrow(); // 2026 is not a leap year
    expect(() => new FuzzyDate("2024-02-29")).not.toThrow(); // 2024 is a leap year
  });
});

describe("FuzzyDate.granularity", () => {
  it("returns 'day' for an exact date", () => {
    expect(new FuzzyDate("2026-03-24").granularity).toBe("day");
  });

  it("returns 'month' when day is unknown", () => {
    expect(new FuzzyDate("2026-03-??").granularity).toBe("month");
  });

  it("returns 'year' when month and day are unknown", () => {
    expect(new FuzzyDate("2026-??-??").granularity).toBe("year");
  });
});

describe("FuzzyDate.toISOString", () => {
  it("returns full date for exact date", () => {
    expect(new FuzzyDate("2026-03-24").toISOString()).toBe("2026-03-24");
  });

  it("returns year-month for month granularity", () => {
    expect(new FuzzyDate("2026-03-??").toISOString()).toBe("2026-03");
  });

  it("returns year for year granularity", () => {
    expect(new FuzzyDate("2026-??-??").toISOString()).toBe("2026");
  });

  it("zero-pads single-digit month and day", () => {
    expect(new FuzzyDate("2026-01-05").toISOString()).toBe("2026-01-05");
  });
});

describe("FuzzyDate.toString", () => {
  it("delegates to toISOString", () => {
    expect(String(new FuzzyDate("2026-03-24"))).toBe("2026-03-24");
    expect(String(new FuzzyDate("2026-03-??"))).toBe("2026-03");
    expect(String(new FuzzyDate("2026-??-??"))).toBe("2026");
  });
});

describe("FuzzyDate.format", () => {
  it("returns ISO string when no locale is provided", () => {
    expect(new FuzzyDate("2026-03-24").format()).toBe("2026-03-24");
    expect(new FuzzyDate("2026-03-??").format()).toBe("2026-03");
    expect(new FuzzyDate("2026-??-??").format()).toBe("2026");
  });

  it("formats exact date with 'en' locale", () => {
    expect(new FuzzyDate("2026-03-24").format("en")).toBe("March 24, 2026");
  });

  it("formats month-only date with 'en' locale", () => {
    expect(new FuzzyDate("2026-03-??").format("en")).toBe("March 2026");
  });

  it("formats year-only date with 'en' locale", () => {
    expect(new FuzzyDate("2026-??-??").format("en")).toBe("2026");
  });

  it("formats with a different locale", () => {
    // Smoke-test: just check it doesn't throw and returns a non-empty string
    const result = new FuzzyDate("2026-03-24").format("fr");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
