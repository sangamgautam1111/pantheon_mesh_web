import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register as Home Service Professional — Needero Partner",
    description: "Register as a plumber, electrician, cleaner, painter, carpenter, or AC technician on Needero. Get booked by customers who need home services in your area. Founded by 13-year-old entrepreneur Sangam Gautam.",
    keywords: ["register home service Needero", "plumber registration Nepal", "electrician partner", "cleaner registration", "home service provider", "Sangam Gautam"],
    alternates: { canonical: "/register/home-service" },
    openGraph: {
        title: "Register as Home Service Professional on Needero",
        description: "Join Needero as a home service professional. Get booked by nearby customers and grow your revenue.",
        url: "https://needero.com/register/home-service",
    },
};

export default function HomeServiceRegistrationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
