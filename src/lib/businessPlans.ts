export type BusinessPlan = {
    id: string;
    name: string;
    price: string;
    cadence: string;
    description: string;
    badge?: string;
    featured?: boolean;
    monthlyJobLimit: number;
    jobsPerMonth: string;
    activeJobLimit: number;
    activeJobs: string;
    deliveryTargetHours: number;
    deliveryTarget: string;
    modelLane: string;
    biddingLane: string;
    reviewDepth: string;
    bestFor: string;
    features: string[];
};

export const BUSINESS_PLANS: BusinessPlan[] = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        cadence: "/month",
        description: "Experience the Mesh workspace first-hand and run baseline business tasks.",
        badge: "Sandbox",
        monthlyJobLimit: 20,
        jobsPerMonth: "20 jobs",
        activeJobLimit: 5,
        activeJobs: "5 active jobs",
        deliveryTargetHours: 72,
        deliveryTarget: "Standard Mesh (72h)",
        modelLane: "Flash / Mini lane",
        biddingLane: "Off",
        reviewDepth: "Basic",
        bestFor: "Trial / Low volume",
        features: [
            "20 AI-driven tasks / month",
            "5 simultaneous active jobs",
            "Baseline Mesh intelligence",
            "Shared dashboard tracking",
            "Fixed AI pricing policy",
        ],
    },
    {
        id: "starter",
        name: "Starter",
        price: "$29",
        cadence: "/month",
        description: "Unlock manual budgeting and economy bidding for consistent weekly operations.",
        monthlyJobLimit: 60,
        jobsPerMonth: "60 jobs",
        activeJobLimit: 15,
        activeJobs: "15 active jobs",
        deliveryTargetHours: 24,
        deliveryTarget: "Accelerated (24h)",
        modelLane: "Balanced Reasoning",
        biddingLane: "Economy pool",
        reviewDepth: "Standard",
        bestFor: "Active solo operators",
        features: [
            "60 AI-driven tasks / month",
            "15 simultaneous active jobs",
            "Economy Bidding enabled (Save on tasks)",
            "Balanced model intelligence",
            "Accelerated 24h delivery target",
        ],
    },
    {
        id: "growth",
        name: "Growth",
        price: "$69",
        cadence: "/month",
        description: "The sweet spot for teams needing speed, volume, and high-quality expert reasoning.",
        badge: "Best Value",
        featured: true,
        monthlyJobLimit: 300,
        jobsPerMonth: "300 jobs",
        activeJobLimit: 100,
        activeJobs: "100 active jobs",
        deliveryTargetHours: 4,
        deliveryTarget: "Priority Fast (4h)",
        modelLane: "Expert Reasoning + Coding",
        biddingLane: "Tier 1 + 2 pools",
        reviewDepth: "Pro",
        bestFor: "Operating teams",
        features: [
            "300 AI-driven tasks / month",
            "100 simultaneous active jobs",
            "Multi-Tier Bidding (Maximum savings)",
            "High-end reasoning & coding lanes",
            "Rapid 4h delivery priority",
        ],
    },
    {
        id: "scale",
        name: "Scale",
        price: "$149",
        cadence: "/month",
        description: "Unlimited potential with dedicated routing and real-time mesh execution.",
        monthlyJobLimit: 1000000,
        jobsPerMonth: "Unlimited jobs",
        activeJobLimit: 500,
        activeJobs: "500 active jobs",
        deliveryTargetHours: 1,
        deliveryTarget: "Real-time Mesh (1h)",
        modelLane: "Elite Elite + Dedicated",
        biddingLane: "Unlimited Global pools",
        reviewDepth: "Deep Forensic",
        bestFor: "Enterprise Ops",
        features: [
            "Unlimited tasks (Scale at will)",
            "500 simultaneous active jobs",
            "Full Global Bidding priority",
            "Dedicated routing & Elite compute",
            "Near-instant 1h delivery pass",
        ],
    },
];
