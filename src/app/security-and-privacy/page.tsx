import Link from "next/link";

export default function SecurityAndPrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">Security &amp; Privacy</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="bg-announcement w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Security &amp; Privacy
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Your safety is our priority. Here&apos;s how to stay protected
            online and keep your personal information secure.
          </p>
        </div>
      </div>

      <div className="container-main py-8 max-w-4xl">
        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Staying safe online
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We want you to feel secure as part of our online community. So
              we&apos;ve put together some guidance to help you avoid malicious
              activity such as phishing and online scams &mdash; keeping you in
              control and keeping your sensitive information safe.
            </p>
            <h3 className="text-base font-bold text-text-primary mt-6">
              What is phishing?
            </h3>
            <p>
              Phishing is the practice of deceiving someone into handing over
              their personal information. For example, you may have received
              emails or text messages that appear to be from us, but they
              aren&apos;t. Or perhaps you&apos;ve seen a fake post offering
              Electriz deals that seem too good to be true. Unfortunately, this
              happens to many trusted brands, with fraudsters looking to trick
              you into giving away sensitive information. The following advice
              will help keep you safe.
            </p>
            <p className="font-semibold text-text-primary">
              We will never ask you to provide payment information or your
              account login details via email. If we do need to take payment,
              we&apos;ll only do so by phone once you&apos;ve passed our
              security checks.
            </p>
          </div>
        </section>

        {/* Warning signs */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            How to spot a phishing attempt
          </h2>
          <div className="space-y-6">
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">
                Sender
              </h3>
              <p className="text-sm text-text-secondary">
                If you don&apos;t recognise the sender, don&apos;t open the
                email. Be especially cautious of potentially malicious emails
                in your spam folder.
              </p>
            </div>

            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">
                Urgency
              </h3>
              <p className="text-sm text-text-secondary">
                Does the sender want you to act quickly to avoid &ldquo;missing
                out&rdquo;? Never be hurried into making an online transaction
                or sharing confidential information until you know for certain
                that it&apos;s legitimate.
              </p>
            </div>

            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">
                Spelling &amp; grammar
              </h3>
              <p className="text-sm text-text-secondary">
                Are there mistakes in the email address, subject line, email
                content or website address? This is frequently a sign that
                it&apos;s fake.
              </p>
            </div>

            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">
                Links &amp; attachments
              </h3>
              <p className="text-sm text-text-secondary">
                Don&apos;t click on links or attachments in unsolicited emails.
                If it looks too good to be true, it very often is.
              </p>
            </div>
          </div>
        </section>

        {/* Website */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Verifying our website
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Our website URL will always contain{" "}
              <strong className="text-text-primary">electriz.co.uk</strong>. For
              example, our customer support information can be found at
              electriz.co.uk/help-and-support.
            </p>
            <p>
              If you hover your cursor over a URL in an email from us and it
              doesn&apos;t look like that, then it&apos;s not legitimate. We
              don&apos;t operate any separate &ldquo;discount&rdquo; websites.
            </p>
          </div>
        </section>

        {/* Phone */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Phone safety
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Don&apos;t give out any personal information over the phone before
              you&apos;ve verified who you&apos;re speaking to. If in doubt, you
              can always call our customer services team back using the number on
              our{" "}
              <Link
                href="/help-and-support#contact"
                className="text-primary hover:underline"
              >
                contact us
              </Link>{" "}
              page. You can also check with them if an email you&apos;ve
              received is genuine or not.
            </p>
          </div>
        </section>

        {/* Passwords */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Your password
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Remembering multiple passwords can be tricky, but setting
              effective and secure passwords is vital to help prevent fraudulent
              activity. Here are our top tips when setting a password:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Avoid using the same password for all of your online accounts.
                That&apos;ll mean they can&apos;t all be fraudulently accessed
                at once. Multiple passwords keep you safer.
              </li>
              <li>
                For guidance on creating a strong password visit the{" "}
                <a
                  href="https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/three-random-words"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  National Cyber Security Centre
                </a>
                .
              </li>
              <li>
                Consider using a reputable password manager application where
                you can manage all your unique passwords in one place.
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Your privacy
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We&apos;re committed to your privacy, and we keep our privacy
              policy up to date. Read our full{" "}
              <Link
                href="/privacy-cookies-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Cookies on your computer
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Cookies are tiny text files stored on your computer when you visit
              certain web pages. We use cookies to keep track of what you have in
              your basket and to remember you when you return to our site.
            </p>
            <p>
              Find out more about cookies, why and how we use them, and how to
              manage them in our{" "}
              <Link
                href="/cookies-policy"
                className="text-primary hover:underline"
              >
                Cookies Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Payment security */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Your payment security
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We maintain the highest levels of security on our website &mdash;
              and take the privacy and security of your payment and personal
              details very seriously.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Our site uses high-level SSL encryption technology, the most
                advanced security software currently available for online
                transactions.
              </li>
              <li>
                You can tell whether a page is secure as &lsquo;https&rsquo;
                will replace the &lsquo;http&rsquo; at the front of the URL in
                your browser address window. A small locked padlock will also
                appear in the browser bar.
              </li>
              <li>Only connect to secure wireless networks that you trust.</li>
              <li>
                Our checkout process uses Verified by Visa, Mastercard
                SecureCode and American Express SafeKey. These services enhance
                your existing card account against unauthorised use when you
                shop with us.
              </li>
              <li>
                To use these services, you must first register with the bank or
                other organisation that issued your card.
              </li>
            </ul>
            <p>
              Once you&apos;ve registered and created your own private password
              with your card issuer, you&apos;ll be prompted automatically at
              checkout to provide this password when you make a purchase that
              requires authorisation.
            </p>
            <p className="text-xs">
              <strong className="text-text-primary">Please note:</strong> Your
              Verified by Visa, Mastercard SecureCode or American Express
              SafeKey password is different from your Electriz account password.
              We don&apos;t have access to card issuer passwords.
            </p>
          </div>
        </section>

        {/* WiFi */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Using WiFi in public places
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Using an unsecured network in a public place can be risky because
              unauthorised people may try to intercept anything you&apos;re
              doing online. We recommend you only connect to secure wireless
              networks that you trust, and always be aware of the risks
              associated with using public WiFi.
            </p>
          </div>
        </section>

        {/* Want to know more */}
        <section className="mb-10 bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Want to know more?
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              For more information, the{" "}
              <a
                href="https://www.ncsc.gov.uk/section/information-for/individuals-families"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                National Cyber Security Centre
              </a>{" "}
              website is an excellent resource. Here you&apos;ll find further
              advice and guidance on what to look out for, how to protect
              yourself from online fraud, and how to report suspicious emails
              and websites.
            </p>
            <p>
              If you believe you&apos;re the victim of a fraud or cyber-enabled
              crime, please report it to{" "}
              <a
                href="https://www.actionfraud.police.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Action Fraud
              </a>
              . If this crime involves your banking information, contact your
              bank fraud team by dialling{" "}
              <strong className="text-text-primary">159</strong> &mdash; a
              service operated by{" "}
              <a
                href="https://stopscamsuk.org.uk/about-stop-scams-uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Stop Scams UK
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
