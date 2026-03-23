export type FuzzyDateGranularity = "year" | "month" | "day";

const FUZZY_DATE_RE = /^(\d{4})-(\d{2}|\?\?)-(\d{2}|\?\?)$/;

/**
 * Represents a non-exact (fuzzy) date where the month and/or day may be
 * unknown. Accepts strings of the form:
 *   "2026-03-24"  – exact date
 *   "2026-03-??"  – month known, day unknown
 *   "2026-??-??"  – only year known
 */
export class FuzzyDate {
  readonly year: number;
  readonly month: number | null;
  readonly day: number | null;

  constructor(input: string) {
    const match = FUZZY_DATE_RE.exec(input);
    if (!match) {
      throw new Error(
        `Invalid FuzzyDate: "${input}". Expected "YYYY-MM-DD", "YYYY-MM-??", or "YYYY-??-??".`
      );
    }

    const [, yearStr, monthStr, dayStr] = match as [
      string,
      string,
      string,
      string,
    ];
    this.year = parseInt(yearStr, 10);

    if (monthStr === "??") {
      if (dayStr !== "??") {
        throw new Error(
          `Invalid FuzzyDate: "${input}". Day cannot be known when month is unknown.`
        );
      }
      this.month = null;
      this.day = null;
    } else {
      const month = parseInt(monthStr, 10);
      if (month < 1 || month > 12) {
        throw new Error(
          `Invalid FuzzyDate: "${input}". Month must be between 01 and 12.`
        );
      }
      this.month = month;

      if (dayStr === "??") {
        this.day = null;
      } else {
        const day = parseInt(dayStr, 10);
        const probe = new Date(this.year, month - 1, day);
        if (
          probe.getFullYear() !== this.year ||
          probe.getMonth() !== month - 1 ||
          probe.getDate() !== day
        ) {
          throw new Error(
            `Invalid FuzzyDate: "${input}". Day ${day} does not exist in month ${month}.`
          );
        }
        this.day = day;
      }
    }
  }

  /** Finest known granularity: "day", "month", or "year". */
  get granularity(): FuzzyDateGranularity {
    if (this.day !== null) return "day";
    if (this.month !== null) return "month";
    return "year";
  }

  /**
   * Returns an ISO-style string up to the finest known granularity:
   *   day   → "2026-03-24"
   *   month → "2026-03"
   *   year  → "2026"
   */
  toISOString(): string {
    if (this.granularity === "year") {
      return String(this.year);
    }
    const mm = String(this.month!).padStart(2, "0");
    if (this.granularity === "month") {
      return `${this.year}-${mm}`;
    }
    const dd = String(this.day!).padStart(2, "0");
    return `${this.year}-${mm}-${dd}`;
  }

  /**
   * Returns a locale-aware human-readable string up to the finest known
   * granularity using `Intl.DateTimeFormat`. Falls back to `toISOString()`
   * when no locale is provided.
   *
   * Examples (locale "en"):
   *   day   → "March 24, 2026"
   *   month → "March 2026"
   *   year  → "2026"
   */
  format(locale?: string): string {
    if (!locale) {
      return this.toISOString();
    }

    if (this.granularity === "year") {
      return String(this.year);
    }

    // Construct a Date anchored to the 1st of the month (or exact day).
    const date = new Date(this.year, (this.month ?? 1) - 1, this.day ?? 1);

    if (this.granularity === "day") {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    // month granularity
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
    }).format(date);
  }

  /** Returns the ISO-style string representation (same as `toISOString()`). */
  toString(): string {
    return this.toISOString();
  }
}
