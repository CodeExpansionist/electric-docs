"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrders, type Order } from "@/lib/orders-context";
import { searchOrders, filterByDateRange, ordersToCSV } from "@/lib/admin-utils";
import DataTable, { type Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";

export default function AdminOrdersPage() {
  const { orders } = useOrders();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "all">("all");

  const filtered = useMemo(() => {
    let result = orders;
    result = searchOrders(result, query);
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    result = filterByDateRange(result, dateRange);
    return result;
  }, [orders, query, statusFilter, dateRange]);

  const handleExport = useCallback(() => {
    const csv = ordersToCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      sortable: true,
      render: (o) => <span className="font-semibold text-primary">{o.orderNumber}</span>,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (o) => (
        <span className="text-text-secondary">
          {new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o) => `${o.delivery.firstName} ${o.delivery.lastName}`,
    },
    {
      key: "email",
      label: "Email",
      render: (o) => <span className="text-text-secondary">{o.customer.email}</span>,
    },
    {
      key: "items",
      label: "Items",
      render: (o) => <span className="text-text-secondary">{o.items.length}</span>,
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (o) => <span className="font-bold">£{o.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (o) => <StatusBadge status={o.status} />,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <button
          onClick={handleExport}
          className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-surface transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search orders..."
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-input-border rounded-md px-3 py-2 text-sm bg-white focus:border-primary focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
        </select>
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          {(["all", "30d", "7d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-2 text-xs ${
                dateRange === r ? "bg-primary text-white" : "bg-white hover:bg-surface"
              }`}
            >
              {r === "all" ? "All time" : r === "30d" ? "30 days" : "7 days"}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(o) => o.id}
        onRowClick={(o) => router.push(`/admin/orders/${o.orderNumber}`)}
        emptyMessage="No orders match your filters."
        pageSize={10}
      />
    </div>
  );
}
