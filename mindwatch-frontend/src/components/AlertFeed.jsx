function AlertFeed({ alerts }) {
  if (!alerts.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
        <h2 className="text-xl font-semibold mb-2">Alerts</h2>
        <div className="text-gray-500">No active alerts</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
          >
            <div className="font-semibold text-red-700">
              {alert.risk_level.toUpperCase()} Risk Alert
            </div>

            <div className="text-sm text-gray-700 mt-1">
              Confidence: {(alert.confidence * 100).toFixed(0)}%
            </div>

            <ul className="list-disc list-inside text-sm mt-2 text-gray-800">
              {alert.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>

            <div className="text-xs text-gray-500 mt-2">
              {new Date(alert.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertFeed;