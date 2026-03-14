"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
}

function AccordionPanel({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  const measure = useCallback(() => {
    if (contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      measure();
    }
  }, [isOpen, measure]);

  // Re-measure when content might change (e.g. window resize)
  useEffect(() => {
    if (!isOpen) return;
    const observer = new ResizeObserver(() => measure());
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    return () => observer.disconnect();
  }, [isOpen, measure]);

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-0 text-left text-sm font-bold text-text-primary hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <span>{item.title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-300 flex-shrink-0 ml-4 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${maxHeight}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pb-4 text-sm text-text-secondary leading-relaxed">
          {item.content}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null);

  return (
    <div className="divide-y divide-border border-t border-b border-border">
      {items.map((item, i) => (
        <AccordionPanel
          key={item.title}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
