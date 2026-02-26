import type { QuestionCard as QuestionCardType } from "../api/questions";

interface Props {
  data: QuestionCardType | null;
  onAnswer: (key: string) => void;
  onSkip: () => void;
}

export default function QuestionCard({ data, onAnswer, onSkip }: Props) {
  if (!data) return null;
  return (
    <div className="max-w-md w-full bg-pro-panel border border-pro-border rounded-xl shadow-panel p-5 font-sans">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{data.title}</h3>
      <p className="text-base text-gray-200 font-medium mb-5">{data.question}</p>
      <div className="flex flex-col gap-2.5">
        {data.answers.map((a) => (
          <button
            key={a.key}
            onClick={() => onAnswer(a.key)}
            className="px-4 py-3 border border-pro-border rounded-lg bg-pro-bg text-gray-300 text-sm hover:bg-white/5 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pro-accent transition-all text-left"
          >
            {a.label}
          </button>
        ))}
      </div>
      {data.allow_skip && (
        <button onClick={onSkip} className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Skip for now
        </button>
      )}
    </div>
  );
}
