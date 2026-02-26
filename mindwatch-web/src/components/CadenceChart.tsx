import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid, Cell } from "recharts";
import type { CheckInRecord } from "../api/wellness";

interface Props {
    history: CheckInRecord[];
}

interface CustomTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-pro-panel/90 backdrop-blur-md border border-pro-border p-3 rounded-xl shadow-panel">
                <p className="text-gray-200 font-semibold mb-1">{data.fullDate}</p>
                <p className="text-sm text-gray-400">
                    Check-ins: <span className="text-white font-medium">{data.runCount}</span>
                </p>
                {data.runCount > 0 && (
                    <p className="text-sm text-gray-400">
                        Avg Score: <span className="text-white font-medium">{Math.round(data.avgScore)}/100</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export default function CadenceChart({ history }: Props) {
    const data = useMemo(() => {
        // Generate an array for the last 7 days including today
        const days: Array<{ date: Date, name: string, fullDate: string, runCount: number, avgScore: number, totalScore: number }> = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push({
                date: d,
                name: d.toLocaleDateString(undefined, { weekday: "short" }),
                fullDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                runCount: 0,
                avgScore: 0,
                totalScore: 0,
            });
        }

        // Populate data with history check-ins
        history.forEach((record) => {
            const recordDate = new Date(record.created_at);
            recordDate.setHours(0, 0, 0, 0);

            const dayData = days.find((d) => d.date.getTime() === recordDate.getTime());
            if (dayData) {
                dayData.runCount += 1;
                dayData.totalScore += record.wellness_score;
            }
        });

        // Calculate average score for coloring
        days.forEach((day) => {
            if (day.runCount > 0) {
                day.avgScore = day.totalScore / day.runCount;
            }
        });

        return days;
    }, [history]);

    // Color logic based on average score
    const getColor = (score: number) => {
        if (score === 0) return "#1f2937"; // No data (gray-800)
        if (score >= 80) return "#10b981"; // Emerald
        if (score >= 60) return "#34d399"; // Light Green
        if (score >= 40) return "#fbbf24"; // Yellow
        if (score >= 20) return "#f97316"; // Orange
        return "#ef4444"; // Red
    };

    return (
        <div className="bg-pro-panel border border-pro-border rounded-xl shadow-panel p-6 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-pro-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-pro-border pb-4 mb-5">
                <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-lg">
                    Weekly Check-in Cadence
                </h3>
                <span className="text-sm font-medium text-gray-500 bg-gray-900/50 px-2.5 py-1 rounded-md border border-gray-800">
                    Last 7 Days
                </span>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a3441" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937', opacity: 0.4 }} />
                        <Bar dataKey="runCount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.avgScore)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
