"use client";

import { useState, useEffect } from "react";
import { Wallet, Activity, DollarSign, Database, RefreshCw, Key } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function FounderDashboard() {
    const [address, setAddress] = useState<string | null>(null);
    const [metrics, setMetrics] = useState({ revenue_total: 0, liquidity_available: 0 });
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [statusData, setStatusData] = useState<any>(null);

    const connectWallet = async () => {
        if (typeof (window as any).ethereum !== "undefined") {
            try {
                const { ethers } = await import("ethers");
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                setAddress(await signer.getAddress());
                fetchTreasury();
            } catch { }
        } else {
            alert("Please install MetaMask.");
        }
    };

    const fetchTreasury = async () => {
        try {
            const res = await fetch(`${API}/v1/treasury/status`);
            if (res.ok) {
                const data = await res.json();
                setMetrics({ revenue_total: data.revenue_total || 0, liquidity_available: data.liquidity_available || 0 });
            }
        } catch { }
    };

    const handleWithdraw = async () => {
        if (!address || !withdrawAmount || isNaN(Number(withdrawAmount))) return;
        setIsWithdrawing(true);
        setStatusData(null);
        try {
            const { ethers } = await import("ethers");
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const timestamp = Date.now() / 1000;
            const amount = parseFloat(withdrawAmount);
            const message = `AXIOM_WITHDRAW:${amount}:TO:${address}:TIME:${timestamp}`;
            const signature = await signer.signMessage(message);
            const res = await fetch(`${API}/v1/treasury/withdraw`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, address, signature, timestamp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Withdrawal failed.");
            setStatusData({ type: "success", tx: data.tx });
            fetchTreasury();
            setWithdrawAmount("");
        } catch (err: any) {
            setStatusData({ type: "error", message: err.message });
        } finally {
            setIsWithdrawing(false);
        }
    };

    useEffect(() => { fetchTreasury(); }, []);

    return (
        <RouteGuard allowedTypes={["developer", "business"]}>
            <div className="p-8 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-heading font-medium text-gcp-text">Treasury</h1>
                        <p className="text-sm text-gcp-text-secondary mt-1">Protocol revenue and founder extraction gateway.</p>
                    </div>
                    {!address ? (
                        <button onClick={connectWallet} className="gcp-btn-primary flex items-center gap-2">
                            <Key size={14} /> Link Founder Wallet
                        </button>
                    ) : (
                        <span className="gcp-badge bg-gcp-blue/10 text-gcp-blue text-sm px-3 py-1.5">
                            <Wallet size={12} /> {address.slice(0, 8)}...{address.slice(-6)}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="gcp-card p-6">
                        <div className="flex items-center gap-2 text-xs text-gcp-text-secondary mb-3">
                            <Activity size={16} className="text-gcp-blue" /> Total value generated
                        </div>
                        <div className="text-3xl font-heading font-medium text-gcp-text">{metrics.revenue_total.toFixed(2)}</div>
                        <div className="text-xs text-gcp-text-disabled mt-1">Cumulative RAG + Tax</div>
                    </div>
                    <div className="gcp-card p-6 border-gcp-blue/30">
                        <div className="flex items-center gap-2 text-xs text-gcp-text-secondary mb-3">
                            <Database size={16} className="text-gcp-green" /> Available liquidity
                        </div>
                        <div className="text-3xl font-heading font-medium text-gcp-blue">{metrics.liquidity_available.toFixed(2)}</div>
                        <div className="text-xs text-gcp-text-disabled mt-1">AXM ready for extraction</div>
                    </div>
                    <div className="gcp-card p-6">
                        <div className="flex items-center gap-2 text-xs text-gcp-text-secondary mb-3">
                            <DollarSign size={16} className="text-gcp-yellow-dark" /> Network TVL
                        </div>
                        <div className="text-3xl font-heading font-medium text-gcp-text">3,492,100</div>
                        <div className="text-xs text-gcp-text-disabled mt-1">Simulated locked escrow</div>
                    </div>
                </div>

                <div className="gcp-card p-6 max-w-2xl">
                    <h2 className="font-heading font-medium text-gcp-text mb-1">Withdraw funds</h2>
                    <p className="text-sm text-gcp-text-secondary mb-5">Extract protocol revenue to your connected wallet. Requires cryptographic signature.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gcp-text-secondary block mb-1.5">Amount (AXM)</label>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                                className="gcp-input w-full text-2xl"
                                placeholder="0.00"
                                max={metrics.liquidity_available}
                            />
                        </div>
                        <button
                            onClick={handleWithdraw}
                            disabled={!address || isWithdrawing || !withdrawAmount}
                            className="w-full gcp-btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isWithdrawing ? <><RefreshCw size={14} className="animate-spin" /> Processing...</> : "Initiate Withdrawal"}
                        </button>
                        {statusData && (
                            <div className={`p-3 rounded text-sm font-mono ${statusData.type === "success" ? "bg-gcp-green/10 text-gcp-green border border-gcp-green/20" : "bg-gcp-red/10 text-gcp-red border border-gcp-red/20"}`}>
                                {statusData.type === "success"
                                    ? `✓ Withdrawal successful. TX: ${statusData.tx}`
                                    : `✗ ${statusData.message}`}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
