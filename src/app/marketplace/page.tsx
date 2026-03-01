"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Plus, X, Wallet, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MOCK_SPECS = [
    { id: "SPEC-001", name: "DeFi-Arbitrage-Bot", description: "Cross-chain arbitrage detection with sub-100ms execution", owner: "0xabcd...ef01", cost: 50, rep: 9.2 },
    { id: "SPEC-002", name: "Code-Auditor", description: "Static analysis and vulnerability scanning for Solidity contracts", owner: "0x1234...cd56", cost: 80, rep: 8.7 },
    { id: "SPEC-003", name: "Bio-Synthesizer", description: "Protein folding simulation and drug candidate generation", owner: "0xf9e8...a7b6", cost: 120, rep: 7.5 },
];

export default function Marketplace() {
    const [specs, setSpecs] = useState<any[]>(MOCK_SPECS);
    const [address, setAddress] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newSpec, setNewSpec] = useState({ name: "", desc: "", cost: "50" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/v1/marketplace`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) setSpecs(data);
                }
            } catch { }
        })();
    }, []);

    const connectWallet = async () => {
        if (typeof (window as any).ethereum !== "undefined") {
            try {
                const { ethers } = await import("ethers");
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                setAddress(await signer.getAddress());
            } catch { }
        } else {
            alert("Please install MetaMask.");
        }
    };

    const registerSpec = async () => {
        if (!address || !newSpec.name || !newSpec.desc || !newSpec.cost) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API}/v1/marketplace/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSpec.name, desc: newSpec.desc, owner: address, cost: parseFloat(newSpec.cost) })
            });
            if (res.ok) {
                setShowModal(false);
                setNewSpec({ name: "", desc: "", cost: "50" });
                const data = await fetch(`${API}/v1/marketplace`);
                if (data.ok) setSpecs(await data.json());
            }
        } catch { }
        setIsSubmitting(false);
    };

    return (
        <div className="p-8 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-heading font-medium text-gcp-text">Marketplace</h1>
                    <p className="text-sm text-gcp-text-secondary mt-1">Decentralized neural capability exchange. List and hire AI agent specs.</p>
                </div>
                <div className="flex items-center gap-3">
                    {!address ? (
                        <button onClick={connectWallet} className="gcp-btn-outlined flex items-center gap-2">
                            <Wallet size={14} /> Connect Wallet
                        </button>
                    ) : (
                        <span className="gcp-badge bg-gcp-blue/10 text-gcp-blue text-sm px-3 py-1.5">
                            <Wallet size={12} /> {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    )}
                    <button
                        onClick={() => address ? setShowModal(true) : alert("Connect wallet first")}
                        className="gcp-btn-primary flex items-center gap-2"
                    >
                        <Plus size={14} /> List capability
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specs.map(spec => (
                    <div key={spec.id || spec.name} className="gcp-card-hover p-6 group">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="gcp-badge bg-gcp-green/10 text-gcp-green-dark">Rep: {spec.rep?.toFixed(1) || "5.0"}</span>
                            <span className="text-xs text-gcp-text-disabled font-mono">{spec.id}</span>
                        </div>
                        <h3 className="text-base font-heading font-medium text-gcp-text group-hover:text-gcp-blue transition-colors mb-2">{spec.name}</h3>
                        <p className="text-sm text-gcp-text-secondary leading-relaxed mb-6 line-clamp-2">{spec.description || spec.desc}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gcp-border">
                            <div>
                                <div className="text-xs text-gcp-text-disabled mb-0.5">Base cost</div>
                                <div className="text-lg font-mono font-medium text-gcp-text">{spec.cost} <span className="text-sm text-gcp-blue">AXM</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gcp-text-disabled mb-0.5">Developer</div>
                                <div className="text-xs font-mono text-gcp-text-secondary">
                                    {spec.owner?.startsWith("0x") ? `${spec.owner.slice(0, 8)}...` : spec.owner}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Register Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-gcp-surface border border-gcp-border rounded-lg p-6 max-w-md w-full relative shadow-2xl">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gcp-text-disabled hover:text-gcp-text">
                            <X size={16} />
                        </button>
                        <div className="flex items-center gap-2 mb-1">
                            <BrainCircuit size={18} className="text-gcp-blue" />
                            <h2 className="font-heading font-medium text-gcp-text">New capability</h2>
                        </div>
                        <p className="text-sm text-gcp-text-secondary mb-6">Deploy a spec into the Marketplace.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gcp-text-secondary block mb-1.5">Name</label>
                                <input value={newSpec.name} onChange={e => setNewSpec({ ...newSpec, name: e.target.value })} className="gcp-input w-full" placeholder="e.g. DeFi-Arbitrage-Bot" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gcp-text-secondary block mb-1.5">Description</label>
                                <textarea value={newSpec.desc} onChange={e => setNewSpec({ ...newSpec, desc: e.target.value })} className="gcp-input w-full h-20 resize-none" placeholder="What does your agent do?" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gcp-text-secondary block mb-1.5">Base cost (AXM)</label>
                                <input type="number" value={newSpec.cost} onChange={e => setNewSpec({ ...newSpec, cost: e.target.value })} className="gcp-input w-full" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="gcp-btn-text">Cancel</button>
                                <button onClick={registerSpec} disabled={isSubmitting} className="gcp-btn-primary disabled:opacity-50 flex items-center gap-2">
                                    {isSubmitting ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</> : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
