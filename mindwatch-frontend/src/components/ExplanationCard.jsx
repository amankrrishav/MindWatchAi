import { useState } from "react";

const toneStyles = {
  urgent: "border-red-500 bg-red-50 text-red-800",
  cautionary: "border-yellow-500 bg-yellow-50 text-yellow-800",
  reassuring: "border-green-500 bg-green-50 text-green-800",
  neutral: "border-gray-400 bg-gray-50 text-gray-800",
};

function ExplanationCard({ explanation }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border-l-4 p-6 rounded-lg shadow-md w-full max-w-3xl ${
        toneStyles[explanation.tone]
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold uppercase">
            {explanation.risk_level} Risk — {explanation.tone}
          </div>

          <p className="mt-2 text-sm">
            {explanation.summary}
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-xs font-medium underline"
        >
          {open ? "Hide details" : "View details"}
        </button>
      </div>

      {open && (
        <ul className="mt-4 list-disc list-inside text-sm space-y-1">
          {explanation.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExplanationCard;