import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};

/** Tiny animated placeholder block; respects dark mode. */
export default function Skeleton({ className = "", style }: Props) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
