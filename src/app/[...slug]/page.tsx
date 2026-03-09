import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";

interface PageData {
  url: string;
  pageTitle: string;
  breadcrumbs: { label: string; url: string }[];
  sections: { heading: string; content: string; type: string }[];
  faqs: { question: string; answer: string }[];
}

function loadPageData(slug: string[]): PageData | null {
  const baseDir = path.join(process.cwd(), "data", "scrape", "pages");
  const slugPath = slug.join("__");
  const resolved = path.resolve(baseDir, `${slugPath}.json`);
  if (!resolved.startsWith(baseDir + path.sep)) return null;
  try {
    const raw = fs.readFileSync(resolved, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function FooterPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = loadPageData(slug);
  if (!page) notFound();

  const crumbs = page.breadcrumbs.length > 0
    ? page.breadcrumbs
    : [
        { label: "Home", url: "/" },
        { label: page.pageTitle, url: `/${slug.join("/")}` },
      ];

  return (
    <div className="bg-surface min-h-screen">
      <div className="container-main py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>&gt;</span>}
              {i < crumbs.length - 1 ? (
                <Link
                  href={crumb.url}
                  className="hover:text-primary no-underline text-text-secondary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-primary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Page heading */}
        <h1 className="text-3xl font-bold text-text-primary mb-8 text-balance">
          {page.pageTitle}
        </h1>

        {/* Content sections */}
        <div className="max-w-3xl space-y-8 mb-12">
          {page.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-bold text-text-primary mb-3">
                {section.heading}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line text-pretty">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        {page.faqs.length > 0 && (
          <div className="max-w-3xl mb-12">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {page.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-md p-4 border border-border"
                >
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
