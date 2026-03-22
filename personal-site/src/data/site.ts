/** Edit this file to personalize the site. */
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

export const featuredProjects = [
  {
    title: "Data platform",
    blurb:
      "Catalogs, pipelines, exchange, and feature infrastructure for large ML orgs.",
    tags: ["Data", "ML", "Platform"],
    href: "#",
    cta: "Details soon",
  },
  {
    title: "SB Finance",
    blurb: "Personal finance tooling and experiments in the open.",
    tags: ["Open Source", "Python"],
    href: "https://github.com/suminb/finance",
    cta: "View on GitHub",
  },
] as const;

export const moreProjects = [
  { title: "SB Coding Workshop", href: "https://github.com/suminb/sbcw" },
  { title: "Durango", href: "http://durango.nexon.com" },
  { title: "Interview questions", href: "https://github.com/suminb/interview-questions" },
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
