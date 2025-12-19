import { useEffect, useState } from "react";

import { fetchUserRisk } from "./api/risk";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";
import { fetchUserTrends } from "./api/trends";

import RiskOverview from "./components/RiskOverview";
import RiskTimeline from "./components/RiskTimeline";
import AlertFeed from "./components/AlertFeed";
import RiskSnapshotTable from "./components/RiskSnapshotTable";
import ExplanationPanel from "./components/ExplanationPanel";
import RiskContributionBreakdown from "./components/RiskContributionBreakdown";
import RiskTrendBanner from "./components/RiskTrendBanner";

function App() {
  const userId = "test_user_001";

  const [risk, setRisk] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Central refresh function (used by alerts + future actions)
  const loadAll = async () => {
    setLoading(true);

    try {
      const [
        riskData,
        snapshotData,
        alertData,
        trendData,
      ] = await Promise.all([
        fetchUserRisk(userId),
        fetchRiskSnapshots(userId),
        fetchUserAlerts(userId),
        fetchUserTrends(userId),
      ]);

      setRisk(riskData);
      setSnapshots(snapshotData);
      setAlerts(alertData);
      setTrends(trendData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 space-y-6">

      {/* Phase 12A — Risk Trend Awareness Banner */}
      <RiskTrendBanner trends={trends} />

      {/* Risk summary */}
      {risk && <RiskOverview risk={risk} />}

      {/* Clinician explanation (Phase 10) */}
      {risk && <ExplanationPanel reasons={risk.reasons} />}

      {/* Contribution breakdown */}
      {risk && <RiskContributionBreakdown reasons={risk.reasons} />}

      {/* Risk timeline updated to include trend overlays */}
      {snapshots.length > 0 && (
        <RiskTimeline snapshots={snapshots} trends={trends} />
      )}

      {/* Alerts (Phase 8 + 9) */}
      <AlertFeed alerts={alerts} onRefresh={loadAll} />

      {/* Snapshot history */}
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