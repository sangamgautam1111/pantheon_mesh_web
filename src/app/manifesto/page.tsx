import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PRINCIPLES = [
    "Do not start broad. Start with phone repair in one city.",
    "Do not charge before value is proven. Give shops real leads first.",
    "Do not expose customer contact details to every shop.",
    "Do not build a full app before manual validation.",
    "Measure the percentage of requests that receive a useful quote within 30 minutes.",
];

export default function ManifestoPage() {
    return (
        <main className="min-h-screen bg-[#f8f7f2] p-6 text-slate-950 md:p-10">
            <div className="mx-auto max-w-5xl rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Needaro manifesto</p>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                    Customers do not want directories. They want exact offers.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                    Needaro turns local search into action. A customer posts one problem, AI makes it clear,
                    nearby businesses compete, and the customer chooses the best offer.
                </p>
                <div className="mt-8 space-y-3">
                    {PRINCIPLES.map((principle, index) => (
                        <div key={principle} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                                {index + 1}
                            </span>
                            <p className="text-sm font-semibold leading-6 text-slate-700">{principle}</p>
                        </div>
                    ))}
                </div>
                <Link href="/client/new" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">
                    Start with a phone repair request
                    <ArrowRight size={16} />
                </Link>
            </div>
        </main>
    );
}
