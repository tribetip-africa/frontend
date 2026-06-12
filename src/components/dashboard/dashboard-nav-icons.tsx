const iconClass = "h-[18px] w-[18px] shrink-0";

export function DashboardNavIcon({ id }: { id: string }) {
  switch (id) {
    case "overview":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 20h6v-5H4v5zm10-11h6V4h-6v5z"
          />
        </svg>
      );
    case "tips":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"
          />
        </svg>
      );
    case "public-page":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
          />
        </svg>
      );
    case "payouts":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
          />
        </svg>
      );
    case "accounts":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
  }
}
