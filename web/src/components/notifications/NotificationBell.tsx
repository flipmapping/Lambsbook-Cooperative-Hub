"use client";

import { useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import type { NotificationPresentationItem } from "./NotificationItem";

const mockNotifications: NotificationPresentationItem[] = [
  {
    id: "notification-1",
    message: "Your dashboard experience is ready.",
    timestampLabel: "Just now",
    read: false,
  },
  {
    id: "notification-2",
    message: "Invitation-related updates will appear here when available.",
    timestampLabel: "Earlier",
    read: true,
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-slate-200 hover:border-slate-600"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17H9.143m9.714 0H21l-1.405-1.405A2.032 2.032 0 0119 14.158V11a7 7 0 10-14 0v3.159c0 .538-.214 1.055-.595 1.436L3 17h2.143m9.714 0a3 3 0 11-6 0m6 0H9.143"
          />
        </svg>
      </button>

      <NotificationPanel items={mockNotifications} open={open} />
    </div>
  );
}
