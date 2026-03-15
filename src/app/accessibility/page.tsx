import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">Accessibility</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="bg-primary w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Accessibility Statement
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            We&apos;re committed to making our website accessible to everyone,
            regardless of ability or technology.
          </p>
        </div>
      </div>

      <div className="container-main py-8 max-w-4xl">
        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Website Accessibility
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              This page explains what we are doing to support assistive
              technology users and customers with accessibility needs when using
              the Electriz website. It covers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our approach to accessibility</li>
              <li>How we test for accessibility</li>
              <li>Known issues and workarounds</li>
              <li>How to report an issue</li>
            </ul>
          </div>
        </section>

        {/* Our approach */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Our approach to accessibility
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We aim to conform to the Web Content Accessibility Guidelines
              (WCAG) 2.1 Level AA standard. We continuously review our designs
              and use accessibility testing tools to identify and resolve issues
              on an ongoing basis.
            </p>
            <p>
              Our goal is to ensure that all customers can browse our range of
              TVs and audio products, add items to their basket, and complete a
              purchase independently and with ease.
            </p>
          </div>
        </section>

        {/* How tested */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            How the website was tested
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We review designs and use automated accessibility testing tools to
              identify and fix accessibility issues on an ongoing basis. The
              website has been tested across a range of browsers, screen
              readers, and assistive technologies to ensure compatibility.
            </p>
            <p>
              Our testing focuses on typical customer journeys including
              browsing products, using search and filters, managing the basket,
              and completing checkout for home delivery.
            </p>
          </div>
        </section>

        {/* Known issues */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Known issues
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Our accessibility testing suggests that customers should be able
              to complete a home delivery purchase independently, while there
              may be some minor accessibility issues in certain areas. We are
              actively working to resolve these.
            </p>

            <div className="space-y-6 mt-6">
              <div className="bg-surface rounded-lg p-5">
                <h3 className="text-base font-bold text-text-primary mb-2">
                  Screen readers
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                  <li>
                    The cookie consent banner is visually prominent but
                    programmatically placed at the bottom of the page. Screen
                    reader users can use &lsquo;Shift + Tab&rsquo; to navigate
                    back through the browser address bar options to access it.
                  </li>
                  <li>
                    On search results pages, each product listing may have
                    multiple links. The main product link will take you to the
                    product description page.
                  </li>
                  <li>
                    Some form controls may not have fully descriptive
                    programmatic labels. You may need to explore the surrounding
                    content to understand how to use these elements.
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-lg p-5">
                <h3 className="text-base font-bold text-text-primary mb-2">
                  Keyboard navigation
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                  <li>
                    All interactive elements can be accessed using the keyboard.
                    Use Tab to move forward, Shift + Tab to move backward, and
                    Enter or Space to activate controls.
                  </li>
                  <li>
                    Modal dialogs (such as cookie preferences and sign-in) can
                    be closed using the Escape key. If you find you cannot
                    re-enter a modal, try refreshing the page using Ctrl + R
                    (Windows) or Command + R (Mac).
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-lg p-5">
                <h3 className="text-base font-bold text-text-primary mb-2">
                  Low vision, zoom &amp; magnification
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                  <li>
                    The website is responsive and supports zoom up to 200%
                    without loss of content or functionality.
                  </li>
                  <li>
                    The colour contrast of some elements such as error
                    messaging and certain icons may be difficult to read for
                    some customers. We are working to improve contrast ratios
                    across the site.
                  </li>
                  <li>
                    On mobile devices in landscape mode, the viewable area may
                    become limited when zoomed in. We recommend viewing in
                    portrait mode and using pinch-and-zoom or your device&apos;s
                    magnification settings.
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-lg p-5">
                <h3 className="text-base font-bold text-text-primary mb-2">
                  Voice activation
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                  <li>
                    Some buttons and interactive elements may lack visible text
                    labels that match the expected voice command. Most dictation
                    software will support grid and number navigation if natural
                    language voice commands do not work.
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-lg p-5">
                <h3 className="text-base font-bold text-text-primary mb-2">
                  Concentrating, remembering &amp; understanding
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                  <li>
                    The website uses some bright colours and promotional
                    banners that may be distracting. You can reduce visual
                    stimulation by enabling your device&apos;s
                    &ldquo;reduce motion&rdquo; or high contrast settings.
                  </li>
                  <li>
                    There are some animations, for example on the homepage
                    carousel and countdown timers. You can disable these using
                    &lsquo;reduced motion&rsquo; and other similar operating
                    system settings.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility features */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Accessibility features
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>We have implemented the following features to support accessibility:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-text-primary">Semantic HTML</strong>{" "}
                &mdash; we use proper heading hierarchy, landmarks, and ARIA
                attributes throughout the site.
              </li>
              <li>
                <strong className="text-text-primary">
                  Keyboard accessible
                </strong>{" "}
                &mdash; all interactive elements are reachable and operable via
                keyboard.
              </li>
              <li>
                <strong className="text-text-primary">
                  Responsive design
                </strong>{" "}
                &mdash; the site works across all screen sizes and supports text
                resizing.
              </li>
              <li>
                <strong className="text-text-primary">
                  Alt text on images
                </strong>{" "}
                &mdash; product images include descriptive alternative text for
                screen reader users.
              </li>
              <li>
                <strong className="text-text-primary">
                  Form labels
                </strong>{" "}
                &mdash; form fields include associated labels and error
                messages are clearly communicated.
              </li>
              <li>
                <strong className="text-text-primary">
                  Visible focus indicators
                </strong>{" "}
                &mdash; interactive elements display a visible focus state when
                navigated via keyboard.
              </li>
            </ul>
          </div>
        </section>

        {/* Reporting */}
        <section className="mb-10 bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Reporting an issue
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              If you are experiencing an accessibility issue on our website that
              you would like to tell us about, please{" "}
              <Link
                href="/help-and-support#contact"
                className="text-primary hover:underline"
              >
                contact us
              </Link>{" "}
              with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A description of the issue you are experiencing</li>
              <li>The page URL where you encountered it</li>
              <li>
                The browser and assistive technology you are using (if
                applicable)
              </li>
            </ul>
            <p>
              We take all accessibility feedback seriously and will work to
              address any reported issues as quickly as possible.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
