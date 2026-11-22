const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const siteOrigin = [configuredOrigin, vercelDomain && `https://${vercelDomain}`]
  .map((candidate) => candidate ? URL.parse(candidate) : null)
  .find((url) => url && ["https:", "http:"].includes(url.protocol) && !url.username && !url.password)?.origin ?? "http://localhost:3000";

export function siteUrl(path: string) {
  return new URL(path, siteOrigin).href;
}

export const publisher = "ca-pub-2824959172169836";
const configuredEmail = process.env.SITE_CONTACT_EMAIL?.trim();
export const contactEmail = configuredEmail && /^[^\s@:?&#]+@[^\s@:?&#]+\.[^\s@:?&#]+$/.test(configuredEmail)
  ? configuredEmail
  : undefined;
export const operator = process.env.SITE_OPERATOR?.trim() || process.env.SITE_OPERATOR_NAME?.trim() || "ADA Scanner";
