import { useState } from "react";
import { translateReasons } from "../utils/reasonTranslator";

export default function ExplanationPanel({ reasons }: { reasons: string[] }) {
  const [open, setOpen] = useState(true);
  if (!reasons?.length) return null;
  const translated = translateReasons(reasons);
  return (
    <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
      <button onClick={() => setOpen(!open)} className="text-sm font-medium text-pro-accent hover:text-pro-accentHover transition-colors mb-4 flex items-center gap-1.5 cursor-pointer">
        <span>{open ? "Hide reasoning" : "Show reasoning"}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="bg-pro-bg rounded-lg p-5 border border-pro-border/50">
          <ul className="space-y-2.5">
            {translated.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-pro-accent mt-0.5">•</span>
                <span className="leading-snug">{r}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-pro-border/50 flex items-center gap-2 text-xs text-gray-500 font-medium">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            These factors were detected based on recent responses and changes.
          </div>
        </div>
      )}
    </div>
  );
}
