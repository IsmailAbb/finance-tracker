import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Props<V extends number | string> = {
  value: V;
  years: number[];
  onChange: (year: V) => void;
  /** Optional extra entry rendered at the top of the list (e.g. "Any Year"). */
  anyOption?: { value: V; label: string };
  /** Number of rows visible when the dropdown is open (rest are scrollable). */
  visibleRows?: number;
  className?: string;
};

const ROW_PX = 36;

export default function YearSelect<V extends number | string>({
  value,
  years,
  onChange,
  anyOption,
  visibleRows = 3,
  className = "",
}: Props<V>) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const items: Array<{ value: V; label: string }> = [
    ...(anyOption ? [anyOption] : []),
    ...years.map((y) => ({ value: y as unknown as V, label: String(y) })),
  ];

  // When opening, focus the current value (or first item).
  useEffect(() => {
    if (open) {
      const i = items.findIndex((it) => it.value === value);
      setFocusIdx(i >= 0 ? i : 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside closes.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  // Scroll the focused item into view.
  useEffect(() => {
    if (!open || focusIdx < 0 || !listRef.current) return;
    const child = listRef.current.children[focusIdx] as HTMLElement | undefined;
    child?.scrollIntoView({ block: "nearest" });
  }, [focusIdx, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusIdx((i) => Math.min(items.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setFocusIdx(0);
        break;
      case "End":
        e.preventDefault();
        setFocusIdx(items.length - 1);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const item = items[focusIdx];
        if (item) {
          onChange(item.value);
          setOpen(false);
        }
        break;
      }
    }
  };

  const displayLabel =
    anyOption && value === anyOption.value ? anyOption.label : String(value);

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 right-0 min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: ROW_PX * visibleRows }}
        >
          {items.map((item, i) => {
            const selected = item.value === value;
            const focused = i === focusIdx;
            return (
              <li
                key={String(item.value)}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setFocusIdx(i)}
                onClick={() => { onChange(item.value); setOpen(false); }}
                className={`px-3 text-sm cursor-pointer flex items-center whitespace-nowrap ${
                  selected ? "text-vivid-turquoise font-medium" : "text-gray-700 dark:text-gray-300"
                } ${focused ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                style={{ height: ROW_PX }}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
