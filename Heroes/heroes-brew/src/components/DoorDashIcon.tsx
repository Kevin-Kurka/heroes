interface DoorDashIconProps {
  /** Rendered height in px; width follows the logo's aspect ratio. */
  size?: number;
  className?: string;
}

// Native logo aspect ratio (traced from the official DoorDash "D-arrow" mark).
const ASPECT = 1525 / 855;

/**
 * Official DoorDash brandmark. Filled with `currentColor` so callers control the
 * tint — white on the DoorDash-red buttons, DoorDash-red in the bottom nav.
 */
export default function DoorDashIcon({ size = 18, className }: DoorDashIconProps) {
  return (
    <svg
      width={size * ASPECT}
      height={size}
      viewBox="0 0 1525 855"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(0,855) scale(0.1,-0.1)" fill="currentColor" stroke="none">
        <path d="M300 8543 c-53 -10 -150 -63 -190 -103 -23 -23 -56 -72 -73 -108 -28 -59 -32 -78 -32 -152 0 -161 -55 -97 927 -1078 1079 -1076 1526 -1516 1622 -1595 130 -108 261 -175 443 -225 l98 -27 3995 -5 3995 -5 75 -22 c122 -35 183 -61 274 -116 369 -225 546 -649 446 -1066 -75 -310 -325 -581 -635 -686 -156 -53 46 -49 -2930 -55 l-2750 -5 -67 -33 c-75 -37 -142 -104 -179 -179 -20 -41 -24 -63 -24 -148 0 -158 8 -170 304 -465 1413 -1410 2180 -2168 2251 -2223 111 -89 291 -178 430 -214 l105 -27 1300 -4 c1317 -4 1530 0 1795 34 470 59 960 208 1389 423 838 421 1516 1102 1932 1941 402 812 528 1700 373 2629 -65 393 -204 831 -394 1239 -315 681 -781 1230 -1380 1627 -532 352 -1058 545 -1725 632 -121 16 -518 17 -5740 19 -3085 1 -5621 -1 -5635 -3z" />
      </g>
    </svg>
  );
}
