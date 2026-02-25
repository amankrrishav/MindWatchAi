import { useEffect, useState } from "react";
import { fetchConsent, updateConsent } from "../api/wellness";
import type { ConsentSettings } from "../api/wellness";

// ── Expandable section ─────────────────────────────────────────────────────
function InfoSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{emoji}</span>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-3 text-sm text-gray-600 space-y-2 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

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

  const toggles: {
    key: keyof Omit<ConsentSettings, "user_id" | "updated_at">;
    label: string;
    description: string;
  }[] = [
    {
      key: "data_collection",
      label: "Data Collection",
      description: "Store your check-ins and behavioral signals so the risk engine can track changes over time.",
    },
    {
      key: "research_use",
      label: "Anonymous Research",
      description: "Contribute de-identified, anonymised data to improve mental health risk models.",
    },
    {
      key: "ai_analysis",
      label: "AI-Assisted Analysis",
      description: "Allow the v3 risk engine to process your check-ins and generate wellness insights.",
    },
    {
      key: "notifications_ok",
      label: "Wellness Notifications",
      description: "Receive in-app alerts when your score changes significantly or risk patterns are detected.",
    },
  ];

  return (
    <div className="space-y-4 max-w-2xl">

      {/* Consent toggles */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
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

      {/* Transparency accordion */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">How MindWatch works</h2>
        <p className="text-sm text-gray-500 mb-4">Tap any section to learn exactly what is collected, where it lives, and how it's used.</p>

        <div className="space-y-2">

          <InfoSection emoji="📦" title="What data is collected">
            <p>Every time you submit a check-in, MindWatch records:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>7 wellness signals</strong> — Mood, Sleep, Energy, Anxiety, Social, Focus, Appetite (each rated 1–5)</li>
              <li><strong>Computed wellness score</strong> — a 0–100 number derived from your signals</li>
              <li><strong>Optional notes</strong> — free text you choose to add</li>
              <li><strong>Timestamp</strong> — when the check-in was submitted</li>
            </ul>
            <p className="mt-2">A lightweight <strong>behavior event</strong> is also created from your Mood rating (mapped to a sentiment value) to feed the behavior pipeline.</p>
            <p className="mt-2">No microphone, camera, location, contacts, or device sensors are ever accessed.</p>
          </InfoSection>

          <InfoSection emoji="🗄️" title="Where data is stored">
            <p>All data is stored in a <strong>SQLite database</strong> running locally on the server you started with <code className="bg-gray-100 px-1 rounded text-xs">uvicorn</code>. In production this would be a PostgreSQL database on a private server.</p>
            <p className="mt-2">Tables that contain your data:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><code className="bg-gray-100 px-1 rounded text-xs">wellness_checkins</code> — your 7 signals + computed score</li>
              <li><code className="bg-gray-100 px-1 rounded text-xs">behavior_events</code> — sentiment derived from mood</li>
              <li><code className="bg-gray-100 px-1 rounded text-xs">risk_snapshots</code> — point-in-time risk assessments</li>
              <li><code className="bg-gray-100 px-1 rounded text-xs">risk_alerts</code> — alerts generated when risk is elevated</li>
              <li><code className="bg-gray-100 px-1 rounded text-xs">user_consent</code> — your privacy preferences</li>
              <li><code className="bg-gray-100 px-1 rounded text-xs">users</code> — your email + bcrypt-hashed password (never stored in plain text)</li>
            </ul>
            <p className="mt-2">Data is <strong>never sent to third-party services</strong> or external APIs.</p>
          </InfoSection>

          <InfoSection emoji="🤖" title="How AI processes your check-ins">
            <p>MindWatch does not use a cloud AI model (like ChatGPT). All processing is <strong>fully deterministic and runs locally</strong> on your machine:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Wellness score</strong>: a weighted blend of your 7 signals. Positive signals (mood, sleep, energy, social, focus, appetite) are averaged and combined with an inverted anxiety score.</li>
              <li><strong>PHQ-9 anchor</strong>: if you've completed a PHQ-9 clinical assessment, its severity sets a floor on your wellness score.</li>
              <li><strong>Behavior modifier</strong>: your mood-derived sentiment events are aggregated and can raise or lower your score by up to 10 points.</li>
            </ul>
            <p className="mt-2">The outputs of AI analysis are: your <strong>wellness score</strong>, <strong>risk level</strong> (low / medium / high), and <strong>signal breakdown</strong> shown in the radar chart.</p>
            <p className="mt-2">No external model ever sees your data. All computation runs in Python on your local server.</p>
          </InfoSection>

          <InfoSection emoji="📊" title="How research use works">
            <p>If you enable <strong>Anonymous Research</strong>, your data may be included in aggregate statistical analysis to improve risk detection accuracy.</p>
            <p className="mt-2">Before any research use:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Your email and account ID are removed (de-identified)</li>
              <li>Only aggregated patterns are studied — not individual check-ins</li>
              <li>Results are used solely to improve the wellness score algorithm</li>
            </ul>
            <p className="mt-2">This feature is currently <strong>inactive in development mode</strong> — no data is exported anywhere until a research pipeline is connected.</p>
          </InfoSection>

          <InfoSection emoji="🔔" title="How notifications work">
            <p>The monitoring worker runs every <strong>5 minutes</strong> in the background. It checks your risk level and creates a notification intent when:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Your risk level stays HIGH for 2 or more consecutive monitoring cycles</li>
              <li>A significant improving or worsening trend is detected over 24 hours</li>
            </ul>
            <p className="mt-2">Notifications appear as a badge on the 🔔 bell icon in the top right. They are stored in <code className="bg-gray-100 px-1 rounded text-xs">notification_intents</code> and dismissed when you click <em>Dismiss</em>.</p>
            <p className="mt-2">No push notifications, emails, or SMS are sent — all alerts are in-app only.</p>
          </InfoSection>

          <InfoSection emoji="🔐" title="Account security">
            <p>Your password is <strong>never stored in plain text</strong>. It is hashed using bcrypt before being saved.</p>
            <p className="mt-2">Your session uses a <strong>JWT token</strong> stored in your browser's localStorage under the key <code className="bg-gray-100 px-1 rounded text-xs">mw_access_token</code>. This token expires and must be refreshed by logging in again.</p>
            <p className="mt-2">To delete all your data: sign out, then delete the <code className="bg-gray-100 px-1 rounded text-xs">mindwatch.db</code> file from the server. This is permanent and cannot be undone.</p>
          </InfoSection>

        </div>
      </div>
    </div>
  );
}
