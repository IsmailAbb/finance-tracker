import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount,
} from "../../hooks/useResources";
import type { Account } from "../../types";
import Modal from "../Modal";
import { useConfirm } from "../ConfirmDialog";
import { formatCurrency } from "../../utils/format";
import { Field, Section, inputCls, primaryBtn, secondaryBtn } from "./shared";

export default function AccountsSection({ currency }: { currency: string }) {
  const { data: accounts = [] } = useAccounts();
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const del = useDeleteAccount();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);

  const onDelete = async (a: Account) => {
    const ok = await confirm({
      title: "Delete account?",
      message: <>This will permanently delete <span className="font-medium">{a.name}</span> and all of its transactions.</>,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await del.mutateAsync(a.id);
      toast.success("Account deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <Section title="Accounts">
      <div className="space-y-2">
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No accounts yet.</p>
        ) : (
          accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <div>
                <div className="font-medium dark:text-gray-100">{a.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Initial: {formatCurrency(a.initialBalance, currency)} · Current:{" "}
                  <span className={a.currentBalance < 0 ? "text-loss-red" : "text-green-600"}>
                    {formatCurrency(a.currentBalance, currency)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(a); setOpen(true); }}
                  className="text-gray-500 hover:text-vivid-turquoise"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(a)} className="text-gray-500 hover:text-loss-red" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => { setEditing(null); setOpen(true); }}
        className={`${primaryBtn} mt-4 inline-flex items-center gap-1`}
      >
        <Plus className="w-4 h-4" /> Add account
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit account" : "Add account"}>
        <AccountForm
          initial={editing}
          currency={currency}
          onSubmit={async (data) => {
            try {
              if (editing) {
                await update.mutateAsync({ id: editing.id, data });
                toast.success("Account updated");
              } else {
                await create.mutateAsync(data);
                toast.success("Account created");
              }
              setOpen(false);
            } catch (e: any) {
              throw e; // let form display the error
            }
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </Section>
  );
}

function AccountForm({
  initial, currency, onSubmit, onCancel,
}: {
  initial: Account | null;
  currency: string;
  onSubmit: (data: { name: string; initialBalance: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [initialBalance, setInitialBalance] = useState(String(initial?.initialBalance ?? 0));
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        const bal = Number(initialBalance);
        if (!name.trim()) return setErr("Name required");
        if (!Number.isFinite(bal)) return setErr("Initial balance must be a number");
        setSubmitting(true);
        try {
          await onSubmit({ name: name.trim(), initialBalance: bal });
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
      <Field label={`Initial balance (${currency})`}>
        <input
          type="text"
          inputMode="decimal"
          value={initialBalance}
          onChange={(e) => {
            const v = e.target.value;
            // Allow optional leading minus, optional digits, optional dot, up to 2 decimals.
            if (v === "" || v === "-" || /^-?\d*\.?\d{0,2}$/.test(v)) setInitialBalance(v);
          }}
          className={inputCls}
        />
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
