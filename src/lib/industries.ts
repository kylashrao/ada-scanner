import industries from "../../data/industries.json";

export const featuredIndustries = [
  "shopify-stores",
  "wordpress-sites",
  "dental-clinics",
  "restaurants-ordering",
  "higher-ed-municipal-portals",
  "real-estate-agencies",
].map((slug) => industries.find((industry) => industry.slug === slug)!);

const relatedGroups = [
  ["shopify-stores", "woocommerce-stores", "bigcommerce-stores", "adobe-commerce-stores", "shopware-stores", "prestashop-stores", "headless-commerce", "grocery-delivery-services"],
  ["wordpress-sites", "squarespace-sites", "wix-sites", "webflow-sites", "drupal-sites", "local-news-publishers"],
  ["dental-clinics", "medical-practices", "telehealth-platforms", "pharmacies", "veterinary-clinics", "fitness-centers"],
  ["higher-ed-municipal-portals", "city-government-websites", "county-government-websites", "election-information-portals", "public-libraries", "public-transit-agencies", "utility-provider-portals"],
  ["hotel-booking-websites", "vacation-rental-marketplaces", "real-estate-agencies", "airline-ticketing-sites", "theaters-event-venues", "museums-galleries", "restaurants-ordering"],
  ["banks-credit-unions", "insurance-agencies", "mortgage-lenders", "automotive-dealerships", "law-firms", "home-services-contractors"],
  ["saas-b2b-sites", "employment-recruiting-portals", "online-education-platforms", "childcare-providers", "membership-associations", "food-banks-nonprofits", "online-donation-platforms"],
];

export function relatedIndustries(slug: string) {
  const group = relatedGroups.find((slugs) => slugs.includes(slug)) ?? [];
  return industries.filter((industry) => industry.slug !== slug && group.includes(industry.slug)).slice(0, 3);
}

export function complianceHref(slug: string) {
  return `/ada-compliance/${slug}`;
}
