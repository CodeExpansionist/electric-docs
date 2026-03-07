import Image from "next/image";

export default function EnergyRatingBadge({
  rating,
  labelUrl,
  className,
}: {
  rating: string;
  labelUrl?: string | null;
  className?: string;
}) {
  const letter = rating.toUpperCase();
  if (!/^[A-G]$/.test(letter)) return null;

  const img = (
    <Image
      src={`/images/icons/energy-class-${letter}.svg`}
      alt={`Energy rating ${letter}`}
      width={54}
      height={31}
      className={className}
      unoptimized
    />
  );

  if (labelUrl) {
    return (
      <a href={labelUrl} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
