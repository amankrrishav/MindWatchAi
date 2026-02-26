import { useEffect, useState, useRef } from "react";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";
import { fetchUserTrends } from "./api/trends";
import { fetchUnreadNotifications } from "./api/notifications";
import { fetchWellnessScore, fetchCheckInHistory } from "./api/wellness";
import type { WellnessScore, CheckInRecord } from "./api/wellness";
import { useAuth } from "./AuthContext";

import NotificationBell from "./components/NotificationBell";
import NotificationBanner from "./components/NotificationBanner";
import MilestoneToast from "./components/MilestoneToast";
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-pro-border hover:bg-pro-panel transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-pro-panel border border-pro-border flex items-center justify-center overflow-hidden">
          <span className="text-sm font-medium text-pro-accent">
            {initials}
          </span>
        </div>
        <span className="text-sm text-gray-300 hidden sm:block max-w-[140px] truncate">{user.email}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-pro-panel border border-pro-border rounded-xl shadow-panel z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-pro-border bg-pro-bg/50">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Signed in as</p>
            <p className="text-sm font-semibold text-gray-200 truncate">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {joined}</p>
          </div>
          <div className="py-2">
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Account ID</p>
              <p className="text-xs font-mono text-gray-400 bg-pro-bg border border-pro-border rounded-md px-2 py-1 break-all">{user.id}</p>
            </div>
          </div>
          <div className="border-t border-pro-border p-2">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

  const [alerts, setAlerts] = useState<unknown[]>([]);
  const [trends, setTrends] = useState<unknown[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const [, alertData, trendData] = await Promise.all([
      fetchRiskSnapshots(),
      fetchUserAlerts(),
      fetchUserTrends(),
    ]);
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

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadNotifications().then(setNotifications).catch(() => { });
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
      <div className="min-h-screen flex items-center justify-center bg-pro-bg text-gray-500 animate-pulse">
        Initializing workspace...
      </div>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "wellness", label: "Wellness", emoji: "🌱" },
    { id: "insights", label: "Insights", emoji: "📊" },
    { id: "privacy", label: "Privacy", emoji: "🔒" },
  ];

  return (
    <AuthGate>
      <div className="min-h-screen bg-pro-bg font-sans text-gray-200">
        {/* Header */}
        <header className="bg-pro-panel/80 backdrop-blur-md border-b border-pro-border sticky top-0 z-10 transition-all">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pro-accent to-purple-600 flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight text-white">MindWatch</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell notifications={notifications} onRefresh={loadAll} />
              <div className="w-px h-6 bg-pro-border mx-2"></div>
              <AccountMenu />
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-6 flex gap-6 pb-0 mt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                  ? "border-pro-accent text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
                  }`}
              >
                <span className={activeTab === tab.id ? "opacity-100" : "opacity-60"}>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <NotificationBanner notifications={notifications} onRefresh={loadAll} />

        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

          {/* ── Wellness tab ── */}
          {activeTab === "wellness" && (
            <div className="max-w-2xl mx-auto">
              {wellnessScore && wellnessScore.wellness_score !== null ? (
                <WellnessMeter data={wellnessScore} />
              ) : (
                <div className="bg-pro-panel border border-pro-border rounded-2xl shadow-panel p-8 text-center">
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 items-center justify-center mb-6 shadow-glow">
                    <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">Welcome to MindWatch</h3>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    Complete your first wellness check-in to calibrate the risk engine and generate your personalized dashboard.
                  </p>
                  <button
                    onClick={() => setShowCheckInForm(true)}
                    className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg font-medium shadow-sm transition-all focus:ring-2 focus:ring-white/20"
                  >
                    Start Check-in
                  </button>
                </div>
              )}

              {wellnessScore && wellnessScore.wellness_score !== null && !showCheckInForm && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowCheckInForm(true)}
                    className="px-5 py-2.5 bg-pro-accent hover:bg-pro-accentHover text-white rounded-lg font-medium shadow-glow transition-all flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Check-in
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
                <div className="mt-8">
                  <WellnessTrend history={checkInHistory} />
                </div>
              )}
            </div>
          )}

          {/* ── Insights tab ── */}
          {activeTab === "insights" && (
            <InsightsTab
              history={checkInHistory}
              wellnessScore={wellnessScore}
              alerts={alerts}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              trends={trends as any[]}
              onRefresh={loadAll}
            />
          )}

          {/* ── Privacy tab ── */}
          {activeTab === "privacy" && <PrivacyTab />}

        </main>

        <MilestoneToast notifications={notifications} onRefresh={loadAll} />
      </div>
    </AuthGate>
  );
}

export default App;
