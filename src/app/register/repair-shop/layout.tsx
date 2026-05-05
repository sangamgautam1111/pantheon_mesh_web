import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register Your Repair Shop — Become a Needero Repair Partner",
    description: "Register your mobile, laptop, electronics, or appliance repair shop on Needero. Get repair leads from nearby customers with broken devices. Send competitive quotes and grow your business. Founded by 13-year-old entrepreneur Sangam Gautam.",
    keywords: ["register repair shop Needero", "mobile repair partner Nepal", "electronics repair registration", "laptop repair partner", "repair shop leads", "Sangam Gautam"],
    alternates: { canonical: "/register/repair-shop" },
    openGraph: {
        title: "Register Your Repair Shop on Needero",
        description: "Join Needero as a repair shop partner. Receive repair leads from nearby customers and grow your business.",
        url: "https://needero.com/register/repair-shop",
    },
};

export default function RepairShopRegistrationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
