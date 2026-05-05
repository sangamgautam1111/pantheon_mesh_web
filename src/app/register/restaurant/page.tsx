"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UtensilsCrossed, Upload, CheckCircle2, Loader2, MapPin, Clock, Store } from "lucide-react";
import { ref, push, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

const foodTypes = ["Nepali", "Indian", "Chinese", "Fast Food", "Italian", "Japanese", "Korean", "Bakery & Cafe", "Desserts", "Multi-Cuisine", "Street Food", "Cloud Kitchen", "Other"];
const deliveryOptions = ["Dine-in only", "Delivery only", "Pickup only", "Dine-in + Delivery", "Dine-in + Pickup", "All options"];

const inputClass = "w-full rounded-xl border border-[#dadbdd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a8f45] focus:ring-4 focus:ring-[#0a8f45]/10";
const labelClass = "block text-xs font-bold uppercase tracking-[0.1em] text-[#404145] mb-2";

export default function RestaurantRegistrationPage() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        restaurantName: "",
        ownerName: "",
        phone: "",
        email: "",
        address: "",
        mapLocation: "",
        foodType: "",
        menuDescription: "",
        openingHours: "",
        closingHours: "",
        deliveryOption: "",
        foodLicense: "",
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
        if (!form.restaurantName || !form.ownerName || !form.phone || !form.address || !form.foodType) {
            setError("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const { getDatabase } = await import("firebase/database");
            const db = getDatabase();
            const registrationsRef = ref(db, "partnerRegistrations/restaurant");
            await push(registrationsRef, {
                ...form,
                type: "restaurant",
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
                        Thank you, <strong>{form.restaurantName}</strong>. Our team will review your application and contact you within 24-48 hours.
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
            <section className="relative overflow-hidden bg-gradient-to-br from-[#ff6b35] to-[#f72585] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white">
                        <ArrowLeft size={16} /> Back to Partner Registration
                    </Link>
                    <div className="mt-6 flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <UtensilsCrossed size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black sm:text-4xl">Restaurant Partner Registration</h1>
                            <p className="mt-1 text-white/80">Join Needero and start receiving food orders from nearby customers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <form onSubmit={handleSubmit}>
                    <div className="rounded-3xl border border-[#e4e5e7] bg-white p-6 shadow-sm sm:p-10">
                        <h2 className="text-xl font-black text-[#222325]">Business Details</h2>
                        <p className="mt-1 text-sm text-[#62646a]">Tell us about your restaurant or food business</p>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}>Restaurant Name *</span>
                                <input className={inputClass} value={form.restaurantName} onChange={(e) => update("restaurantName", e.target.value)} placeholder="e.g. Himalayan Kitchen" required />
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
                                <input className={inputClass} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="business@email.com" />
                            </label>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className={labelClass}><MapPin size={12} className="inline mr-1" />Address / Location *</span>
                                <input className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full address with landmark" required />
                            </label>
                            <label>
                                <span className={labelClass}>Food Type *</span>
                                <select className={inputClass} value={form.foodType} onChange={(e) => update("foodType", e.target.value)} required>
                                    <option value="">Select food type</option>
                                    {foodTypes.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className={labelClass}>Delivery / Pickup Option</span>
                                <select className={inputClass} value={form.deliveryOption} onChange={(e) => update("deliveryOption", e.target.value)}>
                                    <option value="">Select option</option>
                                    {deliveryOptions.map((o) => <option key={o}>{o}</option>)}
                                </select>
                            </label>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}><Clock size={12} className="inline mr-1" />Opening Time</span>
                                <input className={inputClass} type="time" value={form.openingHours} onChange={(e) => update("openingHours", e.target.value)} />
                            </label>
                            <label>
                                <span className={labelClass}><Clock size={12} className="inline mr-1" />Closing Time</span>
                                <input className={inputClass} type="time" value={form.closingHours} onChange={(e) => update("closingHours", e.target.value)} />
                            </label>
                        </div>

                        <label className="mt-8 block">
                            <span className={labelClass}>Menu Description / Items</span>
                            <textarea className={`${inputClass} min-h-[120px] resize-y`} value={form.menuDescription} onChange={(e) => update("menuDescription", e.target.value)} placeholder="Describe your menu: popular dishes, price range, specialties..." />
                        </label>

                        <h2 className="mt-10 text-xl font-black text-[#222325]">Documents & Banking</h2>
                        <p className="mt-1 text-sm text-[#62646a]">Required for payment processing and verification</p>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            <label>
                                <span className={labelClass}>Food License / Registration Number</span>
                                <input className={inputClass} value={form.foodLicense} onChange={(e) => update("foodLicense", e.target.value)} placeholder="License or PAN number" />
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
                            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#f72585] px-8 py-4 text-base font-black text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 sm:w-auto"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Store size={18} />}
                            {submitting ? "Registering..." : "Register Restaurant"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
