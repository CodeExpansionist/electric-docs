"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export interface OrderItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "confirmed" | "processing" | "dispatched" | "delivered";
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  delivery: {
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    postcode: string;
    address1: string;
    address2: string;
    city: string;
    county: string;
  };
  customer: {
    email: string;
  };
  paymentMethod: string;
  estimatedDelivery: string;
}

interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (orderNumber: string) => Order | undefined;
  updateOrderStatus: (orderNumber: string, status: Order["status"]) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("electric-orders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      } catch {
        // Invalid localStorage data — start with empty orders
      }
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      localStorage.setItem("electric-orders", JSON.stringify(orders));
    }
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const getOrder = (orderNumber: string) => {
    return orders.find((o) => o.orderNumber === orderNumber);
  };

  const updateOrderStatus = (orderNumber: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o))
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
