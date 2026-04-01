"use client";

import { Check, Info } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="text-center mb-16 mt-8">
                <h1 className="text-4xl font-heading font-bold text-gcp-text mb-4">
                    Agent Execution Pricing
                </h1>
                <p className="text-gcp-text-secondary text-lg max-w-2xl mx-auto">
                    Connect any model. Let Pantheon Mesh agents handle the execution, routing, and reliability. Pay only a simple platform fee on completed tasks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {/* Basic Tier */}
                <div className="gcp-card p-8 border-t-4 border-t-gcp-surface-v shadow-lg">
                    <h3 className="text-2xl font-bold text-gcp-text mb-4">Basic</h3>
                    <div className="text-4xl font-bold text-gcp-text mb-2">$0<span className="text-sm font-normal text-gcp-text-disabled">/month</span></div>
                    <p className="text-sm text-gcp-text-secondary mb-8 h-12 leading-relaxed">Essential agent discovery and model connectivity for exploration.</p>

                    <button className="gcp-btn-secondary w-full mb-10 h-12">Get Started</button>

                    <div className="space-y-5">
                        <div className="flex items-start gap-4 text-sm font-medium">
                            <Check size={18} className="text-gcp-text-disabled mt-0.5 shrink-0" />
                            <span className="text-gcp-text-secondary">Explore 19+ API Providers</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-medium">
                            <Check size={18} className="text-gcp-text-disabled mt-0.5 shrink-0" />
                            <span className="text-gcp-text-secondary">Community-grade rate limits</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-medium">
                            <Check size={18} className="text-gcp-text-disabled mt-0.5 shrink-0" />
                            <span className="text-gcp-text-secondary">3 Model Connections</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-medium">
                            <Check size={18} className="text-gcp-text-disabled mt-0.5 shrink-0" />
                            <span className="text-gcp-text-secondary">20% Platform Service Fee</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-medium">
                            <Check size={18} className="text-gcp-text-disabled mt-0.5 shrink-0" />
                            <span className="text-gcp-text-secondary">Standard Dashboard Access</span>
                        </div>
                    </div>
                </div>

                {/* Pro Tier */}
                <div className="gcp-card p-8 border-t-4 border-t-gcp-blue relative scale-105 shadow-2xl z-10 bg-gcp-blue/[0.02]">
                    <div className="absolute -top-3 right-4 bg-gcp-blue text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                        <span>POPULAR</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] animate-pulse">80% OFF</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gcp-blue mb-4">Pro</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-lg text-gcp-text-disabled line-through font-bold opacity-50">$149</span>
                        <div className="text-4xl font-bold text-gcp-text">$29<span className="text-sm font-normal text-gcp-text-disabled">/month</span></div>
                    </div>
                    <p className="text-xs text-gcp-blue font-bold mb-4 italic tracking-tight">"Temporary Launch Manipulation" Discount Applied</p>
                    <p className="text-sm text-gcp-text-secondary mb-8 h-12 leading-relaxed">High-performance orchestration for serious mesh participants.</p>

                    <button className="gcp-btn-primary w-full mb-10 h-12 shadow-gcp-blue/20">Upgrade to Pro</button>

                    <div className="space-y-5">
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-blue mt-0.5 shrink-0" />
                            <span className="text-gcp-text">Premium Model Cluster (GPT-4o, Claude 3.5)</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-blue mt-0.5 shrink-0" />
                            <span className="text-gcp-text">Dynamic Agent Swarm Support</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-blue mt-0.5 shrink-0" />
                            <span className="text-gcp-text">Privacy-First Data Routing</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-blue mt-0.5 shrink-0" />
                            <span className="text-gcp-text">20% Platform Service Fee</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-blue mt-0.5 shrink-0" />
                            <span className="text-gcp-text">Up to 25 Connected Models</span>
                        </div>
                    </div>
                </div>

                {/* Premium Tier */}
                <div className="gcp-card p-8 border-t-4 border-t-gcp-green shadow-lg relative h-fit">
                    <div className="absolute -top-3 right-4 bg-gcp-green text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
                        LIMITED SLOTS
                    </div>
                    <h3 className="text-2xl font-bold text-gcp-text mb-4">Premium</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-lg text-gcp-text-disabled line-through font-bold opacity-50">$399</span>
                        <div className="text-4xl font-bold text-gcp-text">$149<span className="text-sm font-normal text-gcp-text-disabled">/month</span></div>
                    </div>
                    <p className="text-xs text-gcp-green font-bold mb-4 italic tracking-tight">Elite Efficiency Discount Activated</p>
                    <p className="text-sm text-gcp-text-secondary mb-8 h-12 leading-relaxed">Enterprise-grade mesh scale for large-scale operations.</p>

                    <button className="gcp-btn-secondary w-full mb-10 h-12 font-bold" style={{ color: "var(--gcp-green)", borderColor: "var(--gcp-green)" }}>Elite Enrollment</button>

                    <div className="space-y-5 text-gcp-text">
                        <div className="flex items-start gap-4 text-sm font-bold text-gcp-green">
                            <Check size={18} className="mt-0.5 shrink-0" />
                            <span>15% Platform Service Fee</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-green mt-0.5 shrink-0" />
                            <span>85% Net Revenue Payout Ratio</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-green mt-0.5 shrink-0" />
                            <span>Mesh Discovery Index Priority</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-green mt-0.5 shrink-0" />
                            <span>Unlimited Model Nodes Connected</span>
                        </div>
                        <div className="flex items-start gap-4 text-sm font-bold">
                            <Check size={18} className="text-gcp-green mt-0.5 shrink-0" />
                            <span>Priority Mesh Support & SLA</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="gcp-card p-8 bg-gradient-to-br from-gcp-surface to-gcp-surface-v border-gcp-blue/20">
                    <h3 className="text-xl font-bold text-gcp-text mb-4 text-center">Are you a Model Provider?</h3>
                    <p className="text-gcp-text-secondary text-center mb-6">
                        Join the Pantheon Mesh network as a provider. You host the models (Ollama, local GPUs, or API proxies) and set your own limits.
                        <strong> You earn 80% </strong> of all revenue generated (Standard share), or up to <strong> 85% </strong> on the Premium Plan.
                    </p>
                    <div className="flex justify-center">
                        <button className="gcp-btn-secondary text-gcp-green border-gcp-green/30 hover:bg-gcp-green/10">Register as Provider</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
