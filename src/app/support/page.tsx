"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Headphones, Mail, MessageSquare, Send, Sparkles } from "lucide-react";

export default function SupportPage() {
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const submitFeedback = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!feedback.trim()) return;
        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-[#f7faf8] px-4 py-8 text-[#222325] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-[#62646a] hover:text-[#0a8f45]">
                    <ArrowLeft size={16} />
                    Back to Needero
                </Link>

                <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="rounded-[34px] border border-[#dfe8e3] bg-white p-7 shadow-sm sm:p-10">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f9f0] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#0a8f45]">
                            <Headphones size={15} />
                            Feedback & support
                        </span>
                        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] sm:text-6xl">
                            Tell us what broke, what confused you, or what you want next.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#62646a]">
                            This MVP support page keeps feedback simple. Write the issue, submit it, and Needero support will show the next contact path.
                        </p>

                        <form onSubmit={submitFeedback} className="mt-8">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#74767e]">Your feedback</span>
                                <textarea
                                    value={feedback}
                                    onChange={(event) => setFeedback(event.target.value)}
                                    className="mt-3 min-h-56 w-full resize-none rounded-[24px] border border-[#dadbdd] bg-[#fbfbfb] p-5 text-base font-medium outline-none transition focus:border-[#0a8f45] focus:bg-white focus:ring-4 focus:ring-[#0a8f45]/10"
                                    placeholder="Example: Message button opens an error, or I cannot see nearby Needs..."
                                />
                            </label>
                            <button className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0a8f45] px-7 py-4 text-sm font-black text-white shadow-lg shadow-[#0a8f45]/20 transition hover:bg-[#08783b]">
                                <Send size={16} />
                                Submit feedback
                            </button>
                        </form>
                    </div>

                    <aside className="space-y-5">
                        <div className="rounded-[30px] border border-[#dfe8e3] bg-white p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                                <Sparkles size={22} />
                            </div>
                            <h2 className="mt-5 text-2xl font-black">AI support pop-up</h2>
                            <p className="mt-3 text-sm leading-6 text-[#62646a]">
                                Use the Needero AI Help button for instant navigation help, posting guidance, and marketplace explanations.
                            </p>
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new Event("needaro-open-assistant"))}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#0a8f45] px-5 py-3 text-sm font-black text-[#0a8f45] transition hover:bg-[#e9f9f0]"
                            >
                                <MessageSquare size={16} />
                                Open AI support
                            </button>
                        </div>

                        <div className="rounded-[30px] border border-[#dfe8e3] bg-[#083b25] p-6 text-white shadow-sm">
                            <Mail size={24} />
                            <h2 className="mt-5 text-xl font-black">Customer support email</h2>
                            <p className="mt-2 text-sm leading-6 text-white/70">Temporary MVP contact:</p>
                            <p className="mt-3 rounded-2xl bg-white/10 px-4 py-3 font-black">needroofficial@gmail.com</p>
                        </div>

                        {submitted && (
                            <div className="rounded-[30px] border border-[#bdebd0] bg-[#e9f9f0] p-6 text-[#083b25]">
                                <CheckCircle2 size={26} />
                                <p className="mt-4 font-black">Feedback captured locally for this MVP screen.</p>
                                <p className="mt-2 text-sm leading-6">Next step: wire this form to the backend support inbox when we add admin support.</p>
                            </div>
                        )}
                    </aside>
                </section>
            </div>
        </main>
    );
}
