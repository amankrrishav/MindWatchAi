import { useState } from "react";
import { submitCheckIn } from "../api/wellness";

interface Signal {
  key: "mood" | "sleep_quality" | "energy" | "anxiety" | "social" | "focus" | "appetite";
  label: string;
  lowLabel: string;
  highLabel: string;
  inverted?: boolean;
  emoji: string[];
}

const SIGNALS: Signal[] = [
  { key: "mood", label: "Mood", lowLabel: "Poor", highLabel: "Excellent", emoji: ["😞", "😕", "😐", "🙂", "😄"] },
  { key: "sleep_quality", label: "Sleep", lowLabel: "Poor", highLabel: "Excellent", emoji: ["😫", "😴", "🛌", "😴", "🌟"] },
  { key: "energy", label: "Energy", lowLabel: "Low", highLabel: "High", emoji: ["🪫", "😓", "⚡", "💪", "🚀"] },
  { key: "anxiety", label: "Anxiety", lowLabel: "Low", highLabel: "High", inverted: true, emoji: ["😌", "😶", "😟", "😰", "🫨"] },
  { key: "social", label: "Connection", lowLabel: "Isolated", highLabel: "Connected", emoji: ["🔇", "👋", "🤝", "👥", "🫂"] },
  { key: "focus", label: "Focus", lowLabel: "Scattered", highLabel: "Sharp", emoji: ["🌫️", "😵‍💫", "🙃", "🧐", "🎯"] },
  { key: "appetite", label: "Appetite", lowLabel: "Poor", highLabel: "Normal", emoji: ["❌", "😑", "🍽️", "😋", "🌮"] },
];

interface Props {
  onComplete?: () => void;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export default function WellnessCheckInForm({ onComplete, onSubmitted, onCancel }: Props) {
  const [values, setValues] = useState<Record<string, number>>({
    mood: 3, sleep_quality: 3, energy: 3, anxiety: 2, social: 3, focus: 3, appetite: 3,
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitCheckIn({
        mood: values.mood, sleep_quality: values.sleep_quality, energy: values.energy,
        anxiety: values.anxiety, social: values.social, focus: values.focus, appetite: values.appetite,
        notes: notes || undefined,
      });
      setSubmitted(true);
      setTimeout(() => { onComplete?.(); onSubmitted?.(); }, 800);
    } catch (err) {
      console.error("Check-in failed:", err);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-2xl bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-emerald-400 font-semibold text-lg mb-1">Check-in Complete</p>
        <p className="text-gray-400 text-sm">Processing telemetry data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-pro-panel border border-pro-border rounded-xl shadow-panel p-6 sm:p-8 font-sans">
      <div className="mb-8 border-b border-pro-border pb-5">
        <h2 className="font-semibold text-white tracking-tight text-xl flex items-center gap-2">
          New Check-in
        </h2>
        <p className="text-sm text-gray-500 mt-2">How are you feeling right now?</p>
      </div>

      <div className="space-y-6">
        {SIGNALS.map((signal) => {
          const val = values[signal.key];
          const colorClass = signal.inverted
            ? (val <= 2 ? "text-emerald-400" : val === 3 ? "text-yellow-400" : "text-red-400")
            : (val >= 4 ? "text-emerald-400" : val === 3 ? "text-yellow-400" : "text-red-400");
          const bgActive = signal.inverted
            ? (val <= 2 ? "bg-emerald-500/10 border-emerald-500/30" : val === 3 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30")
            : (val >= 4 ? "bg-emerald-500/10 border-emerald-500/30" : val === 3 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30");

          return (
            <div key={signal.key} className={`border rounded-lg p-4 transition-colors ${bgActive || "border-pro-border bg-pro-bg"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-200">
                  {signal.label}
                </span>
                <span className={`text-sm font-medium ${colorClass} bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1 shadow-sm`}>
                  {val}/5 {signal.emoji[val - 1]}
                </span>
              </div>
              <input
                type="range" min={1} max={5} value={val}
                onChange={(e) => setValues((v) => ({ ...v, [signal.key]: Number(e.target.value) }))}
                className="w-full h-1.5 appearance-none cursor-pointer bg-gray-800 rounded-full my-3 outline-none"
              />
              <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider mt-2">
                <span className={val === 1 ? colorClass : ""}>{signal.lowLabel}</span>
                <span className={val === 5 ? colorClass : ""}>{signal.highLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <label className="text-sm font-semibold text-gray-300 block mb-2">
          Notes <span className="text-gray-500 font-normal text-xs ml-1">(Optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything else you want to track..."
          className="w-full bg-pro-bg text-gray-200 border border-pro-border rounded-lg p-3 text-sm placeholder-gray-600 resize-none outline-none focus:border-pro-accent focus:ring-1 focus:ring-pro-accent transition-all"
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-3 bg-pro-accent hover:bg-pro-accentHover text-white rounded-lg font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-pro-accent focus:ring-offset-2 focus:ring-offset-pro-bg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Submitting...
            </>
          ) : "Submit Check-in"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-pro-border text-gray-300 hover:bg-pro-bg hover:text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-pro-bg"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
