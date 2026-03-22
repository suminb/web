import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const dataDir = path.join(process.cwd(), "data");

export type FeaturedProject = {
  title: string;
  blurb: string;
  tags: string[];
  href: string;
  cta: string;
};

export type MoreProject = {
  title: string;
  href: string;
  description?: string;
  tags: string[];
};

type FeaturedRaw = {
  title: string;
  blurb: string;
  tags: string[];
  cta: string;
  href?: string;
  experience_slug?: string;
};

type MoreRaw = {
  title: string;
  description?: string;
  tags?: string[];
  href?: string;
  experience_slug?: string;
};

function resolveLink(
  raw: { href?: string; experience_slug?: string },
  experienceUrl: (key: string) => string,
  context: string,
): string {
  if (raw.experience_slug) return experienceUrl(raw.experience_slug);
  if (raw.href !== undefined && raw.href !== "") return raw.href;
  throw new Error(`${context}: set either href or experience_slug`);
}

export function loadFeaturedProjects(
  experienceUrl: (key: string) => string,
): FeaturedProject[] {
  const file = path.join(dataDir, "featured_projects.yml");
  const data = yaml.load(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error("data/featured_projects.yml must be a YAML list");
  }
  return (data as FeaturedRaw[]).map((row, i) => ({
    title: row.title,
    blurb: row.blurb,
    tags: row.tags ?? [],
    href: resolveLink(row, experienceUrl, `featured_projects.yml entry ${i}`),
    cta: row.cta,
  }));
}

export function loadMoreProjects(
  experienceUrl: (key: string) => string,
): MoreProject[] {
  const file = path.join(dataDir, "more_projects.yml");
  const data = yaml.load(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error("data/more_projects.yml must be a YAML list");
  }
  return (data as MoreRaw[]).map((row, i) => {
    const href = resolveLink(row, experienceUrl, `more_projects.yml entry ${i}`);
    const out: MoreProject = {
      title: row.title,
      href,
      tags: row.tags ?? [],
    };
    if (row.description?.trim()) out.description = row.description.trim();
    return out;
  });
}
