import { useEffect, useState } from "react";
import { fetchConsent, updateConsent } from "../api/wellness";
import type { ConsentSettings } from "../api/wellness";

export default function PrivacyTab() {
  const [consent, setConsent] = useState<ConsentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConsent().then(setConsent).catch(console.error);
  }, []);

  const toggle = (key: keyof Omit<ConsentSettings, "user_id" | "updated_at">) => {
    if (!consent) return;
    setConsent({ ...consent, [key]: !consent[key] });
    setSaved(false);
  };

  const save = async () => {
    if (!consent) return;
    setSaving(true);
    try {
      const updated = await updateConsent({
        data_collection: consent.data_collection,
        research_use: consent.research_use,
        ai_analysis: consent.ai_analysis,
        notifications_ok: consent.notifications_ok,
      });
      setConsent(updated);
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!consent) {
    return <div className="text-sm text-gray-400 p-4">Loading privacy settings…</div>;
  }

  const toggles: { key: keyof Omit<ConsentSettings, "user_id" | "updated_at">; label: string; description: string }[] = [
    {
      key: "data_collection",
      label: "Data Collection",
      description: "Allow MindWatch to store your check-ins and behavioral signals for analysis.",
    },
    {
      key: "research_use",
      label: "Anonymous Research",
      description: "Contribute anonymised, de-identified data to mental health research.",
    },
    {
      key: "ai_analysis",
      label: "AI-Assisted Analysis",
      description: "Allow AI models to process your check-ins to improve risk assessments.",
    },
    {
      key: "notifications_ok",
      label: "Wellness Notifications",
      description: "Receive reminders for check-ins and alerts when your score changes significantly.",
    },
  ];

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800">Privacy & Consent</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Control how your data is used. Changes apply immediately on save.
        </p>
      </div>

      <div className="space-y-4">
        {toggles.map(({ key, label, description }) => (
          <div key={key} className="flex items-start gap-4">
            <button
              onClick={() => toggle(key)}
              className={`mt-0.5 w-11 h-6 flex-shrink-0 rounded-full transition-colors ${
                consent[key] ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  consent[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        You can withdraw consent at any time. Withdrawing does not delete previously collected data unless you request account deletion.
      </p>
    </div>
  );
}
