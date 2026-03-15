"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders, type Order } from "@/lib/orders-context";
import { useBasket } from "@/lib/basket-context";
import { useUser } from "@/lib/user-context";
import { luhnCheck, getCardType, formatCardNumber, formatExpiry } from "@/lib/payment-utils";

interface SavedCard {
  id: string;
  cardType: string;
  lastFour: string;
  cardholderName: string;
  expiry: string;
  isDefault: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  phone: string;
  isDefault: boolean;
}

const fieldClass =
  "w-full rounded-sm border border-input-border px-4 py-3 text-sm text-input-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
  processing: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Processing" },
  dispatched: { bg: "bg-purple-100", text: "text-purple-800", label: "Dispatched" },
  delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useBasket();
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({
                        id: item.id,
                        slug: "",
                        title: item.title,
                        brand: "",
                        category: "",
                        subcategory: "",
                        price: { current: item.price },
                        images: { main: item.image, gallery: [], thumbnail: item.image },
                        rating: { average: 0, count: 0 },
                        specs: {},
                        keySpecs: [],
                        description: "",
                        deliveryInfo: { freeDelivery: true, estimatedDate: "" },
                        badges: [],
                        tags: [],
                        offers: [],
                        inStock: true,
                      });
                    }}
                    className="text-xs text-primary hover:underline mt-0.5"
                  >
                    Buy again
                  </button>
                </div>
                <p className="text-xs font-bold text-text-primary">
                  £{item.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/track-your-order"
            className="inline-flex items-center gap-1.5 text-xs text-primary no-underline hover:underline mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Track this order
          </Link>

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
            {order.promoDiscount && order.promoDiscount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Promo ({order.promoCode || "Promo discount"})</span>
                <span className="text-green-600">-£{order.promoDiscount.toFixed(2)}</span>
              </div>
            )}
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

type AccountTab = "overview" | "orders" | "details" | "addresses" | "payment";

