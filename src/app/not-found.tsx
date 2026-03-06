import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-surface min-h-[60vh] flex items-center justify-center">
      <div className="container-main py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-text-muted">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M8 11h6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Page not found
        </h1>
        <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
          have been moved or no longer exists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary text-sm no-underline"
          >
            Go to homepage
          </Link>
          <Link
            href="/tv-and-audio"
            className="btn-outline text-sm no-underline"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
