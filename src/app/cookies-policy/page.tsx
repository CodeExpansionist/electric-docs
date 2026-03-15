import Link from "next/link";

export default function CookiesPolicyPage() {
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
          <span className="text-text-primary">Cookies Policy</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-[#C850C0] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Cookies Policy
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            This policy explains what cookies are, why we collect them, and the
            information they store.
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* What are cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            What are cookies?
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
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
          </div>
        </section>

        {/* What kind of cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            What kind of cookies do we use?
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <h3 className="text-base font-bold text-text-primary mt-2">
              Essential cookies
            </h3>
            <p>
              These cookies are necessary for the website to function properly.
              They enable core features such as security, basket management, and
              account authentication. Without these cookies, services you have
              asked for cannot be provided.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Analytics cookies
            </h3>
            <p>
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. This
              helps us improve our website and the experience we offer.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Functional cookies
            </h3>
            <p>
              These cookies enable enhanced functionality and personalisation,
              such as remembering your preferences and settings. They may be set
              by us or by third-party providers whose services we have added to
              our pages.
            </p>

            <h3 className="text-base font-bold text-text-primary mt-6">
              Marketing cookies
            </h3>
            <p>
              These cookies are used to track visitors across websites. They are
              used to display adverts that are relevant and engaging for
              individual users. They also limit the number of times you see an
              advert and help us measure the effectiveness of our advertising
              campaigns.
            </p>
          </div>
        </section>

        {/* Managing preferences */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Managing your cookie preferences
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
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

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Contact us
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              If you have any questions about our use of cookies, please{" "}
              <Link
                href="/contact-us"
                className="text-primary hover:underline"
              >
                contact us
              </Link>
              . You can also read our full{" "}
              <Link
                href="/privacy-cookies-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for more details on how we handle your personal information.
            </p>
            <p className="text-xs text-text-secondary mt-6">
              This Cookies Policy was last updated and replaces all previous
              versions. This Policy is regularly reviewed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
