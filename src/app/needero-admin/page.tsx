"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    Building2,
    CheckCircle2,
    Eye,
    FileText,
    Loader2,
    Lock,
    Phone,
    RefreshCw,
    Search,
    ShieldCheck,
    Store,
    WalletCards,
    XCircle,
} from "lucide-react";

type RegistrationRecord = {
    id: string;
    type: "repairShop" | "homeService";
    registrationType: string;
    data: Record<string, unknown>;
};

const passwordKey = "needero-admin-password";
const statuses = ["all", "pending", "approved", "manual_review", "rejected"] as const;

function text(value: unknown) {
    return typeof value === "string" ? value : "";
}

function dateLabel(value: unknown) {
    const date = new Date(text(value));
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusClass(status: string) {
    if (status === "approved") return "bg-[#e8f8ef] text-[#0a8f45] border-[#bfe8cd]";
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200";
    if (status === "manual_review") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
}

function dataUrl(value: unknown) {
    const raw = text(value);
    return raw.startsWith("data:") || raw.startsWith("http") ? raw : "";
}

function AttachmentLink({ label, value }: { label: string; value: unknown }) {
    const href = dataUrl(value);
    if (!href) {
        return <span className="rounded-[7px] border border-[#e1e7ec] px-2.5 py-1.5 text-[10px] font-black text-[#9aa6b2]">{label}: missing</span>;
    }
    const isImage = href.startsWith("data:image") || /\.(png|jpg|jpeg|webp)(?:\?|$)/i.test(href);
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#dfe5ea] bg-white px-2.5 py-1.5 text-[10px] font-black text-[#07121f] hover:border-[#0a8f45]"
        >
            {isImage ? <Eye size={13} /> : <FileText size={13} />}
            {label}
        </a>
    );
}

function InfoLine({ label, value }: { label: string; value: unknown }) {
    const display = text(value) || "Not provided";
    return (
        <div className="rounded-[8px] border border-[#edf2f5] bg-[#fbfcfd] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#83909c]">{label}</p>
            <p className="mt-1 break-words text-xs font-black text-[#07121f]">{display}</p>
        </div>
    );
}

