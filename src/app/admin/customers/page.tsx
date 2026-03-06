"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/lib/orders-context";
import { deriveCustomers, searchCustomers, type AdminCustomer } from "@/lib/admin-utils";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchInput from "@/components/admin/SearchInput";

export default function AdminCustomersPage() {
  const { orders } = useOrders();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const customers = useMemo(() => deriveCustomers(orders), [orders]);
  const filtered = useMemo(() => searchCustomers(customers, query), [customers, query]);

  const columns: Column<AdminCustomer>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (c) => <span className="font-semibold text-text-primary">{c.name}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (c) => <span className="text-text-secondary">{c.email}</span>,
    },
    {
      key: "phone",
      label: "Phone",
      render: (c) => <span className="text-text-secondary">{c.phone}</span>,
    },
    {
      key: "totalOrders",
      label: "Orders",
      sortable: true,
      render: (c) => c.totalOrders,
    },
    {
      key: "totalSpent",
      label: "Total Spent",
      sortable: true,
      render: (c) => <span className="font-bold">£{c.totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: "lastOrderDate",
      label: "Last Order",
      sortable: true,
      render: (c) => (
        <span className="text-text-secondary">
          {new Date(c.lastOrderDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-sm text-text-secondary">{customers.length} customers</p>
        </div>
      </div>

      <div className="mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name or email..."
          className="w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.email}
        onRowClick={(c) => router.push(`/admin/customers/${encodeURIComponent(c.email)}`)}
        emptyMessage="No customers found."
        pageSize={10}
      />
    </div>
  );
}
