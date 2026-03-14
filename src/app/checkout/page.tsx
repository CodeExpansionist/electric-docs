"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSidebar from "@/components/checkout/CheckoutSidebar";
import WelcomeStep from "@/components/checkout/WelcomeStep";
import DeliveryStep from "@/components/checkout/DeliveryStep";
import CustomerStep from "@/components/checkout/CustomerStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import SignInModal from "@/components/checkout/SignInModal";
import { useBasket } from "@/lib/basket-context";
import { useOrders } from "@/lib/orders-context";
import { getNextDeliveryDate, formatDeliveryDate } from "@/lib/delivery-date";

export interface DeliveryData {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  postcode: string;
  address1: string;
  address2: string;
  city: string;
  county: string;
  company: string;
  method: "deliver";
}

export interface CustomerData {
  email: string;
  useSameAddress: boolean;
  marketingEmail: boolean;
  marketingSms: boolean;
  billingFirstName: string;
  billingLastName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingPostcode: string;
  billingPhone: string;
}

type CheckoutStep = "welcome" | "delivery" | "customer" | "payment" | "confirmation";

const emptyDelivery: DeliveryData = {
  title: "",
  firstName: "",
  lastName: "",
  phone: "",
  postcode: "",
  address1: "",
  address2: "",
  city: "",
  county: "",
  company: "",
  method: "deliver",
};

const emptyCustomer: CustomerData = {
  email: "",
  useSameAddress: true,
  marketingEmail: true,
  marketingSms: true,
  billingFirstName: "",
  billingLastName: "",
  billingAddress1: "",
  billingAddress2: "",
  billingCity: "",
  billingPostcode: "",
  billingPhone: "",
};

