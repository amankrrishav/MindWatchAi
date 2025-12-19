import { useState } from "react";
import { translateReasons } from "../utils/reasonTranslator";

function ExplanationPanel({ reasons }) {
  const [open, setOpen] = useState(true);

  if (!reasons || !reasons.length) return null;

  const translated = translateReasons(reasons);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-blue-600 hover:underline mb-2"
      >
        {open ? "Hide reasoning" : "Show reasoning"}
      </button>

      {open && (
        <>
          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
            {translated.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <p className="text-xs text-gray-500 mt-3">
            These factors were detected based on recent responses and changes
            compared to earlier measurements.
          </p>
        </>
      )}
    </div>
  );
}

export default ExplanationPanel;