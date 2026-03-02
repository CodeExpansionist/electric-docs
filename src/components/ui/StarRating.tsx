interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showText?: boolean;
}

export default function StarRating({
  rating,
  count,
  size = 14,
  showText = true,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
          const uid = `star-${star}-${size}-${count ?? 0}`;
          return (
            <svg key={star} width={size} height={size} viewBox="0 0 24 24">
              {fill > 0 && fill < 1 && (
                <defs>
                  <linearGradient id={uid}>
                    <stop offset={`${fill * 100}%`} stopColor="#E8A317" />
                    <stop offset={`${fill * 100}%`} stopColor="#E0E0E0" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={
                  fill === 1
                    ? "#E8A317"
                    : fill === 0
                    ? "#E0E0E0"
                    : `url(#${uid})`
                }
              />
            </svg>
          );
        })}
      </div>
      {showText && (
        <>
          <span
            className="text-text-secondary"
            style={{ fontSize: size <= 10 ? "10px" : "12px" }}
          >
            {rating.toFixed(1)}
            {size > 10 && "/5"}
          </span>
          {typeof count === "number" && count > 0 && (
            <span
              className="text-text-secondary"
              style={{ fontSize: size <= 10 ? "10px" : "12px" }}
            >
              {count.toLocaleString()} reviews
            </span>
          )}
        </>
      )}
    </div>
  );
}
