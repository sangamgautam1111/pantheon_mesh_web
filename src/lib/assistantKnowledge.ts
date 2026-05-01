export type AssistantKnowledgeDoc = {
    id: string;
    title: string;
    category: "overview" | "customer" | "business" | "pricing" | "safety" | "marketplace" | "launch";
    route?: string;
    text: string;
};

export const ASSISTANT_KNOWLEDGE: AssistantKnowledgeDoc[] = [
    {
        id: "needero-simple-thesis",
        title: "Needero in one line",
        category: "overview",
        route: "/",
        text:
            "Needero MVP is phone repair only: customers post a phone issue once, nearby repair shops send Repair Offers, and the customer chooses the best shop. Customers do not pay Needero.",
    },
    {
        id: "customer-flow",
        title: "Customer flow",
        category: "customer",
        route: "/client/new",
        text:
            "Customer flow: Post a Phone Repair Need, choose the issue, add brand, model, area, urgency, service preference, and optional photo or video. Repair shops send Offers. The customer compares NPR price, repair time, service type, warranty, parts quality, and note, then chooses one shop.",
    },
    {
        id: "business-flow",
        title: "Local business flow",
        category: "business",
        route: "/marketplace",
        text:
            "Local repair shops browse nearby phone repair Needs in Marketplace and reply with clear Repair Offers: NPR price, estimated time, service type, warranty, parts quality, availability, and a helpful note. The marketplace is the key shop workspace.",
    },
    {
        id: "messages",
        title: "Messages",
        category: "marketplace",
        route: "/messages",
        text:
            "Messages help customers and businesses talk after contact is allowed. Messages can include text, images, files, and map location, and are saved to the backend conversation record.",
    },
    {
        id: "business-plans",
        title: "Business plans",
        category: "pricing",
        route: "/pricing",
        text:
            "Business plans are only for local repair shop accounts. Free is NPR 0/month with a basic profile, 5 offer replies per month, and relevant phone repair Need visibility. Pro is NPR 1,999/month with unlimited offer replies, AI quote helper, verified profile, basic analytics, and higher placement. Premium is NPR 4,999/month with Pro features plus priority placement, featured profile, instant lead alerts, advanced analytics, Top Rated eligibility, and stronger recommendation boost.",
    },
    {
        id: "customer-pricing",
        title: "Customer pricing",
        category: "pricing",
        route: "/client/new",
        text:
            "Customers can post phone repair Needs for free. Needero should not show business subscription plans to customer accounts.",
    },
    {
        id: "privacy",
        title: "Privacy first",
        category: "safety",
        route: "/client/new",
        text:
            "Customer contact details should stay hidden until the customer chooses an Offer. Show approximate area first, not exact private home location.",
    },
    {
        id: "launch",
        title: "Launch focus",
        category: "launch",
        route: "/marketplace",
        text:
            "Needero should validate phone repair first: onboard real local repair shops, get real phone repair Needs, make sure Repair Offers arrive fast, complete a few matches, and only charge shops after they see value.",
    },
    {
        id: "system-architecture",
        title: "System Architecture",
        category: "overview",
        route: "/",
        text:
            "Needero uses a dual-repository architecture. The Backend (Pantheon-Mesh) uses FastAPI and Cloud SQL PostgreSQL for processing relational data (Needs, Offers, Messages). The Frontend (pantheon_mesh_web) is built on Next.js and uses Firebase for authentication and basic profile storage.",
    },
    {
        id: "auth-role-management",
        title: "Auth & Role Management",
        category: "safety",
        route: "/profile",
        text:
            "Needero strictly segregates 'Customer' and 'Business' roles. We use signInWithRedirect for Google/GitHub logins, caching the pending account type in sessionStorage. This ensures users are properly directed to their respective dashboards (/client for Customers, /marketplace for Businesses).",
    },
    {
        id: "profile-editing-workflow",
        title: "Profile Editing",
        category: "overview",
        route: "/profile",
        text:
            "Users can edit their profiles via a unified modal on /profile. Customer profiles capture basic contact info and saved addresses, while Business profiles capture comprehensive details like services, opening hours, and warranty policies to act as a mini website.",
    },
    {
        id: "global-location-currency",
        title: "Global Location & Currency System",
        category: "overview",
        route: "/profile",
        text:
            "Needero MVP uses NPR across the product while validating phone repair in Nepal first. It limits marketplace visibility logically (city first, country next) and stores monetary values securely in minor units.",
    }
];
