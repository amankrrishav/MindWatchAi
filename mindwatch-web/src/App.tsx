import { useEffect, useState } from "react";
import { fetchUserRisk } from "./api/risk";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";
import { fetchUserTrends } from "./api/trends";
import { fetchNextQuestion, submitAnswer, skipQuestion } from "./api/questions";
import { fetchUnreadNotifications } from "./api/notifications";
import { fetchWellnessScore, fetchCheckInHistory } from "./api/wellness";
import type { WellnessScore, CheckInRecord } from "./api/wellness";

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
import AuthGate from "./components/AuthGate";
import WellnessCheckInForm from "./components/WellnessCheckInForm";
import WellnessMeter from "./components/WellnessMeter";
import WellnessTrend from "./components/WellnessTrend";
import PrivacyTab from "./components/PrivacyTab";

type Tab = "wellness" | "monitoring" | "privacy";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("wellness");

  const [wellnessScore, setWellnessScore] = useState<WellnessScore | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [showCheckInForm, setShowCheckInForm] = useState(false);

  const [risk, setRisk] = useState<{ risk_level: string; confidence: number; reasons: string[] } | null>(null);
  const [snapshots, setSnapshots] = useState<unknown[]>([]);
  const [alerts, setAlerts] = useState<unknown[]>([]);
  const [trends, setTrends] = useState<unknown[]>([]);
  const [question, setQuestion] = useState<{ id: string; title: string; question: string; answers: { key: string; label: string }[]; allow_skip: boolean } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; intent_type: string; priority: string; reason: string; source: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWellness = async () => {
    const [score, history] = await Promise.all([
      fetchWellnessScore(),
      fetchCheckInHistory(),
    ]);
    setWellnessScore(score);
    setCheckInHistory(history);
  };

  const loadMonitoring = async () => {
    const [riskData, snapshotData, alertData, trendData, nextQuestion] = await Promise.all([
      fetchUserRisk(),
      fetchRiskSnapshots(),
      fetchUserAlerts(),
      fetchUserTrends(),
      fetchNextQuestion(),
    ]);
    setRisk(riskData);
    setSnapshots(snapshotData);
    setAlerts(alertData);
    setTrends(trendData);
    setQuestion(nextQuestion);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [notificationData] = await Promise.all([
        fetchUnreadNotifications(),
        loadWellness(),
        loadMonitoring(),
      ]);
      setNotifications(notificationData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

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

  const handleCheckInSubmitted = async () => {
    setShowCheckInForm(false);
    await loadWellness();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "wellness", label: "Wellness", emoji: "🌱" },
    { id: "monitoring", label: "Monitoring", emoji: "📊" },
    { id: "privacy", label: "Privacy", emoji: "🔒" },
  ];

  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="font-semibold text-gray-900">MindWatch</span>
            </div>
            <NotificationBell notifications={notifications} onRefresh={loadAll} />
          </div>
          <div className="max-w-3xl mx-auto px-4 flex gap-1 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-1.5">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <NotificationBanner notifications={notifications} onRefresh={loadAll} />

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {activeTab === "wellness" && (
            <>
              {wellnessScore && wellnessScore.wellness_score !== null ? (
                <WellnessMeter data={wellnessScore} />
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Track your wellbeing</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Complete your first check-in to see your wellness score, signal radar, and trends.
                  </p>
                  <button
                    onClick={() => setShowCheckInForm(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Start check-in
                  </button>
                </div>
              )}

              {wellnessScore && wellnessScore.wellness_score !== null && !showCheckInForm && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCheckInForm(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    + New check-in
                  </button>
                </div>
              )}

              {showCheckInForm && (
                <WellnessCheckInForm
                  onSubmitted={handleCheckInSubmitted}
                  onCancel={() => setShowCheckInForm(false)}
                />
              )}

              {checkInHistory.length > 1 && (
                <WellnessTrend history={checkInHistory} />
              )}
            </>
          )}

          {activeTab === "monitoring" && (
            <>
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
              <div className="w-full">
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="text-sm font-medium text-indigo-600 hover:underline mb-2"
                >
                  {historyOpen ? "Hide history" : "View risk history"}
                </button>
                {historyOpen && <RiskSnapshotTable snapshots={snapshots as { id: number; created_at: string; risk_level: string; confidence: number; engine_version: string }[]} />}
              </div>
            </>
          )}

          {activeTab === "privacy" && <PrivacyTab />}

        </main>
      </div>
    </AuthGate>
  );
}

export default App;
