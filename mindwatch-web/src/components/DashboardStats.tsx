import type { CheckInRecord, WellnessScore } from "../api/wellness";

interface Props {
    history: CheckInRecord[];
    score: WellnessScore | null;
}

export default function DashboardStats({ history, score }: Props) {
    // Helper to get day difference (ignoring time)
    const getDayDiff = (d1: Date, d2: Date) => {
        const msPerDay = 1000 * 60 * 60 * 24;
        const ut1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const ut2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
        return Math.floor(Math.abs((ut2 - ut1) / msPerDay));
    };

    // 1. Calculate continuous streak
    let currentStreak = 0;
    if (history && history.length > 0) {
        const sorted = [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        let lastDate = new Date();
        // If the latest check-in is not today or yesterday, streak is 0
        const latestDiff = getDayDiff(lastDate, new Date(sorted[0].created_at));

        if (latestDiff <= 1) {
            currentStreak = 1;
            lastDate = new Date(sorted[0].created_at);

            for (let i = 1; i < sorted.length; i++) {
                const d = new Date(sorted[i].created_at);
                const diff = getDayDiff(lastDate, d);
                if (diff === 1) {
                    currentStreak++;
                    lastDate = d;
                } else if (diff === 0) {
                    // Multiple on same day, ignore
                    continue;
                } else {
                    // Streak broken
                    break;
                }
            }
        }
    }

    // 2. Average Mood (7 Days)
    let avgMood7d = 0;
    let moodTrendDiff = 0;
    if (history && history.length > 0) {
        const now = new Date();

        const last7Days = history.filter(h => getDayDiff(now, new Date(h.created_at)) <= 7);
        const prev7Days = history.filter(h => {
            const diff = getDayDiff(now, new Date(h.created_at));
            return diff > 7 && diff <= 14;
        });

        if (last7Days.length > 0) {
            avgMood7d = last7Days.reduce((acc, curr) => acc + curr.mood, 0) / last7Days.length;
        }

        if (prev7Days.length > 0) {
            const prevMood = prev7Days.reduce((acc, curr) => acc + curr.mood, 0) / prev7Days.length;
            moodTrendDiff = avgMood7d - prevMood;
        }
    }

    // 3. Risk Status
    const riskLevel = score?.risk_level || "unknown";
    const riskColorMap: Record<string, string> = {
        minimal: "text-emerald-400",
        low: "text-emerald-400",
        moderate: "text-yellow-400",
        elevated: "text-orange-400",
        high: "text-red-400",
        critical: "text-red-500 font-bold animate-pulse",
        unknown: "text-gray-400",
    };
    const badgeColor = riskColorMap[riskLevel.toLowerCase()] || "text-gray-400";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
            {/* Bento 1: Check-in Streak */}
            <div className="glass-panel p-6 rounded-xl flex items-center gap-5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-glow-green hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-glow-green transition-transform duration-500 group-hover:scale-110">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Check-in Streak</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white drop-shadow-md">{currentStreak}</h3>
                        <span className="text-sm text-gray-500">days</span>
                    </div>
                </div>
            </div>

            {/* Bento 2: Average Mood */}
            <div className="glass-panel p-6 rounded-xl flex items-center gap-5 hover:border-pro-accent/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-pro-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="w-12 h-12 rounded-full bg-pro-accent/10 border border-pro-accent/20 flex items-center justify-center shrink-0 shadow-glow transition-transform duration-500 group-hover:scale-110">
                    <svg className="w-6 h-6 text-pro-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Avg Mood (7d)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white drop-shadow-md">{avgMood7d.toFixed(1)}</h3>
                        <span className="text-sm text-gray-500">/ 10</span>
                    </div>
                    {moodTrendDiff !== 0 && (
                        <p className={`text-xs mt-1 font-medium ${moodTrendDiff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {moodTrendDiff > 0 ? "↑" : "↓"} {Math.abs(moodTrendDiff).toFixed(1)} vs week
                        </p>
                    )}
                </div>
            </div>

            {/* Bento 3: Risk Status */}
            <div className="glass-panel p-6 rounded-xl flex items-center gap-5 hover:border-violet-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(139,58,237,0.5)] hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="w-12 h-12 rounded-full bg-violet-600/10 border border-violet-600/20 flex items-center justify-center shrink-0 shadow-glow transition-transform duration-500 group-hover:scale-110">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">System Status</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={`text-2xl font-bold uppercase tracking-wide drop-shadow-md ${badgeColor}`}>
                            {riskLevel}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 capitalize opacity-80 backdrop-blur-sm rounded bg-black/20 px-1.5 py-0.5 inline-block">Conf: {(score?.confidence || 0) * 100}%</p>
                </div>
            </div>
        </div>
    );
}
