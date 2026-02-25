import { useEffect, useState, useRef } from "react";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";
import { fetchUserTrends } from "./api/trends";
import { fetchNextQuestion, submitAnswer, skipQuestion } from "./api/questions";
import { fetchUnreadNotifications } from "./api/notifications";
import { fetchWellnessScore, fetchCheckInHistory } from "./api/wellness";
import type { WellnessScore, CheckInRecord } from "./api/wellness";
import { useAuth } from "./AuthContext";

import NotificationBell from "./components/NotificationBell";
import NotificationBanner from "./components/NotificationBanner";
import AuthGate from "./components/AuthGate";
import WellnessCheckInForm from "./components/WellnessCheckInForm";
import WellnessMeter from "./components/WellnessMeter";
import WellnessTrend from "./components/WellnessTrend";
import PrivacyTab from "./components/PrivacyTab";
import InsightsTab from "./components/InsightsTab";

type Tab = "wellness" | "insights" | "privacy";

// ── Account dropdown ──────────────────────────────────────────────────────
function AccountMenu() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    window.localStorage.removeItem("mw_access_token");
    setUser(null);
  };

  if (!user) return null;
  const initials = user.email.slice(0, 2).toUpperCase();
  const joined = new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
        <span className="text-sm text-gray-600 hidden sm:block max-w-[140px] truncate">{user.email}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Signed in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Member since {joined}</p>
          </div>
          <div className="py-1">
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Account ID</p>
              <p className="text-xs font-mono text-gray-600 bg-gray-100 rounded px-2 py-1 break-all">{user.id}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState<Tab>("wellness");

  const [wellnessScore, setWellnessScore] = useState<WellnessScore | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [showCheckInForm, setShowCheckInForm] = useState(false);

  const [snapshots, setSnapshots] = useState<unknown[]>([]);
  const [alerts, setAlerts] = useState<unknown[]>([]);
  const [trends, setTrends] = useState<unknown[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWellness = async () => {
    const [score, history] = await Promise.all([
      fetchWellnessScore(),
      fetchCheckInHistory(),
    ]);
    setWellnessScore(score);
    setCheckInHistory(history);
    return { score, history };
  };

  const loadMonitoring = async () => {
    const [snapshotData, alertData, trendData] = await Promise.all([
      fetchRiskSnapshots(),
      fetchUserAlerts(),
      fetchUserTrends(),
    ]);
    setSnapshots(snapshotData);
    setAlerts(alertData);
    setTrends(trendData);
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
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // After check-in: reload both wellness AND monitoring so insights refresh
  const handleCheckInSubmitted = async () => {
    setShowCheckInForm(false);
    await Promise.all([loadWellness(), loadMonitoring()]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "wellness", label: "Wellness",  emoji: "🌱" },
    { id: "insights", label: "Insights",  emoji: "📊" },
    { id: "privacy",  label: "Privacy",   emoji: "🔒" },
  ];

  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="font-semibold text-gray-900">MindWatch</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell notifications={notifications} onRefresh={loadAll} />
              <AccountMenu />
            </div>
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

          {/* ── Wellness tab ── */}
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

              {checkInHistory.length > 1 && !showCheckInForm && (
                <WellnessTrend history={checkInHistory} />
              )}
            </>
          )}

          {/* ── Insights tab ── */}
          {activeTab === "insights" && (
            <InsightsTab
              history={checkInHistory}
              wellnessScore={wellnessScore}
              alerts={alerts}
              trends={trends as any[]}
              snapshots={snapshots}
              onRefresh={loadAll}
            />
          )}

          {/* ── Privacy tab ── */}
          {activeTab === "privacy" && <PrivacyTab />}

        </main>
      </div>
    </AuthGate>
  );
}

export default App;
