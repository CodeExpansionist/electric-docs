import Link from "next/link";

export default function ElectrizPerks() {
  return (
    <section className="bg-footer-bg py-8">
      <div className="container-main text-center">
        <h2 className="text-white text-2xl font-bold mb-2">Join Electriz Perks</h2>
        <p className="text-footer-text text-sm mb-5">
          For exclusive discounts, giveaways &amp; lots more
        </p>
        <Link
          href="/account"
          className="inline-flex items-center justify-center rounded-pill px-8 py-3
                     border-2 border-white text-white font-semibold
                     hover:bg-white hover:text-footer-bg transition-colors no-underline"
        >
          Sign me up
        </Link>
      </div>
    </section>
  );
}
