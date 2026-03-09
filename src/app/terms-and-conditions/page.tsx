import Link from "next/link";

const tocSections = [
  { id: "supply", label: "Terms and Conditions of Supply" },
  { id: "website-terms", label: "Website Terms of Use" },
  { id: "user-generated-content", label: "User Generated Content" },
];

export default function TermsAndConditionsPage() {
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
          <span className="text-text-primary">Terms &amp; conditions</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-announcement w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Terms &amp; conditions
          </h1>
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

        {/* ========== TERMS AND CONDITIONS OF SUPPLY ========== */}
        <section id="supply" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Terms and Conditions of Supply
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We&apos;ve tried to keep our Terms and Conditions
              (&quot;Ts and Cs&quot;) as clear as possible and to give you all
              the information we can about buying from Electriz. These Ts and Cs
              apply to purchases made on our website or over the phone.
            </p>
            <p>
              Items sold on our website and in-store are intended exclusively
              for normal domestic and personal use within the UK and are not for
              commercial use or resale.
            </p>

            {/* About us */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              1. About us
            </h3>
            <p>
              We are Electriz plc, a company registered in England and Wales
              (registered number 07105905), with our registered office at 1
              Portal Way, London, W3 6RS. Our VAT number is 927 2556 00.
            </p>

            {/* Your contract */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              2. Our contract with you
            </h3>
            <p>
              Don&apos;t panic if you make any mistakes during your order
              &mdash; you can correct any input errors right up until you
              confirm payment. Once you&apos;re happy with the order details,
              you confirm your order by proceeding to payment.
            </p>
            <p>
              Our acceptance of your order takes place when we email you to
              confirm it, at which point a contract will come into existence
              between you and us. We may not accept your order if the product is
              unavailable, if we identify a pricing error, or if you are located
              outside the UK or our delivery areas.
            </p>

            {/* Payment */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              3. Payment
            </h3>
            <p>
              All our prices are in UK pounds. The total cost of your order will
              be the price of the products you order, the delivery charge (if
              any), plus any additional charges for services you may choose.
              This total will be confirmed at checkout before you complete your
              purchase.
            </p>

            {/* Delivery */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              4. Delivery
            </h3>
            <p>
              If our supply of your product is delayed by an event outside our
              control (for example, due to supply chain issues, traffic levels
              or adverse weather conditions), we will contact you as soon as
              possible to let you know and take steps to minimise the effect of
              the delay.
            </p>
            <p>
              We may charge you additional sums if you don&apos;t give us the
              information we&apos;ve asked for about how we can access your
              property for delivery, installation or recycling services. Full
              details about our delivery options are available on our{" "}
              <Link
                href="/services/delivery"
                className="text-primary hover:underline"
              >
                Delivery options
              </Link>{" "}
              page.
            </p>

            {/* Cancellation and returns */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              5. Your right to change your mind
            </h3>
            <p>
              <strong className="text-text-primary">
                Your legal right to change your mind.
              </strong>{" "}
              For most of our products bought online or over the telephone, you
              have a legal right to change your mind about your purchase and
              receive a refund. This is sometimes known as the &quot;cooling
              off&quot; period.
            </p>
            <p>
              <strong className="text-text-primary">
                When you can&apos;t change your mind.
              </strong>{" "}
              You can&apos;t change your mind about an order for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Products sealed for health protection or hygiene purposes, once
                unsealed after delivery.
              </li>
              <li>
                Sealed audio or sealed video recordings or sealed computer
                software, once unsealed after delivery.
              </li>
              <li>
                Any products which become mixed inseparably with other items
                after their delivery.
              </li>
            </ul>
            <p>
              <strong className="text-text-primary">
                The deadline for changing your mind.
              </strong>{" "}
              If you change your mind about goods, you must let us know no later
              than 14 days after the day we deliver your product (or last
              product, if split across deliveries).
            </p>
            <p>
              <strong className="text-text-primary">How to let us know.</strong>{" "}
              To let us know you want to change your mind,{" "}
              <Link
                href="/contact-us"
                className="text-primary hover:underline"
              >
                contact us
              </Link>
              .
            </p>

            {/* Returns */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              6. Returns
            </h3>
            <p>
              You have to return the product if it is goods. You can return it
              by dropping it off at a pickup shop to send the product back to
              us, following the returns process on our website. You should keep
              proof of postage. Alternatively, you can return the product to any
              of our stores.
            </p>
            <p>
              We only refund standard delivery costs. We don&apos;t refund any
              extra you have paid for express delivery or delivery at a
              particular time. Goods must be returned as new and, where
              possible, in the original packaging.
            </p>
            <p>
              For more details, see our{" "}
              <Link
                href="/services/returns"
                className="text-primary hover:underline"
              >
                Returns &amp; cancellations
              </Link>{" "}
              page.
            </p>

            {/* Faulty products */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              7. Faulty products
            </h3>
            <p>
              We want you to be absolutely satisfied with your product and would
              recommend that, where practicable, you unpack and check it for
              damage as soon as it arrives.
            </p>
            <p>
              If your product is faulty, we will offer either a repair, exchange
              or refund if the fault occurs within 30 days of purchase (or
              delivery or installation, whichever is later). We do not cover
              faults caused by accident, neglect, misuse or normal wear and
              tear.
            </p>

            {/* Liability */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              8. Our liability
            </h3>
            <p>
              We are responsible for losses you suffer caused by us breaking
              this contract unless the loss is unexpected, caused by a
              supervening event outside our control, or something you could have
              avoided by taking reasonable action.
            </p>
            <p>
              We do not exclude or limit in any way our liability where it would
              be unlawful to do so. This includes liability for death or
              personal injury caused by our negligence, for fraud or fraudulent
              misrepresentation, and for defective products under the Consumer
              Protection Act 1987.
            </p>

            {/* Changes and ending contract */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              9. Changes to products and these terms
            </h3>
            <p>
              We can always change a product or these Ts and Cs without
              notifying you in advance to reflect changes in relevant laws and
              regulatory requirements, or to make minor adjustments and
              improvements that will not materially affect your use of the
              product.
            </p>

            {/* Ending contract */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              10. We can end our contract with you
            </h3>
            <p>
              We can end our contract with you for a product and claim any
              compensation due to us if you don&apos;t make any payment to us
              when it is due, you don&apos;t provide us with information or
              access that we need, or you don&apos;t allow us to deliver the
              product to you or collect it from us within a reasonable time.
            </p>

            {/* Disputes */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              11. Complaints and disputes
            </h3>
            <p>
              Please{" "}
              <Link
                href="/contact-us"
                className="text-primary hover:underline"
              >
                contact us
              </Link>{" "}
              if you have any questions or complaints. Alternative dispute
              resolution is an optional process where an independent body
              considers the facts of a dispute and seeks to resolve it without
              you having to go to court.
            </p>
            <p>
              These Ts and Cs are governed by English law and wherever you live
              you can bring claims against us in the English courts. If you live
              in Wales, Scotland or Northern Ireland, you can also bring claims
              in the courts of the country you live in.
            </p>

            {/* Other terms */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              12. Other important terms
            </h3>
            <p>
              We can transfer our contract with you so that a different
              organisation is responsible for supplying your product.
              We&apos;ll tell you in writing if this happens and ensure your
              rights under the contract are not affected.
            </p>
            <p>
              Nobody else has any rights under this contract. This contract is
              between you and us. If a court invalidates some of this contract,
              the rest of it will still apply. Even if we delay in enforcing
              this contract, we can still enforce it later.
            </p>
          </div>
        </section>

        {/* ========== WEBSITE TERMS OF USE ========== */}
        <section id="website-terms" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Website Terms of Use
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              These terms of use (together with the documents referred to in
              them) tell you the terms on which you may make use of our website.
              By using our site, you confirm that you accept these terms and
              agree to comply with them.
            </p>

            {/* Accessing the website */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              1. Accessing our website
            </h3>
            <p>
              Access to our site is permitted on a temporary basis. We may
              suspend, withdraw, discontinue or change all or any part of our
              site without notice. We will not be liable to you if for any
              reason our site is unavailable at any time or for any period.
            </p>

            {/* UK only */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              2. Our site is only for users in the UK
            </h3>
            <p>
              Our site is directed to people residing in the United Kingdom. We
              do not represent that content available on or through our site is
              appropriate for use or available in locations outside the UK.
            </p>

            {/* Intellectual property */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              3. Intellectual property rights
            </h3>
            <p>
              We, our group of companies and our suppliers own the copyright,
              trademarks and all other intellectual property rights in all
              material and content on our website. You may print off one copy,
              and may download extracts, of any page(s) from our site for your
              personal use and you may draw the attention of others to content
              posted on our site.
            </p>
            <p>
              You must not modify the paper or digital copies of any materials
              you have printed off or downloaded, and you must not use any
              illustrations, photographs, video or audio sequences or any
              graphics separately from any accompanying text. Our status as the
              authors of content on our site must always be acknowledged.
            </p>

            {/* No text mining */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              4. Text and data mining
            </h3>
            <p>
              You shall not conduct, facilitate, authorise or permit any text or
              data mining or web scraping in relation to our site or any
              services provided via, or in relation to, our site. This includes
              using any system or software to extract data from our website for
              commercial or non-commercial purposes.
            </p>

            {/* User content */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              5. User content rules
            </h3>
            <p>
              Whenever you make use of a feature that allows you to upload
              content to our site (such as reviews or comments), you must comply
              with our content standards. Any content you upload must be
              accurate, genuinely held where it states opinions, and comply with
              applicable law.
            </p>
            <p>Content must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be defamatory, obscene, offensive, hateful or inflammatory.</li>
              <li>Promote sexually explicit material, violence, or discrimination.</li>
              <li>
                Infringe any intellectual property rights of any other person.
              </li>
              <li>
                Be likely to deceive any person or be used to impersonate any
                person.
              </li>
              <li>
                Breach any legal duty owed to a third party, such as a
                contractual duty or a duty of confidence.
              </li>
              <li>Advocate, promote or assist any unlawful act.</li>
            </ul>

            {/* External links */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              6. We are not responsible for websites we link to
            </h3>
            <p>
              Where our site contains links to other sites and resources
              provided by third parties, these links are provided for your
              information only. Such links should not be interpreted as approval
              by us of those linked websites or information you may obtain from
              them. We have no control over the contents of those sites or
              resources.
            </p>

            {/* Liability */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              7. Our liability
            </h3>
            <p>
              We do not exclude or limit in any way our liability to you where
              it would be unlawful to do so. This includes liability for death
              or personal injury caused by our negligence or the negligence of
              our employees, and for fraud or fraudulent misrepresentation.
            </p>
            <p>
              We will not be liable for any loss or damage, whether in contract,
              tort (including negligence), breach of statutory duty, or
              otherwise, even if foreseeable, arising under or in connection
              with use of, or inability to use, our site.
            </p>
            <p>
              We only provide our site for domestic and private use. You agree
              not to use our site for any commercial or business purposes, and
              we have no liability to you for any loss of profit, loss of
              business, business interruption, or loss of business opportunity.
            </p>

            {/* Governing law */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              8. Governing law
            </h3>
            <p>
              If you are a consumer, these terms of use, their subject matter
              and their formation are governed by English law. You can bring
              legal proceedings in the English courts. If you live in Scotland
              you can bring proceedings in either Scottish or English courts. If
              you live in Northern Ireland you can bring proceedings in either
              Northern Irish or English courts.
            </p>
          </div>
        </section>

        {/* ========== USER GENERATED CONTENT ========== */}
        <section id="user-generated-content" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            User Generated Content
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              The following terms apply to content you share with us, such as
              product reviews, ratings, questions, answers, photos, and any
              other content (&quot;Content&quot;) that you submit via our
              website.
            </p>

            {/* License */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              1. Rights you give us
            </h3>
            <p>
              By submitting Content, you grant Electriz a non-exclusive,
              royalty-free, perpetual, worldwide licence to use, reproduce,
              modify, publish, translate, distribute, and display the Content in
              any media. We may also sub-license these rights to our group
              companies and service providers.
            </p>

            {/* Cancelling rights */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              2. How to cancel our rights to use your Content
            </h3>
            <p>
              Our rights to use your Content last indefinitely unless and until
              they are cancelled by you. You can cancel at any time by{" "}
              <Link
                href="/contact-us"
                className="text-primary hover:underline"
              >
                contacting us
              </Link>
              . Once cancelled, we will make reasonable efforts to remove your
              Content, though it may take some time to remove from all systems
              and caches.
            </p>

            {/* Your promises */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              3. Your promises to us
            </h3>
            <p>By submitting Content, you confirm that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The Content is your original work and you own all intellectual
                property rights in it.
              </li>
              <li>
                Our use of your Content will not infringe the intellectual
                property, privacy, or publicity rights of any third party.
              </li>
              <li>
                The Content is truthful and based on your genuine experience.
              </li>
              <li>
                You have not been offered payment or incentive by any third
                party to submit the Content.
              </li>
              <li>
                The Content complies with all applicable laws and our content
                standards.
              </li>
            </ul>

            {/* Removal */}
            <h3 className="text-base font-bold text-text-primary mt-6">
              4. Our right to remove Content
            </h3>
            <p>
              We reserve the right to remove or edit any Content at our
              discretion, particularly if it breaches our content standards or
              these terms. We are not obliged to publish, use, or retain any
              Content you submit.
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
