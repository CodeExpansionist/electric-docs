import Image from "next/image";
import Link from "next/link";
import type { ContentCard } from "@/lib/category-data";

interface HubContentGridProps {
  cards: ContentCard[];
  heading: string;
  columns: 3 | 4;
  cta?: { text: string; url: string };
}

export default function HubContentGrid({ cards, heading, columns, cta }: HubContentGridProps) {
  const gridCols = columns === 4
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-3";

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-text-primary mb-4">{heading}</h2>
      <div className={`grid ${gridCols} gap-4`}>
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.url}
            className="group card overflow-hidden no-underline"
          >
            <div className="aspect-[16/10] bg-surface relative overflow-hidden">
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {cta && (
        <div className="mt-4">
          <Link href={cta.url} className="text-sm text-primary hover:underline">
            {cta.text}
          </Link>
        </div>
      )}
    </section>
  );
}
