import { useState } from "react";
import { toast } from "sonner";
import { updateMe } from "../../services/auth";
import type { User } from "../../types";
import { Field, Section, inputCls, primaryBtn } from "./shared";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY", "INR", "MXN", "BRL"];

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Vancouver", "America/Sao_Paulo", "America/Mexico_City",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Madrid", "Europe/Rome",
  "Europe/Amsterdam", "Europe/Stockholm", "Europe/Athens", "Europe/Moscow",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Hong_Kong",
  "Australia/Sydney", "Australia/Perth", "Pacific/Auckland",
];

const WEEK_START_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function ProfileSection({
  user, setUser,
}: { user: User; setUser: (u: User) => void }) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState(user.currency);
  const [timezone, setTimezone] = useState(user.timezone);
  const [weekStartsOn, setWeekStartsOn] = useState<number>(user.weekStartsOn);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateMe({
        name: name || null,
        email,
        currency,
        timezone,
        weekStartsOn,
      });
      setUser(updated);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Show the user's detected browser timezone as a discoverable option even if it's
  // not in our common list.
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOptions = Array.from(new Set([detected, timezone, ...COMMON_TIMEZONES])).filter(Boolean);

  return (
    <Section title="Profile">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} />
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Timezone">
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>{tz === detected ? `${tz} (detected)` : tz}</option>
            ))}
          </select>
        </Field>
        <Field label="Week starts on">
          <select
            value={weekStartsOn}
            onChange={(e) => setWeekStartsOn(Number(e.target.value))}
            className={inputCls}
          >
            {WEEK_START_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <button onClick={save} disabled={saving} className={primaryBtn}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Section>
  );
}
