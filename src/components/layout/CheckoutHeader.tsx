import Link from "next/link";

export default function CheckoutHeader() {
  return (
    <header className="bg-white border-b border-border">
      <div className="container-main flex items-center justify-between py-4">
        {/* Electriz logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">
              electriz
            </span>
          </div>
        </Link>

        {/* Secure checkout */}
        <div className="flex items-center gap-2 text-text-secondary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="text-sm font-medium">Secure checkout</span>
        </div>
      </div>
    </header>
  );
}
