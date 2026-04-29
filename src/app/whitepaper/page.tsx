import Link from "next/link";
import { ArrowRight, Building2, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const SECTIONS = [
    {
        title: "Core idea",
        text: "Customers post a local problem once. Needero cleans it into a quote card. Nearby businesses send offers. The customer chooses the best offer by price, distance, speed, warranty, and trust.",
    },
    {
        title: "First market",
        text: "Start with phone repair in one city. It is common, urgent, price-sensitive, local, competitive, and easy to explain with text and photos.",
    },
    {
        title: "Business model",
        text: "Customers use the app free. Shops pay SaaS subscriptions for more quote replies, better visibility, AI quote tools, analytics, and stronger profiles.",
    },
    {
        title: "Validation target",
        text: "Before scaling, prove 10 onboarded repair shops, 50 customer requests, 5 completed matches, and 1 paying business.",
    },
];

export default function WhitepaperPage() {
    return (
        <main className="min-h-screen bg-[#f8f7f2] p-6 text-slate-950 md:p-10">
            <div className="mx-auto max-w-6xl">
                <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Whitepaper v1
                    </p>
                    <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                        Needero: a local service and product quote marketplace.
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                        The internet has many directories. Customers do not want directories. They want outcomes:
                        trusted nearby businesses that can solve their exact problem with clear prices.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/client/new" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">
                            Build the request flow
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/pricing" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black">
                            Business plans
                        </Link>
                    </div>
                </section>

                <section className="mt-6 grid gap-5 md:grid-cols-2">
                    {SECTIONS.map((section, index) => (
                        <div key={section.title} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                {index === 0 && <Sparkles size={20} />}
                                {index === 1 && <MapPin size={20} />}
                                {index === 2 && <Building2 size={20} />}
                                {index === 3 && <ShieldCheck size={20} />}
                            </div>
                            <h2 className="text-2xl font-black">{section.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{section.text}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-6 rounded-[30px] border border-slate-200 bg-slate-950 p-7 text-white shadow-sm md:p-8">
                    <h2 className="text-3xl font-black">Final positioning</h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl bg-white/10 p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Customers</p>
                            <p className="mt-3 text-sm font-semibold leading-6">Post your problem. Get prices from nearby businesses. Choose the best offer.</p>
                        </div>
                        <div className="rounded-3xl bg-white/10 p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Businesses</p>
                            <p className="mt-3 text-sm font-semibold leading-6">Get nearby customers who already need your service.</p>
                        </div>
                        <div className="rounded-3xl bg-white/10 p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Founder</p>
                            <p className="mt-3 text-sm font-semibold leading-6">One category. One city. One painful problem. Validate manually first.</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
