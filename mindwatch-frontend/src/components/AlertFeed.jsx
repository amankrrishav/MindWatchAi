import { useState } from "react";
import {
  acknowledgeAlert,
  resolveAlert,
} from "../api/alerts";

function AlertFeed({ alerts, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!alerts.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
        <h2 className="text-xl font-semibold mb-2">Alerts</h2>
        <div className="text-gray-500">No active alerts</div>
      </div>
    );
  }

  const toggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAcknowledge = async (id) => {
    await acknowledgeAlert(id);
    onRefresh();
  };

  const handleResolve = async (id) => {
    await resolveAlert(id);
    onRefresh();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isOpen = expandedId === alert.id;

          return (
            <div
              key={alert.id}
              className="border rounded cursor-pointer"
              onClick={() => toggle(alert.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-l-4 border-red-500">
                <div className="font-semibold text-red-700">
                  {alert.risk_level.toUpperCase()} Risk Alert
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(alert.created_at).toLocaleString()}
                </div>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-800 space-y-2">
                  <div>
                    Confidence: {(alert.confidence * 100).toFixed(0)}%
                  </div>

                  <ul className="list-disc list-inside">
                    {alert.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                      className="text-xs px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Acknowledge
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(alert.id);
                      }}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertFeed;