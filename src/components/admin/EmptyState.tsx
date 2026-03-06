import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-4 text-text-secondary">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary text-sm no-underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
