"use client";

interface ProductSpecsProps {
  specifications: Record<string, Record<string, string>>;
}

export default function ProductSpecs({ specifications }: ProductSpecsProps) {
  const categories = Object.entries(specifications);

  if (categories.length === 0) return null;

  return (
    <div className="space-y-6">
      {categories.map(([heading, rows]) => (
        <div key={heading}>
          <h4 className="text-lg font-bold text-text-primary mb-2 uppercase tracking-wide">
            {heading}
          </h4>
          <div className="border-t border-border">
            {Object.entries(rows).map(([label, value]) => (
              <div
                key={label}
                className="flex text-xs py-2.5 border-b border-border"
              >
                <span className="w-2/5 text-text-secondary font-medium pr-4">
                  {label}
                </span>
                <span className="w-3/5 text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
