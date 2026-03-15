import Link from "next/link";

export default function CareersPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">Careers</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="bg-primary w-full">
        <div className="container-main py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Careers at Electriz
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Join our team and help bring the best in TV and audio technology to
            customers across the UK.
          </p>
        </div>
      </div>

      <div className="container-main py-10 max-w-3xl">
        {/* No vacancies */}
        <section className="mb-10 text-center">
          <div className="bg-surface rounded-lg p-8 md:p-12">
            <div className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              No current vacancies
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto mb-6">
              We don&apos;t have any open positions at the moment, but we&apos;re
              always interested in hearing from talented people. Check back here
              regularly as new opportunities are posted as they arise.
            </p>
          </div>
        </section>

        {/* Why work with us */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Why work with us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-sm font-bold text-text-primary mb-1">
                Passionate about tech
              </h3>
              <p className="text-xs text-text-secondary">
                We live and breathe TVs and audio. If you&apos;re excited by the
                latest in display technology and sound engineering, you&apos;ll
                fit right in.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-sm font-bold text-text-primary mb-1">
                Growing business
              </h3>
              <p className="text-xs text-text-secondary">
                As a fast-growing specialist retailer, there are always new
                challenges and opportunities to develop your career.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-sm font-bold text-text-primary mb-1">
                Flexible working
              </h3>
              <p className="text-xs text-text-secondary">
                We support flexible and remote working arrangements to help our
                team maintain a healthy work-life balance.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-sm font-bold text-text-primary mb-1">
                Staff discounts
              </h3>
              <p className="text-xs text-text-secondary">
                All team members enjoy generous discounts across our full range
                of products.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-surface rounded-lg p-6 text-center">
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Interested in joining us?
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            If you&apos;d like to register your interest for future roles, please
            get in touch via our{" "}
            <Link href="/help-and-support#contact" className="text-primary hover:underline">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
