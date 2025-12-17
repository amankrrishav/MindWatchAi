function RiskSnapshotTable({ snapshots }) {
  if (!snapshots.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
        <h2 className="text-xl font-semibold mb-2">Risk History</h2>
        <div className="text-gray-500">No snapshots available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Risk History</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Risk</th>
              <th className="px-4 py-2 border">Confidence</th>
              <th className="px-4 py-2 border">Engine</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((s) => (
              <tr key={s.id} className="text-center">
                <td className="px-4 py-2 border">
                  {new Date(s.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 border font-semibold">
                  {s.risk_level.toUpperCase()}
                </td>
                <td className="px-4 py-2 border">
                  {(s.confidence * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2 border">
                  {s.engine_version}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RiskSnapshotTable;