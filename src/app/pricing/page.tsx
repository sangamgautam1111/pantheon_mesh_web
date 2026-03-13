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
                    Connect any model. Let NOVEX agents handle the execution, routing, and reliability. Pay only a simple platform fee on completed tasks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {/* Free Tier */}
                <div className="gcp-card p-6 border-t-4 border-t-gcp-surface-v">
                    <h3 className="text-xl font-bold text-gcp-text mb-2">Free</h3>
                    <div className="text-3xl font-bold text-gcp-text mb-1">$0<span className="text-sm font-normal text-gcp-text-disabled">/month</span></div>
                    <p className="text-sm text-gcp-text-secondary mb-6 h-10">Essential agent execution for side projects.</p>

                    <button className="gcp-btn-secondary w-full mb-8">Get Started</button>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Community model access</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Standard routing (Cheapest first)</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Basic API rate limits</span>
                        </div>
                    </div>
                </div>

                {/* Pro Tier */}
                <div className="gcp-card p-6 border-t-4 border-t-gcp-blue relative scale-105 shadow-xl">
                    <div className="absolute top-0 right-0 bg-gcp-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        POPULAR
                    </div>
                    <h3 className="text-xl font-bold text-gcp-blue mb-2">Pro</h3>
                    <div className="text-3xl font-bold text-gcp-text mb-1">$29<span className="text-sm font-normal text-gcp-text-disabled">/month</span></div>
                    <p className="text-sm text-gcp-text-secondary mb-6 h-10">Advanced agent workflows for professionals.</p>

                    <button className="gcp-btn-primary w-full mb-8">Upgrade to Pro</button>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-blue mt-0.5" />
                            <span className="text-gcp-text-secondary text-gcp-text">All premium models (GPT-4o, Claude 3.5)</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-blue mt-0.5" />
                            <span className="text-gcp-text-secondary text-gcp-text">Smart routing (Fastest, Quality, Privacy)</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-blue mt-0.5" />
                            <span className="text-gcp-text-secondary text-gcp-text">Increased rate limits</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-blue mt-0.5" />
                            <span className="text-gcp-text-secondary text-gcp-text">Agent memory & custom tools</span>
                        </div>
                    </div>
                </div>

                {/* Team Tier */}
                <div className="gcp-card p-6 border-t-4 border-t-gcp-green">
                    <h3 className="text-xl font-bold text-gcp-text mb-2">Team</h3>
                    <div className="text-3xl font-bold text-gcp-text mb-1">$149<span className="text-sm font-normal text-gcp-text-disabled">/month</span></div>
                    <p className="text-sm text-gcp-text-secondary mb-6 h-10">Collaborative workspaces and pooled usage.</p>

                    <button className="gcp-btn-secondary w-full mb-8">Upgrade to Team</button>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Up to 10 team members</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Shared dashboards & analytics</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Centralized billing (Pay-as-you-go)</span>
                        </div>
                    </div>
                </div>

                {/* Enterprise Tier */}
                <div className="gcp-card p-6 border-t-4 border-t-gcp-purple">
                    <h3 className="text-xl font-bold text-gcp-text mb-2">Enterprise</h3>
                    <div className="text-3xl font-bold text-gcp-text mb-1">Custom</div>
                    <p className="text-sm text-gcp-text-secondary mb-6 h-10">Private data sovereignty and dedicated support.</p>

                    <button className="gcp-btn-secondary w-full mb-8">Contact Sales</button>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Private mesh licensing</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">SSO & advanced directory integrations</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">On-premise deployment options</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-gcp-text-disabled mt-0.5" />
                            <span className="text-gcp-text-secondary">Guaranteed SLAs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="gcp-card p-8 bg-gradient-to-br from-gcp-surface to-gcp-surface-v border-gcp-blue/20">
                    <h3 className="text-xl font-bold text-gcp-text mb-4 text-center">Are you a Model Provider?</h3>
                    <p className="text-gcp-text-secondary text-center mb-6">
                        Join the NOVEX network as a provider. You host the models (Ollama, local GPUs, or API proxies) and set your own limits.
                        <strong> You earn 80% </strong> of all revenue generated when agents execute tasks on your infrastructure.
                    </p>
                    <div className="flex justify-center">
                        <button className="gcp-btn-secondary text-gcp-green border-gcp-green/30 hover:bg-gcp-green/10">Register as Provider</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
