import Link from "next/link";

const doItems = [
  "Leave a genuine review based on your own experience",
  "Focus on the product itself",
  "Keep to the facts",
  "Be consistent with your star rating",
];

const dontItems = [
  "Post false or misleading comments",
  "Accept undisclosed incentives for a review",
  "Review products you do not own or have not used",
  "Include personal information about yourself or others",
  "Include irrelevant content unrelated to the product",
  "Post spam or duplicate reviews",
  "Use profanity or offensive language",
  "Post illegal or harmful content",
];

function InfoCard({
  number,
  title,
  description,
  color,
}: {
  number: number;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div
          className={`${color} w-full md:w-48 h-32 md:h-auto flex-shrink-0 flex items-center justify-center`}
        >
          <span className="text-4xl font-bold text-white">{number}</span>
        </div>
        <div className="p-6">
          <h3 className="text-base font-bold text-text-primary mb-2">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductReviewsPage() {
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
          <span className="text-text-primary">Product Reviews</span>
        </nav>
      </div>

      <div className="container-main pb-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Reviews Policy
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            This policy sets out our approach to reviews and ratings that are
            published on our site and how we manage them.
          </p>
        </div>

        {/* Info cards */}
        <div className="space-y-4 mb-10">
          <InfoCard
            number={1}
            title="How do we collect our product reviews?"
            description="We partner with Feefo who collect and moderate our reviews. Once you've made a purchase, we send customers an email inviting them to leave a product review by giving a star rating from one to five. This ensures our reviews are written by real customers."
            color="bg-primary"
          />
          <InfoCard
            number={2}
            title="How our moderation process works"
            description="Our reviews are independently moderated by our third-party provider, Feefo. A combination of software tools and algorithms are used to detect non-compliant reviews."
            color="bg-announcement"
          />
          <InfoCard
            number={3}
            title="Incentivised reviews"
            description="Transparency is important to us. We do not offer any incentives to our customers in exchange for a product review."
            color="bg-primary-dark"
          />
        </div>

        {/* Submitting a review section */}
        <section className="bg-white rounded-lg shadow-card p-6 md:p-8 mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Submitting a review
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DO column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#008A00] flex items-center justify-center flex-shrink-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#008A00]">DO</h3>
              </div>
              <ul className="space-y-3">
                {doItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#008A00"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DON'T column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-sale flex items-center justify-center flex-shrink-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-sale">DON&apos;T</h3>
              </div>
              <ul className="space-y-3">
                {dontItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#CC0000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 mt-0.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span className="text-sm text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Suspicious review section */}
        <section className="bg-white rounded-lg shadow-card p-6 md:p-8 mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            What to do if you find a suspicious review
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            If you come across a review that you believe is suspicious,
            misleading, or does not comply with this policy, please report it to
            us. We take all reports seriously and will investigate accordingly.
          </p>
        </section>

        {/* Footer note */}
        <p className="text-xs text-text-secondary mb-8">
          By posting or submitting a review, you agree to adhere to this policy.
        </p>

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
