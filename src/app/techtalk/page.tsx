import Link from "next/link";
import Image from "next/image";
import { getTechTalkIndex } from "@/lib/article-data";
import type { ArticleIndexEntry } from "@/lib/article-data";

function ArticleImage({
  article,
  large = false,
}: {
  article: ArticleIndexEntry;
  large?: boolean;
}) {
  return (
    <div
      className={`relative bg-gray-200 ${
        large ? "h-64 md:h-80" : "h-44"
      } rounded-t-lg overflow-hidden`}
    >
      <Image
        src={article.heroImage}
        alt={article.title}
        fill
        className="object-cover"
        sizes={large ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 50vw"}
      />
    </div>
  );
}

export default function TechTalkPage() {
  const index = getTechTalkIndex();
  const { articles, categories, trending } = index;

  const featuredSlug = index.featured;
  const featuredArticle = articles.find((a) => a.slug === featuredSlug) || articles[0];

  const trendingArticles = trending
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter(Boolean) as ArticleIndexEntry[];

  // Grid articles: everything except the featured article
  const gridArticles = articles.filter((a) => a.slug !== featuredSlug);

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
          <span className="text-text-primary">TechTalk</span>
        </nav>
      </div>

      {/* Header */}
      <div className="container-main pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
          TechTalk
        </h1>
        <p className="text-sm text-text-secondary">
          The latest tech, tips and inspiration from Electriz
        </p>
      </div>

      {/* Category links bar */}
      <div className="border-b border-border bg-white">
        <div className="container-main">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
            {categories.map((cat) => (
              <span
                key={cat}
                className="whitespace-nowrap px-4 py-2 text-sm text-text-primary rounded-pill border border-border flex-shrink-0"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Featured + Trending row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Featured article hero */}
          <div className="lg:col-span-2">
            <Link
              href={`/techtalk/${featuredArticle.slug}`}
              className="block no-underline group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-card">
                <ArticleImage article={featuredArticle} large />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary">
                      {featuredArticle.subcategory || featuredArticle.category}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {featuredArticle.date}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Trending sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-5 h-full">
              <h3 className="text-base font-bold text-text-primary mb-4">
                Trending Articles
              </h3>
              <ol className="space-y-4">
                {trendingArticles.map((article, i) => (
                  <li key={article.slug} className="flex gap-3">
                    <span className="text-2xl font-bold text-primary leading-none">
                      {i + 1}
                    </span>
                    <Link
                      href={`/techtalk/${article.slug}`}
                      className="text-sm text-text-primary no-underline hover:text-primary transition-colors leading-snug"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Article card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {gridArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/techtalk/${article.slug}`}
              className="block no-underline group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-card h-full">
                <ArticleImage article={article} />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary">
                      {article.subcategory || article.category}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
