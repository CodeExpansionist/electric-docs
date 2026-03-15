import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">About us</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="bg-primary w-full">
        <div className="container-main py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            About Electriz
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Your trusted destination for televisions and audio equipment in the UK.
          </p>
        </div>
      </div>

      <div className="container-main py-10 max-w-4xl">
        {/* Who we are */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Who we are</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Electriz is a specialist online retailer dedicated to TVs and audio
              products. We bring together the biggest brands in home entertainment
              &mdash; from Samsung, Sony and LG to Bose, Sonos and Bang &amp;
              Olufsen &mdash; all in one place, with expert guidance to help you
              find the perfect setup for your home.
            </p>
            <p>
              Based in the UK, we serve customers nationwide with fast, reliable
              delivery and a commitment to outstanding customer service. Whether
              you&apos;re upgrading your living room TV, building a home cinema
              system, or looking for the perfect pair of headphones, we&apos;re
              here to help.
            </p>
          </div>
        </section>

        {/* What we offer */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">What we offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">Televisions</h3>
              <p className="text-sm text-text-secondary">
                From compact screens for the bedroom to expansive 85&quot;+ displays
                for the ultimate cinema experience. OLED, QLED, Mini LED, 4K and
                8K &mdash; we stock it all.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">Soundbars &amp; speakers</h3>
              <p className="text-sm text-text-secondary">
                Upgrade your TV audio with soundbars from Sonos, Samsung and more,
                or fill your home with multi-room speakers and Hi-Fi systems.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">Headphones &amp; earbuds</h3>
              <p className="text-sm text-text-secondary">
                Noise-cancelling headphones, wireless earbuds, and studio monitors
                from brands like Sony, Bose, Sennheiser and Apple.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-5">
              <h3 className="text-base font-bold text-text-primary mb-2">TV accessories</h3>
              <p className="text-sm text-text-secondary">
                Wall mounts, stands, cables, streaming devices and everything else
                you need to complete your entertainment setup.
              </p>
            </div>
          </div>
        </section>

        {/* Why shop with us */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Why shop with us</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-text-primary">Free delivery</strong> on
                orders over &pound;40, with next-day delivery available 7 days a
                week.
              </li>
              <li>
                <strong className="text-text-primary">Expert range</strong> &mdash;
                over 140 brands and thousands of products, all carefully curated
                for TV and audio enthusiasts.
              </li>
              <li>
                <strong className="text-text-primary">Easy returns</strong> &mdash;
                changed your mind? Return within 30 days for a full refund, no
                questions asked.
              </li>
              <li>
                <strong className="text-text-primary">Secure shopping</strong> &mdash;
                SSL encryption, Verified by Visa and Mastercard SecureCode protect
                every transaction.
              </li>
              <li>
                <strong className="text-text-primary">Customer support</strong> &mdash;
                our friendly UK-based team is available 7 days a week by phone or
                live chat.
              </li>
            </ul>
          </div>
        </section>

        {/* Our values */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Our values</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We believe great technology should be accessible to everyone. That
              means honest pricing, genuine product reviews from real customers,
              and straightforward advice without the jargon.
            </p>
            <p>
              We&apos;re also committed to doing our part for the environment. We
              offer a{" "}
              <Link href="/recycling" className="text-primary hover:underline">
                recycling service
              </Link>{" "}
              for your old electronics and work with our delivery partners to
              minimise our carbon footprint.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">Get in touch</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-3">
            <p>
              Got a question? Visit our{" "}
              <Link href="/help-and-support" className="text-primary hover:underline">
                Help &amp; Support
              </Link>{" "}
              page or{" "}
              <Link href="/help-and-support#contact" className="text-primary hover:underline">
                contact us
              </Link>{" "}
              directly.
            </p>
            <p>
              <strong className="text-text-primary">Electriz plc</strong><br />
              1 Portal Way, London, W3 6RS<br />
              Registered in England &amp; Wales. Company number: 07105905.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
