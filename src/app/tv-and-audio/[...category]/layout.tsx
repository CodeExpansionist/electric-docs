import type { Metadata } from "next";
import { categoryDisplayNames } from "@/lib/category-data";

interface Props {
  params: Promise<{ category: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const segments = category;
  const slug = segments.join("/");
  const categoryName = categoryDisplayNames[slug]
    || segments[segments.length - 1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${categoryName} | TV & Audio`,
    description: `Shop ${categoryName.toLowerCase()} at Electriz. Browse our wide range with free delivery on orders over £40. Compare specs, read reviews and find the best deals.`,
    alternates: { canonical: `/tv-and-audio/${segments.join("/")}` },
    openGraph: {
      title: `${categoryName} | TV & Audio | Electriz`,
      description: `Shop ${categoryName.toLowerCase()} at Electriz. Free delivery on orders over £40.`,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
