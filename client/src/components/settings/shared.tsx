import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200";

export const primaryBtn =
  "px-4 py-2 rounded-lg bg-vivid-turquoise text-white hover:bg-turquoise disabled:opacity-60";

export const secondaryBtn =
  "px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200";
