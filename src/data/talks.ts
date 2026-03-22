import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const talksPath = path.join(process.cwd(), "data", "talks.yml");

export type TalkLinks = {
  event?: string;
  slides?: string;
  video?: string;
};

export type Talk = {
  title: string;
  date: string;
  featured?: boolean;
  kind?: string;
  event?: string;
  venue?: string;
  summary?: string;
  links?: TalkLinks;
};

type TalkRaw = {
  title?: string;
  date?: string;
  featured?: boolean;
  kind?: string;
  event?: string;
  venue?: string;
  summary?: string;
  links?: TalkLinks;
};

function loadTalksRaw(): TalkRaw[] {
  const text = fs.readFileSync(talksPath, "utf8");
  const data = yaml.load(text) as { talks?: TalkRaw[] };
  if (!data || !Array.isArray(data.talks)) {
    throw new Error("data/talks.yml must contain a `talks` array");
  }
  return data.talks;
}

function normalizeTalk(raw: TalkRaw, index: number): Talk {
  if (!raw.title?.trim()) {
    throw new Error(`data/talks.yml entry ${index}: title is required`);
  }
  if (!raw.date?.trim()) {
    throw new Error(`data/talks.yml entry ${index}: date is required (YYYY-MM-DD)`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.date.trim())) {
    throw new Error(
      `data/talks.yml entry ${index}: date must be YYYY-MM-DD, got ${JSON.stringify(raw.date)}`,
    );
  }
  return {
    title: raw.title.trim(),
    date: raw.date.trim(),
    featured: raw.featured === true,
    kind: raw.kind?.trim() || undefined,
    event: raw.event?.trim() || undefined,
    venue: raw.venue?.trim() || undefined,
    summary: raw.summary?.trim() || undefined,
    links: raw.links && Object.keys(raw.links).length > 0 ? raw.links : undefined,
  };
}

const talks: Talk[] = loadTalksRaw().map(normalizeTalk);

function byDateDesc(a: Talk, b: Talk): number {
  return b.date.localeCompare(a.date);
}

/** All talks, newest first. */
export function allTalks(): Talk[] {
  return [...talks].sort(byDateDesc);
}

/** Up to three featured talks for the home page (newest first among featured). */
export function featuredTalksForHome(max = 3): Talk[] {
  return talks.filter((t) => t.featured).sort(byDateDesc).slice(0, max);
}

export function formatTalkDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dt);
}

export function talkYear(isoDate: string): number {
  return Number.parseInt(isoDate.slice(0, 4), 10);
}

/** Prefer event page, then video, then slides. */
export function talkPrimaryHref(links?: TalkLinks): string {
  if (!links) return "#";
  return links.event ?? links.video ?? links.slides ?? "#";
}

export function talkCardCta(links?: TalkLinks): string {
  if (!links) return "";
  if (links.event) return "Event";
  if (links.video) return "Video";
  if (links.slides) return "Slides";
  return "";
}

/** Tags for list rows: kind, event, venue when present. */
export function talkTags(t: Talk): string[] {
  const tags: string[] = [];
  if (t.kind) tags.push(t.kind);
  if (t.event) tags.push(t.event);
  if (t.venue) tags.push(t.venue);
  return tags;
}

/** Tags for home cards — event is already shown as workplace; keep kind + venue only. */
export function talkTagsForCard(t: Talk): string[] {
  const tags: string[] = [];
  if (t.kind) tags.push(t.kind);
  if (t.venue) tags.push(t.venue);
  return tags;
}
