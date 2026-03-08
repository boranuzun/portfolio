import { SITE, SOCIALS } from "@consts";

export function generatePersonSchema(url: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": url.origin,
    name: SITE.NAME,
    email: `mailto:${SITE.EMAIL}`,
    jobTitle: "DevOps Engineer",
    description:
      "Recent graduate with a HES-SO BSc in Business Information Technology, aspiring DevOps engineer and network systems administrator",
    url: url.origin,
    image: new URL("/B_black@1x.png", url.origin).toString(),
    sameAs: SOCIALS.map((social) => social.HREF),
  };
}

export function generateBlogPostingSchema(
  post: {
    title: string;
    description: string;
    date: Date;
  },
  url: URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    dateModified: post.date.toISOString(),
    author: {
      "@type": "Person",
      name: SITE.NAME,
      email: `mailto:${SITE.EMAIL}`,
      url: url.origin,
    },
    url: url.toString(),
    mainEntity: {
      "@type": "BlogPosting",
      "@id": url.toString(),
    },
  };
}

export function generateProjectSchema(
  project: {
    title: string;
    description: string;
    date: Date;
    technologies?: string[];
  },
  url: URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    dateCreated: project.date.toISOString(),
    author: {
      "@type": "Person",
      name: SITE.NAME,
      email: `mailto:${SITE.EMAIL}`,
      url: url.origin,
    },
    url: url.toString(),
    programmingLanguage: project.technologies || ["TypeScript", "JavaScript"],
  };
}
