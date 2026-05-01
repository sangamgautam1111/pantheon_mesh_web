import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, FileText, Scale, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service - Needero",
    description: "Needero application terms of service for customers and businesses.",
};

const terms = [
    {
        title: "1. The Service",
        body: "Needero is a phone repair marketplace MVP. Customers can post phone repair Needs, upload repair proof, compare repair Offers, message businesses, and choose a repair shop. Businesses can create profiles, complete verification, browse relevant Needs, and send repair Offers.",
    },
    {
        title: "2. Accounts and Sign-In",
        body: "Users may sign in with Google, GitHub, email/password, or other supported authentication methods. You are responsible for keeping your account secure and for all activity under your account. You must provide accurate profile, contact, and verification information.",
    },
    {
        title: "3. Phone and Business Verification",
        body: "Phone OTP verification may be required before customers post Needs or businesses send Offers. Business verification may use submitted shop information, photos, map location, public web evidence, Tavily search, AI-assisted review, and manual review. A verification badge means information passed Needero checks; it is not a guarantee that a business, customer, repair, price, or outcome is risk-free.",
    },
    {
        title: "4. Marketplace Relationship",
        body: "Needero helps customers and businesses connect. Repair services are provided by independent businesses, not by Needero. Businesses are responsible for diagnosis, pricing, parts quality, warranty, delivery, pickup, repair work, taxes, licenses, and customer service for their Offers.",
    },
    {
        title: "5. Quotes, Payments, and Plans",
        body: "Customers can post phone repair Needs for free during the MVP. Businesses may use free or paid subscription plans for visibility, lead access, AI quote tools, analytics, or other business features. Unless a separate payment flow is shown inside the app, customer payments for repairs are handled directly between the customer and the selected business.",
    },
    {
        title: "6. User Content",
        body: "You keep ownership of the content you submit, such as profiles, Needs, photos, messages, shop information, and Offers. You give Needero permission to host, process, display, and use that content as needed to operate, secure, improve, and promote the marketplace. Do not upload content you do not have permission to use.",
    },
    {
        title: "7. Prohibited Use",
        body: "Do not submit fake identities, fake shop photos, false pricing, misleading documents, abusive messages, illegal content, malware, spam, scraped data, or content that violates another person's rights. Do not try to bypass OTP cooldowns, verification gates, account rules, or security controls.",
    },
    {
        title: "8. AI Features",
        body: "Needero may use AI to clean repair requests, assist support, rank information, summarize evidence, and review business verification risk. AI output can be incomplete or wrong. Users should review important information before acting on it.",
    },
    {
        title: "9. Suspension and Removal",
        body: "Needero may limit, suspend, remove, or refuse accounts, profiles, Needs, Offers, messages, verification badges, or subscriptions when needed to protect users, prevent abuse, enforce these Terms, or comply with legal obligations.",
    },
    {
        title: "10. Disclaimers",
        body: "Needero is provided on an as-is and as-available basis. We do not promise uninterrupted service, perfect matching, guaranteed repairs, guaranteed business authenticity, guaranteed customer behavior, or a specific earning outcome for businesses.",
    },
    {
        title: "11. Limitation of Liability",
        body: "To the maximum extent allowed by law, Needero will not be liable for indirect, incidental, special, consequential, or punitive damages, or for disputes between customers and independent businesses, except where liability cannot legally be limited.",
    },
    {
        title: "12. Updates",
        body: "Needero may update these Terms as the MVP changes. Continued use of the service after updates means you accept the updated Terms. Material changes may be shown inside the app or posted on this page.",
    },
];

export default function TermsPage() {
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
                            <FileText size={15} />
                            Application terms
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f1f5f9] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#475569]">
                            Effective May 1, 2026
                        </span>
                    </div>

                    <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.05em] sm:text-6xl">
                        Terms of Service
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-[#62646a]">
                        These Terms of Service govern use of Needero by customers, businesses, and visitors. Needero is
                        operated as a phone repair marketplace by Needero Local Marketplace Ltd. for the Pantheon Mesh Web
                        project.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {[
                            { icon: BadgeCheck, label: "Verified gates", copy: "Phone and business checks before core actions" },
                            { icon: Scale, label: "Marketplace role", copy: "Needero connects users; shops perform repairs" },
                            { icon: ShieldAlert, label: "Trust limits", copy: "AI and verification are checks, not guarantees" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                                <item.icon size={20} className="text-[#0a8f45]" />
                                <p className="mt-3 text-sm font-black">{item.label}</p>
                                <p className="mt-1 text-xs leading-5 text-[#64748b]">{item.copy}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4">
                        {terms.map((item) => (
                            <section key={item.title} className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-5">
                                <h2 className="text-lg font-black tracking-[-0.02em]">{item.title}</h2>
                                <p className="mt-2 text-sm leading-7 text-[#62646a]">{item.body}</p>
                            </section>
                        ))}
                    </div>

                    <section className="mt-8 rounded-2xl border border-[#dfe8e3] bg-white p-5">
                        <h2 className="text-xl font-black">Contact</h2>
                        <p className="mt-3 text-sm leading-7 text-[#62646a]">
                            Questions about these Terms can be sent to{" "}
                            <a className="font-black text-[#0a8f45]" href="mailto:neederoofficial@gmail.com">neederoofficial@gmail.com</a>.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#62646a]">
                            Your use of Needero is also governed by the{" "}
                            <Link className="font-black text-[#0a8f45]" href="/privacy">Privacy Policy</Link>.
                        </p>
                    </section>
                </section>
            </div>
        </main>
    );
}