export default function AccountPage() {
  const { user, isSignedIn, signIn, signOut } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const { orders, isHydrated } = useOrders();
  const [toast, setToast] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "", firstName: "", lastName: "", address1: "", address2: "", city: "", postcode: "", phone: "" });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Show create-account form if navigated with #register hash
  useEffect(() => {
    if (window.location.hash === "#register") setShowCreate(true);
  }, []);

  // Load saved cards and addresses from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("electric-saved-cards");
    if (stored) {
      try { setSavedCards(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const storedAddr = localStorage.getItem("electric-saved-addresses");
    if (storedAddr) {
      try { setSavedAddresses(JSON.parse(storedAddr)); } catch { /* ignore */ }
    }
  }, []);

  // Derive user data from context first, then fall back to most recent order
  const latestOrder = orders[0];
  const userName = user?.firstName
    ? { first: user.firstName, last: user.lastName }
    : latestOrder
      ? { first: latestOrder.delivery.firstName, last: latestOrder.delivery.lastName }
      : { first: "", last: "" };
  const userEmail = user?.email || latestOrder?.customer?.email || "";
  const userPhone = latestOrder?.delivery?.phone || "";
  const lastPayment = latestOrder?.paymentMethod || "";

  // Also merge cards from order history
  const allCards = (() => {
    const merged = [...savedCards];
    orders
      .filter((o) => o.paymentDetails)
      .forEach((o) => {
        const d = o.paymentDetails!;
        const lastFour = d.cardNumber.slice(-4);
        if (!merged.find((c) => c.lastFour === lastFour && c.cardType === d.cardType)) {
          merged.push({
            id: `order-${lastFour}-${d.cardType}`,
            cardType: d.cardType,
            lastFour,
            cardholderName: d.cardholderName,
            expiry: d.expiry,
            isDefault: merged.length === 0,
          });
        }
      });
    return merged;
  })();

  const persistCards = (cards: SavedCard[]) => {
    setSavedCards(cards);
    localStorage.setItem("electric-saved-cards", JSON.stringify(cards));
  };

  const clearCardError = (field: string) => {
    if (cardErrors[field]) setCardErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const handleAddCard = () => {
    const errors: Record<string, string> = {};
    const cleanNum = cardNumber.replace(/\D/g, "");

    if (cleanNum.length < 13) {
      errors.cardNumber = "Please enter a valid card number";
    } else if (!luhnCheck(cleanNum)) {
      errors.cardNumber = "Invalid card number";
    }
    if (!cardName.trim()) {
      errors.cardName = "Please enter the name on your card";
    }
    if (cardExpiry.length < 4) {
      errors.cardExpiry = "Please enter a valid expiry date (MM/YY)";
    } else {
      const month = parseInt(cardExpiry.slice(0, 2));
      const year = parseInt(cardExpiry.slice(2));
      if (month < 1 || month > 12) {
        errors.cardExpiry = "Invalid month";
      } else {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear() % 100;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errors.cardExpiry = "Card has expired";
        }
      }
    }
    if (cardCvv.length < 3) {
      errors.cardCvv = "Please enter a valid CVV";
    }

    setCardErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const type = getCardType(cardNumber) || "Card";
    const lastFour = cleanNum.slice(-4);
    const newCard: SavedCard = {
      id: `manual-${Date.now()}`,
      cardType: type,
      lastFour,
      cardholderName: cardName.trim(),
      expiry: cardExpiry.slice(0, 2) + "/" + cardExpiry.slice(2),
      isDefault: savedCards.length === 0 && allCards.length === 0,
    };

    persistCards([...savedCards, newCard]);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setCardErrors({});
    setShowAddCard(false);
    showToast("Card added successfully");
  };

  const removeCard = (id: string) => {
    const updated = savedCards.filter((c) => c.id !== id);
    if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
      updated[0].isDefault = true;
    }
    persistCards(updated);
    showToast("Card removed");
  };

  const setDefaultCard = (id: string) => {
    const updated = savedCards.map((c) => ({ ...c, isDefault: c.id === id }));
    persistCards(updated);
    showToast("Default card updated");
  };

  // --- Address helpers ---
  const persistAddresses = (addrs: SavedAddress[]) => {
    setSavedAddresses(addrs);
    localStorage.setItem("electric-saved-addresses", JSON.stringify(addrs));
  };

  // Merge order-derived address with manually saved addresses
  const allAddresses = (() => {
    const merged = [...savedAddresses];
    if (latestOrder && !merged.some((a) => a.id.startsWith("order-"))) {
      const d = latestOrder.delivery;
      merged.push({
        id: `order-${latestOrder.id}`,
        label: "Home",
        firstName: d.firstName,
        lastName: d.lastName,
        address1: d.address1,
        address2: d.address2,
        city: d.city,
        postcode: d.postcode,
        phone: d.phone,
        isDefault: merged.length === 0,
      });
    }
    return merged;
  })();

  const resetAddrForm = () => {
    setAddrForm({ label: "", firstName: "", lastName: "", address1: "", address2: "", city: "", postcode: "", phone: "" });
    setAddrErrors({});
    setShowAddAddress(false);
    setEditingAddressId(null);
  };

  const handleSaveAddress = () => {
    const errors: Record<string, string> = {};
    if (!addrForm.firstName.trim()) errors.firstName = "Required";
    if (!addrForm.lastName.trim()) errors.lastName = "Required";
    if (!addrForm.address1.trim()) errors.address1 = "Required";
    if (!addrForm.city.trim()) errors.city = "Required";
    if (!addrForm.postcode.trim()) errors.postcode = "Required";
    setAddrErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (editingAddressId) {
      const updated = savedAddresses.map((a) =>
        a.id === editingAddressId ? { ...a, ...addrForm, label: addrForm.label || "Home" } : a
      );
      persistAddresses(updated);
      showToast("Address updated");
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        label: addrForm.label || "Home",
        firstName: addrForm.firstName.trim(),
        lastName: addrForm.lastName.trim(),
        address1: addrForm.address1.trim(),
        address2: addrForm.address2.trim(),
        city: addrForm.city.trim(),
        postcode: addrForm.postcode.trim().toUpperCase(),
        phone: addrForm.phone.trim(),
        isDefault: savedAddresses.length === 0 && allAddresses.length === 0,
      };
      persistAddresses([...savedAddresses, newAddr]);
      showToast("Address added");
    }
    resetAddrForm();
  };

  const removeAddress = (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) updated[0].isDefault = true;
    persistAddresses(updated);
    showToast("Address removed");
  };

  const setDefaultAddress = (id: string) => {
    persistAddresses(savedAddresses.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast("Default address updated");
  };

  const startEditAddress = (addr: SavedAddress) => {
    setAddrForm({ label: addr.label, firstName: addr.firstName, lastName: addr.lastName, address1: addr.address1, address2: addr.address2, city: addr.city, postcode: addr.postcode, phone: addr.phone });
    setEditingAddressId(addr.id);
    setShowAddAddress(true);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email);
  };

  if (isSignedIn) {
    return (
      <div className="bg-surface min-h-[60vh]">
        <div className="container-main py-8">
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
            <span>&gt;</span>
            <span className="text-text-primary">My account</span>
          </nav>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">My account</h1>
              <p className="text-sm text-text-secondary">
                Welcome back{userName.first ? `, ${userName.first}` : ""}
              </p>
            </div>
            <button onClick={signOut} className="text-sm text-primary hover:underline">Sign out</button>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
            {([
              { id: "overview" as const, label: "Overview" },
              { id: "orders" as const, label: "My orders" },
              { id: "details" as const, label: "My details" },
              { id: "addresses" as const, label: "Addresses" },
              { id: "payment" as const, label: "Payment methods" },
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
              <AccountCard
                title="Payment methods"
                description={lastPayment || "Manage saved cards"}
                onClick={() => setActiveTab("payment")}
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>}
              />
              <AccountCard
                title="Electriz Perks"
                description="View rewards and offers"
                onClick={() => showToast("Perks programme coming soon")}
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">My orders</h2>
              {!isHydrated ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-200 rounded" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32" />
                          <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="card p-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1.5" className="mx-auto mb-4">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p className="text-sm text-text-primary font-semibold mb-2">No orders yet</p>
                  <p className="text-xs text-text-secondary mb-4">When you place an order, it will appear here.</p>
                  <Link href="/" className="btn-primary no-underline inline-block">Start shopping</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="max-w-lg">
              <h2 className="text-lg font-bold text-text-primary mb-4">My details</h2>
              <div className="card p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">First name</label>
                    <input type="text" defaultValue={userName.first} placeholder="First name" className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">Last name</label>
                    <input type="text" defaultValue={userName.last} placeholder="Last name" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Email address</label>
                  <input type="email" defaultValue={userEmail} placeholder="Email address" className={fieldClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Phone number</label>
                  <input type="tel" defaultValue={userPhone} placeholder="Phone number" className={fieldClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Date of birth</label>
                  <input type="text" placeholder="DD/MM/YYYY" className={fieldClass} />
                </div>
                <button onClick={() => showToast("Details saved successfully")} className="btn-primary text-sm">Save changes</button>
              </div>

              <h3 className="text-base font-bold text-text-primary mt-8 mb-4">Change password</h3>
              <div className="card p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Current password</label>
                  <input type="password" className={fieldClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">New password</label>
                  <input type="password" className={fieldClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Confirm new password</label>
                  <input type="password" className={fieldClass} />
                </div>
                <button onClick={() => showToast("Password updated successfully")} className="btn-primary text-sm">Update password</button>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="max-w-lg">
              <h2 className="text-lg font-bold text-text-primary mb-4">Address book</h2>

              {allAddresses.length === 0 && !showAddAddress && (
                <div className="card p-8 text-center mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1.5" className="mx-auto mb-4">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <p className="text-sm text-text-primary font-semibold mb-2">No saved addresses</p>
                  <p className="text-xs text-text-secondary mb-4">Add an address or place an order to save your delivery address.</p>
                </div>
              )}

              {allAddresses.length > 0 && !showAddAddress && (
                <div className="space-y-3 mb-4">
                  {allAddresses.map((addr) => {
                    const isManual = addr.id.startsWith("addr-");
                    return (
                      <div key={addr.id} className="card p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {addr.isDefault && <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">Default</span>}
                            <p className="text-sm font-bold text-text-primary">{addr.label}</p>
                          </div>
                        </div>
                        <div className="text-sm text-text-secondary space-y-0.5 mb-3">
                          <p>{addr.firstName} {addr.lastName}</p>
                          <p>{addr.address1}</p>
                          {addr.address2 && <p>{addr.address2}</p>}
                          <p>{addr.city}, {addr.postcode}</p>
                          {addr.phone && <p>{addr.phone}</p>}
                        </div>
                        <div className="flex gap-3">
                          {isManual && (
                            <button onClick={() => startEditAddress(addr)} className="text-xs text-primary hover:underline">Edit</button>
                          )}
                          {!addr.isDefault && isManual && (
                            <button onClick={() => setDefaultAddress(addr.id)} className="text-xs text-primary hover:underline">Set as default</button>
                          )}
                          {isManual && (
                            <button onClick={() => removeAddress(addr.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {showAddAddress ? (
                <div className="card p-5 mb-4">
                  <h3 className="text-sm font-bold text-text-primary mb-4">{editingAddressId ? "Edit address" : "Add new address"}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Address label</label>
                      <input
                        type="text"
                        value={addrForm.label}
                        onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Home, Work"
                        className={fieldClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-primary mb-1 block">First name</label>
                        <input
                          type="text"
                          value={addrForm.firstName}
                          onChange={(e) => { setAddrForm((f) => ({ ...f, firstName: e.target.value })); setAddrErrors((p) => { const n = { ...p }; delete n.firstName; return n; }); }}
                          className={`${fieldClass} ${addrErrors.firstName ? "!border-red-600" : ""}`}
                        />
                        {addrErrors.firstName && <p className="text-xs text-red-600 mt-1">{addrErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-primary mb-1 block">Last name</label>
                        <input
                          type="text"
                          value={addrForm.lastName}
                          onChange={(e) => { setAddrForm((f) => ({ ...f, lastName: e.target.value })); setAddrErrors((p) => { const n = { ...p }; delete n.lastName; return n; }); }}
                          className={`${fieldClass} ${addrErrors.lastName ? "!border-red-600" : ""}`}
                        />
                        {addrErrors.lastName && <p className="text-xs text-red-600 mt-1">{addrErrors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Address line 1</label>
                      <input
                        type="text"
                        value={addrForm.address1}
                        onChange={(e) => { setAddrForm((f) => ({ ...f, address1: e.target.value })); setAddrErrors((p) => { const n = { ...p }; delete n.address1; return n; }); }}
                        className={`${fieldClass} ${addrErrors.address1 ? "!border-red-600" : ""}`}
                      />
                      {addrErrors.address1 && <p className="text-xs text-red-600 mt-1">{addrErrors.address1}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Address line 2 <span className="text-text-muted font-normal">(optional)</span></label>
                      <input
                        type="text"
                        value={addrForm.address2}
                        onChange={(e) => setAddrForm((f) => ({ ...f, address2: e.target.value }))}
                        className={fieldClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-primary mb-1 block">City</label>
                        <input
                          type="text"
                          value={addrForm.city}
                          onChange={(e) => { setAddrForm((f) => ({ ...f, city: e.target.value })); setAddrErrors((p) => { const n = { ...p }; delete n.city; return n; }); }}
                          className={`${fieldClass} ${addrErrors.city ? "!border-red-600" : ""}`}
                        />
                        {addrErrors.city && <p className="text-xs text-red-600 mt-1">{addrErrors.city}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-primary mb-1 block">Postcode</label>
                        <input
                          type="text"
                          value={addrForm.postcode}
                          onChange={(e) => { setAddrForm((f) => ({ ...f, postcode: e.target.value })); setAddrErrors((p) => { const n = { ...p }; delete n.postcode; return n; }); }}
                          className={`${fieldClass} ${addrErrors.postcode ? "!border-red-600" : ""}`}
                        />
                        {addrErrors.postcode && <p className="text-xs text-red-600 mt-1">{addrErrors.postcode}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Phone number <span className="text-text-muted font-normal">(optional)</span></label>
                      <input
                        type="tel"
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                        className={fieldClass}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveAddress} className="btn-primary text-sm flex-1">{editingAddressId ? "Update address" : "Save address"}</button>
                      <button onClick={resetAddrForm} className="btn-outline text-sm flex-1">Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddAddress(true)} className="btn-outline text-sm w-full">+ Add new address</button>
              )}
            </div>
          )}

          {activeTab === "payment" && (
            <div className="max-w-lg">
              <h2 className="text-lg font-bold text-text-primary mb-4">Payment methods</h2>

              {allCards.length === 0 && !showAddCard && (
                <div className="card p-8 text-center mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1.5" className="mx-auto mb-4">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <path d="M1 10h22" />
                  </svg>
                  <p className="text-sm text-text-primary font-semibold mb-2">No saved payment methods</p>
                  <p className="text-xs text-text-secondary mb-4">Add a card or place an order to save your payment method.</p>
                </div>
              )}

              {allCards.length > 0 && (
                <div className="space-y-3 mb-4">
                  {allCards.map((card) => {
                    const isManual = card.id.startsWith("manual-");
                    return (
                      <div key={card.id} className="card p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {card.cardType === "Visa" && <img src="/images/icons/visa-logo.png" alt="Visa" className="h-[24px] w-auto" />}
                            {card.cardType === "Mastercard" && <img src="/images/icons/mastercard-logo.png" alt="Mastercard" className="h-[24px] w-auto" />}
                            {card.cardType === "Amex" && <img src="/images/icons/amex-logo.png" alt="American Express" className="h-[24px] w-auto" />}
                            {!["Visa", "Mastercard", "Amex"].includes(card.cardType) && (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                                <rect x="1" y="4" width="22" height="16" rx="2" />
                                <path d="M1 10h22" />
                              </svg>
                            )}
                            <div>
                              <p className="text-sm font-bold text-text-primary">{card.cardType} ending {card.lastFour}</p>
                              <p className="text-xs text-text-secondary">Expires {card.expiry}</p>
                            </div>
                          </div>
                          {card.isDefault && <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">Default</span>}
                        </div>
                        <p className="text-xs text-text-secondary mb-3">{card.cardholderName}</p>
                        <div className="flex gap-3">
                          {!card.isDefault && isManual && (
                            <button onClick={() => setDefaultCard(card.id)} className="text-xs text-primary hover:underline">Set as default</button>
                          )}
                          {isManual && (
                            <button onClick={() => removeCard(card.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {showAddCard ? (
                <div className="card p-5 mb-4">
                  <h3 className="text-sm font-bold text-text-primary mb-4">Add new card</h3>

                  <div className="flex justify-end gap-2 mb-3">
                    <img src="/images/icons/visa-logo.png" alt="Visa" className="h-[22px] w-auto" />
                    <img src="/images/icons/mastercard-logo.png" alt="Mastercard" className="h-[22px] w-auto" />
                    <img src="/images/icons/amex-logo.png" alt="American Express" className="h-[22px] w-auto" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Card number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formatCardNumber(cardNumber)}
                          onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16)); clearCardError("cardNumber"); }}
                          placeholder="0000 0000 0000 0000"
                          className={`${fieldClass} ${cardErrors.cardNumber ? "!border-red-600" : ""} pr-14`}
                          maxLength={19}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {getCardType(cardNumber) === "Visa" && <img src="/images/icons/visa-logo.png" alt="Visa" className="h-[20px] w-auto" />}
                          {getCardType(cardNumber) === "Mastercard" && <img src="/images/icons/mastercard-logo.png" alt="Mastercard" className="h-[20px] w-auto" />}
                          {getCardType(cardNumber) === "Amex" && <img src="/images/icons/amex-logo.png" alt="Amex" className="h-[20px] w-auto" />}
                          {!getCardType(cardNumber) && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                              <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {cardErrors.cardNumber && <p className="text-xs text-red-600 mt-1">{cardErrors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Name on card</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => { setCardName(e.target.value); clearCardError("cardName"); }}
                        placeholder="J Smith"
                        className={`${fieldClass} ${cardErrors.cardName ? "!border-red-600" : ""}`}
                      />
                      {cardErrors.cardName && <p className="text-xs text-red-600 mt-1">{cardErrors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-primary mb-1 block">Expiry date</label>
                        <input
                          type="text"
                          value={formatExpiry(cardExpiry)}
                          onChange={(e) => { setCardExpiry(e.target.value.replace(/\D/g, "").slice(0, 4)); clearCardError("cardExpiry"); }}
                          placeholder="MM/YY"
                          className={`${fieldClass} ${cardErrors.cardExpiry ? "!border-red-600" : ""}`}
                          maxLength={5}
                        />
                        {cardErrors.cardExpiry && <p className="text-xs text-red-600 mt-1">{cardErrors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-primary mb-1 block">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); clearCardError("cardCvv"); }}
                          placeholder="123"
                          className={`${fieldClass} ${cardErrors.cardCvv ? "!border-red-600" : ""}`}
                          maxLength={4}
                        />
                        {cardErrors.cardCvv && <p className="text-xs text-red-600 mt-1">{cardErrors.cardCvv}</p>}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-surface rounded-md p-3 border border-border">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <p className="text-xs text-text-secondary">Your card details are stored securely on your device only.</p>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleAddCard} className="btn-primary text-sm flex-1">Save card</button>
                      <button
                        onClick={() => { setShowAddCard(false); setCardNumber(""); setCardName(""); setCardExpiry(""); setCardCvv(""); setCardErrors({}); }}
                        className="btn-outline text-sm flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddCard(true)} className="btn-outline text-sm w-full">+ Add new card</button>
              )}
            </div>
          )}
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-700 text-white px-5 py-3 rounded-md shadow-lg text-sm font-medium animate-fade-in">
            {toast}
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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className={fieldClass} />
              </div>
              <div>
                <label className="text-sm font-bold text-text-primary mb-1 block">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className={fieldClass} />
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
                {["Track your orders and deliveries", "Save items to your wishlist", "Faster checkout with saved details", "Exclusive Electriz Perks rewards"].map((b) => (
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

            <form onSubmit={(e) => { e.preventDefault(); signIn(regEmail, regFirst, regLast); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-text-primary mb-1 block">First name</label><input type="text" value={regFirst} onChange={(e) => setRegFirst(e.target.value)} placeholder="First name" className={fieldClass} required /></div>
                <div><label className="text-sm font-bold text-text-primary mb-1 block">Last name</label><input type="text" value={regLast} onChange={(e) => setRegLast(e.target.value)} placeholder="Last name" className={fieldClass} required /></div>
              </div>
              <div><label className="text-sm font-bold text-text-primary mb-1 block">Email address</label><input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Enter your email" className={fieldClass} required /></div>
              <div><label className="text-sm font-bold text-text-primary mb-1 block">Password</label><input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Create a password" className={fieldClass} required /><p className="text-xs text-text-secondary mt-1">Must be at least 8 characters</p></div>
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
