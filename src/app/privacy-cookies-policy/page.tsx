import Link from "next/link";

const tocSections = [
  { id: "privacy-policy", label: "Our Privacy Policy" },
  { id: "how-we-collect", label: "How we collect your information" },
  { id: "what-we-use", label: "What we use your information for" },
  { id: "who-we-share", label: "Who we share your information with" },
  { id: "how-long", label: "How long we keep your information" },
  { id: "your-rights", label: "Your rights" },
  { id: "marketing", label: "How to stop marketing" },
  { id: "cookies-policy", label: "Our Cookies Policy" },
  { id: "contact-us", label: "Contact us" },
];

export default function PrivacyCookiesPolicyPage() {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link
            href="/"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-text-secondary">Services</span>
          <span>&gt;</span>
          <span className="text-text-primary">Privacy &amp; cookies</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-[#C850C0] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Privacy &amp; cookies
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Want to opt out of marketing?{" "}
            <Link
              href="/contact-us"
              className="text-white underline hover:text-white/80"
            >
              Tell us your preferences
            </Link>
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Table of Contents */}
        <nav className="bg-white rounded-lg border border-border p-6 mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Contents
          </h2>
          <ul className="space-y-2">
            {tocSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-primary no-underline hover:underline"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ========== PRIVACY POLICY ========== */}
        <section id="privacy-policy" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Our Privacy Policy
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Our policy explains what personal information we collect. It also
              explains what we do with it. It helps you find out what
              information we hold on you, and how you can update it.
            </p>
            <p>
              It applies to you if you use our products and services. This can
              be either in-store, online, or over the phone. It also applies if
              you visit our website or social media pages.
            </p>
            <p>
              <strong className="text-text-primary">
                Electriz Group is the data controller.
              </strong>{" "}
              Electriz Group includes Electriz plc and its subsidiaries and
              associated brands. When we use the words &quot;we&quot;,
              &quot;us&quot; and &quot;our&quot;, we mean Electriz Group.
            </p>
            <p>
              We may change this policy from time to time by updating this page.
              You should check this page occasionally to make sure you are happy
              with any changes.
            </p>
          </div>
        </section>

        {/* ========== HOW WE COLLECT ========== */}
        <section id="how-we-collect" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            How we collect your information
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>We collect personal information from you in several ways:</p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              1. When you place an order
            </h3>
            <p>
              When you buy products or services from us, we collect information
              such as your name, email address, delivery address, billing
              address, phone number and payment details. We need this to process
              your order, send you order updates, and deliver your products.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              2. When you create an account
            </h3>
            <p>
              If you create an account with us, we store your name, email
              address, contact details and preferences. We use this information
              to provide you with a personalised experience and to make it
              easier for you to manage your orders and settings.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              3. When you browse our website
            </h3>
            <p>
              We collect information about how you use our website, including
              pages you visit, products you view, and searches you make. We use
              cookies and similar technologies to collect this information.
              Please see our{" "}
              <a href="#cookies-policy" className="text-primary hover:underline">
                Cookie Policy
              </a>{" "}
              for more details.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              4. When you contact us
            </h3>
            <p>
              If you contact our customer service team by phone, email, webchat
              or social media, we may keep a record of that correspondence and
              any information you provide during the interaction.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              5. When you enter competitions or promotions
            </h3>
            <p>
              If you enter a competition, prize draw or promotion, we collect
              the information you provide as part of your entry. We may also
              share your information with the partner brand running the
              promotion where applicable.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              6. When you write a review
            </h3>
            <p>
              If you leave a product review or rating on our website, we collect
              the content of your review along with your display name. Reviews
              help other customers make informed purchasing decisions.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              7. When you visit our stores
            </h3>
            <p>
              If you visit one of our stores, we may collect information when
              you interact with our colleagues, use in-store services, or
              connect to our Wi-Fi network. We also operate CCTV in our stores
              for security and crime prevention purposes.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              8. From third parties
            </h3>
            <p>
              We may receive information about you from third parties, such as
              delivery partners, payment processors, fraud prevention agencies,
              and marketing partners. We use this information in accordance with
              this privacy policy.
            </p>
          </div>
        </section>

        {/* ========== WHAT WE USE IT FOR ========== */}
        <section id="what-we-use" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            What we use your information for
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>We use your personal information for the following purposes:</p>

            <div className="bg-surface rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EBEBEB]">
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      Purpose
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      Legal basis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 align-top">
                      Processing your orders and managing your account
                    </td>
                    <td className="px-4 py-3 align-top">
                      Performance of a contract
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 align-top">
                      Communicating with you about your orders, including
                      delivery updates and service notifications
                    </td>
                    <td className="px-4 py-3 align-top">
                      Performance of a contract
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 align-top">
                      Sending you marketing communications about our products,
                      services, offers and promotions
                    </td>
                    <td className="px-4 py-3 align-top">
                      Consent / Legitimate interest
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 align-top">
                      Personalising your experience on our website and showing
                      you relevant products and offers
                    </td>
                    <td className="px-4 py-3 align-top">
                      Legitimate interest
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 align-top">
                      Providing customer support and responding to your
                      enquiries
                    </td>
                    <td className="px-4 py-3 align-top">
                      Performance of a contract / Legitimate interest
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 align-top">
                      Fraud prevention and detection
                    </td>
                    <td className="px-4 py-3 align-top">
                      Legal obligation / Legitimate interest
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top">
                      Improving our website, products and services through
                      analytics and research
                    </td>
                    <td className="px-4 py-3 align-top">
                      Legitimate interest
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              We engage in advertising activity across digital platforms with
              both targeted and non-targeted advertising. For targeted
              advertising, we work with partners and agencies to analyse
              customer browsing and purchasing patterns to serve you relevant
              advertisements.
            </p>
          </div>
        </section>

        {/* ========== WHO WE SHARE WITH ========== */}
        <section id="who-we-share" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Who we share your information with
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We may share your personal information with the following
              categories of recipients:
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Our service providers
            </h3>
            <p>
              We use a range of third-party service providers to help us run our
              business and deliver our products and services to you. These
              include companies that provide delivery services, payment
              processing, IT hosting, customer service support, marketing and
              analytics services. These providers only process your information
              on our behalf and in accordance with our instructions.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Other organisations and individuals
            </h3>
            <p>
              We may also share your information with manufacturers and brand
              partners (for warranty, product safety and recall purposes),
              credit reference and fraud prevention agencies, law enforcement
              and regulatory bodies (where required by law), and professional
              advisers such as accountants, lawyers and auditors.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              International transfers
            </h3>
            <p>
              Some of our service providers are based outside the UK. Where we
              transfer your personal information to countries outside the UK, we
              ensure that appropriate safeguards are in place, such as standard
              contractual clauses approved by the Information Commissioner, to
              protect your information.
            </p>
          </div>
        </section>

        {/* ========== HOW LONG WE KEEP ========== */}
        <section id="how-long" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            How long we keep your information
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We keep your personal information only for as long as is necessary
              for the purposes set out in this policy, or as required by law.
              The retention period depends on the type of information and the
              purpose for which it was collected.
            </p>
            <p>
              For example, we keep transactional data (such as order details)
              for up to 7 years for tax and accounting purposes. We keep
              marketing preferences for as long as you are an active customer,
              and for a reasonable period after your last interaction with us.
            </p>
            <p>
              When your information is no longer needed, we will securely delete
              or anonymise it so that it can no longer be linked back to you.
            </p>
          </div>
        </section>

        {/* ========== YOUR RIGHTS ========== */}
        <section id="your-rights" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Your rights
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Under UK data protection law, you have a number of rights in
              relation to your personal information. These include the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-text-primary">Access</strong> &mdash;
                request a copy of the personal information we hold about you.
              </li>
              <li>
                <strong className="text-text-primary">Rectification</strong>{" "}
                &mdash; ask us to correct inaccurate or incomplete information.
              </li>
              <li>
                <strong className="text-text-primary">Erasure</strong> &mdash;
                ask us to delete your personal information in certain
                circumstances.
              </li>
              <li>
                <strong className="text-text-primary">
                  Restriction of processing
                </strong>{" "}
                &mdash; ask us to limit how we use your information.
              </li>
              <li>
                <strong className="text-text-primary">Data portability</strong>{" "}
                &mdash; request a copy of your information in a structured,
                commonly used format.
              </li>
              <li>
                <strong className="text-text-primary">Object</strong> &mdash;
                object to the processing of your information for certain
                purposes, including direct marketing.
              </li>
            </ul>
            <p>
              If you would like to exercise any of these rights, please{" "}
              <Link
                href="/contact-us"
                className="text-primary hover:underline"
              >
                contact us
              </Link>
              . We will respond to your request within one month.
            </p>
          </div>
        </section>

        {/* ========== MARKETING ========== */}
        <section id="marketing" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            How to stop marketing
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>You can stop receiving marketing from us at any time by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Clicking the &quot;unsubscribe&quot; link in any marketing email
                we send you.
              </li>
              <li>
                Updating your marketing preferences in your account settings.
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-primary hover:underline"
                >
                  Contacting us
                </Link>{" "}
                to ask us to stop.
              </li>
            </ul>
            <p>
              To stop online marketing through cookies, please see our{" "}
              <a href="#cookies-policy" className="text-primary hover:underline">
                Cookie Policy
              </a>{" "}
              below.
            </p>
            <p>
              Please note that even if you opt out of marketing, we will still
              send you important service messages about your orders and account.
            </p>
          </div>
        </section>

        {/* ========== COOKIES POLICY ========== */}
        <section id="cookies-policy" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Our Cookies Policy
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              This policy explains what cookies are and why we collect them. It
              also explains the information cookies store.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              What are cookies?
            </h3>
            <p>
              Cookies are small data files which are placed on your computer or
              other devices (such as smartphones or tablets) as you browse our
              website. They are used to remember your preferences, understand
              how you use our site, and improve your experience.
            </p>
            <p>
              Cookies are either First Party, meaning they are placed directly
              by Electriz, or Third Party cookies, which are placed by external
              services we use on our website.
            </p>
            <p>Cookies are also either session or persistent:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-text-primary">Session cookies</strong>{" "}
                &mdash; these are temporary cookies that are deleted when you
                close your browser.
              </li>
              <li>
                <strong className="text-text-primary">
                  Persistent cookies
                </strong>{" "}
                &mdash; these remain on your device for a set period or until
                you delete them.
              </li>
            </ul>

            <h3 className="text-base font-bold text-text-primary mt-6">
              What kind of cookies do we use?
            </h3>

            <h4 className="text-sm font-bold text-text-primary mt-4">
              Essential cookies
            </h4>
            <p>
              These cookies are necessary for the website to function properly.
              They enable core features such as security, basket management, and
              account authentication. Without these cookies, services you have
              asked for cannot be provided.
            </p>

            <h4 className="text-sm font-bold text-text-primary mt-4">
              Analytics cookies
            </h4>
            <p>
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. This
              helps us improve our website and the experience we offer.
            </p>

            <h4 className="text-sm font-bold text-text-primary mt-4">
              Functional cookies
            </h4>
            <p>
              These cookies enable enhanced functionality and personalisation,
              such as remembering your preferences and settings. They may be set
              by us or by third-party providers whose services we have added to
              our pages.
            </p>

            <h4 className="text-sm font-bold text-text-primary mt-4">
              Marketing cookies
            </h4>
            <p>
              These cookies are used to track visitors across websites. They are
              used to display adverts that are relevant and engaging for
              individual users. They also limit the number of times you see an
              advert and help us measure the effectiveness of our advertising
              campaigns.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Managing your cookie preferences
            </h3>
            <p>
              When you first visit our website you will be presented with a
              cookie banner where you can accept all cookies, allow required
              cookies only, or customise your preferences.
            </p>
            <p>
              You can change your cookie preferences at any time through your
              browser settings. Most browsers allow you to refuse or delete
              cookies. Please note that if you disable cookies, some parts of
              our website may not function properly.
            </p>
          </div>
        </section>

        {/* ========== CONTACT US ========== */}
        <section id="contact-us" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Contact us
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              If you have any questions regarding this Privacy &amp; Cookies
              Policy, you can contact our Data Protection Office at:
            </p>
            <div className="bg-white rounded-lg border border-border p-4">
              <p className="mb-2">
                <strong className="text-text-primary">
                  Data Protection Office
                </strong>
              </p>
              <p>Electriz Group</p>
              <p>1 Portal Way</p>
              <p>London, W3 6RS</p>
              <p className="mt-2">
                Or{" "}
                <Link
                  href="/contact-us"
                  className="text-primary hover:underline"
                >
                  contact us online
                </Link>
                .
              </p>
            </div>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Complaining to the Data Protection Regulator
            </h3>
            <p>
              If you are unhappy with how we have handled your personal
              information, you have the right to lodge a complaint with the
              Information Commissioner&apos;s Office (ICO), the UK&apos;s data
              protection regulator.
            </p>
            <p>
              You can find more information on the ICO&apos;s website or contact
              them directly. However, we would appreciate the opportunity to
              address your concerns first, so please{" "}
              <Link
                href="/contact-us"
                className="text-primary hover:underline"
              >
                contact us
              </Link>{" "}
              in the first instance.
            </p>
            <p className="text-xs text-text-secondary mt-6">
              This Privacy &amp; Cookies Policy was last updated and replaces
              all previous versions. This Policy is regularly reviewed.
            </p>
          </div>
        </section>

        {/* Back link */}
        <div className="border-t border-border pt-6 mb-8">
          <Link
            href="/"
            className="text-sm text-primary no-underline hover:underline"
          >
            &larr; Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
