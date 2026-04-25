import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { NEEDARO_PLANS } from "@/lib/nearquote";

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#f8f7f2] p-6 text-slate-950 md:p-10">
            <div className="mx-auto max-w-7xl">
                <section className="mb-8 rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Business SaaS
                    </p>
                    <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                        Shops pay for more quote replies, visibility, AI tools, and analytics.
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                        Customers use Needaro free. Local businesses start free, receive real nearby requests, then
                        upgrade after they see lead value.
                    </p>
                </section>

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {NEEDARO_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`flex h-full flex-col rounded-[30px] border bg-white p-6 shadow-sm ${
                                plan.id === "pro" ? "border-slate-950 shadow-xl" : "border-slate-200"
                            }`}
                        >
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-2xl font-black">{plan.name}</p>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{plan.bestFor}</p>
                                </div>
                                {plan.id === "pro" && (
                                    <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase text-white">
                                        Best proof
                                    </span>
                                )}
                            </div>

                            <div className="mb-5">
                                <span className="text-4xl font-black">{plan.price}</span>
                                <span className="ml-1 text-sm font-semibold text-slate-400">{plan.cadence}</span>
                            </div>

                            <div className="mb-6 space-y-3 rounded-3xl bg-slate-50 p-4 text-sm">
                                {[
                                    ["Quote replies", plan.quoteReplies],
                                    ["Visibility", plan.visibility],
                                    ["AI tools", plan.aiTools],
                                    ["Analytics", plan.analytics],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-start justify-between gap-3">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="text-right font-black">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="mb-6 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
                                {plan.id === "free" ? "Start free" : `Choose ${plan.name}`}
                            </button>

                            <div className="mt-auto space-y-3">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                                        <CheckCircle2 className="mt-0.5 shrink-0 text-slate-950" size={17} />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="mt-8 rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
                    <h2 className="text-2xl font-black">Do not charge too early.</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        First prove demand: 10 repair shops, 50 customer requests, 5 completed matches, and 1 shop
                        willing to pay. Then turn on paid plans for more replies and better tools.
                    </p>
                    <Link href="/client/new" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">
                        Test customer request flow
                        <ArrowRight size={16} />
                    </Link>
                </section>
            </div>
        </main>
    );
}
