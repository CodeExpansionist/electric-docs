"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

// Seed with a demo order so account and admin have data
const demoOrders: Order[] = [
  {
    id: "demo-1",
    orderNumber: "CUR-AB3X9K-7281",
    date: "2026-02-25T14:30:00Z",
    status: "delivered",
    items: [
      {
        id: "10282706",
        title: 'SAMSUNG UB00F 50" Crystal UHD 4K HDR Smart TV 2025',
        image: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
        price: 299,
        quantity: 1,
      },
    ],
    subtotal: 299,
    deliveryCost: 0,
    total: 299,
    delivery: {
      title: "Mr",
      firstName: "John",
      lastName: "Smith",
      phone: "07193190923",
      postcode: "NW1 0AE",
      address1: "Flat 8, Brehon House",
      address2: "17-19 Pratt Street",
      city: "London",
      county: "",
    },
    customer: { email: "john.smith@email.com" },
    paymentMethod: "Visa ending 6411",
    estimatedDelivery: "27 Feb 2026",
  },
  {
    id: "demo-2",
    orderNumber: "CUR-QP7M2D-5934",
    date: "2026-02-20T09:15:00Z",
    status: "dispatched",
    items: [
      {
        id: "10282800",
        title: 'SAMSUNG S90F 65" OLED 4K Vision AI Smart TV 2025',
        image: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
        price: 1399,
        quantity: 1,
      },
      {
        id: "10266466",
        title: "SAMSUNG HW-Q990D 11.1.4 Wireless Sound Bar with Dolby Atmos",
        image: "https://media.currys.biz/i/currysprod/10266466?$l-large$&fmt=auto",
        price: 999,
        quantity: 1,
      },
    ],
    subtotal: 2398,
    deliveryCost: 0,
    total: 2398,
    delivery: {
      title: "Mr",
      firstName: "John",
      lastName: "Smith",
      phone: "07193190923",
      postcode: "NW1 0AE",
      address1: "Flat 8, Brehon House",
      address2: "17-19 Pratt Street",
      city: "London",
      county: "",
    },
    customer: { email: "john.smith@email.com" },
    paymentMethod: "Visa ending 6411",
    estimatedDelivery: "3 Mar 2026",
  },
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("electric-orders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        } else {
          setOrders(demoOrders);
        }
      } catch {
        setOrders(demoOrders);
      }
    } else {
      setOrders(demoOrders);
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("electric-orders", JSON.stringify(orders));
    }
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const getOrder = (orderNumber: string) => {
    return orders.find((o) => o.orderNumber === orderNumber);
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrder }}>
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
