import Link from "next/link";

export default function RecyclingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">Recycling</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="bg-[#2E7D32] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Recycling &amp; WEEE
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            We&apos;re committed to responsible recycling of old electrical and
            electronic equipment. Here&apos;s how we can help.
          </p>
        </div>
      </div>

      <div className="container-main py-8 max-w-4xl">
        {/* What is WEEE */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            What is WEEE?
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              WEEE stands for Waste Electrical and Electronic Equipment. The WEEE
              Regulations aim to reduce the amount of electrical and electronic
              equipment being produced and to encourage reuse, recycling and
              recovery of such products. The regulations also aim to improve the
              environmental performance of all those involved in the lifecycle of
              electrical and electronic equipment.
            </p>
            <p>
              As a retailer of electrical goods, we have obligations under the
              WEEE Regulations to provide information to consumers about the
              environmental impact of electrical products and to offer free
              take-back of old equipment when a new equivalent is purchased.
            </p>
          </div>
        </section>

        {/* The crossed-out wheelie bin symbol */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            The crossed-out wheelie bin symbol
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              You may notice a crossed-out wheelie bin symbol on your electrical
              products or their packaging. This symbol indicates that the product
              should not be disposed of with general household waste. Instead, it
              should be recycled through an appropriate recycling facility or
              take-back scheme.
            </p>
            <p>
              Disposing of electrical items in general waste can release harmful
              substances into the environment. Proper recycling ensures that
              valuable materials such as metals, plastics and glass are recovered
              and reused.
            </p>
          </div>
        </section>

        {/* Our recycling service */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Our recycling service
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              When you purchase a new TV or audio product from us, we can
              collect and recycle your old equivalent item. Here&apos;s how it
              works:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="bg-surface rounded-lg p-5 text-center">
                <div className="text-2xl font-bold text-primary mb-2">1</div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Add recycling to your order
                </h3>
                <p className="text-xs text-text-secondary">
                  When purchasing a new product, add our recycling service to
                  your basket at checkout.
                </p>
              </div>
              <div className="bg-surface rounded-lg p-5 text-center">
                <div className="text-2xl font-bold text-primary mb-2">2</div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Prepare your old item
                </h3>
                <p className="text-xs text-text-secondary">
                  Disconnect your old TV or audio equipment and have it ready
                  for collection when your new product is delivered.
                </p>
              </div>
              <div className="bg-surface rounded-lg p-5 text-center">
                <div className="text-2xl font-bold text-primary mb-2">3</div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  We collect &amp; recycle
                </h3>
                <p className="text-xs text-text-secondary">
                  Our delivery team will take your old item away when they
                  deliver your new product. We&apos;ll ensure it&apos;s
                  recycled responsibly.
                </p>
              </div>
            </div>

            <p>
              Please note, we recycle items on a like-for-like basis. The item we
              remove should be roughly the same size as the new one we deliver.
              Sometimes, we can remove a larger item if we have room in our
              delivery van.
            </p>
          </div>
        </section>

        {/* What can be recycled */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            What can be recycled
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              We can recycle the following types of electrical equipment when you
              purchase a new equivalent product:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Televisions of all types and sizes</li>
              <li>Soundbars and home cinema systems</li>
              <li>Hi-Fi systems and speakers</li>
              <li>Headphones and earphones</li>
              <li>DVD and Blu-ray players</li>
              <li>Streaming devices and set-top boxes</li>
              <li>TV accessories including wall mounts and stands</li>
            </ul>
          </div>
        </section>

        {/* Small items */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Small electrical items
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Got any small, old tech lying around? If we have room in our
              delivery van when dropping off your new product, we can recycle
              small electrical items free of charge alongside your old TV or
              audio equipment.
            </p>
          </div>
        </section>

        {/* Battery recycling */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Battery recycling
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-4">
            <p>
              Under the Waste Batteries and Accumulators Regulations 2009,
              batteries should not be disposed of with general household waste.
              Many products we sell contain rechargeable batteries, including
              wireless headphones, portable speakers, and remote controls.
            </p>
            <p>
              Used batteries can be taken to most local recycling centres or
              battery collection points at supermarkets and other retailers.
              Please remove batteries from products before recycling where
              possible.
            </p>
          </div>
        </section>

        {/* Already placed an order */}
        <section className="mb-10 bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Already placed an order?
          </h2>
          <div className="prose max-w-none text-sm text-text-secondary space-y-3">
            <p>
              If you&apos;ve already placed an order and would like to add our
              recycling service, call us on{" "}
              <strong className="text-text-primary">0344 561 1234</strong> and
              we&apos;ll arrange it for you.
            </p>
            <p>
              For more information about recycling electrical equipment in your
              area, visit{" "}
              <a
                href="https://www.recyclenow.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Recycle Now
              </a>{" "}
              or contact your local council.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
