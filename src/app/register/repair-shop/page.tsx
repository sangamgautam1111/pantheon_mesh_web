"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BadgeCheck,
    BarChart3,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Headphones,
    Loader2,
    MapPin,
    ShieldCheck,
    Smartphone,
    Store,
    UploadCloud,
    Wrench,
    Zap,
} from "lucide-react";
import { ref, push } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

const repairCategories = ["Mobile Phone", "Screen Replacement", "Battery Replacement", "Charging Port Repair", "Speaker / Mic Repair", "Camera Repair", "Water Damage", "Software / Unlock Help", "Multiple Mobile Repairs"];
const brandOptions = ["Apple", "Samsung", "Xiaomi / Redmi", "OnePlus", "Vivo", "OPPO", "Realme", "All Mobile Brands"];

const inputClass = "h-9 w-full rounded-[6px] border border-[#dfe5ea] bg-white px-3 text-[11px] font-semibold text-[#07121f] outline-none transition placeholder:text-[#a4afba] focus:border-[#0a8f45] focus:ring-2 focus:ring-[#dff6e8]";
const textareaClass = "w-full rounded-[6px] border border-[#dfe5ea] bg-white px-3 py-2 text-[11px] font-semibold text-[#07121f] outline-none transition placeholder:text-[#a4afba] focus:border-[#0a8f45] focus:ring-2 focus:ring-[#dff6e8]";
const labelClass = "mb-1.5 block text-[9px] font-black uppercase tracking-[0.12em] text-[#536170]";
const kycDocumentTypes = ["Passport", "Driving License", "Identity Card", "Citizenship Card", "Other Government ID"];

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsDataURL(file);
    });
}

function SectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
    return (
        <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f8ef] text-[11px] font-black text-[#0a8f45]">{number}</span>
            <div>
                <h2 className="text-sm font-black text-[#07121f]">{title}</h2>
                <p className="text-[10px] font-medium text-[#7a8793]">{subtitle}</p>
            </div>
        </div>
    );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={className}>
            <span className={labelClass}>{label}</span>
            {children}
        </label>
    );
}

function UploadField({
    label,
    value,
    onChange,
    helper,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helper: string;
}) {
    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        onChange(await readFileAsDataUrl(file));
    };

    return (
        <label className="block rounded-[8px] border border-dashed border-[#cfd8df] bg-[#fbfffd] p-3">
            <span className={labelClass}>{label}</span>
            <input type="file" accept="image/*,application/pdf,.pdf" onChange={handleFile} className="hidden" />
            <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#e8f8ef] text-[#0a8f45]">
                    <UploadCloud size={17} />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-black text-[#07121f]">{value ? "File attached" : "Click to upload"}</p>
                    <p className="text-[10px] font-medium leading-4 text-[#7a8793]">{helper}</p>
                </div>
            </div>
        </label>
    );
}

