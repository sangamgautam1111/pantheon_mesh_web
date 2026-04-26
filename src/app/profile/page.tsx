"use client";

import Link from "next/link";
import {
    Briefcase,
    CheckCircle2,
    CreditCard,
    MapPin,
    MessageSquare,
    ShieldCheck,
    Store,
    UserRound,
    type LucideIcon,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";

type ChecklistItem = {
    label: string;
    done: boolean;
    weight: number;
};

function completion(items: ChecklistItem[]) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    const done = items.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
}

function ProgressCard({
    title,
    message,
    items,
}: {
    title: string;
    message: string;
    items: ChecklistItem[];
}) {
    const percent = completion(items);

    return (
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Profile completion
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                    <p className="text-2xl font-black">{percent}%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">complete</p>
                </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950" style={{ width: `${percent}%` }} />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className={item.done ? "text-emerald-600" : "text-slate-300"} />
                            <p className="text-sm font-bold">{item.label}</p>
                        </div>
                        <span className="text-xs font-black text-slate-400">+{item.weight}%</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function InfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon size={20} />
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-black leading-6">{value}</p>
        </div>
    );
}

export default function ProfilePage() {
    const { profile, accountType } = useAuth();
    const isBusiness = accountType === "business";
    const displayName = profile?.displayName || (isBusiness ? "Local Business" : "Customer");
    const email = profile?.email || "Email not added";
    const photo = profile?.photoURL || "";
    const businessName = profile?.companyName || displayName;
    const plan = profile?.currentPlanId || "free";

    const customerChecklist: ChecklistItem[] = [
        { label: "Add profile photo", done: Boolean(photo), weight: 15 },
        { label: "Verify phone number", done: false, weight: 20 },
        { label: "Add location", done: false, weight: 15 },
        { label: "Add saved address", done: false, weight: 15 },
        { label: "Add email", done: Boolean(profile?.email), weight: 15 },
        { label: "Complete first Need", done: false, weight: 20 },
    ];

    const businessChecklist: ChecklistItem[] = [
        { label: "Add business logo", done: Boolean(photo), weight: 10 },
        { label: "Add business name", done: Boolean(businessName), weight: 10 },
        { label: "Add category", done: false, weight: 10 },
        { label: "Add location/map", done: false, weight: 15 },
        { label: "Add opening hours", done: false, weight: 10 },
        { label: "Add services/products", done: false, weight: 15 },
        { label: "Add warranty policy", done: false, weight: 10 },
        { label: "Add shop photos", done: false, weight: 10 },
        { label: "Verify phone/email", done: Boolean(profile?.email), weight: 10 },
    ];

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-slate-950 text-3xl font-black text-white">
                                    {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        {isBusiness ? "Business Profile" : "Customer Profile"}
                                    </p>
                                    <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
                                        {isBusiness ? businessName : displayName}
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
                                        {isBusiness
                                            ? "Complete your profile to earn customer trust and rank higher in recommendations."
                                            : "Complete your profile to get faster and safer Offers from nearby businesses."}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={isBusiness ? "/marketplace" : "/client/new"}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white"
                            >
                                {isBusiness ? <Briefcase size={17} /> : <MessageSquare size={17} />}
                                {isBusiness ? "Open Lead Pipeline" : "Post a Need"}
                            </Link>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-4">
                        <InfoTile icon={UserRound} label="Basic info" value={`${displayName} - ${email}`} />
                        <InfoTile icon={MapPin} label="Location" value="City, area, saved addresses" />
                        <InfoTile icon={ShieldCheck} label="Trust" value={profile?.email ? "Email ready" : "Verify phone/email"} />
                        <InfoTile icon={CreditCard} label={isBusiness ? "Subscription" : "Payments later"} value={isBusiness ? plan : "Saved cards and refunds later"} />
                    </section>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                        <ProgressCard
                            title={isBusiness ? "Business Profile" : "Profile"}
                            message={isBusiness
                                ? "Better profile equals more trust, better ranking, and more selected Bookings."
                                : "Keep it light. Add only the information that helps businesses quote safely."}
                            items={isBusiness ? businessChecklist : customerChecklist}
                        />

                        {isBusiness ? (
                            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Mini website preview</p>
                                        <h2 className="mt-2 text-2xl font-black">{businessName}</h2>
                                        <p className="mt-2 text-sm font-semibold text-slate-500">Verified-ready profile after checklist completion</p>
                                    </div>
                                    <Store size={28} />
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {["Verified badge", "4.8 rating later", "1.2 km away later", "96% on-time later"].map((item) => (
                                        <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-6 grid gap-3 md:grid-cols-3">
                                    {[
                                        ["Overview", "Description, location, hours"],
                                        ["Services", "Service menu and starting prices"],
                                        ["Products", "Accessories and local products"],
                                        ["Reviews", "Customer feedback"],
                                        ["Offers", "Active Quotes by this business"],
                                        ["Trust", "Verification, warranty, on-time score"],
                                    ].map(([title, copy]) => (
                                        <div key={title} className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm font-black">{title}</p>
                                            <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Customer workspace</p>
                                <h2 className="mt-2 text-2xl font-black">Simple profile, safer Offers.</h2>
                                <div className="mt-6 grid gap-3 md:grid-cols-2">
                                    {[
                                        ["My Needs", "Active, completed, and cancelled Needs"],
                                        ["Orders / Bookings", "Booked local services and products"],
                                        ["Reviews", "Reviews given to businesses"],
                                        ["Safety", "Hidden contact settings and reports"],
                                    ].map(([title, copy]) => (
                                        <div key={title} className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm font-black">{title}</p>
                                            <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </RouteGuard>
    );
}
