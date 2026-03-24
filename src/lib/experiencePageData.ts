import { parseMarkdown } from "./markdown";
import {
  getExperienceForPage,
  listExperienceDetailPageKeys,
  listProjectDetailPageKeys,
  isProjectDetailPageKey,
  type ExperienceRecord,
} from "./experiences";

/** Canonical URL for a published experience write-up (project markdown → `/projects/…`). */
export function experienceDetailPath(key: string): string {
  return isProjectDetailPageKey(key)
    ? `/projects/${key}.html`
    : `/experience/${key}.html`;
}

export function experienceDetailStaticPaths(): { params: { slug: string } }[] {
  return listExperienceDetailPageKeys().map((key) => ({
    params: { slug: key },
  }));
}

export function projectDetailStaticPaths(): { params: { slug: string } }[] {
  return listProjectDetailPageKeys().map((key) => ({ params: { slug: key } }));
}

export function experienceKeyFromSlug(slug: string | undefined): string {
  if (!slug) throw new Error("Missing experience slug");
  return slug;
}

export async function experiencePageProps(key: string): Promise<{
  exp: ExperienceRecord;
  contentHtml: string;
}> {
  const exp = getExperienceForPage(key);
  if (!exp) throw new Error(`Unknown or unpublished experience: ${key}`);
  const contentHtml = await parseMarkdown(exp.description);
  return { exp, contentHtml };
}