function SidebarCard({
    title,
    copy,
    children,
}: {
    title: string;
    copy?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[10px] border border-[#e1e7ec] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-black text-[#07121f]">{title}</h3>
            {copy && <p className="mt-1 text-[10px] font-medium leading-4 text-[#72808e]">{copy}</p>}
            <div className="mt-3">{children}</div>
        </section>
    );
}

function PartnerSidebar() {
    const benefitCards = [
        { label: "Verified customer leads", icon: ShieldCheck },
        { label: "Zero commission start", icon: CheckCircle2 },
        { label: "Easy lead management", icon: BarChart3 },
        { label: "Grow your local visibility", icon: Zap },
    ];

    const journey = [
        ["Submit Application", "Fill in your details and services."],
        ["Verification", "Our team verifies your documents and details."],
        ["Profile Activation", "Your profile goes live on Needero."],
        ["Start Receiving Leads", "Get repair leads and grow your business."],
    ];

    return (
        <aside className="space-y-4 lg:sticky lg:top-20">
            <SidebarCard title="Why partner with Needero?" copy="Grow your repair business with quality leads from customers in your area.">
                <div className="grid grid-cols-2 gap-2">
                    {benefitCards.map((item) => (
                        <div key={item.label} className="rounded-[8px] border border-[#edf2ef] bg-[#fbfffd] p-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#e8f8ef] text-[#0a8f45]">
                                <item.icon size={14} />
                            </div>
                            <p className="mt-2 text-[10px] font-black leading-4 text-[#405060]">{item.label}</p>
                        </div>
                    ))}
                </div>
            </SidebarCard>

            <SidebarCard title="Your onboarding journey">
                <div className="space-y-3">
                    {journey.map(([title, copy], index) => (
                        <div key={title} className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0a8f45] text-[10px] font-black text-white">{index + 1}</span>
                            <div>
                                <p className="text-[11px] font-black text-[#07121f]">{title}</p>
                                <p className="text-[10px] font-medium leading-4 text-[#7a8793]">{copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </SidebarCard>

            <SidebarCard title="Trusted & Secure">
                <div className="flex gap-3 rounded-[8px] border border-[#dfe8ff] bg-[#f7faff] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2457ff] shadow-sm">
                        <BadgeCheck size={19} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-[#07121f]">ISO 27001 Infrastructure Security</p>
                        <p className="mt-1 text-[10px] font-medium leading-4 text-[#72808e]">Your data and documents are encrypted and safe with us.</p>
                    </div>
                </div>
            </SidebarCard>

            <SidebarCard title="Profile preview (Example)">
                <div className="rounded-[9px] border border-[#e5eaef] bg-[#fbfcfd] p-3">
                    <div className="flex gap-3">
                        <div className="h-14 w-16 rounded-[8px] bg-[linear-gradient(135deg,#e7f8ee,#ffffff)]" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black text-[#07121f]">QuickFix Mobile Repair</p>
                            <p className="mt-1 text-[10px] font-medium text-[#7a8793]">New Road, Kathmandu</p>
                            <div className="mt-1 inline-flex rounded-full bg-[#e8f8ef] px-2 py-0.5 text-[9px] font-black text-[#0a8f45]">Verified Partner</div>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-bold text-[#6b7886]">
                        {["Screen Repair", "Battery", "Water Damage"].map((item) => (
                            <span key={item} className="rounded-full border border-[#dfe5ea] bg-white px-2 py-1">{item}</span>
                        ))}
                    </div>
                    <button className="mt-3 h-8 w-full rounded-[7px] bg-[#0a8f45] text-[10px] font-black text-white">Request Repair</button>
                </div>
            </SidebarCard>
        </aside>
    );
}

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
        bankAccountHolderName: "",
        bankAccount: "",
        bankBranch: "",
        esewaNumber: "",
        khaltiNumber: "",
        payoutMethod: "",
        shopPhoto: "",
        ownerKycType: "",
        ownerKycNumber: "",
        ownerKycDocument: "",
        businessDocumentFile: "",
        verificationNote: "",
        additionalNotes: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.shopName || !form.ownerName || !form.phone || !form.shopAddress || !form.repairCategory || !form.shopPhoto || !form.ownerKycType || !form.ownerKycDocument) {
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
            <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4">
                <div className="mx-auto max-w-lg rounded-[12px] border border-[#e1e7ec] bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f8ef]">
                        <CheckCircle2 size={34} className="text-[#0a8f45]" />
                    </div>
                    <h1 className="mt-5 text-2xl font-black text-[#07121f]">Registration submitted</h1>
                    <p className="mt-2 text-sm leading-6 text-[#627181]">
                        Thank you, <strong>{form.shopName}</strong>. Our team will review your application and contact you within 24-48 hours.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link href="/register" className="rounded-[8px] border border-[#dfe5ea] bg-white px-5 py-2.5 text-xs font-black text-[#07121f] hover:bg-[#f6f8fa]">
                            Back to Registration
                        </Link>
                        <Link href="/marketplace" className="rounded-[8px] bg-[#0a8f45] px-5 py-2.5 text-xs font-black text-white hover:bg-[#08783b]">
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f9fb] text-[#07121f]">
            <div className="mx-auto max-w-[1180px] px-4 py-5 md:px-6">
                <Link href="/register" className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#526170] hover:text-[#0a8f45]">
                    <ArrowLeft size={13} />
                    Back to Partner Registration
                </Link>

                <header className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#e8f8ef] text-[#0a8f45]">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-[-0.04em] text-[#07121f]">Repair Shop Partner Registration</h1>
                        <p className="mt-0.5 text-xs font-medium text-[#72808e]">Join Needero and start receiving nearby phone repair leads.</p>
                    </div>
                </header>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form onSubmit={handleSubmit} className="rounded-[10px] border border-[#e1e7ec] bg-white p-5 shadow-sm">
                        <section>
                            <SectionTitle number="1" title="Business Information" subtitle="Tell us about your shop and how customers can reach you." />
                            <div className="grid gap-3 md:grid-cols-4">
                                <Field label="Shop name *">
                                    <input className={inputClass} value={form.shopName} onChange={(event) => update("shopName", event.target.value)} placeholder="e.g. QuickFix Mobile Repair" required />
                                </Field>
                                <Field label="Owner name *">
                                    <input className={inputClass} value={form.ownerName} onChange={(event) => update("ownerName", event.target.value)} placeholder="Full name" required />
                                </Field>
                                <Field label="Phone number *">
                                    <input className={inputClass} type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+977-98XXXXXXXX" required />
                                </Field>
                                <Field label="Email address">
                                    <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@email.com" />
                                </Field>
                                <Field label="Shop address *" className="md:col-span-2">
                                    <input className={inputClass} value={form.shopAddress} onChange={(event) => update("shopAddress", event.target.value)} placeholder="Full address, building, landmark" required />
                                </Field>
                                <Field label="City / area" className="md:col-span-2">
                                    <input className={inputClass} placeholder="e.g. Kathmandu, New Baneshwor" />
                                </Field>
                            </div>
                        </section>

                        <section className="mt-7 border-t border-[#edf2f5] pt-5">
                            <SectionTitle number="2" title="Repair Services" subtitle="Share the services you provide and your shop specialties." />
                            <div className="grid gap-3 md:grid-cols-4">
                                <Field label="Repair category *">
                                    <select className={inputClass} value={form.repairCategory} onChange={(event) => update("repairCategory", event.target.value)} required>
                                        <option value="">Select repair category</option>
                                        {repairCategories.map((category) => <option key={category}>{category}</option>)}
                                    </select>
                                </Field>
                                <Field label="Brands handled">
                                    <select className={inputClass} value={form.brandsHandled} onChange={(event) => update("brandsHandled", event.target.value)}>
                                        <option value="">Select brands</option>
                                        {brandOptions.map((brand) => <option key={brand}>{brand}</option>)}
                                    </select>
                                </Field>
                                <Field label="Pickup / drop availability">
                                    <select className={inputClass} value={form.pickupDrop} onChange={(event) => update("pickupDrop", event.target.value)}>
                                        <option value="">Select option</option>
                                        <option>Yes - Free pickup & drop</option>
                                        <option>Yes - Paid pickup & drop</option>
                                        <option>No - Customer visits shop</option>
                                    </select>
                                </Field>
                                <Field label="Home visit availability">
                                    <select className={inputClass}>
                                        <option>Select option</option>
                                        <option>Available</option>
                                        <option>Limited areas only</option>
                                        <option>Not available</option>
                                    </select>
                                </Field>
                                <Field label="Warranty offered">
                                    <select className={inputClass} value={form.warrantyOffered} onChange={(event) => update("warrantyOffered", event.target.value)}>
                                        <option value="">Select warranty</option>
                                        <option>Yes - 30 days</option>
                                        <option>Yes - 90 days</option>
                                        <option>Yes - 6 months</option>
                                        <option>Yes - 1 year</option>
                                        <option>No warranty</option>
                                        <option>Depends on repair</option>
                                    </select>
                                </Field>
                                <Field label="Opening hours">
                                    <input className={inputClass} placeholder="09:00 AM" />
                                </Field>
                                <Field label="Closing hours">
                                    <input className={inputClass} placeholder="07:00 PM" />
                                </Field>
                                <label className="flex items-end gap-2 pb-2 text-[10px] font-black text-[#536170]">
                                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#cfd8df] text-[#0a8f45]" />
                                    Open 24 hours
                                </label>
                                <Field label="Popular services / price list" className="md:col-span-4">
                                    <textarea className={`${textareaClass} min-h-20 resize-y`} value={form.priceList} onChange={(event) => update("priceList", event.target.value)} placeholder="List common services with starting prices, e.g. screen replacement NPR 3000-8000, battery NPR 1500-3000." />
                                </Field>
                            </div>
                        </section>

                        <section className="mt-7 border-t border-[#edf2f5] pt-5">
                            <SectionTitle number="3" title="Payout & Verification" subtitle="Provide shop photo, owner KYC, legal documents, and payout details." />
                            <div className="grid gap-3 md:grid-cols-4">
                                <UploadField
                                    label="Service shop photo *"
                                    value={form.shopPhoto}
                                    onChange={(value) => update("shopPhoto", value)}
                                    helper="Upload a clear shop/front/service photo for verification."
                                />
                                <UploadField
                                    label="Business legal document / PAN"
                                    value={form.businessDocumentFile}
                                    onChange={(value) => update("businessDocumentFile", value)}
                                    helper="PAN, business registration, or other legal document."
                                />
                                <UploadField
                                    label="Owner KYC document *"
                                    value={form.ownerKycDocument}
                                    onChange={(value) => update("ownerKycDocument", value)}
                                    helper="Passport, driving license, identity card, or citizenship."
                                />
                                <Field label="KYC document type *">
                                    <select className={inputClass} value={form.ownerKycType} onChange={(event) => update("ownerKycType", event.target.value)}>
                                        <option value="">Select KYC type</option>
                                        {kycDocumentTypes.map((type) => <option key={type}>{type}</option>)}
                                    </select>
                                </Field>
                                <Field label="Business document / PAN">
                                    <input className={inputClass} value={form.businessDocuments} onChange={(event) => update("businessDocuments", event.target.value)} placeholder="PAN or registration no." />
                                </Field>
                                <Field label="KYC ID number">
                                    <input className={inputClass} value={form.ownerKycNumber} onChange={(event) => update("ownerKycNumber", event.target.value)} placeholder="Document / ID number" />
                                </Field>
                                <Field label="Payout method">
                                    <select className={inputClass} value={form.payoutMethod} onChange={(event) => update("payoutMethod", event.target.value)}>
                                        <option>Select payout method</option>
                                        <option>Bank transfer</option>
                                        <option>eSewa</option>
                                        <option>Khalti</option>
                                        <option>Bank + wallet backup</option>
                                    </select>
                                </Field>
                                <Field label="Account holder name">
                                    <input className={inputClass} value={form.bankAccountHolderName} onChange={(event) => update("bankAccountHolderName", event.target.value)} placeholder="Name as per bank/wallet" />
                                </Field>
                                <Field label="Bank name">
                                    <input className={inputClass} value={form.bankName} onChange={(event) => update("bankName", event.target.value)} placeholder="e.g. NICA Asia, Global IME" />
                                </Field>
                                <Field label="Bank account number">
                                    <input className={inputClass} value={form.bankAccount} onChange={(event) => update("bankAccount", event.target.value)} placeholder="Account number or wallet ID" />
                                </Field>
                                <Field label="Bank branch">
                                    <input className={inputClass} value={form.bankBranch} onChange={(event) => update("bankBranch", event.target.value)} placeholder="Branch name" />
                                </Field>
                                <Field label="eSewa number">
                                    <input className={inputClass} value={form.esewaNumber} onChange={(event) => update("esewaNumber", event.target.value)} placeholder="98XXXXXXXX" />
                                </Field>
                                <Field label="Khalti number">
                                    <input className={inputClass} value={form.khaltiNumber} onChange={(event) => update("khaltiNumber", event.target.value)} placeholder="98XXXXXXXX" />
                                </Field>
                                <Field label="Optional verification note" className="md:col-span-4">
                                    <textarea className={`${textareaClass} min-h-16 resize-y`} value={form.verificationNote} onChange={(event) => update("verificationNote", event.target.value)} placeholder="Add any additional information or note for our verification team." />
                                </Field>
                            </div>
                        </section>

                        <section className="mt-7 border-t border-[#edf2f5] pt-5">
                            <SectionTitle number="4" title="Final Notes" subtitle="Tell customers why they should choose your shop." />
                            <Field label="Business description">
                                <textarea className={`${textareaClass} min-h-20 resize-y`} value={form.additionalNotes} onChange={(event) => update("additionalNotes", event.target.value)} placeholder="Describe your shop, experience, warranty, and what makes your service reliable." />
                            </Field>
                        </section>

                        {error && <div className="mt-5 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700">{error}</div>}

                        <div className="mt-5 flex flex-col gap-3 border-t border-[#edf2f5] pt-4 sm:flex-row sm:items-center">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#0a8f45] px-5 text-xs font-black text-white shadow-sm transition hover:bg-[#08783b] disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Store size={15} />}
                                {submitting ? "Submitting..." : "Submit Repair Shop Application"}
                            </button>
                            <p className="flex items-center gap-2 text-[10px] font-semibold text-[#7a8793]">
                                <Clock size={13} />
                                Our team will review your application and get back to you within 24-48 hours.
                            </p>
                        </div>
                    </form>

                    <PartnerSidebar />
                </div>
            </div>
        </main>
    );
}
