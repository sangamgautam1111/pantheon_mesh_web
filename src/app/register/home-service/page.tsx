"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BadgeCheck,
    BarChart3,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    Headphones,
    Home,
    Loader2,
    MapPin,
    ShieldCheck,
    Sparkles,
    Store,
    UploadCloud,
    User,
    Zap,
} from "lucide-react";
import { ref, push } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

const serviceCategories = ["Home Cleaning", "Deep Cleaning", "Regular House Cleaning", "Kitchen Cleaning", "Bathroom Cleaning", "Sofa / Carpet Cleaning", "Office Cleaning", "Move-in / Move-out Cleaning", "Post-construction Cleaning", "Multiple Cleaning Services"];
const providerTypes = ["Individual", "Company / Team"];
const timeSlots = ["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 5 PM)", "Evening (5 PM - 9 PM)", "Full Day", "Flexible / On Call", "24/7 Available"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const inputClass = "h-9 w-full rounded-[6px] border border-[#dfe5ea] bg-white px-3 text-[11px] font-semibold text-[#07121f] outline-none transition placeholder:text-[#a4afba] focus:border-[#2457ff] focus:ring-2 focus:ring-[#dfe7ff]";
const textareaClass = "w-full rounded-[6px] border border-[#dfe5ea] bg-white px-3 py-2 text-[11px] font-semibold text-[#07121f] outline-none transition placeholder:text-[#a4afba] focus:border-[#2457ff] focus:ring-2 focus:ring-[#dfe7ff]";
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
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef3ff] text-[11px] font-black text-[#2457ff]">{number}</span>
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
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#eef3ff] text-[#2457ff]">
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
        { label: "Area-based matching", icon: MapPin },
        { label: "Easy lead management", icon: BarChart3 },
        { label: "Grow your local visibility", icon: Zap },
    ];

    const journey = [
        ["Submit Application", "Fill in your details and services."],
        ["Verification", "We verify your documents and details."],
        ["Profile Activation", "Your profile goes live on Needero."],
        ["Start Receiving Leads", "Get matched with local customers."],
    ];

    return (
        <aside className="space-y-4 lg:sticky lg:top-20">
            <SidebarCard title="Why partner with Needero?" copy="Grow your home service business with quality leads from customers in your area.">
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
                        <div className="h-14 w-16 rounded-[8px] bg-[linear-gradient(135deg,#edf4ff,#ffffff)]" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black text-[#07121f]">Reliable Home Services</p>
                            <p className="mt-1 text-[10px] font-medium text-[#7a8793]">Lalitpur, Nepal</p>
                            <div className="mt-1 inline-flex rounded-full bg-[#e8f8ef] px-2 py-0.5 text-[9px] font-black text-[#0a8f45]">Verified Partner</div>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-bold text-[#6b7886]">
                        {["Cleaning", "Deep Clean", "Kitchen", "Bathroom"].map((item) => (
                            <span key={item} className="rounded-full border border-[#dfe5ea] bg-white px-2 py-1">{item}</span>
                        ))}
                    </div>
                    <button className="mt-3 h-8 w-full rounded-[7px] border border-[#dfe5ea] bg-white text-[10px] font-black text-[#07121f]">View Full Profile</button>
                </div>
            </SidebarCard>
        </aside>
    );
}

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
        bankAccountHolderName: "",
        bankAccount: "",
        bankBranch: "",
        esewaNumber: "",
        khaltiNumber: "",
        payoutMethod: "",
        serviceShopPhoto: "",
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
        if (!form.providerName || !form.phone || !form.serviceArea || !form.serviceCategory || !form.serviceShopPhoto || !form.ownerKycType || !form.ownerKycDocument) {
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
            <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4">
                <div className="mx-auto max-w-lg rounded-[12px] border border-[#e1e7ec] bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef3ff]">
                        <CheckCircle2 size={34} className="text-[#2457ff]" />
                    </div>
                    <h1 className="mt-5 text-2xl font-black text-[#07121f]">Registration submitted</h1>
                    <p className="mt-2 text-sm leading-6 text-[#627181]">
                        Thank you, <strong>{form.providerName}</strong>. Our team will review your application and contact you within 24-48 hours.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link href="/register" className="rounded-[8px] border border-[#dfe5ea] bg-white px-5 py-2.5 text-xs font-black text-[#07121f] hover:bg-[#f6f8fa]">
                            Back to Registration
                        </Link>
                        <Link href="/marketplace" className="rounded-[8px] bg-[#2457ff] px-5 py-2.5 text-xs font-black text-white hover:bg-[#1743d4]">
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
                <Link href="/register" className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#526170] hover:text-[#2457ff]">
                    <ArrowLeft size={13} />
                    Back to Partner Registration
                </Link>

                <header className="mt-4 overflow-hidden rounded-[10px] bg-[linear-gradient(90deg,#2563eb,#7c3aed)] px-6 py-6 text-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/20 text-white">
                            <Home size={27} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-[-0.04em]">Home Service Partner Registration</h1>
                            <p className="mt-0.5 text-xs font-medium text-white/80">Join Needero and get booked by customers who need help at their doorstep.</p>
                        </div>
                    </div>
                </header>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <form onSubmit={handleSubmit} className="rounded-[10px] border border-[#e1e7ec] bg-white p-5 shadow-sm">
                        <section>
                            <SectionTitle number="1" title="Provider Details" subtitle="Tell us about your business and service expertise." />
                            <div className="grid gap-3 md:grid-cols-4">
                                <Field label="Service provider / company name *" className="md:col-span-2">
                                    <input className={inputClass} value={form.providerName} onChange={(event) => update("providerName", event.target.value)} placeholder="Enter your business or company name" required />
                                </Field>
                                <Field label="Individual or company *">
                                    <select className={inputClass} value={form.providerType} onChange={(event) => update("providerType", event.target.value)}>
                                        <option value="">Select type</option>
                                        {providerTypes.map((type) => <option key={type}>{type}</option>)}
                                    </select>
                                </Field>
                                <Field label="Phone number *">
                                    <input className={inputClass} type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+977-98XXXXXXXX" required />
                                </Field>
                                <Field label="Email *" className="md:col-span-2">
                                    <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@email.com" />
                                </Field>
                                <Field label="Service area *" className="md:col-span-2">
                                    <input className={inputClass} value={form.serviceArea} onChange={(event) => update("serviceArea", event.target.value)} placeholder="e.g. Kathmandu Valley, Lalitpur, Bhaktapur" required />
                                </Field>
                                <Field label="Category *" className="md:col-span-2">
                                    <select className={inputClass} value={form.serviceCategory} onChange={(event) => update("serviceCategory", event.target.value)} required>
                                        <option value="">Select service category</option>
                                        {serviceCategories.map((category) => <option key={category}>{category}</option>)}
                                    </select>
                                </Field>
                                <Field label="Years of experience *" className="md:col-span-2">
                                    <select className={inputClass} value={form.experience} onChange={(event) => update("experience", event.target.value)}>
                                        <option value="">Select experience</option>
                                        <option>Less than 1 year</option>
                                        <option>1-3 years</option>
                                        <option>3-5 years</option>
                                        <option>5-10 years</option>
                                        <option>10+ years</option>
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section className="mt-7 border-t border-[#edf2f5] pt-5">
                            <SectionTitle number="2" title="Availability & Service Setup" subtitle="Help customers know when and how to hire you." />
                            <div className="grid gap-3 md:grid-cols-4">
                                <Field label="Available time slots *">
                                    <select className={inputClass} value={form.availableSlots} onChange={(event) => update("availableSlots", event.target.value)}>
                                        <option value="">Select time slots</option>
                                        {timeSlots.map((slot) => <option key={slot}>{slot}</option>)}
                                    </select>
                                </Field>
                                <Field label="Emergency service available">
                                    <select className={inputClass}>
                                        <option>Select option</option>
                                        <option>Yes</option>
                                        <option>No</option>
                                        <option>Depends on location</option>
                                    </select>
                                </Field>
                                <Field label="Home visit fee (NPR)">
                                    <input className={inputClass} value={form.homeVisitFee} onChange={(event) => update("homeVisitFee", event.target.value)} placeholder="e.g. 200, Free" />
                                </Field>
                                <Field label="Preferred service radius">
                                    <input className={inputClass} placeholder="e.g. 10 km, 15 km" />
                                </Field>
                                <div className="md:col-span-4">
                                    <span className={labelClass}>Days available *</span>
                                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                                        {days.map((day) => (
                                            <button key={day} type="button" className="h-8 rounded-[6px] border border-[#ccd7ff] bg-[#f7f9ff] text-[10px] font-black text-[#2457ff]">
                                                <Check size={11} className="mr-1 inline" />
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mt-7 border-t border-[#edf2f5] pt-5">
                            <SectionTitle number="3" title="Verification & Payout" subtitle="Required for secure payouts, service photos, and owner identity verification." />
                            <div className="grid gap-3 md:grid-cols-4">
                                <UploadField
                                    label="Service shop / team photo *"
                                    value={form.serviceShopPhoto}
                                    onChange={(value) => update("serviceShopPhoto", value)}
                                    helper="Upload a clear service/team/shop photo for verification."
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
                                <Field label="ID proof / citizenship / PAN *">
                                    <input className={inputClass} value={form.idProof} onChange={(event) => update("idProof", event.target.value)} placeholder="Enter ID number" />
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
                                <Field label="Bank name *">
                                    <input className={inputClass} value={form.bankName} onChange={(event) => update("bankName", event.target.value)} placeholder="e.g. NICA Asia, Global IME" />
                                </Field>
                                <Field label="Bank account number">
                                    <input className={inputClass} value={form.bankAccount} onChange={(event) => update("bankAccount", event.target.value)} placeholder="Enter account number" />
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
                                    <textarea className={`${textareaClass} min-h-16 resize-y`} value={form.verificationNote} onChange={(event) => update("verificationNote", event.target.value)} placeholder="Add any additional info to help us verify your application." />
                                </Field>
                            </div>
                        </section>

                        <section className="mt-7 border-t border-[#edf2f5] pt-5">
                            <SectionTitle number="4" title="Business Profile" subtitle="Tell customers why they should choose your services." />
                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="Short business description *">
                                    <textarea className={`${textareaClass} min-h-20 resize-y`} value={form.additionalNotes} onChange={(event) => update("additionalNotes", event.target.value)} placeholder="Briefly describe your business, team, and experience." />
                                </Field>
                                <Field label="Services offered *">
                                    <textarea className={`${textareaClass} min-h-20 resize-y`} placeholder="e.g. Cleaning, deep cleaning, sofa cleaning" />
                                </Field>
                                <Field label="Why customers should choose you *">
                                    <textarea className={`${textareaClass} min-h-20 resize-y`} placeholder="What makes your service reliable and different?" />
                                </Field>
                            </div>
                        </section>

                        {error && <div className="mt-5 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700">{error}</div>}

                        <div className="mt-5 flex flex-col gap-3 border-t border-[#edf2f5] pt-4 sm:flex-row sm:items-center">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(90deg,#2563eb,#7c3aed)] px-5 text-xs font-black text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Store size={15} />}
                                {submitting ? "Submitting..." : "Register Home Service Partner"}
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
