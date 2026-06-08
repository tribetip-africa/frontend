export function AnimatedCheckmark() {
  return (
    <div className="success-icon-wrap mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
      <svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden>
        <circle
          className="success-check-circle"
          cx="26"
          cy="26"
          r="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          className="success-check-mark"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.5 27.5 22 35 37.5 18.5"
        />
      </svg>
    </div>
  );
}