export default function NeederoAdminPage() {
    const [password, setPassword] = useState("");
    const [unlocked, setUnlocked] = useState(false);
    const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("all");
    const [adminNote, setAdminNote] = useState<Record<string, string>>({});

    useEffect(() => {
        const saved = window.sessionStorage.getItem(passwordKey) || "";
        if (saved) {
            setPassword(saved);
            void load(saved);
        }
    }, []);

    const load = async (nextPassword = password) => {
        setLoading(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/partner-registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: nextPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.error || "Could not load admin data.");
            setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
            setUnlocked(true);
            window.sessionStorage.setItem(passwordKey, nextPassword);
        } catch (error) {
            setUnlocked(false);
            setMessage(error instanceof Error ? error.message : "Could not unlock admin.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (record: RegistrationRecord, status: "pending" | "approved" | "manual_review" | "rejected") => {
        setLoading(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/partner-registrations", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password,
                    type: record.type,
                    id: record.id,
                    status,
                    adminNote: adminNote[record.id] || "",
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.error || "Could not update status.");
            await load(password);
            setMessage(`Updated ${record.registrationType} registration to ${status}.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not update status.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return registrations.filter((record) => {
            const status = text(record.data.status) || "pending";
            if (statusFilter !== "all" && status !== statusFilter) return false;
            if (!needle) return true;
            const haystack = [
                record.registrationType,
                record.id,
                record.data.shopName,
                record.data.providerName,
                record.data.ownerName,
                record.data.phone,
                record.data.email,
                record.data.shopAddress,
                record.data.serviceArea,
                record.data.repairCategory,
                record.data.serviceCategory,
            ].map(text).join(" ").toLowerCase();
            return haystack.includes(needle);
        });
    }, [query, registrations, statusFilter]);

    const stats = useMemo(() => {
        const counts = { total: registrations.length, pending: 0, approved: 0, review: 0, rejected: 0 };
        registrations.forEach((record) => {
            const status = text(record.data.status) || "pending";
            if (status === "approved") counts.approved += 1;
            else if (status === "manual_review") counts.review += 1;
            else if (status === "rejected") counts.rejected += 1;
            else counts.pending += 1;
        });
        return counts;
    }, [registrations]);
    const statCards = [
        { label: "Total", value: stats.total, icon: Store },
        { label: "Pending", value: stats.pending, icon: Phone },
        { label: "Approved", value: stats.approved, icon: CheckCircle2 },
        { label: "Manual Review", value: stats.review, icon: WalletCards },
        { label: "Rejected", value: stats.rejected, icon: XCircle },
    ];

    if (!unlocked) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4 text-[#07121f]">
                <section className="w-full max-w-md rounded-[16px] border border-[#e1e7ec] bg-white p-7 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#07121f] text-white">
                        <Lock size={24} />
                    </div>
                    <h1 className="mt-5 text-2xl font-black tracking-[-0.04em]">Needero Admin</h1>
                    <p className="mt-2 text-sm leading-6 text-[#627181]">Enter the admin password to manage partner onboarding, KYC documents, payout details, and approval status.</p>
                    <form
                        className="mt-6 space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void load(password);
                        }}
                    >
                        <input
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            className="h-11 w-full rounded-[8px] border border-[#dfe5ea] px-3 text-sm font-semibold outline-none focus:border-[#0a8f45] focus:ring-4 focus:ring-[#e8f8ef]"
                            placeholder="Admin password"
                        />
                        {message && <p className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700">{message}</p>}
                        <button disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#07121f] text-sm font-black text-white disabled:opacity-60">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            Unlock Admin
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f9fb] px-4 py-6 text-[#07121f] md:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="rounded-[16px] border border-[#e1e7ec] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0a8f45]">Needero Website Admin</p>
                            <h1 className="mt-1 text-3xl font-black tracking-[-0.05em]">Partner KYC & Onboarding</h1>
                            <p className="mt-1 text-sm font-medium text-[#627181]">Manage repair-shop and home-service registrations, owner KYC, legal documents, payout numbers, and approval status.</p>
                        </div>
                        <button onClick={() => void load(password)} className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#dfe5ea] bg-white px-4 text-xs font-black hover:border-[#07121f]">
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {statCards.map((item) => (
                            <div key={item.label} className="rounded-[10px] border border-[#edf2f5] bg-[#fbfcfd] p-4">
                                <item.icon size={18} className="text-[#0a8f45]" />
                                <p className="mt-3 text-2xl font-black">{item.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#83909c]">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </header>

                <section className="mt-5 rounded-[16px] border border-[#e1e7ec] bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex h-10 min-w-0 flex-1 items-center rounded-[8px] border border-[#dfe5ea] px-3">
                            <Search size={15} className="text-[#83909c]" />
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search KYC, shop, owner, phone, category..." className="min-w-0 flex-1 px-2 text-sm font-semibold outline-none" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                            {statuses.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black capitalize ${
                                        statusFilter === status ? "border-[#07121f] bg-[#07121f] text-white" : "border-[#dfe5ea] bg-white text-[#627181]"
                                    }`}
                                >
                                    {status.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {message && <div className="mt-4 rounded-[10px] border border-[#dfe5ea] bg-white px-4 py-3 text-xs font-black">{message}</div>}

                <div className="mt-5 space-y-4">
                    {filtered.map((record) => {
                        const data = record.data;
                        const title = text(data.shopName) || text(data.providerName) || "Unnamed registration";
                        const status = text(data.status) || "pending";
                        return (
                            <article key={`${record.type}-${record.id}`} className="rounded-[16px] border border-[#e1e7ec] bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-[#dfe5ea] bg-[#fbfcfd] px-3 py-1 text-[10px] font-black text-[#627181]">{record.registrationType}</span>
                                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black capitalize ${statusClass(status)}`}>{status.replace("_", " ")}</span>
                                            <span className="text-[10px] font-black text-[#9aa6b2]">{dateLabel(data.createdAt)}</span>
                                        </div>
                                        <h2 className="mt-3 text-xl font-black tracking-[-0.03em]">{title}</h2>
                                        <p className="mt-1 text-xs font-semibold text-[#627181]">ID: {record.id}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => void updateStatus(record, "approved")} className="rounded-[8px] bg-[#0a8f45] px-3 py-2 text-xs font-black text-white">Approve</button>
                                        <button onClick={() => void updateStatus(record, "manual_review")} className="rounded-[8px] bg-[#2457ff] px-3 py-2 text-xs font-black text-white">Manual Review</button>
                                        <button onClick={() => void updateStatus(record, "rejected")} className="rounded-[8px] bg-red-600 px-3 py-2 text-xs font-black text-white">Reject</button>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                    <InfoLine label="Owner / Provider" value={data.ownerName || data.providerName} />
                                    <InfoLine label="Phone" value={data.phone} />
                                    <InfoLine label="Email" value={data.email} />
                                    <InfoLine label="Category" value={data.repairCategory || data.serviceCategory} />
                                    <InfoLine label="Address / Area" value={data.shopAddress || data.serviceArea} />
                                    <InfoLine label="KYC Type" value={data.ownerKycType} />
                                    <InfoLine label="KYC Number" value={data.ownerKycNumber || data.idProof} />
                                    <InfoLine label="PAN / Legal No." value={data.businessDocuments} />
                                    <InfoLine label="Payout Method" value={data.payoutMethod} />
                                    <InfoLine label="Account Holder" value={data.bankAccountHolderName} />
                                    <InfoLine label="Bank" value={data.bankName} />
                                    <InfoLine label="Bank Account" value={data.bankAccount} />
                                    <InfoLine label="Bank Branch" value={data.bankBranch} />
                                    <InfoLine label="eSewa Number" value={data.esewaNumber} />
                                    <InfoLine label="Khalti Number" value={data.khaltiNumber} />
                                    <InfoLine label="Verification Note" value={data.verificationNote} />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <AttachmentLink label="Shop / Service Photo" value={data.shopPhoto || data.serviceShopPhoto} />
                                    <AttachmentLink label="Owner KYC Document" value={data.ownerKycDocument} />
                                    <AttachmentLink label="Business Legal Document" value={data.businessDocumentFile} />
                                </div>

                                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                                    <label>
                                        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.14em] text-[#83909c]">Admin note</span>
                                        <textarea
                                            value={adminNote[record.id] ?? text(data.adminNote)}
                                            onChange={(event) => setAdminNote((current) => ({ ...current, [record.id]: event.target.value }))}
                                            className="min-h-16 w-full rounded-[8px] border border-[#dfe5ea] px-3 py-2 text-xs font-semibold outline-none focus:border-[#0a8f45] focus:ring-4 focus:ring-[#e8f8ef]"
                                            placeholder="Internal note for this KYC review"
                                        />
                                    </label>
                                    <button onClick={() => void updateStatus(record, status as any)} className="h-10 rounded-[8px] border border-[#07121f] px-4 text-xs font-black">
                                        Save Note
                                    </button>
                                </div>
                            </article>
                        );
                    })}

                    {!filtered.length && (
                        <div className="rounded-[16px] border border-dashed border-[#dfe5ea] bg-white p-12 text-center">
                            <Building2 className="mx-auto text-[#9aa6b2]" size={36} />
                            <p className="mt-3 font-black">No registrations found</p>
                            <p className="mt-1 text-sm text-[#627181]">Try refreshing, changing the status filter, or searching a different keyword.</p>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-[#07121f] px-4 py-3 text-xs font-black text-white shadow-2xl">
                        <Loader2 size={15} className="animate-spin" />
                        Working...
                    </div>
                )}
            </div>
        </main>
    );
}
