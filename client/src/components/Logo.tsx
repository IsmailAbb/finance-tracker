type Props = {
  /** Render only the icon mark (no wordmark). */
  iconOnly?: boolean;
  /** Pixel size of the icon mark. */
  size?: number;
  className?: string;
};

/**
 * Brand mark: a stylized growth-arrow inside a rounded square in the brand color.
 * Pairs with the "Finance Tracker" wordmark when iconOnly is false.
 */
export default function Logo({ iconOnly = false, size = 36, className = "" }: Props) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark size={size} />
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className="font-semibold text-lg tracking-tight text-gray-900 dark:text-white">
            Finance<span className="text-vivid-turquoise">.</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-300 font-medium">
            Tracker
          </span>
        </div>
      )}
    </div>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Finance Tracker"
    >
      <rect width="40" height="40" rx="10" fill="#05b27c" />
      {/* upward bars suggesting growth */}
      <rect x="10" y="22" width="5" height="10" rx="1.5" fill="white" opacity="0.75" />
      <rect x="17.5" y="16" width="5" height="16" rx="1.5" fill="white" opacity="0.85" />
      <rect x="25" y="10" width="5" height="22" rx="1.5" fill="white" />
    </svg>
  );
}
