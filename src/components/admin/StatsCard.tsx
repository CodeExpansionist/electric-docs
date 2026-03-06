interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

export default function StatsCard({ label, value, icon, className = "" }: StatsCardProps) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
