import { loadFeaturedProjects, loadMoreProjects } from "./homeProjects";

/** Edit this file to personalize the site. */

/**
 * If experience pages from the Flask/frozen-flask site live on another host,
 * set the origin (no trailing slash), e.g. "https://example.com".
 * Leave empty when the Astro site and `/experience/*.html` share the same origin.
 */
export const experienceBase: string = "";

function experienceUrl(key: string): string {
  const path = `/experience/${key}.html`;
  if (!experienceBase) return path;
  const base = experienceBase.replace(/\/$/, "");
  return `${base}${path}`;
}

export const featuredProjects = loadFeaturedProjects(experienceUrl);
export const moreProjects = loadMoreProjects(experienceUrl);

export const site = {
  title: "Sumin Byeon",
  description:
    "Machine learning data platform lead, engineer, and occasional writer.",
  url: "https://example.com",
};

export const hero = {
  greeting: "Hi, I'm",
  name: "Sumin Byeon",
  tagline: "The data guy — building platforms for ML/LLM at scale.",
  intro:
    "I lead a machine learning data platform team at NAVER Cloud. Our mission is to develop and operate a large-scale, fault-tolerant ML data platform where engineers and researchers collaborate to build next-generation AI systems.",
};

export const connect = [
  { label: "Blog", href: "https://blog.shortbread.io", hint: "Writing" },
  { label: "GitHub", href: "https://github.com/suminb", hint: "Code" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/suminb", hint: "Work" },
] as const;

export const articles = [
  {
    title: "Replace with your latest post",
    date: "2025-01-01",
    href: "https://philosophical.one",
    summary: "Hook this list to your blog RSS or CMS when you are ready.",
  },
  {
    title: "Another sample entry",
    date: "2024-06-15",
    href: "#",
    summary: "Short one-line teaser for the article.",
  },
] as const;
