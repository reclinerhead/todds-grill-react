// src/lib/formatDate.ts
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

export function formatSmartDate(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    // Calculate how many days ago this is
    const daysAgo = differenceInDays(new Date(), dateObj);

    if (daysAgo > 90) {
      // Older than 90 days → show full date
      return format(dateObj, "MMM d, yyyy 'at' h:mm a");
      // Examples: "Feb 28, 2026 at 12:00 PM"
    } else {
      // Recent (≤ 90 days) → show relative time
      return formatDistanceToNow(dateObj, {
        addSuffix: true, // adds "ago"
        includeSeconds: false, // keeps it clean ("just now" instead of seconds)
      });
      // Examples: "just now", "2 days ago", "3 weeks ago"
    }
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Unknown";
  }
}

// Optional: Keep the old full-date function if you need it elsewhere
export function formatFullDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}
