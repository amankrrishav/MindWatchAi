import { useEffect, useState } from "react";
import { fetchUserRisk } from "./api/risk";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";
import { fetchUserTrends } from "./api/trends";
import { fetchNextQuestion, submitAnswer, skipQuestion } from "./api/questions";
import { bootstrapFirstAssessment } from "./api/bootstrap";
import { fetchUnreadNotifications } from "./api/notifications";
import RiskOverview from "./components/RiskOverview";
import RiskTimeline from "./components/RiskTimeline";
import AlertFeed from "./components/AlertFeed";
import RiskSnapshotTable from "./components/RiskSnapshotTable";
import ExplanationPanel from "./components/ExplanationPanel";
import RiskContributionBreakdown from "./components/RiskContributionBreakdown";
import RiskTrendBanner from "./components/RiskTrendBanner";
import QuestionCard from "./components/QuestionCard";
import NotificationBell from "./components/NotificationBell";
import NotificationBanner from "./components/NotificationBanner";

function App() {
  const [risk, setRisk] = useState<{ risk_level: string; confidence: number; reasons: string[] } | null>(null);
  const [snapshots, setSnapshots] = useState<unknown[]>([]);
  const [alerts, setAlerts] = useState<unknown[]>([]);
  const [trends, setTrends] = useState<unknown[]>([]);
  const [question, setQuestion] = useState<{ id: string; title: string; question: string; answers: { key: string; label: string }[]; allow_skip: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; intent_type: string; priority: string; reason: string; source: string; created_at: string }[]>([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [riskData, snapshotData, alertData, trendData, nextQuestion, notificationData] = await Promise.all([
        fetchUserRisk(),
        fetchRiskSnapshots(),
        fetchUserAlerts(),
        fetchUserTrends(),
        fetchNextQuestion(),
        fetchUnreadNotifications(),
      ]);
      setRisk(riskData);
      setNotifications(notificationData);
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

  // Poll notifications every 60s so new alerts show without refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadNotifications().then(setNotifications).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAnswer = async (answerKey: string) => {
    if (!question) return;
    try {
      await submitAnswer({ questionId: question.id, answerKey });
      const next = await fetchNextQuestion();
      setQuestion(next);
    } catch (err) {
      console.error("Answer failed:", err);
    }
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    try {
      await bootstrapFirstAssessment();
      await loadAll();
    } catch (err) {
      console.error("Bootstrap failed:", err);
    } finally {
      setBootstrapping(false);
    }
  };

  const handleSkip = async () => {
    if (!question) return;
    try {
      await skipQuestion({ questionId: question.id });
      const next = await fetchNextQuestion();
      setQuestion(next);
    } catch (err) {
      console.error("Skip failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 space-y-6">
      <NotificationBell notifications={notifications} onRefresh={loadAll} />
      <NotificationBanner notifications={notifications} onRefresh={loadAll} />
      {risk?.risk_level === "unknown" && (
        <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900">Get started</h3>
          <p className="text-sm text-blue-800 mt-1">Complete your first assessment to enable monitoring and check-ins.</p>
          <button onClick={handleBootstrap} disabled={bootstrapping} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
            {bootstrapping ? "Setting up…" : "Complete first assessment"}
          </button>
        </div>
      )}
      {question && <QuestionCard data={question} onAnswer={handleAnswer} onSkip={handleSkip} />}
      <RiskTrendBanner trends={trends as { direction: string; severity: string; reason: string }[]} />
      {risk && <RiskOverview risk={risk} />}
      {risk && <ExplanationPanel reasons={risk.reasons} />}
      {risk && <RiskContributionBreakdown reasons={risk.reasons} />}
      {snapshots.length > 0 && (
        <RiskTimeline
          snapshots={snapshots as { created_at: string; risk_level: string; confidence: number }[]}
          trends={trends as { created_at: string; direction: string; severity: string; reason: string }[]}
        />
      )}
      <AlertFeed alerts={alerts as { id: number; risk_level: string; confidence: number; reasons: string[]; created_at: string }[]} onRefresh={loadAll} />
      <div className="w-full max-w-3xl mt-6">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="text-sm font-medium text-blue-600 hover:underline mb-2"
        >
          {historyOpen ? "Hide history" : "View risk history"}
        </button>
        {historyOpen && <RiskSnapshotTable snapshots={snapshots as { id: number; created_at: string; risk_level: string; confidence: number; engine_version: string }[]} />}
      </div>
    </div>
  );
}

export default App;
