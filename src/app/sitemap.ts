import type { MetadataRoute } from "next";
import industries from "../../data/industries.json";
import { guides } from "../lib/guides";
import { complianceHref } from "../lib/industries";
import { siteUrl } from "../lib/site";

const staticPages = [
  "/", "/industries", "/rules", "/statement-generator", "/guides",
  "/about", "/contact", "/privacy-policy", "/terms", "/legal-disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages,
    ...guides.map(({ slug }) => `/guides/${slug}`),
    ...industries.map(({ slug }) => complianceHref(slug)),
  ].map((path) => ({ url: siteUrl(path) }));
}
