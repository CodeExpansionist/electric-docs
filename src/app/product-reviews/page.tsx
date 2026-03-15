import Link from "next/link";
import Image from "next/image";

const topCards = [
  {
    title: "How do we collect our product reviews?",
    image: "/images/banners/product-reviews-collect.png",
    text: "We partner with Feefo who collect and moderate our reviews in accordance with their policy on Compliance and Authenticity Checks. Once you\u2019ve made a purchase, we send customers an email inviting them to leave a product review by giving a star rating from one to five and describing their experience with us. Simply follow the steps outlined in the email to share your experience. This process ensures our reviews are written by real customers, thereby reinforcing the integrity of genuine customer feedback and giving you feedback you can trust. You may also see verified customer reviews collected from a third party, such as a direct to consumer product brand. These will always be labelled separately.",
  },
  {
    title: "How our moderation process works",
    image: "/images/banners/product-reviews-moderation.png",
    text: "Submitting and publishing fake or misleading reviews are strictly prohibited under this policy. Our reviews are independently moderated by our third-party provider, Feefo, to ensure the content displayed is authentic. A combination of software tools and algorithms are used to automatically and manually detect non-compliant reviews.",
  },
  {
    title: "Incentivised reviews",
    image: "/images/banners/product-reviews-incentivised.png",
    text: "Transparency is important to us. We do not offer any incentives to our customers in exchange for a product review. However, reviews published on our site by a third party, may provide a customer with a free product or sample in exchange for leaving their genuine feedback. This will be treated as an incentivised review and labelled as such.",
  },
];

const doCards = [
  {
    icon: "/images/icons/guarantee-2-svg.svg",
    text: "Your review is always genuine, even if you receive an incentive, and relates to the correct product.",
  },
  {
    icon: "/images/icons/laptop-svg.svg",
    text: "You focus on the product or service purchased.",
  },
  {
    icon: "/images/icons/tick-svg.svg",
    text: "You keep to the true facts; avoid accusations and personal insults.",
  },
  {
    icon: "/images/icons/copy-svg.svg",
    text: "Your review is consistent with the overall rating you are giving.",
  },
];

const dontCards = [
  {
    icon: "/images/icons/close-svg.svg",
    text: "Make false, inaccurate or misleading comments about the product or service you have received.",
  },
  {
    icon: "/images/icons/guarantee-2-svg.svg",
    text: "Leave a review without disclosing any incentive you have received.",
  },
  {
    icon: "/images/icons/laptop-svg.svg",
    text: "Leave a review for products you have not purchased or used.",
  },
  {
    icon: "/images/icons/user-svg.svg",
    text: "Include personal information about yourself or anyone else.",
  },
  {
    icon: "/images/icons/mobile-svg.svg",
    text: "Post irrelevant content such as a review left on an unrelated product.",
  },
  {
    icon: "/images/icons/share-svg.svg",
    text: "Include spam, advertising or marketing of other shops or websites.",
  },
  {
    icon: "/images/icons/flag-svg.svg",
    text: "Use profanity, offensive, sexually explicit, abusive, hateful or discriminatory language.",
  },
  {
    icon: "/images/icons/alert-svg.svg",
    text: "Include content that is illegal.",
  },
];

export default function ProductReviewsPage() {
  return (
    <div className="bg-white min-h-screen">
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

      <div className="container-main pb-12">
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

        {/* Top 3 cards — image top half, grey bg bottom half */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topCards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg border border-border overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="bg-surface p-5 flex-1">
                <h3 className="text-base font-bold text-text-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Submitting a review */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-2 text-center">
            Submitting a review
          </h2>
          <p className="text-sm text-text-secondary mb-8 text-center">
            We request that you follow these guidelines when writing a review to
            ensure reviews you leave are an honest and factual account of your
            purchase. Please ensure:
          </p>

          {/* 4 guideline cards with circle overlay icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {doCards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-border shadow-card pt-10 pb-5 px-5 text-center relative"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center">
                  <Image
                    src={card.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* You must NOT section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-8">
            You must NOT:
          </h2>

          {/* Two rows of 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-8 mb-6">
            {dontCards.slice(0, 4).map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-border shadow-card pt-10 pb-5 px-5 text-center relative"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center">
                  <Image
                    src={card.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {dontCards.slice(4).map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-border shadow-card pt-10 pb-5 px-5 text-center relative"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center">
                  <Image
                    src={card.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm text-text-secondary mt-8 leading-relaxed text-center">
            If a review is suspected to be fake, misleading or contain the above
            banned content such as an undisclosed incentive, spam, profanities or
            discrimination it will be removed.
          </p>
          <p className="text-sm text-text-secondary mt-4 leading-relaxed text-center">
            All reviews, regardless of the ratings and whether they are positive
            or negative, are treated the same. If you have a complaint this will
            not preclude you from also leaving a review, which will always be
            published providing it complies with the rules above.
          </p>
        </section>

        {/* 50/50 split — suspicious review */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-lg border border-border overflow-hidden">
            <div className="relative w-full aspect-[16/10] md:aspect-auto">
              <Image
                src="/images/banners/product-reviews-suspicious.jpg"
                alt="What to do if you find a suspicious review"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="bg-surface p-8 flex flex-col justify-center">
              <h2 className="text-xl font-bold text-text-primary mb-3">
                What to do if you find a suspicious review
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                If you found a review you feel should not have been published
                this can be reported to us. Every review flagged is investigated.
              </p>
            </div>
          </div>
        </section>

        {/* Footer disclaimer */}
        <p className="text-xs text-text-secondary">
          By posting or submitting a review through our partner Feefo, you agree
          to adhere to this policy. This might change from time to time.
        </p>
      </div>
    </div>
  );
}
