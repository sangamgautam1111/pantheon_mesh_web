export type PlanId = "free" | "starter" | "pro" | "premium";
export type WorkCategoryId = "phone_repair" | "laptop_repair" | "appliance_repair" | "bike_repair" | "beauty" | "tutoring";
export type ModelLaneId = "request_cleaner" | "quote_helper" | "analytics";

export interface WorkCategoryInput {
    title?: string;
    description?: string;
}

export interface ModelGroupDefinition {
    id: ModelLaneId;
    planId: PlanId;
    planName: string;
    title: string;
    tag: string;
    description: string;
    examples: string;
    workflow: string;
    bidding: string;
    models: Array<{ role: string; name: string; logoKey: string }>;
}

export const WORK_CATEGORY_LABELS: Record<WorkCategoryId, string> = {
    phone_repair: "Phone repair",
    laptop_repair: "Laptop repair",
    appliance_repair: "Appliance repair",
    bike_repair: "Bike or scooter repair",
    beauty: "Salon or barber",
    tutoring: "Tutoring",
};

export const PLAN_TO_LANE: Record<PlanId, ModelLaneId> = {
    free: "request_cleaner",
    starter: "quote_helper",
    pro: "quote_helper",
    premium: "analytics",
};

export const PLAN_RANK: Record<PlanId, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    premium: 3,
};

export const LANE_RANK: Record<ModelLaneId, number> = {
    request_cleaner: 0,
    quote_helper: 1,
    analytics: 2,
};

export function normalizePlanId(planId: string | null | undefined): PlanId {
    if (planId === "starter" || planId === "pro" || planId === "premium") {
        return planId;
    }
    return "free";
}

export function canUseModelLane(planId: string, lane: ModelLaneId) {
    return PLAN_RANK[normalizePlanId(planId)] >= LANE_RANK[lane];
}

export function detectWorkCategory(input: WorkCategoryInput): WorkCategoryId {
    const text = `${input.title || ""} ${input.description || ""}`.toLowerCase();
    if (/\b(laptop|computer|pc|macbook)\b/.test(text)) return "laptop_repair";
    if (/\b(washing|fridge|refrigerator|microwave|appliance)\b/.test(text)) return "appliance_repair";
    if (/\b(bike|scooter|motorcycle)\b/.test(text)) return "bike_repair";
    if (/\b(salon|barber|haircut|makeup)\b/.test(text)) return "beauty";
    if (/\b(tutor|tuition|math|english|science)\b/.test(text)) return "tutoring";
    return "phone_repair";
}

export function getModelGroupsForCategory(category: WorkCategoryId): ModelGroupDefinition[] {
    return [
        {
            id: "request_cleaner",
            planId: "free",
            planName: "Free",
            title: "AI Problem Card Cleaner",
            tag: WORK_CATEGORY_LABELS[category],
            description: "Cleans messy customer requests into structured quote cards.",
            examples: "Issue, device, known status, missing info, quote needed",
            workflow: "Customer request is converted into a shop-readable card.",
            bidding: "Businesses send offers.",
            models: [{ role: "Cleaner", name: "Needero Request AI", logoKey: "needaro" }],
        },
        {
            id: "quote_helper",
            planId: "starter",
            planName: "Starter",
            title: "Business Quote Helper",
            tag: "SaaS tool",
            description: "Helps shops write professional replies with price, time, warranty, and note.",
            examples: "Professional offer replies",
            workflow: "Shop enters rough price and Needero improves the reply.",
            bidding: "Businesses compete with offers.",
            models: [{ role: "Quote writer", name: "Needero Reply AI", logoKey: "needaro" }],
        },
    ];
}

export function getDefaultModelGroupForPlan(planId: string, category: WorkCategoryId) {
    const lane = PLAN_TO_LANE[normalizePlanId(planId)];
    return getModelGroupsForCategory(category).find((group) => group.id === lane) ?? getModelGroupsForCategory(category)[0];
}
