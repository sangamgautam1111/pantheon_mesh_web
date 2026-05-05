"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, CheckCircle2, Loader2, MapPin, Clock, Store, User } from "lucide-react";
import { ref, push } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

const serviceCategories = ["Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry", "AC / Refrigeration", "Pest Control", "Gardening", "Moving & Packing", "Interior Design", "Masonry", "Multiple Services"];
const providerTypes = ["Individual", "Company / Team"];
const timeSlots = ["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 5 PM)", "Evening (5 PM - 9 PM)", "Full Day", "Flexible / On Call", "24/7 Available"];

const inputClass = "w-full rounded-xl border border-[#dadbdd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a8f45] focus:ring-4 focus:ring-[#0a8f45]/10";
const labelClass = "block text-xs font-bold uppercase tracking-[0.1em] text-[#404145] mb-2";

export default function HomeServiceRegistrationPage() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        providerName: "",
        providerType: "",
        phone: "",
        email: "",
        serviceArea: "",
        serviceCategory: "",
        experience: "",
        availableSlots: "",
        homeVisitFee: "",
        idProof: "",
        bankName: "",
        bankAccount: "",
        additionalNotes: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.providerName || !form.phone || !form.serviceArea || !form.serviceCategory) {
            setError("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const { getDatabase } = await import("firebase/database");
            const db = getDatabase();
            const registrationsRef = ref(db, "partnerRegistrations/homeService");
            await push(registrationsRef, {
                ...form,
                type: "home-service",
                userId: user?.uid || null,
                status: "pending",
                createdAt: new Date().toISOString(),
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err?.message || "Registration failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
                <div className="mx-auto max-w-lg text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0a8f45]/10">
                        <CheckCircle2 size={40} className="text-[#0a8f45]" />
                    </div>
                    <h1 className="mt-6 text-3xl font-black text-[#222325]">Registration Submitted!</h1>
                    <p className="mt-3 text-[#62646a]">
                        Thank you, <strong>{form.providerName}</strong>. Our team will review your application and contact you within 24-48 hours.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link href="/register" className="rounded-xl border border-[#dadbdd] bg-white px-6 py-3 text-sm font-bold text-[#222325] hover:bg-[#f5f5f5]">
                            Back to Registration
                        </Link>
                        <Link href="/marketplace" className="rounded-xl bg-[#0a8f45] px-6 py-3 text-sm font-bold text-white hover:bg-[#08783b]">
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white">
                        <ArrowLeft size={16} /> Back to Partner Registration
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Home size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black sm:text-4xl">Home Service Partner Registration</h1>
                            <p className="mt-1 text-white/80">Join Needero and get booked by customers who need help at their doorstep</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <form onSubmit={handleSubmit}>
                    <div className="rounded-3xl border border-[#e4e5e7] bg-white p-6 shadow-sm sm:p-10">
                        <h2 className="text-xl font-black text-[#222325]">Service Provider Details</h2>
                        <p className="mt-1 text-sm text-[#62646a]">Tell us about yourself or your company</p>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}><User size={12} className="inline mr-1" />Service Provider / Company Name *</span>
                                <input className={inputClass} value={form.providerName} onChange={(e) => update("providerName", e.target.value)} placeholder="Your name or company name" required />
                            </label>
                            <label>
                                <span className={labelClass}>Individual or Company</span>
                                <select className={inputClass} value={form.providerType} onChange={(e) => update("providerType", e.target.value)}>
                                    <option value="">Select type</option>
                                    {providerTypes.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Phone Number *</span>
                                <input className={inputClass} type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977-98XXXXXXXX" required />
                            </label>
                            <label>
                                <span className={labelClass}>Email</span>
                                <input className={inputClass} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="provider@email.com" />
                            </label>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className={labelClass}><MapPin size={12} className="inline mr-1" />Service Area *</span>
                                <input className={inputClass} value={form.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} placeholder="e.g. Kathmandu Valley, Lalitpur, Bhaktapur" required />
                            </label>
                            <label>
                                <span className={labelClass}>Service Category *</span>
                                <select className={inputClass} value={form.serviceCategory} onChange={(e) => update("serviceCategory", e.target.value)} required>
                                    <option value="">Select category</option>
                                    {serviceCategories.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Experience</span>
                                <select className={inputClass} value={form.experience} onChange={(e) => update("experience", e.target.value)}>
                                    <option value="">Select experience</option>
                                    <option>Less than 1 year</option>
                                    <option>1-3 years</option>
                                    <option>3-5 years</option>
                                    <option>5-10 years</option>
                                    <option>10+ years</option>
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}><Clock size={12} className="inline mr-1" />Available Time Slots</span>
                                <select className={inputClass} value={form.availableSlots} onChange={(e) => update("availableSlots", e.target.value)}>
                                    <option value="">Select time</option>
                                    {timeSlots.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Home Visit Fee</span>
                                <input className={inputClass} value={form.homeVisitFee} onChange={(e) => update("homeVisitFee", e.target.value)} placeholder="e.g. NPR 200, Free for nearby areas" />
                            </label>
                        </div>

                        <h2 className="mt-10 text-xl font-black text-[#222325]">Documents & Banking</h2>
                        <p className="mt-1 text-sm text-[#62646a]">Required for payment processing and verification</p>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}>ID Proof / Citizenship Number</span>
                                <input className={inputClass} value={form.idProof} onChange={(e) => update("idProof", e.target.value)} placeholder="Citizenship or PAN number" />
                            </label>
                            <label>
                                <span className={labelClass}>Bank Name</span>
                                <input className={inputClass} value={form.bankName} onChange={(e) => update("bankName", e.target.value)} placeholder="e.g. NIC Asia, Global IME" />
                            </label>
                            <label>
                                <span className={labelClass}>Bank Account Number</span>
                                <input className={inputClass} value={form.bankAccount} onChange={(e) => update("bankAccount", e.target.value)} placeholder="Account number for payouts" />
                            </label>
                        </div>

                        <label className="mt-6 block">
                            <span className={labelClass}>Additional Notes</span>
                            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} placeholder="Anything else you'd like us to know?" />
                        </label>

                        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-8 py-4 text-base font-black text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 sm:w-auto"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Store size={18} />}
                            {submitting ? "Registering..." : "Register Home Service"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
