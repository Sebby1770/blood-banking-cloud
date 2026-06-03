import { Icon } from './icons.jsx';

export default function Privacy() {
  return (
    <div className="legal">
      <div className="card">
        <h2><Icon name="shield" size={26} style={{ verticalAlign: '-5px', color: 'var(--primary)' }} /> Privacy Policy</h2>
        <p className="updated">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p className="lede">
          Blood Bank Cloud connects donors, hospitals, and recipients to manage the safe supply of blood.
          Because that work involves <strong>sensitive health information</strong>, we hold ourselves to a high
          standard of data protection. This policy explains what we collect, why, how we safeguard it, and the
          rights you have over it.
        </p>

        <div className="callout">
          This application is a portfolio/demonstration project. It is not a production medical service and must
          not be used to store real patient or donor records. The policy below describes how a production
          deployment <em>should</em> behave.
        </div>

        <h3>1. Who we are</h3>
        <p>
          “Blood Bank Cloud” (“we”, “us”) operates this platform. For any privacy request, contact the data
          controller at <a href="mailto:privacy@bloodbank.example">privacy@bloodbank.example</a>. A production
          deployment serving the EU/UK should also designate a Data Protection Officer.
        </p>

        <h3>2. Information we collect</h3>
        <table>
          <thead><tr><th>Category</th><th>Examples</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Donor identity</td><td>Name, email, phone, city</td><td>Contact donors and arrange donations</td></tr>
            <tr><td>Health data</td><td>Blood group, donation history, availability</td><td>Match compatible donors to recipient requests</td></tr>
            <tr><td>Hospital contacts</td><td>Facility name, city, contact email/phone</td><td>Coordinate fulfilment of requests</td></tr>
            <tr><td>Recipient requests</td><td>Patient name, blood group, units, urgency</td><td>Locate and reserve compatible supply</td></tr>
            <tr><td>Operational logs</td><td>API access timestamps, request IDs</td><td>Security monitoring and abuse prevention</td></tr>
          </tbody>
        </table>
        <p>
          A person’s <strong>blood group is health data</strong> (a “special category” of personal data under the
          GDPR). We process it only for the medical coordination purposes above.
        </p>

        <h3>3. Legal bases for processing</h3>
        <ul>
          <li><strong>Vital interests &amp; public interest in health</strong> — matching blood supply to those who need it.</li>
          <li><strong>Explicit consent</strong> — donors opt in when they register and may withdraw at any time.</li>
          <li><strong>Legitimate interests</strong> — keeping the service secure and reliable, balanced against your rights.</li>
        </ul>

        <h3>4. How we protect your data</h3>
        <ul>
          <li>All API traffic is authenticated with a credential checked in <em>constant time</em> to resist timing attacks.</li>
          <li>Transport is encrypted with TLS; database connections to managed Postgres (RDS) require SSL.</li>
          <li>Strict security headers, a Content-Security-Policy, scoped CORS, and per-IP rate limiting guard the API.</li>
          <li>Request payloads are size-bounded and validated; database writes use transactions with row locks.</li>
          <li>Access is least-privilege, and operational logs avoid recording sensitive field values.</li>
        </ul>

        <h3>5. Sharing &amp; disclosure</h3>
        <p>
          We share the minimum necessary information with the hospital handling a given request. We do
          <strong> not</strong> sell personal data. Limited processors (cloud hosting, managed database, notification
          delivery) act only on our instructions under contract. We may disclose data where required by law.
        </p>

        <h3>6. Data retention</h3>
        <p>
          Donor and request records are kept only as long as needed for the coordination purpose and any legal
          obligation, then deleted or irreversibly anonymised for aggregate analytics (e.g. donation trends).
        </p>

        <h3>7. Your rights</h3>
        <ul>
          <li>Access, correct, or export your data.</li>
          <li>Withdraw consent and request erasure (“right to be forgotten”).</li>
          <li>Object to or restrict certain processing.</li>
          <li>Lodge a complaint with your local data-protection authority.</li>
        </ul>
        <p>To exercise any right, email <a href="mailto:privacy@bloodbank.example">privacy@bloodbank.example</a>.</p>

        <h3>8. Cookies &amp; tracking</h3>
        <p>
          The dashboard stores only a small local preference (your light/dark theme) in your browser. It does not
          use advertising or third-party tracking cookies.
        </p>

        <h3>9. Changes to this policy</h3>
        <p>We will post any changes here and update the “last updated” date above.</p>
      </div>
    </div>
  );
}
