import { marked } from "marked";
import {
  getExperienceForPage,
  listExperiencePageKeys,
  type ExperienceRecord,
} from "./experiences";

marked.use({ gfm: true });

export function experienceStaticPaths(): { params: { slug: string } }[] {
  return listExperiencePageKeys().map((key) => ({ params: { slug: key } }));
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
  const parsed = marked.parse(exp.description);
  const contentHtml =
    typeof parsed === "string" ? parsed : await Promise.resolve(parsed);
  return { exp, contentHtml };
}
