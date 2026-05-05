import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register Your Restaurant — Become a Needero Food Partner",
    description: "Register your restaurant, cloud kitchen, or food delivery service on Needero. Start receiving food orders from nearby hungry customers. List your menu, set delivery zones, and grow your revenue. Founded by 13-year-old entrepreneur Sangam Gautam.",
    keywords: ["register restaurant Needero", "restaurant partner Nepal", "list restaurant online", "food delivery partner", "cloud kitchen registration", "Sangam Gautam"],
    alternates: { canonical: "/register/restaurant" },
    openGraph: {
        title: "Register Your Restaurant on Needero",
        description: "Join Needero as a restaurant partner. Receive food orders from nearby customers and grow your business.",
        url: "https://needero.com/register/restaurant",
    },
};

export default function RestaurantRegistrationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
