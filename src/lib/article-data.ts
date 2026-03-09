import fs from "fs";
import path from "path";

export interface ArticleData {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  date: string;
  author: string;
  excerpt: string;
  heroImage: string;
  content: string;
  images: string[];
  relatedSlugs: string[];
}

export interface ArticleIndexEntry {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  date: string;
  excerpt: string;
  heroImage: string;
}

export interface TechTalkIndex {
  featured: string;
  trending: string[];
  categories: string[];
  articles: ArticleIndexEntry[];
}

const ARTICLES_DIR = path.join(process.cwd(), "data", "scrape", "articles");
const INDEX_PATH = path.join(
  process.cwd(),
  "data",
  "scrape",
  "techtalk-index.json"
);

export function getTechTalkIndex(): TechTalkIndex {
  const raw = fs.readFileSync(INDEX_PATH, "utf-8");
  return JSON.parse(raw);
}

export function getArticleBySlug(slug: string): ArticleData | null {
  const resolved = path.resolve(ARTICLES_DIR, `${slug}.json`);
  if (!resolved.startsWith(ARTICLES_DIR + path.sep)) return null;
  try {
    const raw = fs.readFileSync(resolved, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAllArticleSlugs(): string[] {
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}
