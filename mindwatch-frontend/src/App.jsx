import { useEffect, useState } from "react";
import { fetchUserRisk } from "./api/risk";
import RiskOverview from "./components/RiskOverview";

function App() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserRisk("test_user_001")
      .then((data) => {
        console.log("Risk API response:", data);
        setRisk(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Risk fetch failed:", err);
        setError("Failed to load risk data");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {loading && <div>Loading risk data...</div>}

      {error && (
        <div className="text-red-600 font-semibold">
          {error}
        </div>
      )}

      {!loading && risk && (
        <RiskOverview risk={risk} />
      )}

      {!loading && !risk && !error && (
        <div>No risk data available</div>
      )}
    </div>
  );
}

export default App;