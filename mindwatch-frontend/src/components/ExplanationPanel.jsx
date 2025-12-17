import { explainReason } from "../utils/explanations";

function ExplanationPanel({ reasons }) {
  if (!reasons || !reasons.length) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Why this risk level?
      </h2>

      <ul className="space-y-3">
        {reasons.map((reason, idx) => (
          <li key={idx} className="text-gray-800">
            • {explainReason(reason)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExplanationPanel;