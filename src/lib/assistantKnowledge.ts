export type AssistantKnowledgeDoc = {
    id: string;
    title: string;
    category: "overview" | "customer" | "business" | "pricing" | "safety" | "marketplace" | "launch";
    route?: string;
    text: string;
};

export const ASSISTANT_KNOWLEDGE: AssistantKnowledgeDoc[] = [
    {
        id: "needaro-thesis",
        title: "Needaro business thesis",
        category: "overview",
        route: "/",
        text:
            "Needaro.com is an AI-powered local service marketplace. Customers post a local problem once, AI turns it into a clean quote request, nearby businesses send offers, and the customer chooses by price, distance, speed, rating, and warranty.",
    },
    {
        id: "first-market",
        title: "First market",
        category: "launch",
        route: "/client/new",
        text:
            "Needaro starts narrow: phone repair in one city. Phone repair is common, local, price-sensitive, competitive, photo-friendly, and does not require Needaro to perform the repair itself.",
    },
    {
        id: "customer-flow",
        title: "Customer flow",
        category: "customer",
        route: "/client/new",
        text:
            "The customer posts a problem with description, location, urgency, optional phone model, optional budget, and optional photo or video. Needaro AI creates a Problem Card with category, issue, device, known status, missing info, and quote needed. Businesses then send offers.",
    },
    {
        id: "business-flow",
        title: "Business flow",
        category: "business",
        route: "/marketplace",
        text:
            "Businesses sign up, select category and service area, receive nearby matching requests, send quotes with price, repair time, warranty, note, and availability, then win customers when chosen.",
    },
    {
        id: "offers",
        title: "Offer comparison",
        category: "marketplace",
        route: "/marketplace",
        text:
            "Customers compare offers by price, repair time, warranty, distance, shop note, and trust signals. After choosing, Needaro unlocks map, call, message, and booking details.",
    },
    {
        id: "business-model",
        title: "Business model",
        category: "pricing",
        route: "/pricing",
        text:
            "Customers use Needaro free. Businesses pay monthly for more quote replies, better visibility, AI quote tools, analytics, and stronger profiles. Plans are Free Rs.0 for 5 replies, Starter Rs.500 for 30 replies, Pro Rs.1000 for unlimited replies and profile, and Premium Rs.2500 for priority visibility and analytics.",
    },
    {
        id: "pay-per-lead-later",
        title: "Pay per lead later",
        category: "pricing",
        route: "/pricing",
        text:
            "A later model is pay-per-lead when a customer chooses a shop. Do not start with full customer payments. In version 1, customers pay the shop directly.",
    },
    {
        id: "launch-plan",
        title: "Manual launch plan",
        category: "launch",
        route: "/dashboard",
        text:
            "Manual validation target: onboard 10 phone repair shops, collect 50 customer requests, create 5 real matches, and get 1 paying business. Visit or message shops manually and help them reply fast before automating.",
    },
    {
        id: "safety",
        title: "Safety and privacy",
        category: "safety",
        route: "/client/new",
        text:
            "Needaro should hide customer contact details until the customer chooses an offer. Businesses should be manually approved early. Collect only necessary data and avoid risky regulated categories at first.",
    },
    {
        id: "moat",
        title: "Defensibility",
        category: "overview",
        route: "/dashboard",
        text:
            "Needaro's moat is not code. It is the local business network, customer demand history, trust and verification, AI request intelligence, and business SaaS tools.",
    },
];
