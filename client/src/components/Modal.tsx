import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
};

export default function Modal({ open, onClose, title, children, widthClass = "max-w-md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full ${widthClass} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-gray-700 dark:text-gray-200">{children}</div>
      </div>
    </div>
  );
}
