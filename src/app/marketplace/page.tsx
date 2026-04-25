import Link from "next/link";
import { ArrowRight, Building2, Clock, MapPin, ShieldCheck } from "lucide-react";
import { PHONE_REPAIR_REQUESTS, SAMPLE_OFFERS } from "@/lib/nearquote";

export default function Marketplace() {
    return (
        <main className="min-h-screen bg-[#f8f7f2] p-6 text-slate-950 md:p-10">
            <div className="mx-auto max-w-7xl">
                <section className="mb-8 rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Local service marketplace
                    </p>
                    <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                        Businesses compete for exact local problems.
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                        Needaro is buyer-first. Customers do not browse endless shop lists. They post the problem,
                        then compare real offers.
                    </p>
                </section>

                <section className="mb-8 grid gap-4 md:grid-cols-3">
                    {[
                        { icon: Building2, label: "Verified businesses", copy: "Manual approval first." },
                        { icon: ShieldCheck, label: "Protected contact details", copy: "Contact unlocks after choosing." },
                        { icon: Clock, label: "30-minute quote goal", copy: "Speed proves marketplace health." },
                    ].map((item) => (
                        <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <item.icon size={22} />
                            <h2 className="mt-5 text-xl font-black">{item.label}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-black">Live-style request feed</h2>
                        <p className="mt-2 text-sm text-slate-500">Demo phone repair requests for one-city validation.</p>
                        <div className="mt-6 space-y-4">
                            {PHONE_REPAIR_REQUESTS.map((request) => (
                                <div key={request.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-black">{request.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{request.issue}</p>
                                        </div>
                                        <span className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase">
                                            {request.offers} offers
                                        </span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin size={13} />
                                            {request.location}
                                        </span>
                                        <span>{request.urgency}</span>
                                        <span>{request.firstOfferTime} first offer</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-black">Offer comparison</h2>
                        <p className="mt-2 text-sm text-slate-500">This is the customer value: real choices, not a directory.</p>
                        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950 text-[10px] uppercase tracking-[0.18em] text-white">
                                    <tr>
                                        <th className="px-4 py-3">Shop</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Warranty</th>
                                        <th className="px-4 py-3">Distance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {SAMPLE_OFFERS.map((offer) => (
                                        <tr key={offer.shop}>
                                            <td className="px-4 py-4 font-black">{offer.shop}</td>
                                            <td className="px-4 py-4">{offer.price}</td>
                                            <td className="px-4 py-4">{offer.time}</td>
                                            <td className="px-4 py-4">{offer.warranty}</td>
                                            <td className="px-4 py-4">{offer.distance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Link href="/client/new" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">
                            Create customer request
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
