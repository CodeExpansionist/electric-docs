import Link from "next/link";

const sidebarItems = [
  {
    title: 'SAMSUNG UB00F 50" Crystal UHD 4K HDR Smart TV 2025 – UE50UB00F',
    quantity: 1,
    price: 299.0,
  },
  {
    title: 'SONY BRAVIA 8A 55" OLED 4K HDR AI Smart TV – K55HR8AB',
    quantity: 1,
    price: 1399.0,
  },
];

export default function CheckoutSidebar() {
  const subtotal = sidebarItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="card p-5 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">In your basket</h3>
        <Link href="/basket" className="text-xs text-primary hover:underline">
          Edit basket
        </Link>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-4">
        {sidebarItems.map((item, i) => (
          <div key={i} className="border-b border-border pb-3">
            <p className="text-xs text-text-primary font-medium leading-snug mb-1">
              {item.title}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Quantity: {item.quantity}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                £{item.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Subtotal</span>
          <span className="text-xs text-text-primary">
            £{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Delivery</span>
          <span className="text-xs text-text-muted">—</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-base font-bold text-text-primary">Total</span>
        <span className="text-xl font-bold text-text-primary">
          £{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
