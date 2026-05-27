interface ArrowUpRightIconProps {
  /** Pixel size for both width and height. Defaults to 24. */
  size?: number;
  className?: string;
}

/**
 * Inline SVG arrow used by the homepage CTAs (ABOUT AWARDS / ABOUT KUDOS) and
 * by AwardCard's "Chi tiết" link. The path is filled with `currentColor` so
 * the arrow always inherits its parent's text color — yellow buttons show a
 * dark arrow, dark buttons show a light arrow, no separate SVG variants
 * required.
 */
export function ArrowUpRightIcon({ size = 24, className }: ArrowUpRightIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}
