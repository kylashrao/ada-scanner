import TrustPage from "../../components/TrustPage";
import { scanDisclaimer } from "../../lib/disclaimer";
import { siteUrl } from "../../lib/site";

const title = "Legal disclaimer";
const description = "Understand automated accessibility testing limits and why reports do not establish ADA compliance.";
export const metadata = { title, description, alternates: { canonical: siteUrl("/legal-disclaimer") } };

export default function LegalDisclaimer() {
  return (
    <TrustPage title={title} intro={scanDisclaimer}>
      <section><h2>What scan results establish</h2><p>Results identify selected conditions in submitted HTML or a single public page response. An automated score, a lack of reported findings or a generated statement does not guarantee accessibility, WCAG conformance or compliance with ADA Title II or Title III. Automated checks can miss barriers and can report items that need context. The percentage above is an estimate and varies by page, tools and testing scope.</p></section>
      <section><h2>Title II and Title III</h2><p>Title II’s federal web and mobile rule applies to covered state and local government content under 28 CFR Part 35 and adopts WCAG 2.1 Level AA. DOJ’s April 2026 interim final rule extended the relevant deadlines to April 26, 2027 and April 26, 2028, depending on the entity. <a href="https://www.ada.gov/resources/small-entity-compliance-guide/">DOJ Title II compliance guide</a></p><p>Title III addresses equal access to the goods and services of places of public accommodation. Applicability and remedies depend on the facts and relevant law. <a href="https://www.ada.gov/resources/web-guidance/">DOJ guidance on web accessibility and the ADA</a></p></section>
      <section><h2>Using our materials</h2><p>Our guides, templates and scanner results are educational. Using them does not create an attorney-client relationship or certify your site. For decisions about your legal obligations, consult qualified counsel. Arrange manual testing of complete user journeys with keyboard, assistive technology and users with disabilities to understand barriers missed by automation.</p></section>
    </TrustPage>
  );
}
