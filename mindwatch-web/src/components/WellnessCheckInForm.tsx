import { useState } from "react";
import { submitCheckIn } from "../api/wellness";

interface Signal {
  key: "mood" | "sleep_quality" | "energy" | "anxiety" | "social" | "focus" | "appetite";
  label: string;
  lowLabel: string;
  highLabel: string;
  inverted?: boolean; // high = bad (anxiety)
  emoji: string[];
}

const SIGNALS: Signal[] = [
  {
    key: "mood",
    label: "Mood",
    lowLabel: "Very low",
    highLabel: "Excellent",
    emoji: ["😞", "😕", "😐", "🙂", "😄"],
  },
  {
    key: "sleep_quality",
    label: "Sleep",
    lowLabel: "Very poor",
    highLabel: "Excellent",
    emoji: ["😫", "😴", "🛌", "😴", "🌟"],
  },
  {
    key: "energy",
    label: "Energy",
    lowLabel: "Exhausted",
    highLabel: "Full of energy",
    emoji: ["🪫", "😓", "⚡", "💪", "🚀"],
  },
  {
    key: "anxiety",
    label: "Anxiety",
    lowLabel: "Calm",
    highLabel: "Very anxious",
    inverted: true,
    emoji: ["😌", "😶", "😟", "😰", "🫨"],
  },
  {
    key: "social",
    label: "Connection",
    lowLabel: "Isolated",
    highLabel: "Very connected",
    emoji: ["🔇", "👋", "🤝", "👥", "🫂"],
  },
  {
    key: "focus",
    label: "Focus",
    lowLabel: "Very scattered",
    highLabel: "Sharp & clear",
    emoji: ["🌫️", "😵‍💫", "🙃", "🧐", "🎯"],
  },
  {
    key: "appetite",
    label: "Appetite",
    lowLabel: "No appetite",
    highLabel: "Healthy appetite",
    emoji: ["❌", "😑", "🍽️", "😋", "🌮"],
  },
];

interface Props {
  onComplete?: () => void;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export default function WellnessCheckInForm({ onComplete, onSubmitted, onCancel }: Props) {
  const [values, setValues] = useState<Record<string, number>>({
    mood: 3,
    sleep_quality: 3,
    energy: 3,
    anxiety: 2,
    social: 3,
    focus: 3,
    appetite: 3,
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitCheckIn({
        mood: values.mood,
        sleep_quality: values.sleep_quality,
        energy: values.energy,
        anxiety: values.anxiety,
        social: values.social,
        focus: values.focus,
        appetite: values.appetite,
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
      <div className="w-full max-w-2xl bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-800 font-semibold">Check-in recorded!</p>
        <p className="text-green-700 text-sm mt-1">Your wellness score is updating…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Daily Wellness Check-In</h2>
        <p className="text-sm text-gray-500 mt-0.5">Rate how you're feeling across 7 signals — takes about 60 seconds.</p>
      </div>

      <div className="space-y-5">
        {SIGNALS.map((signal) => {
          const val = values[signal.key];
          return (
            <div key={signal.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{signal.label}</span>
                <span className="text-xl">{signal.emoji[val - 1]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={val}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [signal.key]: Number(e.target.value) }))
                }
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>{signal.lowLabel}</span>
                <span>{signal.highLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything on your mind today…"
          className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {submitting ? "Saving…" : "Submit check-in"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
