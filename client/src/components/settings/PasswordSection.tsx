import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../services/auth";
import { Field, Section, inputCls, primaryBtn } from "./shared";

export default function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      toast.success("Password updated");
      setCurrent("");
      setNext("");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.issues?.[0]?.message ||
          e?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section title="Password">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Current password">
          <PasswordInput value={current} onChange={setCurrent} show={showCurrent} onToggleShow={() => setShowCurrent((s) => !s)} />
        </Field>
        <Field label="New password (min 8)">
          <PasswordInput value={next} onChange={setNext} show={showNext} onToggleShow={() => setShowNext((s) => !s)} />
        </Field>
      </div>
      <div className="mt-4">
        <button
          onClick={submit}
          disabled={submitting || !current || next.length < 8}
          className={primaryBtn}
        >
          {submitting ? "Updating…" : "Change password"}
        </button>
      </div>
    </Section>
  );
}

function PasswordInput({
  value, onChange, show, onToggleShow,
}: { value: string; onChange: (s: string) => void; show: boolean; onToggleShow: () => void }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} pr-10`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
