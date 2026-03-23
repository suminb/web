import { describe, it, expect } from "vitest";
import {
  formatTalkDate,
  talkYear,
  talkPrimaryHref,
  talkCardCta,
  talkTags,
  talkTagsForCard,
  type Talk,
  type TalkLinks,
} from "./talks";

describe("formatTalkDate", () => {
  it("formats an ISO date to US locale", () => {
    expect(formatTalkDate("2023-11-28")).toBe("Nov 28, 2023");
  });

  it("handles single-digit month and day", () => {
    expect(formatTalkDate("2020-01-05")).toBe("Jan 5, 2020");
  });
});

describe("talkYear", () => {
  it("extracts the calendar year as [y, y]", () => {
    expect(talkYear("2023-11-28")).toEqual([2023, 2023]);
  });
});

describe("talkPrimaryHref", () => {
  it("returns '#' when links is undefined", () => {
    expect(talkPrimaryHref(undefined)).toBe("#");
  });

  it("prefers event link", () => {
    const links: TalkLinks = {
      event: "https://event.example.com",
      video: "https://video.example.com",
      slides: "https://slides.example.com",
    };
    expect(talkPrimaryHref(links)).toBe("https://event.example.com");
  });

  it("falls back to video when no event", () => {
    const links: TalkLinks = {
      video: "https://video.example.com",
      slides: "https://slides.example.com",
    };
    expect(talkPrimaryHref(links)).toBe("https://video.example.com");
  });

  it("falls back to slides when no event or video", () => {
    const links: TalkLinks = {
      slides: "https://slides.example.com",
    };
    expect(talkPrimaryHref(links)).toBe("https://slides.example.com");
  });

  it("returns '#' when links object has no URLs", () => {
    expect(talkPrimaryHref({})).toBe("#");
  });
});

describe("talkCardCta", () => {
  it("returns empty string when links is undefined", () => {
    expect(talkCardCta(undefined)).toBe("");
  });

  it("returns 'Event' when event link is present", () => {
    expect(talkCardCta({ event: "https://e.co" })).toBe("Event");
  });

  it("returns 'Video' when only video is present", () => {
    expect(talkCardCta({ video: "https://v.co" })).toBe("Video");
  });

  it("returns 'Slides' when only slides is present", () => {
    expect(talkCardCta({ slides: "https://s.co" })).toBe("Slides");
  });

  it("returns empty string for empty links object", () => {
    expect(talkCardCta({})).toBe("");
  });
});

describe("talkTags", () => {
  it("returns kind, event, and venue when all present", () => {
    const talk: Talk = {
      title: "My Talk",
      date: "2023-01-01",
      kind: "Conference",
      event: "SomeConf",
      venue: "Hall A",
    };
    expect(talkTags(talk)).toEqual(["Conference", "SomeConf", "Hall A"]);
  });

  it("returns empty array when no optional fields", () => {
    const talk: Talk = { title: "My Talk", date: "2023-01-01" };
    expect(talkTags(talk)).toEqual([]);
  });

  it("omits missing fields", () => {
    const talk: Talk = {
      title: "My Talk",
      date: "2023-01-01",
      event: "SomeConf",
    };
    expect(talkTags(talk)).toEqual(["SomeConf"]);
  });
});

describe("talkTagsForCard", () => {
  it("excludes event (shown as workplace), keeps kind and venue", () => {
    const talk: Talk = {
      title: "My Talk",
      date: "2023-01-01",
      kind: "Conference",
      event: "SomeConf",
      venue: "Hall A",
    };
    expect(talkTagsForCard(talk)).toEqual(["Conference", "Hall A"]);
  });

  it("returns empty array when no kind or venue", () => {
    const talk: Talk = {
      title: "My Talk",
      date: "2023-01-01",
      event: "SomeConf",
    };
    expect(talkTagsForCard(talk)).toEqual([]);
  });
});
