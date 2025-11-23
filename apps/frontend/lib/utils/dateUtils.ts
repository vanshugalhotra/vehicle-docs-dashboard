export function formatReadableDate(input?: string | Date | null): string {
  if (!input) return "-";

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(input?: string | Date | null): string {
  if (!input) return "-";
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "-";

  const now = new Date();
  const past = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - past.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;

  return "just now";
}

// Helper function to calculate days difference and generate status text
export const getExpireStatus = (expiryDate: string): string => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  // Reset time part for accurate day calculation
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Expires today";
  } else if (diffDays === 1) {
    return "Expires tomorrow";
  } else if (diffDays > 1) {
    return `Expires in ${diffDays} days`;
  } else if (diffDays === -1) {
    return "Expired yesterday";
  } else {
    return `Expired ${Math.abs(diffDays)} days ago`;
  }
};
