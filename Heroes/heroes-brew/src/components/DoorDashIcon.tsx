interface DoorDashIconProps {
  size?: number;
  className?: string;
}

/**
 * DoorDash-style forward "swoosh" mark — twin chevrons evoking fast delivery.
 * Uses `currentColor` so callers control the tint (DoorDash red or white on red).
 */
export default function DoorDashIcon({ size = 18, className }: DoorDashIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
