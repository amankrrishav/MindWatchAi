import { useEffect, useState } from "react";

import { fetchUserRisk } from "./api/risk";
import { fetchRiskSnapshots } from "./api/riskSnapshots";
import { fetchUserAlerts } from "./api/alerts";

import RiskOverview from "./components/RiskOverview";
import RiskTimeline from "./components/RiskTimeline";
import AlertFeed from "./components/AlertFeed";

function App() {
  const [risk, setRisk] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchUserRisk("test_user_001"),
      fetchRiskSnapshots("test_user_001"),
      fetchUserAlerts("test_user_001"),
    ])
      .then(([riskData, snapshotData, alertData]) => {
        setRisk(riskData);
        setSnapshots(snapshotData);
        setAlerts(alertData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      {risk && <RiskOverview risk={risk} />}
      {snapshots.length > 0 && (
        <RiskTimeline snapshots={snapshots} />
      )}
      <AlertFeed alerts={alerts} />
    </div>
  );
}

export default App;