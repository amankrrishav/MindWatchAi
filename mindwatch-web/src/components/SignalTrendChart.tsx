import type { CheckInRecord } from "../api/wellness";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface Props {
    history: CheckInRecord[];
}

export default function SignalTrendChart({ history }: Props) {
    if (!history || history.length === 0) return null;

    const sorted = [...history].reverse(); // oldest first

    // Map out strictly the 4 requested signals: mood, sleep_quality, anxiety, energy
    const data = sorted.map(c => ({
        date: new Date(c.created_at).toLocaleDateString(undefined, { weekday: 'short' }),
        mood: c.mood,
        sleep: c.sleep_quality,
        anxiety: c.anxiety,
        energy: c.energy,
    }));

    return (
        <div className="w-full bg-pro-panel border border-pro-border shadow-panel p-6 rounded-xl font-sans relative overflow-hidden mt-6 pb-2">
            <div className="flex items-center justify-between mb-8 border-b border-pro-border/50 pb-4">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-3">
                    WEEKLY TREND — MOOD · SLEEP · ANXIETY · ENERGY
                </h2>
            </div>

            <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#8b949e", fontSize: 13 }}
                            dy={15}
                        />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 3, 6, 10]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#8b949e", fontSize: 13 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#161b22",
                                borderColor: "#2a3441",
                                borderRadius: "8px",
                                color: "#e6edf3",
                                fontSize: "13px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                                padding: "10px 14px"
                            }}
                            itemStyle={{ fontWeight: "600", padding: "2px 0" }}
                            labelStyle={{ color: "#8b949e", marginBottom: "4px" }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="plainline"
                            wrapperStyle={{ paddingTop: "20px", fontSize: "14px", color: "#8b949e" }}
                        />

                        {/* The 4 core signals based on user's inspiration image */}
                        <Line
                            type="monotone"
                            dataKey="mood"
                            name="Mood"
                            stroke="#58c4dc"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#58c4dc", stroke: "#161b22", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="sleep"
                            name="Sleep"
                            stroke="#bc8cff"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#bc8cff", stroke: "#161b22", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="energy"
                            name="Energy"
                            stroke="#3fb950"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#3fb950", stroke: "#161b22", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="anxiety"
                            name="Anxiety"
                            stroke="#f85149"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#f85149", stroke: "#161b22", strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
