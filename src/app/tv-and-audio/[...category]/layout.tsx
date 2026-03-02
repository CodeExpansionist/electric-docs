import type { Metadata } from "next";

interface Props {
  params: { category: string[] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segments = params.category;
  const lastSegment = segments[segments.length - 1];
  const categoryName = lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${categoryName} | TV & Audio`,
    description: `Shop ${categoryName.toLowerCase()} at Currys. Browse our wide range with free delivery on orders over £40. Compare specs, read reviews and find the best deals.`,
    alternates: { canonical: `/tv-and-audio/${segments.join("/")}` },
    openGraph: {
      title: `${categoryName} | TV & Audio | Currys`,
      description: `Shop ${categoryName.toLowerCase()} at Currys. Free delivery on orders over £40.`,
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
