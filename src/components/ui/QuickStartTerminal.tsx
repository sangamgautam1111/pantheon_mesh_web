"use client";

import { useState } from "react";
import { Copy, Check, Terminal as TerminalIcon } from "lucide-react";

export const QuickStartTerminal = () => {
    const [activeTab, setActiveTab] = useState("one-liner");
    const [copied, setCopied] = useState(false);
    const [shell, setShell] = useState("ps1");

    const command = shell === "ps1"
        ? "iwr -useb https://pantheon.ai/install.ps1 | iex"
        : "curl -fsSL https://pantheon.ai/install.sh | bash";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = ["one-liner", "npm", "sdk"];

    return (
        <div className="gcp-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gcp-border bg-gcp-surface-v">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-gcp-text-disabled" />
                    <span className="text-xs font-medium text-gcp-text-secondary">Quick Start</span>
                </div>

                <div className="flex items-center gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-xs font-medium px-3 py-1 rounded transition-colors ${activeTab === tab
                                    ? "bg-gcp-blue/10 text-gcp-blue"
                                    : "text-gcp-text-disabled hover:text-gcp-text-secondary hover:bg-sidebar-hover"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="ml-2 pl-2 border-l border-gcp-border">
                        <button
                            onClick={() => setShell(shell === "ps1" ? "sh" : "ps1")}
                            className="text-xs font-medium text-gcp-text-disabled hover:text-gcp-text-secondary bg-gcp-surface-v border border-gcp-border rounded px-2 py-0.5 transition-colors"
                        >
                            {shell === "ps1" ? "PowerShell" : "Bash"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 font-mono text-sm relative group">
                <p className="text-gcp-text-disabled mb-3"># Install Pantheon Mesh SDK</p>
                <div className="flex items-center gap-3">
                    <span className="text-gcp-blue">$</span>
                    <code className="text-gcp-text">{command}</code>
                </div>

                <button
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 rounded hover:bg-sidebar-hover transition-all opacity-0 group-hover:opacity-100"
                >
                    {copied ? <Check size={14} className="text-gcp-green" /> : <Copy size={14} className="text-gcp-text-disabled" />}
                </button>
            </div>

            <div className="px-4 py-2 border-t border-gcp-border flex justify-between text-xs text-gcp-text-disabled">
                <div className="flex gap-4">
                    <span>v12.0.0 Stable</span>
                    <span>Verified Release</span>
                </div>
                <a href="#" className="text-gcp-blue hover:underline">View on GitHub</a>
            </div>
        </div>
    );
};
