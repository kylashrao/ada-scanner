import TrustPage from "../../components/TrustPage";
import { contactEmail, operator, siteUrl } from "../../lib/site";

const title = "Contact";
const description = "Contact the ADA Scanner team about accessibility barriers, editorial corrections and privacy requests.";
export const metadata = { title, description, alternates: { canonical: siteUrl("/contact") } };

export default function Contact() {
  return (
    <TrustPage title={title} intro="Tell us about an accessibility barrier on this site, suggest an editorial correction, or contact us about your privacy choices.">
      <section><h2>Contact {operator}</h2>{contactEmail
        ? <p>Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Use a subject such as “Accessibility feedback,” “Editorial correction,” or “Privacy request” so your message can be directed appropriately.</p>
        : <p>A public contact address has not been configured for this deployment.</p>}</section>
      <section><h2>Accessibility feedback</h2><p>Include the page address, what you were trying to do and where you encountered a barrier. If you feel comfortable sharing it, tell us the browser, device and assistive technology you used. If you need content in an alternative format, tell us what format would work for you.</p></section>
      <section><h2>Editorial and scanner corrections</h2><p>For a guide, send the URL, the passage you want us to review and a link to the relevant agency, standard or platform documentation. For a scanner finding, share the rule name, expected behavior and a small example with private information removed.</p></section>
      <section><h2>Privacy requests</h2><p>Tell us which right you want to exercise and how to reach you. Start with the minimum information needed to identify the correspondence at issue. Keep passwords, payment details, medical information and private HTML out of your message. See our <a href="/privacy-policy">privacy policy</a> for available choices.</p></section>
    </TrustPage>
  );
}