function StepIndicator({
  number,
  label,
  status,
  onEdit,
}: {
  number: number;
  label: string;
  status: "pending" | "active" | "completed";
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {status === "completed" ? (
        <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      ) : (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
            status === "active"
              ? "bg-primary text-white"
              : "bg-text-secondary text-white"
          }`}
        >
          {number}
        </div>
      )}
      <span
        className={`text-lg font-bold ${
          status === "pending" ? "text-text-muted" : "text-text-primary"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function CompletedDeliverySummary({ data, itemSummary, deliveryCost, onEdit }: { data: DeliveryData; itemSummary?: string; deliveryCost?: number; onEdit?: () => void }) {
  const dateStr = formatDeliveryDate(getNextDeliveryDate());
  const costStr = deliveryCost === 0 ? "FREE" : `£${(deliveryCost ?? 0).toFixed(2)}`;
  return (
    <div className="card p-5 mt-2 mb-6">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-text-primary">
          Arriving {dateStr}, All day 7am-8pm – {costStr}
        </p>
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-primary underline flex-shrink-0 ml-4">
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-text-secondary mb-3">
        {itemSummary || "Your order"}
      </p>
      <p className="text-sm font-semibold text-text-primary mb-1">Delivering to</p>
      <div className="text-xs text-text-secondary space-y-0.5">
        <p>
          {data.title} {data.firstName} {data.lastName}
        </p>
        {data.company && <p>{data.company}</p>}
        <p>
          {data.address1}
          {data.address2 ? `, ${data.address2}` : ""}
        </p>
        <p>
          {data.city}
          {data.county ? `, ${data.county}` : ""}, {data.postcode}
        </p>
        <p>{data.phone}</p>
      </div>
    </div>
  );
}

function CompletedCustomerSummary({
  delivery,
  customer,
  onEdit,
}: {
  delivery: DeliveryData;
  customer: CustomerData;
  onEdit?: () => void;
}) {
  return (
    <div className="card p-5 mt-2 mb-6">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-semibold text-text-primary">Email</p>
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-primary underline flex-shrink-0 ml-4">
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-text-secondary mb-3">{customer.email}</p>
      <p className="text-sm font-semibold text-text-primary mb-1">Billing details</p>
      <div className="text-xs text-text-secondary space-y-0.5">
        {customer.useSameAddress ? (
          <>
            <p>{delivery.title} {delivery.firstName} {delivery.lastName}</p>
            <p>{delivery.address1}{delivery.address2 ? `, ${delivery.address2}` : ""}</p>
            <p>{delivery.city}, {delivery.postcode}</p>
            <p>{delivery.phone}</p>
          </>
        ) : (
          <>
            <p>{customer.billingFirstName} {customer.billingLastName}</p>
            <p>{customer.billingAddress1}{customer.billingAddress2 ? `, ${customer.billingAddress2}` : ""}</p>
            <p>{customer.billingCity}, {customer.billingPostcode}</p>
            <p>{customer.billingPhone}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { basket, clearBasket } = useBasket();
  const { addOrder } = useOrders();
  const [step, setStep] = useState<CheckoutStep>("welcome");
  const [showSignIn, setShowSignIn] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryData>(emptyDelivery);
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = () => setShowSignIn(true);
  const handleGuest = () => setStep("delivery");
  const handleDeliverySubmit = (data: DeliveryData) => {
    setDelivery(data);
    setStep("customer");
  };
  const handleCustomerSubmit = (data: CustomerData) => {
    setCustomer(data);
    setStep("payment");
  };
  const handlePaymentSubmit = (cardData: { cardType: string; lastFour: string; cardNumber: string; cardholderName: string; expiry: string; cvv: string }) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const orderNum = `ELZ-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;


      const estDate = getNextDeliveryDate();

      addOrder({
        id: Date.now().toString(),
        orderNumber: orderNum,
        date: new Date().toISOString(),
        status: "confirmed",
        items: basket.items.map((item) => ({
          id: item.product.id,
          title: item.product.title,
          image: item.product.images.main,
          price: item.product.price.current,
          quantity: item.quantity,
        })),
        subtotal: basket.subtotal,
        deliveryCost: basket.deliveryCost,
        total: basket.total,
        delivery: {
          title: delivery.title,
          firstName: delivery.firstName,
          lastName: delivery.lastName,
          phone: delivery.phone,
          postcode: delivery.postcode,
          address1: delivery.address1,
          address2: delivery.address2,
          city: delivery.city,
          county: delivery.county,
        },
        customer: { email: customer.email },
        billing: customer.useSameAddress
          ? { firstName: delivery.firstName, lastName: delivery.lastName, address1: delivery.address1, address2: delivery.address2, city: delivery.city, postcode: delivery.postcode, phone: delivery.phone }
          : { firstName: customer.billingFirstName, lastName: customer.billingLastName, address1: customer.billingAddress1, address2: customer.billingAddress2, city: customer.billingCity, postcode: customer.billingPostcode, phone: customer.billingPhone },
        paymentMethod: `${cardData.cardType} ending ${cardData.lastFour}`,
        paymentDetails: {
          cardType: cardData.cardType,
          cardNumber: cardData.cardNumber,
          cardholderName: cardData.cardholderName,
          expiry: cardData.expiry,
          cvv: cardData.cvv,
        },
        ...(basket.promoCode && { promoCode: basket.promoCode, promoDiscount: basket.promoDiscount }),
        estimatedDelivery: estDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });

      clearBasket();
      setIsSubmitting(false);
      router.push(`/checkout/confirmation?order=${orderNum}`);
    }, 7000);
  };

  return (
    <div className="container-main py-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left: Steps */}
        <div className="flex-1 min-w-0">
          {/* Welcome */}
          {step === "welcome" && (
            <WelcomeStep onSignIn={handleSignIn} onGuest={handleGuest} />
          )}

          {step !== "welcome" && (
            <div className="space-y-6">
              {/* Step 1: Delivery */}
              <div>
                <StepIndicator
                  number={1}
                  label="Delivery options"
                  status={
                    step === "delivery"
                      ? "active"
                      : step === "customer" || step === "payment"
                      ? "completed"
                      : "pending"
                  }
                  onEdit={
                    step !== "delivery" ? () => setStep("delivery") : undefined
                  }
                />
                {(step === "customer" || step === "payment") && (
                  <CompletedDeliverySummary
                    data={delivery}
                    itemSummary={basket.items.map((item) => item.product.title).join(", ")}
                    deliveryCost={basket.deliveryCost}
                    onEdit={() => setStep("delivery")}
                  />
                )}
                {step === "delivery" && (
                  <DeliveryStep
                    initialData={delivery}
                    onSubmit={handleDeliverySubmit}
                  />
                )}
              </div>

              {/* Step 2: Customer */}
              <div>
                <StepIndicator
                  number={2}
                  label="Customer details"
                  status={
                    step === "customer"
                      ? "active"
                      : step === "payment"
                      ? "completed"
                      : "pending"
                  }
                  onEdit={
                    step === "payment" ? () => setStep("customer") : undefined
                  }
                />
                {step === "payment" && (
                  <CompletedCustomerSummary
                    delivery={delivery}
                    customer={customer}
                    onEdit={() => setStep("customer")}
                  />
                )}
                {step === "customer" && (
                  <CustomerStep
                    initialData={customer}
                    deliveryData={delivery}
                    onSubmit={handleCustomerSubmit}
                  />
                )}
              </div>

              {/* Step 3: Payment */}
              <div>
                <StepIndicator
                  number={3}
                  label="Payment methods"
                  status={step === "payment" ? "active" : "pending"}
                />
                {step === "payment" && (
                  <PaymentStep
                    onSubmit={handlePaymentSubmit}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar — offset only when step headings are visible */}
        <div className={`w-full lg:w-[300px] flex-shrink-0 ${step !== "welcome" ? "lg:pt-10" : ""}`}>
          <CheckoutSidebar />
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onContinue={(email) => {
            setShowSignIn(false);
            setCustomer((c) => ({ ...c, email }));
            setStep("delivery");
          }}
          onGuest={() => {
            setShowSignIn(false);
            setStep("delivery");
          }}
        />
      )}
    </div>
  );
}
