import Link from "next/link";
import { stripDomain } from "@/lib/constants";

interface SidebarSection {
  title: string;
  links: Array<{ text: string; url: string }>;
}

interface HubSidebarProps {
  sections: SidebarSection[];
}

export default function HubSidebar({ sections }: HubSidebarProps) {
  return (
    <aside className="w-[240px] flex-shrink-0">
      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            {section.title}
          </h3>
          <div className="flex flex-col gap-2">
            {section.links.map((link) => (
              <Link
                key={link.text}
                href={stripDomain(link.url)}
                className="pill-link text-xs"
              >
                <span className="flex-1">{link.text}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="flex-shrink-0"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
