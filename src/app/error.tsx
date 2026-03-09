"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
          We ran into an unexpected error. Please try again, or head back to the
          homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-outline text-sm no-underline"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
