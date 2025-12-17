import { useState, useEffect } from "react";

function AlertFeed({ alerts }) {
  // Only keep unacknowledged alerts from backend
  const [alertStates, setAlertStates] = useState([]);

  useEffect(() => {
    const activeAlerts = alerts
      .filter((a) => !a.acknowledged)
      .map((a) => ({ ...a, status: "new" }));

    setAlertStates(activeAlerts);
  }, [alerts]);

  if (!alertStates.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
        <h2 className="text-xl font-semibold mb-2">Alerts</h2>
        <div className="text-gray-500">No active alerts</div>
      </div>
    );
  }

  const updateStatus = (id, status) => {
    setAlertStates((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>

      <div className="space-y-4">
        {alertStates.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 rounded ${
              alert.status === "resolved"
                ? "bg-gray-100 border-gray-400"
                : "bg-red-50 border-red-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-red-700">
                  {alert.risk_level.toUpperCase()} Risk Alert
                </div>

                <div className="text-sm text-gray-700 mt-1">
                  Confidence: {alert.confidence}%
                </div>

                <ul className="list-disc list-inside text-sm mt-2 text-gray-800">
                  {alert.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>

                <div className="text-xs text-gray-500 mt-2">
                  {new Date(alert.created_at).toLocaleString()}
                </div>

                <div className="text-xs mt-2 font-medium">
                  Status:{" "}
                  <span className="uppercase">
                    {alert.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {alert.status === "new" && (
                  <button
                    onClick={() =>
                      updateStatus(alert.id, "acknowledged")
                    }
                    className="text-xs px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== "resolved" && (
                  <button
                    onClick={() =>
                      updateStatus(alert.id, "resolved")
                    }
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertFeed;