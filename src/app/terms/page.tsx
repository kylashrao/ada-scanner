import TrustPage from "../../components/TrustPage";
import { operator, siteUrl } from "../../lib/site";

const title = "Terms of service";
const description = "Terms for using the ADA Scanner, accessibility statements and editorial guides.";
export const metadata = { title, description, alternates: { canonical: siteUrl("/terms") } };

export default function Terms() {
  return (
    <TrustPage title={title} intro={`These terms cover your use of the scanner, statement generator and editorial resources operated by ${operator}.`}>
      <section><h2>Using the tools</h2><p>Use the scanner for public pages you own, manage or have permission to evaluate. Only paste markup you are permitted to submit. You remain responsible for meeting applicable laws, respecting third-party rights and determining whether any submitted material is confidential. Your submission permits the application to process it for the requested scan.</p></section>
      <section><h2>Acceptable use</h2><p>Respect the availability of the service and target websites. Do not attempt to bypass network restrictions, scan internal infrastructure, submit unlawful material, overwhelm the tool with automated requests, or interfere with other users. We may restrict abusive traffic, suspend or change the service, and limit which targets the scanner accepts.</p></section>
      <section><h2>Reports, articles and statements</h2><p>You may use the results and generated drafts in your own accessibility work. Review findings against the actual page, test full workflows and verify any public statement before publishing it. Scanner reports and editorial material are informational. Automated results do not guarantee WCAG conformance or compliance with ADA Title II or Title III.</p></section>
      <section><h2>Third-party content and advertising</h2><p>External links, target websites and advertisements are governed by their providers’ terms and privacy notices. An advertisement is a paid placement. Its appearance does not indicate our endorsement of its claims. See the <a href="/privacy-policy">privacy policy</a> for information about advertising choices and scan processing.</p></section>
      <section><h2>Availability and responsibility</h2><p>The tools and materials are provided as available. To the extent permitted by law, we disclaim implied warranties and liability for losses arising from reliance on scan results, examples, third-party content or interruptions. These terms preserve consumer and other rights that cannot be excluded by law.</p></section>
      <section><h2>Questions and changes</h2><p>We may update these terms as the service changes. Review the current version before use. Send questions, corrections and accessibility feedback through our <a href="/contact">contact page</a>.</p></section>
    </TrustPage>
  );
}
