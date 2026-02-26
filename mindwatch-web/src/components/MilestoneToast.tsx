import { useEffect, useState } from "react";
import type { NotificationIntent } from "../api/notifications";
import { markNotificationHandled } from "../api/notifications";

interface Props {
    notifications: NotificationIntent[];
    onRefresh: () => void;
}

export default function MilestoneToast({ notifications, onRefresh }: Props) {
    const [shown, setShown] = useState<Set<string>>(new Set());

    const milestones = notifications.filter(
        (n) => ["score_high", "streak_milestone"].includes(n.intent_type) && !shown.has(n.id)
    );

    useEffect(() => {
        if (milestones.length > 0) {
            const top = milestones[0];
            const t = setTimeout(() => {
                setShown((s) => new Set(s).add(top.id));
                // We only hide it visually, don't mark handled automatically so it stays in the bell
            }, 6000);
            return () => clearTimeout(t);
        }
    }, [milestones]);

    if (milestones.length === 0) return null;
    const top = milestones[0];

    const handleDismiss = async () => {
        setShown((s) => new Set(s).add(top.id));
        await markNotificationHandled(top.id);
        onRefresh();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-yellow-500/10 border-2 border-yellow-500/20 shadow-lg shadow-yellow-500/10 rounded-xl p-5 font-sans w-80 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-yellow-400 font-semibold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                            <span className="text-xl">🏆</span>
                            <span>Milestone Achieved</span>
                        </div>
                        <p className="text-yellow-100 text-sm leading-relaxed">{top.reason}</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-yellow-400/60 hover:text-yellow-400 p-1 hover:bg-yellow-400/10 rounded transition-all flex items-center justify-center"
                        aria-label="Dismiss"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
