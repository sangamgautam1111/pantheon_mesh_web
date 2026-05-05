"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, CheckCircle2, Loader2, MapPin, Wrench, Store } from "lucide-react";
import { ref, push } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

const repairCategories = ["Mobile Phone", "Laptop / Computer", "Tablet / iPad", "Smart Watch", "Television", "Electronics", "Home Appliances", "Bike / Scooter", "Multiple Categories"];
const brandOptions = ["Apple", "Samsung", "Xiaomi / Redmi", "OnePlus", "Vivo", "OPPO", "Realme", "HP", "Dell", "Lenovo", "Asus", "All Brands"];

const inputClass = "w-full rounded-xl border border-[#dadbdd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a8f45] focus:ring-4 focus:ring-[#0a8f45]/10";
const labelClass = "block text-xs font-bold uppercase tracking-[0.1em] text-[#404145] mb-2";

export default function RepairShopRegistrationPage() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        shopName: "",
        ownerName: "",
        phone: "",
        email: "",
        shopAddress: "",
        repairCategory: "",
        brandsHandled: "",
        pickupDrop: "",
        warrantyOffered: "",
        priceList: "",
        businessDocuments: "",
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
        if (!form.shopName || !form.ownerName || !form.phone || !form.shopAddress || !form.repairCategory) {
            setError("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const { getDatabase } = await import("firebase/database");
            const db = getDatabase();
            const registrationsRef = ref(db, "partnerRegistrations/repairShop");
            await push(registrationsRef, {
                ...form,
                type: "repair-shop",
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
                        Thank you, <strong>{form.shopName}</strong>. Our team will review your application and contact you within 24-48 hours.
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
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0a8f45] to-[#38b000] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white">
                        <ArrowLeft size={16} /> Back to Partner Registration
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Smartphone size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black sm:text-4xl">Repair Shop Partner Registration</h1>
                            <p className="mt-1 text-white/80">Join Needero and get repair leads from customers near your shop</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <form onSubmit={handleSubmit}>
                    <div className="rounded-3xl border border-[#e4e5e7] bg-white p-6 shadow-sm sm:p-10">
                        <h2 className="text-xl font-black text-[#222325]">Shop Details</h2>
                        <p className="mt-1 text-sm text-[#62646a]">Tell us about your repair business</p>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}>Shop Name *</span>
                                <input className={inputClass} value={form.shopName} onChange={(e) => update("shopName", e.target.value)} placeholder="e.g. QuickFix Mobile Repair" required />
                            </label>
                            <label>
                                <span className={labelClass}>Owner Name *</span>
                                <input className={inputClass} value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} placeholder="Full name" required />
                            </label>
                            <label>
                                <span className={labelClass}>Phone Number *</span>
                                <input className={inputClass} type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977-98XXXXXXXX" required />
                            </label>
                            <label>
                                <span className={labelClass}>Email</span>
                                <input className={inputClass} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="shop@email.com" />
                            </label>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className={labelClass}><MapPin size={12} className="inline mr-1" />Shop Address *</span>
                                <input className={inputClass} value={form.shopAddress} onChange={(e) => update("shopAddress", e.target.value)} placeholder="Full address with landmark" required />
                            </label>
                            <label>
                                <span className={labelClass}><Wrench size={12} className="inline mr-1" />Repair Category *</span>
                                <select className={inputClass} value={form.repairCategory} onChange={(e) => update("repairCategory", e.target.value)} required>
                                    <option value="">Select category</option>
                                    {repairCategories.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Brands Handled</span>
                                <select className={inputClass} value={form.brandsHandled} onChange={(e) => update("brandsHandled", e.target.value)}>
                                    <option value="">Select brands</option>
                                    {brandOptions.map((b) => <option key={b}>{b}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Pickup / Drop Available?</span>
                                <select className={inputClass} value={form.pickupDrop} onChange={(e) => update("pickupDrop", e.target.value)}>
                                    <option value="">Select</option>
                                    <option>Yes — Free pickup & drop</option>
                                    <option>Yes — Paid pickup & drop</option>
                                    <option>No — Customer visits shop</option>
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Warranty Offered?</span>
                                <select className={inputClass} value={form.warrantyOffered} onChange={(e) => update("warrantyOffered", e.target.value)}>
                                    <option value="">Select</option>
                                    <option>Yes — 30 days</option>
                                    <option>Yes — 90 days</option>
                                    <option>Yes — 6 months</option>
                                    <option>Yes — 1 year</option>
                                    <option>No warranty</option>
                                    <option>Depends on repair</option>
                                </select>
                            </label>
                        </div>

                        <label className="mt-8 block">
                            <span className={labelClass}>Price List / Common Repairs</span>
                            <textarea className={`${inputClass} min-h-[120px] resize-y`} value={form.priceList} onChange={(e) => update("priceList", e.target.value)} placeholder="e.g. Screen replacement: NPR 3000-8000, Battery: NPR 1500-3000..." />
                        </label>

                        <h2 className="mt-10 text-xl font-black text-[#222325]">Documents & Banking</h2>
                        <p className="mt-1 text-sm text-[#62646a]">Required for payment processing and verification</p>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}>Business Documents / PAN</span>
                                <input className={inputClass} value={form.businessDocuments} onChange={(e) => update("businessDocuments", e.target.value)} placeholder="PAN or registration number" />
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
                            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a8f45] to-[#38b000] px-8 py-4 text-base font-black text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 sm:w-auto"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Store size={18} />}
                            {submitting ? "Registering..." : "Register Repair Shop"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
