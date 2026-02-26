interface Snapshot {
  id: number;
  created_at: string;
  risk_level: string;
  confidence: number;
  engine_version: string;
}

export default function RiskSnapshotTable({ snapshots }: { snapshots: Snapshot[] }) {
  if (!snapshots.length) {
    return (
      <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
        <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Risk History</h2>
        <div className="text-gray-500 text-sm">No snapshots available</div>
      </div>
    );
  }
  return (
    <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
      <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Risk History</h2>
      <div className="overflow-x-auto rounded-lg border border-pro-border">
        <table className="min-w-full text-sm">
          <thead className="bg-pro-bg border-b border-pro-border text-gray-400">
            <tr>
              <th className="px-4 py-3 font-semibold text-left">Date</th>
              <th className="px-4 py-3 font-semibold text-center">Risk</th>
              <th className="px-4 py-3 font-semibold text-center">Confidence</th>
              <th className="px-4 py-3 font-semibold text-center">Engine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pro-border">
            {snapshots.map((s) => (
              <tr key={s.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-gray-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {new Date(s.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${s.risk_level === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : s.risk_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {s.risk_level.charAt(0).toUpperCase() + s.risk_level.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-400">{(s.confidence * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">{s.engine_version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
