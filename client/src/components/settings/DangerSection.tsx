import { useState } from "react";
import { toast } from "sonner";
import { deleteMe } from "../../services/auth";
import { useConfirm } from "../ConfirmDialog";
import { Section, secondaryBtn } from "./shared";

export default function DangerSection({ signOut }: { signOut: () => void }) {
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    const ok = await confirm({
      title: "Delete account?",
      message: "This will permanently delete your account and all of your data. This cannot be undone.",
      confirmText: "Delete forever",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteMe();
      toast.success("Account deleted");
      signOut();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Section title="Account">
      <div className="flex flex-wrap gap-3">
        <button onClick={signOut} className={secondaryBtn}>Sign out</button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg bg-loss-red text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </Section>
  );
}
