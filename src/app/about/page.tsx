import TrustPage from "../../components/TrustPage";
import { siteUrl } from "../../lib/site";

const title = "About the ADA Scanner";
const description = "Learn how the ADA Scanner evaluates HTML against selected WCAG 2.1 Level A and AA criteria.";
export const metadata = { title, description, alternates: { canonical: siteUrl("/about") } };

export default function About() {
  return (
    <TrustPage title={title} intro="We build a free HTML accessibility scanner and publish practical guides for people responsible for websites and digital services.">
      <section><h2>What we test</h2><p>A URL scan fetches the original HTML response for one public page. A pasted-HTML scan parses the markup you supply without fetching any embedded resources. The same rule set runs on both inputs, checking signals such as missing text alternatives, accessible names, document language, landmarks, heading structure, zoom restrictions, frame titles, table headers and obvious inline contrast problems.</p><p>Each report names the applicable WCAG 2.1 Level A or AA criterion and identifies sample locations when available. Context-dependent checks such as empty alt text and data table headers are flagged for review. Severity describes the potential impact on a user completing a task.</p></section>
      <section><h2>How to interpret the score</h2><p>The score starts at 100 and deducts 12 points per critical finding, seven per serious finding, four per moderate finding and two per minor finding, capped at five occurrences per rule. The total cannot fall below zero. Manual-review findings carry no deduction. Use scores to compare the same page over time under comparable conditions.</p></section>
      <section><h2>What a manual audit adds</h2><p>Automated scans detect an estimated 30–40% of WCAG issues. An auditor checks the rendered page, interactions, full workflows, keyboard order, focus visibility, zoom and reflow, screen-reader announcements, meaningful alternatives and embedded services. Include disabled users in usability testing where possible.</p><p>For the complete evaluation model, consult <a href="https://www.w3.org/TR/WCAG21/">WCAG 2.1</a> and the <a href="https://www.w3.org/WAI/test-evaluate/">W3C evaluation resources</a>.</p></section>
      <section><h2>Editorial sources and corrections</h2><p>Our guidance links to primary sources from W3C, DOJ, regulators and platform documentation. We welcome corrections that include the affected page, the relevant passage and an authoritative source. <a href="/contact">Contact the editorial team</a>.</p></section>
    </TrustPage>
  );
}
