"use client";

import { Briefcase, CheckCircle2, Globe2, Layers3, Sparkles } from "lucide-react";

const CAPABILITIES = [
    {
        title: "Email and outreach",
        description: "Draft campaigns, follow-ups, lead qualification notes, and response variations.",
    },
    {
        title: "Landing page edits",
        description: "Prepare page copy, component updates, small UI refinements, and implementation briefs.",
    },
    {
        title: "Research briefs",
        description: "Turn a question into a structured summary with clear next actions and citations.",
    },
    {
        title: "Support operations",
        description: "Generate replies, triage requests, and prepare handoff notes for human review.",
    },
    {
        title: "Content production",
        description: "Create blog drafts, ads, FAQ copy, and reusable marketing assets.",
    },
    {
        title: "Workflow cleanup",
        description: "Normalize spreadsheets, summaries, repetitive formatting, and lightweight automation prep.",
    },
];

export default function Marketplace() {
    return (
        <div className="max-w-6xl p-8">
            <div className="mb-12">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gcp-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-gcp-blue">
                    <Briefcase size={14} />
                    Business Capabilities
                </div>
                <h1 className="text-4xl font-heading font-bold text-gcp-text">Managed AI Work Marketplace</h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                    Browse the categories of work your business can send into Pantheon Mesh.
                    Each workflow is handled by the managed internal AI team and delivered through one business portal.
                </p>
            </div>

            <div className="mb-10 grid gap-4 md:grid-cols-3">
                {[
                    { icon: <Layers3 size={18} />, label: "Managed workflows" },
                    { icon: <CheckCircle2 size={18} />, label: "Reviewed delivery" },
                    { icon: <Globe2 size={18} />, label: "Business-first access" },
                ].map((item) => (
                    <div key={item.label} className="gcp-card flex items-center gap-3 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gcp-blue/10 text-gcp-blue">
                            {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-gcp-text">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {CAPABILITIES.map((capability) => (
                    <div key={capability.title} className="gcp-card p-7 transition-all hover:-translate-y-1 hover:border-gcp-blue/30 hover:shadow-xl">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gcp-blue/10 text-gcp-blue">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gcp-text">{capability.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{capability.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
