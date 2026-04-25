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
            "Needero is a simple local marketplace: customers post a Need, nearby businesses send Offers, and the customer chooses the best one. Customers do not pay Needero.",
    },
    {
        id: "customer-flow",
        title: "Customer flow",
        category: "customer",
        route: "/client/new",
        text:
            "Customer flow: Post a Need, add area, urgency, optional budget, and optional image or video. Needero turns the text into a clean Need Card. Businesses send Offers. The customer compares price, time, warranty, distance, and note, then chooses one business.",
    },
    {
        id: "business-flow",
        title: "Local business flow",
        category: "business",
        route: "/marketplace",
        text:
            "Local businesses browse nearby Needs in Marketplace and reply with clear Offers: price, time, warranty, distance, and a helpful note. The marketplace is the key business workspace.",
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
            "Business plans are only for local business accounts. Free is $0/month with a basic profile, 5 offer replies per month, and relevant Need visibility. Pro is $19/month with unlimited offer replies, AI quote helper, verified profile, basic analytics, and higher placement. Premium is $49/month with Pro features plus priority placement, featured profile, instant lead alerts, advanced analytics, Top Rated eligibility, and stronger recommendation boost.",
    },
    {
        id: "customer-pricing",
        title: "Customer pricing",
        category: "pricing",
        route: "/client/new",
        text:
            "Customers can post Needs for free. Needero should not show business subscription plans to customer accounts.",
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
            "Needero can start broad in UI but should validate locally: onboard real local businesses, get real posted Needs, make sure Offers arrive fast, and only charge businesses after they see value.",
    },
];
