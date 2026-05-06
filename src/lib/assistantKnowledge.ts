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
            "Needero MVP focuses on two categories: Home Cleaning first, and Mobile Repair second. Customers post one Need, nearby businesses send Service Offers, and the customer chooses the best provider. Customers do not pay Needero during MVP testing.",
    },
    {
        id: "customer-flow",
        title: "Customer flow",
        category: "customer",
        route: "/client/new",
        text:
            "Customer flow: post a Home Cleaning or Mobile Repair Need, choose the issue or cleaning type, add location, urgency, service preference, budget, and optional photo or video. Businesses send Offers. The customer compares NPR price, time, service type, guarantee or warranty, quality, and note, then chooses one provider.",
    },
    {
        id: "business-flow",
        title: "Local business flow",
        category: "business",
        route: "/marketplace",
        text:
            "Home cleaning teams and mobile repair shops browse nearby Needs in Marketplace and reply with clear Service Offers: NPR price, estimated time, service type, quality or warranty, availability, and a helpful note. Phone OTP is required before sending Offers.",
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
            "Business plans are for local Home Cleaning and Mobile Repair accounts. Free is NPR 0/month with a basic profile, limited offer replies, and relevant Need visibility. Pro and Premium add more replies, AI quote help, verified profile, analytics, and placement benefits.",
    },
    {
        id: "customer-pricing",
        title: "Customer pricing",
        category: "pricing",
        route: "/client/new",
        text:
            "Customers can post Home Cleaning and Mobile Repair Needs for free during MVP testing. Needero should not show business subscription plans to customer accounts.",
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
            "Needero should validate Home Cleaning first, then Mobile Repair: onboard real local partners, get real Needs, make sure Service Offers arrive fast, complete a few matches, and only charge businesses after value is proven.",
    },
    {
        id: "system-architecture",
        title: "System Architecture",
        category: "overview",
        route: "/",
        text:
            "Needero uses a dual-repository architecture. The Backend (Pantheon-Mesh) uses FastAPI and Cloud SQL PostgreSQL for relational data such as Needs, Offers, and Messages. The Frontend (pantheon_mesh_web) is built on Next.js and uses Firebase for authentication and basic profile storage.",
    },
    {
        id: "auth-role-management",
        title: "Auth & Role Management",
        category: "safety",
        route: "/profile",
        text:
            "Needero strictly separates Customer and Business roles. We use signInWithRedirect for Google/GitHub logins, caching the pending account type in sessionStorage. This directs customers to /client and businesses to /marketplace.",
    },
    {
        id: "profile-editing-workflow",
        title: "Profile Editing",
        category: "overview",
        route: "/profile",
        text:
            "Users can edit their profiles via a unified modal on /profile. Customer profiles capture basic contact info and saved addresses, while Business profiles capture services, opening hours, photos, and warranty or guarantee policies.",
    },
    {
        id: "global-location-currency",
        title: "Global Location & Currency System",
        category: "overview",
        route: "/profile",
        text:
            "Needero MVP uses NPR while validating local service demand in Nepal first. It limits marketplace visibility logically by area and stores monetary values securely in minor units.",
    },
];
