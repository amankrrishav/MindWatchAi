import { useEffect, useState } from "react";

import { fetchUserRisk } from "./api/risk";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";
import { fetchUserTrends } from "./api/trends";

import {
  fetchNextQuestion,
  submitAnswer,
  skipQuestion,
} from "./api/questions";

import RiskOverview from "./components/RiskOverview";
import RiskTimeline from "./components/RiskTimeline";
import AlertFeed from "./components/AlertFeed";
import RiskSnapshotTable from "./components/RiskSnapshotTable";
import ExplanationPanel from "./components/ExplanationPanel";
import RiskContributionBreakdown from "./components/RiskContributionBreakdown";
import RiskTrendBanner from "./components/RiskTrendBanner";
import QuestionCard from "./components/QuestionCard";

function App() {
  const [risk, setRisk] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [question, setQuestion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  // -------------------------------
  // Central refresh
  // -------------------------------
  const loadAll = async () => {
    setLoading(true);

    try {
      const [
        riskData,
        snapshotData,
        alertData,
        trendData,
        nextQuestion,
      ] = await Promise.all([
        fetchUserRisk(),
        fetchRiskSnapshots(),
        fetchUserAlerts(),
        fetchUserTrends(),
        fetchNextQuestion(), // identity via header
      ]);

      setRisk(riskData);
      setSnapshots(snapshotData);
      setAlerts(alertData);
      setTrends(trendData);
      setQuestion(nextQuestion);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // -------------------------------
  // Answer handler
  // -------------------------------
  const handleAnswer = async (answerKey) => {
    if (!question) return;

    try {
      await submitAnswer({
        questionId: question.id,
        answerKey,
      });

      const next = await fetchNextQuestion();
      setQuestion(next);
    } catch (err) {
      console.error("Answer failed:", err);
    }
  };

  // -------------------------------
  // Skip handler
  // -------------------------------
  const handleSkip = async () => {
    if (!question) return;

    try {
      await skipQuestion({
        questionId: question.id,
      });

      const next = await fetchNextQuestion();
      setQuestion(next);
    } catch (err) {
      console.error("Skip failed:", err);
    }
  };

  // -------------------------------
  // Loading state
  // -------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 space-y-6">

      {/* Question flow (guardrail-aware) */}
      {question && (
        <QuestionCard
          data={question}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      )}

      <RiskTrendBanner trends={trends} />

      {risk && <RiskOverview risk={risk} />}

      {risk && <ExplanationPanel reasons={risk.reasons} />}

      {risk && <RiskContributionBreakdown reasons={risk.reasons} />}

      {snapshots.length > 0 && (
        <RiskTimeline snapshots={snapshots} trends={trends} />
      )}

      <AlertFeed alerts={alerts} onRefresh={loadAll} />

      <div className="w-full max-w-3xl mt-6">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="text-sm font-medium text-blue-600 hover:underline mb-2"
        >
          {historyOpen ? "Hide history" : "View risk history"}
        </button>

        {historyOpen && (
          <RiskSnapshotTable snapshots={snapshots} />
        )}
      </div>

    </div>
  );
}

export default App;