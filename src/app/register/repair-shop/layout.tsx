import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register Your Mobile Repair Shop | Needero",
    description: "Register your mobile repair shop on Needero and receive phone repair leads from nearby customers.",
    keywords: ["register mobile repair shop Needero", "mobile repair partner Nepal", "phone repair leads", "Needero partner"],
    alternates: { canonical: "/register/repair-shop" },
    openGraph: {
        title: "Register Your Mobile Repair Shop on Needero",
        description: "Join Needero as a mobile repair partner. Receive repair leads from nearby customers and grow your business.",
        url: "https://needero.com/register/repair-shop",
    },
};

export default function RepairShopRegistrationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
