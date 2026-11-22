import { permanentRedirect } from "next/navigation";
import industries from "../../../../data/industries.json";
import { complianceHref } from "../../../lib/industries";

export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map(({ slug }) => ({ slug }));
}

export default async function IndustryRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(complianceHref(slug));
}
