"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders, type Order } from "@/lib/orders-context";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
  processing: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Processing" },
  dispatched: { bg: "bg-purple-100", text: "text-purple-800", label: "Dispatched" },
  delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const colors = statusColors[order.status] || statusColors.confirmed;

  return (
    <div className="card overflow-hidden mb-4">
      <div
        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white border border-border rounded flex items-center justify-center flex-shrink-0">
            {order.items[0] && (
              <Image
                src={order.items[0].image}
                alt=""
                width={48}
                height={48}
                className="object-contain"
                unoptimized
              />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{order.orderNumber}</p>
            <p className="text-xs text-text-secondary">
              {new Date(order.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`${colors.bg} ${colors.text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
            {colors.label}
          </span>
          <span className="text-sm font-bold text-text-primary">
            £{order.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4">
          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-12 h-12 bg-white border border-border rounded flex items-center justify-center flex-shrink-0">
                  <Image src={item.image} alt={item.title} width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{item.title}</p>
                  <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-bold text-text-primary">
                  £{item.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-text-primary mb-1">Delivery address</p>
              <div className="text-text-secondary space-y-0.5">
                <p>{order.delivery.firstName} {order.delivery.lastName}</p>
                <p>{order.delivery.address1}</p>
                {order.delivery.address2 && <p>{order.delivery.address2}</p>}
                <p>{order.delivery.city}, {order.delivery.postcode}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-1">Payment</p>
              <p className="text-text-secondary">{order.paymentMethod}</p>
              <p className="font-semibold text-text-primary mt-2 mb-1">Estimated delivery</p>
              <p className="text-text-secondary">{order.estimatedDelivery}</p>
            </div>
          </div>

          <div className="border-t border-border mt-4 pt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Subtotal</span>
              <span>£{order.subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Delivery</span>
              <span>{order.deliveryCost === 0 ? "FREE" : `£${order.deliveryCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
              <span>Total</span>
              <span>£{order.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type AccountTab = "overview" | "orders" | "details" | "addresses";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const { orders } = useOrders();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignedIn(true);
  };

  if (isSignedIn) {
    return (
      <div className="container-main py-8">
        <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
          <span>&gt;</span>
          <span className="text-text-primary">My Account</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">My Account</h1>
            <p className="text-sm text-text-secondary">Welcome back, John</p>
          </div>
          <button onClick={() => setIsSignedIn(false)} className="text-sm text-primary hover:underline">Sign out</button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {([
            { id: "overview" as const, label: "Overview" },
            { id: "orders" as const, label: "My Orders" },
            { id: "details" as const, label: "My Details" },
            { id: "addresses" as const, label: "Addresses" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AccountCard title="My orders" description="Track, return or buy items again" onClick={() => setActiveTab("orders")}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>} />
            <AccountCard title="My details" description="Manage your personal information" onClick={() => setActiveTab("details")}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" /></svg>} />
            <AccountCard title="Saved items" description="View your saved products" href="/saved"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>} />
            <AccountCard title="Address book" description="Manage your delivery addresses" onClick={() => setActiveTab("addresses")}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>} />
            <AccountCard title="Payment methods" description="Manage saved cards"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>} />
            <AccountCard title="Currys Perks" description="View rewards and offers"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>} />
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">My Orders</h2>
            {orders.length > 0 ? (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="card p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1.5" className="mx-auto mb-4">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p className="text-sm text-text-primary font-semibold mb-2">No orders yet</p>
                <p className="text-xs text-text-secondary mb-4">When you place an order, it will appear here.</p>
                <Link href="/tv-and-audio" className="btn-primary no-underline inline-block">Start shopping</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-text-primary mb-4">My Details</h2>
            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">First name</label>
                  <input type="text" defaultValue="John" className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Last name</label>
                  <input type="text" defaultValue="Smith" className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Email address</label>
                <input type="email" defaultValue="john.smith@email.com" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Phone number</label>
                <input type="tel" defaultValue="07193190923" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Date of birth</label>
                <input type="text" defaultValue="15/06/1990" className="input-field text-sm" />
              </div>
              <button className="btn-primary text-sm">Save changes</button>
            </div>

            <h3 className="text-base font-bold text-text-primary mt-8 mb-4">Change password</h3>
            <div className="card p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Current password</label>
                <input type="password" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">New password</label>
                <input type="password" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Confirm new password</label>
                <input type="password" className="input-field text-sm" />
              </div>
              <button className="btn-primary text-sm">Update password</button>
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-text-primary mb-4">Address Book</h2>
            <div className="card p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">Default</span>
                  <p className="text-sm font-bold text-text-primary">Home</p>
                </div>
                <button className="text-xs text-primary hover:underline">Edit</button>
              </div>
              <div className="text-sm text-text-secondary space-y-0.5">
                <p>Mr John Smith</p>
                <p>Flat 8, Brehon House</p>
                <p>17-19 Pratt Street</p>
                <p>London, NW1 0AE</p>
                <p>07193190923</p>
              </div>
            </div>
            <button className="btn-outline text-sm w-full">+ Add new address</button>
          </div>
        )}
      </div>
    );
  }

  // --- Sign in / Create account form ---
  return (
    <div className="container-main py-8">
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
        <span>&gt;</span>
        <span className="text-text-primary">Sign in</span>
      </nav>

      <div className="max-w-md mx-auto">
        {!showCreate ? (
          <>
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">Sign in to your account</h1>
            <p className="text-sm text-text-secondary text-center mb-8">Access your orders, saved items and account details</p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text-primary mb-1 block">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-sm font-bold text-text-primary mb-1 block">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="input-field text-sm" />
                <Link href="#" className="text-xs text-primary no-underline hover:underline mt-1 inline-block">Forgotten your password?</Link>
              </div>
              <button type="submit" className="btn-primary w-full text-sm">Sign in</button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <hr className="flex-1 border-border" />
              <span className="text-sm text-text-secondary">OR</span>
              <hr className="flex-1 border-border" />
            </div>

            <button onClick={() => setShowCreate(true)} className="btn-outline w-full text-sm">Create an account</button>

            <div className="mt-6 bg-surface rounded-lg p-4 border border-border">
              <h3 className="text-sm font-bold text-text-primary mb-2">Why create an account?</h3>
              <ul className="space-y-2 text-xs text-text-secondary">
                {["Track your orders and deliveries", "Save items to your wishlist", "Faster checkout with saved details", "Exclusive Currys Perks rewards"].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2.5" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" /></svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">Create an account</h1>
            <p className="text-sm text-text-secondary text-center mb-8">Join us to track orders, save items and earn Perks</p>

            <form onSubmit={(e) => { e.preventDefault(); setIsSignedIn(true); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-text-primary mb-1 block">First name</label><input type="text" placeholder="First name" className="input-field text-sm" required /></div>
                <div><label className="text-sm font-bold text-text-primary mb-1 block">Last name</label><input type="text" placeholder="Last name" className="input-field text-sm" required /></div>
              </div>
              <div><label className="text-sm font-bold text-text-primary mb-1 block">Email address</label><input type="email" placeholder="Enter your email" className="input-field text-sm" required /></div>
              <div><label className="text-sm font-bold text-text-primary mb-1 block">Password</label><input type="password" placeholder="Create a password" className="input-field text-sm" required /><p className="text-xs text-text-secondary mt-1">Must be at least 8 characters</p></div>
              <div className="flex items-start gap-2"><input type="checkbox" className="mt-1 accent-primary" /><span className="text-xs text-text-secondary">I&apos;d like to hear about offers, promotions and new products via email</span></div>
              <button type="submit" className="btn-primary w-full text-sm">Create account</button>
            </form>

            <p className="text-xs text-text-secondary text-center mt-4">Already have an account?{" "}<button onClick={() => setShowCreate(false)} className="text-primary hover:underline">Sign in</button></p>
          </>
        )}
      </div>
    </div>
  );
}

function AccountCard({ title, description, href, onClick, icon }: { title: string; description: string; href?: string; onClick?: () => void; icon: React.ReactNode }) {
  const Wrapper = href ? Link : "button";
  const wrapperProps = href ? { href } : { onClick, type: "button" as const };

  return (
    // @ts-expect-error - dynamic element type
    <Wrapper {...wrapperProps} className="bg-white rounded-lg border border-border p-5 no-underline hover:border-primary hover:shadow-sm transition-all flex items-start gap-4 text-left w-full">
      <div className="text-primary flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-1">{title}</h3>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </Wrapper>
  );
}
