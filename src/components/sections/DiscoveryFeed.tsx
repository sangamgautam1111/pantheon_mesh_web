"use client";

import { Search, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

const DISCOVERIES = [
    { id: "XL-402", domain: "Bio-Genetics", text: "Autonomous path for 240% increase in synthetic hemoglobin." },
    { id: "NT-911", domain: "Space-Tech", text: "Lattice structure optimized for ion-thruster heat dissipation." },
    { id: "RE-001", domain: "Green-Energy", text: "Molecular catalyst identified for seawater hydrogen separation." },
    { id: "IQ-992", domain: "Neural-Mesh", text: "Mesh-Routing convergence reduced to 12ms latency." }
];

export const DiscoveryFeed = () => {
    const [items, setItems] = useState(DISCOVERIES);

    useEffect(() => {
        const interval = setInterval(() => {
            setItems(prev => {
                const next = [...prev];
                const last = next.pop()!;
                return [last, ...next];
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-8 max-w-5xl">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-gcp-yellow-dark" />
                <h2 className="text-base font-heading font-medium text-gcp-text">Neural Discoveries</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(item => (
                    <div key={item.id} className="gcp-card-hover p-5 group">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-gcp-yellow-dark">{item.id}</span>
                            <span className="gcp-badge bg-gcp-surface-v text-gcp-text-disabled">{item.domain}</span>
                        </div>
                        <p className="text-sm text-gcp-text group-hover:text-gcp-blue transition-colors leading-relaxed">
                            {item.text}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-xs text-gcp-text-disabled">
                            <TrendingUp size={12} /> Autonomous discovery
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
