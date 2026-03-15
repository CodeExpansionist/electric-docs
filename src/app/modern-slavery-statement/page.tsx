import Link from "next/link";

export default function ModernSlaveryStatementPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">Modern Slavery Statement</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="bg-announcement w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Modern Slavery Statement
          </h1>
        </div>
      </div>

      <div className="container-main py-8 max-w-4xl">
        {/* Introduction */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Introduction</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              This statement is made pursuant to Section 54 of the Modern Slavery
              Act 2015 and sets out the steps that Electriz plc (&ldquo;Electriz&rdquo;)
              has taken, and continues to take, to ensure that modern slavery and
              human trafficking are not taking place within our business or supply
              chains.
            </p>
            <p>
              Modern slavery is a crime and a violation of fundamental human
              rights. It takes various forms, including slavery, servitude, forced
              and compulsory labour, and human trafficking, all of which have in
              common the deprivation of a person&apos;s liberty by another in
              order to exploit them for personal or commercial gain.
            </p>
          </div>
        </section>

        {/* Our business */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Our business</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Electriz is a UK-based online retailer specialising in televisions
              and audio equipment. We source products from established
              manufacturers and brand partners, and sell directly to consumers
              through our website. We are committed to acting ethically and with
              integrity in all our business dealings and relationships.
            </p>
          </div>
        </section>

        {/* Our supply chains */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Our supply chains</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Our supply chains include the sourcing of consumer electronics from
              international manufacturers, logistics and delivery services, IT
              infrastructure, and marketing services. We recognise that modern
              slavery risks can exist in complex global supply chains, and we take
              this responsibility seriously.
            </p>
          </div>
        </section>

        {/* Our policies */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Our policies in relation to modern slavery
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>We are committed to ensuring there is no modern slavery or human trafficking in our supply chains or in any part of our business. Our policies reflect our commitment to acting ethically and with integrity. These include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-text-primary">Supplier Code of Conduct</strong> &mdash;
                we expect all suppliers to adhere to our Code of Conduct, which
                sets out the minimum standards we require in relation to labour
                practices, working conditions, and human rights.
              </li>
              <li>
                <strong className="text-text-primary">Whistleblowing Policy</strong> &mdash;
                we encourage all employees, workers and business partners to
                report any concerns related to our direct activities or supply
                chains. This includes any circumstances that may give rise to an
                enhanced risk of slavery or human trafficking.
              </li>
              <li>
                <strong className="text-text-primary">Recruitment Policy</strong> &mdash;
                we operate a robust recruitment process, including eligibility
                to work checks for all employees, to safeguard against human
                trafficking or individuals being forced to work against their
                will.
              </li>
            </ul>
          </div>
        </section>

        {/* Due diligence */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Due diligence</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>As part of our efforts to monitor and reduce the risk of modern slavery occurring within our supply chains, we have taken the following steps:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                We assess all new suppliers against our Code of Conduct before
                entering into any business relationship.
              </li>
              <li>
                We carry out regular reviews of our existing suppliers to ensure
                ongoing compliance.
              </li>
              <li>
                We work with established, reputable brands and manufacturers
                who have their own publicly available modern slavery statements
                and ethical sourcing commitments.
              </li>
              <li>
                We maintain clear lines of communication with our suppliers to
                encourage transparency and the reporting of any concerns.
              </li>
            </ul>
          </div>
        </section>

        {/* Training */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Training</h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We provide training to relevant members of our team so they
              understand the risks of modern slavery and human trafficking
              within our business and supply chains. This training is designed to
              help staff identify the signs of modern slavery and know how to
              report any concerns.
            </p>
          </div>
        </section>

        {/* Approval */}
        <section className="mb-10 bg-surface rounded-lg p-6">
          <p className="text-sm text-text-secondary">
            This statement has been approved by the Board of Directors of
            Electriz plc and will be reviewed and updated annually.
          </p>
          <p className="text-xs text-text-secondary mt-3">
            Last updated: March 2026
          </p>
        </section>
      </div>
    </div>
  );
}
