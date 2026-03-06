const statusColors: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
  processing: { bg: "bg-yellow-100", text: "text-yellow-800" },
  dispatched: { bg: "bg-purple-100", text: "text-purple-800" },
  delivered: { bg: "bg-green-100", text: "text-green-800" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  return (
    <span className={`${colors.bg} ${colors.text} text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}>
      {status}
    </span>
  );
}
