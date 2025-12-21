export default function QuestionCard({ data, onAnswer, onSkip }) {
  if (!data) return null;

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-4">
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-700 mb-1">
        {data.title}
      </h3>

      {/* Question */}
      <p className="text-base text-gray-900 mb-4">
        {data.question}
      </p>

      {/* Answers */}
      <div className="flex flex-col gap-2">
        {data.answers.map((a) => (
          <button
            key={a.key}
            onClick={() => onAnswer(a.key)}
            className="
              px-4 py-2
              border border-gray-300
              rounded-md
              bg-white
              text-gray-800
              text-sm
              hover:bg-gray-50
              focus:outline-none
            "
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Skip */}
      {data.allow_skip && (
        <button
          onClick={onSkip}
          className="mt-3 text-sm text-gray-500 hover:underline"
        >
          Skip
        </button>
      )}
    </div>
  );
}