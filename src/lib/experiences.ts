import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "data");
const experiencesPath = path.join(dataDir, "experiences.yml");

const IncludeType = new yaml.Type("!include", {
  kind: "scalar",
  resolve: (data: unknown): data is string => typeof data === "string",
  construct: (filename: string) =>
    fs.readFileSync(path.join(dataDir, filename), "utf8"),
});

const experiencesSchema = yaml.DEFAULT_SCHEMA.extend([IncludeType]);

export type ExperienceRecord = {
  published: boolean;
  parent: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  category: string;
  tags: string[];
  description: string;
};

let cache: Record<string, ExperienceRecord> | null = null;

function loadAll(): Record<string, ExperienceRecord> {
  if (!cache) {
    const text = fs.readFileSync(experiencesPath, "utf8");
    cache = yaml.load(text, { schema: experiencesSchema }) as Record<
      string,
      ExperienceRecord
    >;
  }
  return cache;
}

/** Published experiences with a non-empty body (markdown from YAML or !include). */
export function listExperiencePageKeys(): string[] {
  return Object.entries(loadAll())
    .filter(
      ([, v]) =>
        v.published &&
        typeof v.description === "string" &&
        v.description.trim().length > 0,
    )
    .map(([k]) => k);
}

const projectsMdDir = path.join(dataDir, "projects");

let projectSlugCache: Set<string> | null = null;

function loadProjectSlugs(): Set<string> {
  if (!projectSlugCache) {
    const slugs =
      fs.existsSync(projectsMdDir)
        ? fs
            .readdirSync(projectsMdDir)
            .filter((f) => f.endsWith(".md"))
            .map((f) => path.basename(f, ".md"))
        : [];
    projectSlugCache = new Set(slugs);
  }
  return projectSlugCache;
}

/** Basenames `slug` for each `data/projects/*.md` (detail pages use `/projects/{slug}.html`). */
export function listProjectMarkdownSlugs(): string[] {
  return [...loadProjectSlugs()];
}

export function isProjectDetailPageKey(key: string): boolean {
  return loadProjectSlugs().has(key);
}

/** Long-form pages under `/experience/{slug}.html` (not backed by `data/projects/*.md`). */
export function listExperienceDetailPageKeys(): string[] {
  return listExperiencePageKeys().filter((k) => !isProjectDetailPageKey(k));
}

/** Long-form pages under `/projects/{slug}.html` (markdown in `data/projects/`). */
export function listProjectDetailPageKeys(): string[] {
  return listExperiencePageKeys().filter((k) => isProjectDetailPageKey(k));
}

export function getExperienceForPage(key: string): ExperienceRecord | undefined {
  const exp = loadAll()[key];
  if (!exp?.published || !exp.description?.trim()) return undefined;
  return exp;
}

export type ExperienceWithKey = { key: string; record: ExperienceRecord };

/** Every published row (including short inline descriptions). */
export function listAllPublished(): ExperienceWithKey[] {
  return Object.entries(loadAll())
    .filter(([, v]) => v.published)
    .map(([key, record]) => ({ key, record }));
}

export function findPublishedByTag(tag: string): ExperienceWithKey[] {
  return listAllPublished().filter(({ record }) =>
    (record.tags ?? []).includes(tag),
  );
}

/** Distinct tags that appear on at least one published experience. */
export function allPublishedTagSlugs(): string[] {
  const seen = new Set<string>();
  for (const { record } of listAllPublished()) {
    for (const t of record.tags ?? []) seen.add(t);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

export function truncatePlain(text: string, maxLen: number): string {
  const plain = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen)}…`;
}
