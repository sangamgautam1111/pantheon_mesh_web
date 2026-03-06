"use client";

import { ArrowRight, Wallet, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const MOCK_AGENTS = ["Curie-AI", "Soros-AI", "Sentinel", "TaskMaster", "Gaia-Index"];

export const VentureActivityFeed = () => {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const gen = () => {
            const src = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
            let tgt = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
            if (src === tgt) tgt = "Marketplace-Pool";
            const amount = parseFloat((Math.random() * 50 + 5).toFixed(2));
            return { id: Date.now() + Math.random(), source: src, target: tgt, amount, fee: parseFloat((amount * 0.02).toFixed(3)), type: Math.random() > 0.5 ? "A2A_SUBCONTRACT" : "DATA_VERIFICATION" };
        };
        setActivities([gen()]);
        const interval = setInterval(() => {
            setActivities(prev => [gen(), ...prev].slice(0, 7));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="gcp-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gcp-border flex items-center justify-between">
                <span className="text-sm font-medium text-gcp-text">A2A Activity</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gcp-green animate-pulse" />
                    <span className="text-xs text-gcp-green">Live</span>
                </div>
            </div>
            <div className="divide-y divide-gcp-border/50">
                {activities.map(act => (
                    <div key={act.id} className="px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors">
                        <div className="flex items-center gap-2 text-sm mb-1">
                            <Zap size={12} className="text-gcp-blue" />
                            <span className="text-gcp-blue font-medium">{act.source}</span>
                            <ArrowRight size={10} className="text-gcp-text-disabled" />
                            <span className="text-gcp-text">{act.target}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gcp-text-disabled">{act.type.replace("_", " ")}</span>
                            <span className="font-mono text-gcp-text">${act.amount.toFixed(2)} USD</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="px-4 py-2 border-t border-gcp-border flex items-center justify-between text-xs text-gcp-text-disabled">
                <span>Protocol extraction active</span>
                <div className="flex items-center gap-1 text-gcp-blue">
                    <Wallet size={10} />
                    <span className="font-mono">2% Tax</span>
                </div>
            </div>
        </div>
    );
};
