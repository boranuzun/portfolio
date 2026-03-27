import { SITE, SOCIALS } from "@consts";
import type { SchemaOrgPerson, SchemaOrgBlogPosting, SchemaOrgSoftwareSourceCode } from './schema.types';

export function generatePersonSchema(url: URL): SchemaOrgPerson {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": url.origin,
    name: SITE.NAME,
    email: `mailto:${SITE.EMAIL}`,
    jobTitle: "Aspiring DevOps Engineer · Network & Systems Administrator",
    description:
      "Recent graduate with a HES-SO BSc in Business Information Technology, eager to begin a career in DevOps or network and systems administration.",
    url: url.origin,
    image: new URL("/avatar.webp", url.origin).toString(),
    sameAs: SOCIALS.map((social) => social.HREF),
  };
}

export function generateBlogPostingSchema(
  post: {
    title: string;
    description: string;
    date: Date;
    lastModified?: Date | null;
  },
  url: URL,
): SchemaOrgBlogPosting {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    dateModified: (post.lastModified ?? post.date).toISOString(),
    author: {
      "@type": "Person",
      name: SITE.NAME,
      email: `mailto:${SITE.EMAIL}`,
      url: url.origin,
    },
    url: url.toString(),
    mainEntityOfPage: {
      "@type": "WebPage",
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
): SchemaOrgSoftwareSourceCode {
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
