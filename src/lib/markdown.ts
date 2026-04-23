import { marked } from "marked";

marked.use({ gfm: true });

/** Parse a Markdown string to HTML using GFM. */
export async function parseMarkdown(markdown: string): Promise<string> {
  const parsed = marked.parse(markdown);
  return typeof parsed === "string" ? parsed : await parsed;
}
