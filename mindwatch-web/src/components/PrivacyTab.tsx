import { useEffect, useState } from "react";
import { fetchConsent, updateConsent } from "../api/wellness";
import type { ConsentSettings } from "../api/wellness";

// ── Common Box ────────────────────────────────────────────────────────────
function TerminalBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-pro-panel border border-pro-border rounded-xl shadow-panel p-6 overflow-hidden relative font-sans">
      <div className="flex items-center justify-between border-b border-pro-border pb-4 mb-5">
        <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-lg">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ── Expandable section ─────────────────────────────────────────────────────
function InfoSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-pro-border bg-pro-bg rounded-lg mb-3 font-sans overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-pro-panel transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg opacity-80 bg-gray-800/50 p-1.5 rounded-md border border-gray-700/50">{emoji}</span>
          <span className="text-sm font-semibold text-gray-200">{title}</span>
        </div>
        <span className="text-gray-500">
          <svg className={`w-5 h-5 transition-transform ${open ? "rotate-180 text-pro-accent" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-5 py-4 text-sm text-gray-400 space-y-3 bg-pro-panel/30 border-t border-pro-border leading-relaxed">
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
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-pro-accent border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const toggles: {
    key: keyof Omit<ConsentSettings, "user_id" | "updated_at">;
    label: string;
    description: string;
  }[] = [
      {
        key: "data_collection",
        label: "Telemetry Logging",
        description: "Store local vectors for chronological drift analysis.",
      },
      {
        key: "research_use",
        label: "Global Analytics",
        description: "Transmit scrubbed data to central network for ML training.",
      },
      {
        key: "ai_analysis",
        label: "v3 Engine Processing",
        description: "Allow local daemon to run diagnostic inference on check-ins.",
      },
      {
        key: "notifications_ok",
        label: "Comms Link",
        description: "Enable system alerts upon detection of target deviations.",
      },
    ];

  return (
    <div className="space-y-6 max-w-2xl font-sans mx-auto pt-4">

      {/* Consent toggles */}
      <TerminalBox title="Privacy & Data Settings">
        <div className="mb-6 pb-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            Manage your data collection preferences and system features. Changes apply immediately upon saving.
          </p>
        </div>

        <div className="space-y-4">
          {toggles.map(({ key, label, description }) => (
            <div key={key} className="flex items-center gap-5 bg-pro-bg border border-pro-border rounded-lg p-4 transition-colors hover:border-gray-700">
              {/* Toggle Switch */}
              <button
                onClick={() => toggle(key)}
                className={`w-11 h-6 flex-shrink-0 rounded-full transition-all relative flex items-center ${consent[key] ? "bg-emerald-500" : "bg-gray-700"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-pro-bg`}
                role="switch"
                aria-checked={consent[key]}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm transform ${consent[key] ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200">{label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4 border-t border-pro-border pt-6">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 bg-pro-accent hover:bg-pro-accentHover text-white rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </>
            ) : "Save Preferences"}
          </button>
          {saved && <span className="text-sm text-emerald-500 font-medium flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Settings Saved</span>}
        </div>
      </TerminalBox>

      {/* Transparency accordion */}
      <TerminalBox title="System Documentation">
        <p className="text-sm text-gray-500 mb-6 pl-3 border-l-2 border-pro-accent/50">
          Learn how MindWatch works under the hood. Select a topic below to read more.
        </p>

        <div className="space-y-1">
          <InfoSection emoji="🗄️" title="Data Collection Pipeline">
            <h4 className="font-semibold text-gray-200 mb-2">Ingestion Layer</h4>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Core metrics: Mood, Sleep, Energy, Anxiety, Social, Focus, Appetite</li>
              <li>Calculated 0-100 wellness score</li>
              <li>Free-form journal entries and notes</li>
              <li>Secure timestamping</li>
            </ul>
            <p>Secondary behavioral signals are extracted securely through local processing.</p>
          </InfoSection>

          <InfoSection emoji="💾" title="Storage Architecture">
            <h4 className="font-semibold text-gray-200 mb-2">Persistence Layer</h4>
            <p className="mb-3">Data resides securely in our managed relational database infrastructure. Core schemas:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><code className="bg-pro-bg px-1.5 py-0.5 rounded text-gray-300">wellness_checkins</code> - Raw telemetry</li>
              <li><code className="bg-pro-bg px-1.5 py-0.5 rounded text-gray-300">behavior_events</code> - Aggregated analytics</li>
              <li><code className="bg-pro-bg px-1.5 py-0.5 rounded text-gray-300">risk_snapshots</code> - Assessment history</li>
              <li><code className="bg-pro-bg px-1.5 py-0.5 rounded text-gray-300">risk_alerts</code> - Notification cache</li>
            </ul>
            <p className="text-gray-400">By default, we do not share this raw data with any third parties.</p>
          </InfoSection>

          <InfoSection emoji="⚙️" title="Risk Engine (v3)">
            <h4 className="font-semibold text-gray-200 mb-2">Processing Node</h4>
            <p className="mb-2">Our proprietary engine operates deterministically. Logic pipeline:</p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>Aggregate positive signals (mean)</li>
              <li>Invert negative signals (e.g., anxiety)</li>
              <li>Apply clinical floor overrides</li>
              <li>Apply historical modifiers</li>
            </ol>
            <p>Outputs a reliable risk assessment score and level without AI hallucination.</p>
          </InfoSection>

          <InfoSection emoji="🔔" title="Notifications">
            <h4 className="font-semibold text-gray-200 mb-2">Background Worker</h4>
            <p className="mb-2">A background process evaluates telemetry on a schedule. It generates alerts when:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Risk elevates to High for consecutive periods</li>
              <li>Significant trajectory shifts are detected</li>
              <li>Milestone achievements are registered</li>
            </ul>
            <p>These notify your dashboard. Push notifications are optional.</p>
          </InfoSection>

          <InfoSection emoji="🔐" title="Security & Compliance">
            <h4 className="font-semibold text-gray-200 mb-2">Authentication</h4>
            <p className="mb-2">Credentials are securely hashed via bcrypt. Sessions are maintained via secure JWT tokens.</p>
            <p className="text-red-400 mt-4 pt-3 border-t border-pro-border">To delete your account and purge all data, contact support. This action is irreversible.</p>
          </InfoSection>

        </div>
      </TerminalBox>
    </div>
  );
}
