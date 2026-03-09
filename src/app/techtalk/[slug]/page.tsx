import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getAllArticleSlugs,
  getTechTalkIndex,
} from "@/lib/article-data";

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | TechTalk`,
    description: article.excerpt,
    alternates: { canonical: `/techtalk/${slug}` },
    openGraph: {
      title: `${article.title} | Electriz TechTalk`,
      description: article.excerpt,
    },
  };
}

/** Simple markdown-to-JSX renderer for article content */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-xl font-bold text-text-primary mt-8 mb-3"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-lg font-bold text-text-primary mt-6 mb-2"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Images
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      if (src.startsWith("/images/")) {
        elements.push(
          <div key={i} className="my-6">
            <Image
              src={src}
              alt={alt || "Article image"}
              width={800}
              height={450}
              className="w-full rounded-lg"
            />
          </div>
        );
      }
      i++;
      continue;
    }

    // Unordered list items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        listItems.push(
          <li key={i}>{renderInline(lines[i].slice(2))}</li>
        );
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="list-disc pl-6 space-y-1 my-4 text-sm text-text-secondary leading-relaxed"
        >
          {listItems}
        </ul>
      );
      continue;
    }

    // Ordered list items
    if (/^\d+\.\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(
          <li key={i}>
            {renderInline(lines[i].replace(/^\d+\.\s/, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="list-decimal pl-6 space-y-1 my-4 text-sm text-text-secondary leading-relaxed"
        >
          {listItems}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={i}
        className="text-sm text-text-secondary leading-relaxed my-3"
      >
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

/** Render inline markdown (bold, links) */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(
        <strong key={key++} className="font-bold text-text-primary">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Links
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      if (linkMatch.index > 0) {
        parts.push(remaining.slice(0, linkMatch.index));
      }
      if (!linkMatch[2].startsWith("/")) {
        // Non-internal links render as plain text
        parts.push(linkMatch[1]);
      } else {
        parts.push(
          <Link
            key={key++}
            href={linkMatch[2]}
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </Link>
        );
      }
      remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
      continue;
    }

    // Plain text
    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // Get related articles (same category, exclude self)
  let relatedArticles: { slug: string; title: string; heroImage: string }[] =
    [];
  try {
    const index = getTechTalkIndex();
    relatedArticles = index.articles
      .filter((a) => a.category === article.category && a.slug !== slug)
      .slice(0, 3);
  } catch {
    // Index not available
  }

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
          <Link
            href="/techtalk"
            className="hover:text-primary no-underline text-text-secondary"
          >
            TechTalk
          </Link>
          <span>&gt;</span>
          <span className="text-text-primary line-clamp-1">
            {article.title}
          </span>
        </nav>
      </div>

      <div className="container-main pb-12">
        <article className="bg-white rounded-lg shadow-card overflow-hidden max-w-3xl mx-auto">
          {/* Hero image */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={article.heroImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-6 md:p-8">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-primary">
                {article.subcategory || article.category}
              </span>
              <span className="text-xs text-text-secondary">
                {article.date}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
              {article.title}
            </h1>

            {/* Content */}
            <div className="prose max-w-none">
              {renderMarkdown(article.content)}
            </div>
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-3xl mx-auto mt-10">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Related articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/techtalk/${related.slug}`}
                  className="block no-underline group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-card h-full">
                    <div className="relative w-full aspect-[16/9]">
                      <Image
                        src={related.heroImage}
                        alt={related.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="max-w-3xl mx-auto border-t border-border pt-6 mt-10">
          <Link
            href="/techtalk"
            className="text-sm text-primary no-underline hover:underline"
          >
            &larr; Back to TechTalk
          </Link>
        </div>
      </div>
    </div>
  );
}
