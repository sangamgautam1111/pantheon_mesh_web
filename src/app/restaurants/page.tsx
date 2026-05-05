import type { Metadata } from "next";
import Link from "next/link";
import { UtensilsCrossed, Star, MapPin, Clock, ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Restaurants Near You — Order Food Delivery & Dine-In | Needero",
    description: "Discover the best restaurants near you on Needero. Order food delivery, dine-in, or pickup from local restaurants, cloud kitchens, and cafes. Post your food need and get offers from nearby restaurants. Founded by 13-year-old entrepreneur Sangam Gautam from Nepal.",
    keywords: ["restaurants near me", "food delivery Nepal", "order food online Kathmandu", "best restaurants Nepal", "food delivery app", "Needero food", "local restaurants", "cloud kitchen Nepal", "dine-in restaurants", "Sangam Gautam"],
    alternates: { canonical: "/restaurants" },
    openGraph: {
        title: "Order from Restaurants Near You — Needero Food Delivery",
        description: "Post what you want to eat. Local restaurants compete to serve you the best food at the best price. Needero — founded by 13-year-old Sangam Gautam.",
        url: "https://needero.com/restaurants",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Restaurants Near You — Needero",
        description: "Post your food need and get offers from nearby restaurants. Delivery, pickup, or dine-in.",
    },
};

const cuisines = [
    { name: "Nepali", emoji: "🍛", popular: "Dal Bhat, Momos, Thukpa" },
    { name: "Indian", emoji: "🍲", popular: "Biryani, Butter Chicken, Naan" },
    { name: "Chinese", emoji: "🥡", popular: "Chow Mein, Fried Rice, Dumplings" },
    { name: "Fast Food", emoji: "🍔", popular: "Burgers, Pizza, Fries" },
    { name: "Bakery & Cafe", emoji: "☕", popular: "Pastries, Coffee, Sandwiches" },
    { name: "Desserts", emoji: "🍰", popular: "Cakes, Ice Cream, Sweets" },
];

const howItWorks = [
    { step: "1", title: "Post Your Food Need", description: "Tell us what you're craving — cuisine, quantity, budget, delivery or pickup.", icon: Zap },
    { step: "2", title: "Receive Restaurant Offers", description: "Nearby restaurants see your need and send their best offers with price and time.", icon: TrendingUp },
    { step: "3", title: "Choose & Enjoy", description: "Compare offers, pick the best one, and enjoy your meal delivered or ready for pickup.", icon: Star },
];

const structuredData = {
    "@context": "https://schema.org",
    "@type": "FoodService",
    "name": "Needero Restaurants",
    "url": "https://needero.com/restaurants",
    "description": "Order food from the best local restaurants near you via Needero. Delivery, pickup, and dine-in options available.",
    "areaServed": { "@type": "Country", "name": "Nepal" },
    "provider": {
        "@type": "Organization",
        "name": "Needero",
        "founder": { "@type": "Person", "name": "Sangam Gautam", "description": "13-year-old tech entrepreneur from Nepal" },
    },
};

export default function RestaurantsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <main className="min-h-screen bg-[#fafafa]">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#ff6b35] via-[#f72585] to-[#b5179e] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.1),transparent_40%)]" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Needero Food Marketplace</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Restaurants{" "}
                            <span className="text-yellow-300">near you</span>,{" "}
                            competing to serve you
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Don't scroll through endless menus. Just post what you want to eat — nearby restaurants will send you their best offers with prices, delivery time, and special deals.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href="/client/new" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-[#f72585] shadow-lg transition hover:shadow-xl">
                                <UtensilsCrossed size={18} /> Order Food Now
                            </Link>
                            <Link href="/register/restaurant" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/10">
                                <Shield size={18} /> Register Your Restaurant
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <h2 className="text-center text-3xl font-black text-[#222325]">How Needero Food Works</h2>
                    <p className="mt-2 text-center text-[#62646a]">3 simple steps to get the best food at the best price</p>
                    <div className="mt-12 grid gap-8 sm:grid-cols-3">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="rounded-3xl border border-[#e4e5e7] bg-white p-8 text-center transition hover:shadow-lg">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#f72585] text-xl font-black text-white">
                                    {item.step}
                                </div>
                                <h3 className="mt-5 text-lg font-black text-[#222325]">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#62646a]">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular cuisines */}
                <section className="border-t border-[#e4e5e7] bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <h2 className="text-3xl font-black text-[#222325]">Popular Cuisines</h2>
                        <p className="mt-2 text-[#62646a]">Find exactly what you're craving from local restaurants</p>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {cuisines.map((cuisine) => (
                                <Link
                                    key={cuisine.name}
                                    href={`/marketplace/category/food`}
                                    className="group flex items-center gap-4 rounded-2xl border border-[#e4e5e7] bg-[#fafafa] p-5 transition hover:border-[#f72585] hover:shadow-md"
                                >
                                    <span className="text-4xl">{cuisine.emoji}</span>
                                    <div>
                                        <p className="font-black text-[#222325] group-hover:text-[#f72585]">{cuisine.name}</p>
                                        <p className="text-xs text-[#74767e]">{cuisine.popular}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#050816] text-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
                        <h2 className="text-3xl font-black">Own a restaurant? Join Needero today.</h2>
                        <p className="mt-3 text-white/60">Register your restaurant and start receiving food orders from nearby customers. Zero upfront cost.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link href="/register/restaurant" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f72585] px-8 py-4 text-sm font-black text-white shadow-lg">
                                Register Restaurant <ArrowRight size={16} />
                            </Link>
                        </div>
                        <p className="mt-6 text-xs text-white/40">
                            Needero — Founded by 13-year-old entrepreneur Sangam Gautam from Nepal
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
