import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check } from "lucide-react";
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from "../../hooks/useResources";
import type { Category, CategoryType } from "../../types";
import Modal from "../Modal";
import { useConfirm } from "../ConfirmDialog";
import { paletteFor, FALLBACK_COLOR } from "../../constants/colors";
import { Field, Section, inputCls, primaryBtn, secondaryBtn } from "./shared";

export default function CategoriesSection() {
  const { data: categories = [] } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  const onDelete = async (c: Category) => {
    const ok = await confirm({
      title: "Delete category?",
      message: <>Delete <span className="font-medium">{c.name}</span>? Transactions in this category will be kept but uncategorized.</>,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await del.mutateAsync(c.id);
      toast.success("Category deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  const list = (items: Category[]) => (
    <div className="space-y-1">
      {items.length === 0 && <div className="text-sm text-gray-400 dark:text-gray-500 italic">None yet</div>}
      {items.map((c) => (
        <div key={c.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-gray-200">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full border border-black/10"
              style={{ backgroundColor: c.color ?? FALLBACK_COLOR }}
            />
            <span>{c.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(c); setOpen(true); }} className="text-gray-500 hover:text-vivid-turquoise" aria-label="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(c)} className="text-gray-500 hover:text-loss-red" aria-label="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Section title="Categories">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Income</h4>
          {list(income)}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expense</h4>
          {list(expense)}
        </div>
      </div>
      <button onClick={() => { setEditing(null); setOpen(true); }} className={`${primaryBtn} mt-4 inline-flex items-center gap-1`}>
        <Plus className="w-4 h-4" /> Add category
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "Add category"}>
        <CategoryForm
          initial={editing}
          allCategories={categories}
          onSubmit={async (data) => {
            if (editing) {
              await update.mutateAsync({ id: editing.id, data });
              toast.success("Category updated");
            } else {
              await create.mutateAsync(data);
              toast.success("Category created");
            }
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </Section>
  );
}

function CategoryForm({
  initial, allCategories, onSubmit, onCancel,
}: {
  initial: Category | null;
  allCategories: Category[];
  onSubmit: (data: { name: string; type: CategoryType; color: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<CategoryType>(initial?.type ?? "expense");
  const [color, setColor] = useState<string | null>(initial?.color ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const palette = paletteFor(type);
  const usedColors = useMemo(
    () =>
      new Set(
        allCategories
          .filter((c) => c.type === type && c.id !== initial?.id && c.color)
          .map((c) => c.color as string)
      ),
    [allCategories, type, initial?.id]
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return setErr("Name required");
        setSubmitting(true);
        setErr(null);
        try {
          await onSubmit({ name: name.trim(), type, color });
        } catch (e: any) {
          setErr(e?.response?.data?.message || "Failed");
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
      noValidate
    >
      <Field label="Name">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Type">
        <select
          value={type}
          onChange={(e) => { setType(e.target.value as CategoryType); setColor(null); }}
          className={inputCls}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </Field>
      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setColor(null)}
            className={`w-7 h-7 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500 ${
              color === null ? "ring-2 ring-vivid-turquoise" : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            title="No color"
          >
            ✕
          </button>
          {palette.map((c) => {
            const taken = usedColors.has(c) && color !== c;
            const selected = color === c;
            return (
              <button
                key={c}
                type="button"
                disabled={taken}
                onClick={() => !taken && setColor(c)}
                className={`w-7 h-7 rounded-full border border-black/10 flex items-center justify-center transition ${
                  selected ? "ring-2 ring-offset-1 ring-vivid-turquoise" : ""
                } ${taken ? "opacity-30 cursor-not-allowed" : "hover:scale-110"}`}
                style={{ backgroundColor: c }}
                title={taken ? `${c} (in use)` : c}
              >
                {selected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
      </Field>
      {err && <p className="text-loss-red text-sm">{err}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={secondaryBtn}>Cancel</button>
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
