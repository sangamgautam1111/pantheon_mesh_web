import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy - Needero",
    description: "Needero privacy policy for the local service marketplace.",
};

const sections = [
    {
        title: "Information We Collect",
        body: [
            "Account information such as name, email address, profile photo, username, account type, and sign-in provider details.",
            "Phone verification information, including phone number, OTP verification status, and verification timestamps.",
            "Profile and marketplace information such as customer service Needs, business profiles, business photos, addresses, map pins, Offers, messages, reviews, support feedback, and subscription plan metadata.",
            "Uploaded media such as service issue photos, business-front photos, inside-business photos, logos, and optional business verification documents.",
            "Technical information such as device/browser data, IP-based approximate location, logs, and security events needed to run and protect the service.",
        ],
    },
    {
        title: "How We Use Information",
        body: [
            "To create and secure user accounts, including Google sign-in, GitHub sign-in, email/password sign-in, and Firebase phone verification.",
            "To help customers post service Needs and compare service Offers from nearby businesses.",
            "To help businesses create profiles, verify business information, send Offers, manage messages, and use paid plans.",
            "To run trust and safety checks, including username uniqueness, phone verification, business verification, web evidence checks, and AI-assisted risk review.",
            "To operate support, improve the product, debug errors, prevent abuse, and comply with applicable legal obligations.",
        ],
    },
    {
        title: "Service Providers",
        body: [
            "Needero uses Firebase and Google Cloud for authentication, realtime database, hosting, and related infrastructure.",
            "Needero may use AI and search providers such as DeepSeek, Tavily, OpenRouter, and Groq to clean service requests, assist support, and review business verification evidence.",
            "Needero may use IP/location lookup services to suggest country, city, and nearby service Needs.",
            "These providers process information only as needed to provide app features, security, verification, analytics, and infrastructure.",
        ],
    },
    {
        title: "Sharing",
        body: [
            "Customer contact details stay protected until marketplace flows require sharing, such as selected Offers, messages, or bookings.",
            "Businesses may see customer Need details such as issue, area, urgency, photos, budget preference, and service preferences.",
            "Customers may see business profile details such as business name, profile photo/logo, category, Offer terms, warranty, verification badge, and public business location information.",
            "Owner documents and private verification evidence are not intended for public display.",
            "We do not sell personal information.",
        ],
    },
    {
        title: "Data Retention and Deletion",
        body: [
            "We keep account, Need, Offer, message, verification, and support records while they are needed to operate the marketplace, prevent fraud, resolve disputes, and meet legal or accounting needs.",
            "Users can request correction or deletion of account data by contacting support. Some records may be retained where required for security, dispute handling, compliance, or legitimate business records.",
        ],
    },
    {
        title: "Security",
        body: [
            "Needero uses Firebase authentication, realtime database access controls, verification checks, and operational logging to protect accounts and marketplace activity.",
            "No online service can promise perfect security, so users should keep login credentials private and report suspicious activity quickly.",
        ],
    },
    {
        title: "Children and Sensitive Documents",
        body: [
            "Needero is not intended for children under 13. Business owners should upload only documents they are authorized to provide.",
            "Do not upload unnecessary sensitive documents. If a document is requested for verification, use only what is needed to confirm the business.",
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#f7faf8] px-4 py-8 text-[#06111f] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-[#62646a] hover:text-[#0a8f45]">
                    <ArrowLeft size={16} />
                    Back to Needero
                </Link>

                <section className="mt-6 rounded-[30px] border border-[#dfe8e3] bg-white p-7 shadow-sm sm:p-10">
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f9f0] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#0a8f45]">
                            <ShieldCheck size={15} />
                            Public policy
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f1f5f9] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#475569]">
                            Effective May 1, 2026
                        </span>
                    </div>

                    <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.05em] sm:text-6xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-[#62646a]">
                        This Privacy Policy explains how Needero Local Marketplace Ltd. collects, uses, stores, and shares
                        information for Needero, a local service marketplace where customers post service Needs and nearby
                        businesses send service Offers.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {[
                            { icon: LockKeyhole, label: "Protected login", copy: "Firebase and provider sign-in" },
                            { icon: Database, label: "Marketplace data", copy: "Needs, Offers, messages, profiles" },
                            { icon: Mail, label: "Contact", copy: "neederoofficial@gmail.com" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                                <item.icon size={20} className="text-[#0a8f45]" />
                                <p className="mt-3 text-sm font-black">{item.label}</p>
                                <p className="mt-1 text-xs leading-5 text-[#64748b]">{item.copy}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-7">
                        {sections.map((section) => (
                            <section key={section.title}>
                                <h2 className="text-xl font-black tracking-[-0.02em]">{section.title}</h2>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[#62646a]">
                                    {section.body.map((item) => (
                                        <li key={item} className="rounded-2xl bg-[#fbfdfb] px-4 py-3">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    <section className="mt-8 rounded-2xl border border-[#dfe8e3] bg-[#fbfdfb] p-5">
                        <h2 className="text-xl font-black">Contact and Requests</h2>
                        <p className="mt-3 text-sm leading-7 text-[#62646a]">
                            For privacy questions, account deletion, data correction, or security concerns, contact Needero
                            support at <a className="font-black text-[#0a8f45]" href="mailto:neederoofficial@gmail.com">neederoofficial@gmail.com</a>.
                        </p>
                    </section>
                </section>
            </div>
        </main>
    );
}
