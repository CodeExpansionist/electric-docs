import Link from "next/link";

export default function ProductRecallsPage() {
  return (
    <div className="bg-surface min-h-screen">
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
          <span className="text-text-primary">Product Recalls</span>
        </nav>
      </div>

      <div className="container-main pb-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Product Recalls
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            We take product safety seriously. This page lists any current product
            recalls affecting items sold through Electriz. If you own an affected
            product, please follow the instructions provided.
          </p>
        </div>

        {/* Current recalls section */}
        <section className="bg-white rounded-lg shadow-card p-6 md:p-8 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Current product recalls
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            There are currently no active product recalls. This page is updated
            regularly. Please check back for the latest information.
          </p>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <p className="text-sm text-text-secondary">
              We recommend customers also check manufacturer websites directly
              for the latest recall information, as recalls may be issued
              independently of retailers.
            </p>
          </div>
        </section>

        {/* What to do section */}
        <section className="bg-white rounded-lg shadow-card p-6 md:p-8 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            What to do if your product is recalled
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-sale flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Stop using the product immediately
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Disconnect or stop using the affected product as soon as you
                  become aware of the recall to avoid any potential safety risks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Follow the recall instructions
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Each recall notice will include specific instructions on what
                  to do. You may be entitled to a repair, replacement, or refund
                  depending on the specific recall.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-announcement flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Contact us for support
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  If you have a product affected by a recall, please{" "}
                  <Link
                    href="/contact-us"
                    className="text-primary no-underline hover:underline"
                  >
                    contact us
                  </Link>{" "}
                  and our team will help you through the process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Staying informed section */}
        <section className="bg-white rounded-lg shadow-card p-6 md:p-8 mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Staying informed
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Product recalls can be issued at any time by manufacturers or
            regulatory bodies. We encourage all customers to register their
            products with the manufacturer where possible, so you can be
            contacted directly in the event of a recall. You can also visit the
            UK Government&apos;s product recall page for a comprehensive list of
            recalled products across all retailers.
          </p>
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
