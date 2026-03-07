"use client";

import { useState, useEffect, useRef } from "react";

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTime(getTimeUntilMidnight());
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setTime(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className="bg-primary text-white text-xs py-2 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!barRef.current?.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div className="container-main text-center flex items-center justify-center gap-2 flex-wrap">
        <span className="font-semibold">
          First-time buyers get £50 off! Use code
        </span>
        <span className="inline-block bg-white text-red-600 font-bold text-xs px-3 py-0.5 rounded-full">
          1STTV50
        </span>
        <span
          className="font-semibold"
          aria-live="polite"
          aria-atomic="true"
          role="timer"
        >
          Ends in{" "}
          {time ? (
            <span key={time.seconds} className="inline-block animate-[timer-flash_0.4s_ease-out]">
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>
          ) : "--:--:--"}
        </span>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition-opacity"
          aria-label="Close announcement"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
