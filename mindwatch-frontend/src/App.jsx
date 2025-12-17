import { useEffect, useState } from "react";

import { fetchUserRisk } from "./api/risk";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";

import RiskOverview from "./components/RiskOverview";
import RiskTimeline from "./components/RiskTimeline";
import AlertFeed from "./components/AlertFeed";
import RiskSnapshotTable from "./components/RiskSnapshotTable";
import ExplanationPanel from "./components/ExplanationPanel";
import RiskContributionBreakdown from "./components/RiskContributionBreakdown";

function App() {
  const userId = "test_user_001";

  const [risk, setRisk] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);

    try {
      const [riskData, snapshotData, alertData] =
        await Promise.all([
          fetchUserRisk(userId),
          fetchRiskSnapshots(userId),
          fetchUserAlerts(userId),
        ]);

      setRisk(riskData);
      setSnapshots(snapshotData);
      setAlerts(alertData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 space-y-6">
      {risk && <RiskOverview risk={risk} />}
      {risk && <ExplanationPanel reasons={risk.reasons} />}
      {risk && <RiskContributionBreakdown reasons={risk.reasons} />}

      {snapshots.length > 0 && (
        <RiskTimeline snapshots={snapshots} />
      )}

      <AlertFeed alerts={alerts} onRefresh={loadAll} />

      <RiskSnapshotTable snapshots={snapshots} />
    </div>
  );
}

export default App;