"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { BUSINESS_PLANS } from "@/lib/businessPlans";
import {
    WORK_CATEGORY_LABELS,
    LANE_RANK,
    canUseModelLane,
    detectWorkCategory,
    getModelGroupsForCategory,
    normalizePlanId,
    type ModelGroupDefinition,
    type ModelLaneId,
    type PlanId,
    type WorkCategoryId,
} from "@/lib/modelGroups";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock,
    FileText,
    ImagePlus,
    Link as LinkIcon,
    Loader2,
    Send,
    Sparkles,
    UploadCloud,
    X,
} from "lucide-react";
import anthropicLogo from "../../../../logos/anthorpic.png";
import chatgptLogo from "../../../../logos/chatgpt.jpg";
import deepseekLogo from "../../../../logos/deepseek.png";
import fluxLogo from "../../../../logos/flux.png";
import geminiLogo from "../../../../logos/gemini.jpg";
import glmLogo from "../../../../logos/glm.png";
import llamaLogo from "../../../../logos/llama.png";
import midjourneyLogo from "../../../../logos/mid journey.png";
import qwenLogo from "../../../../logos/qwen.png";
import stableDiffusionLogo from "../../../../logos/stable diffusion.png";

type StepId = "scope" | "routing" | "checkout";
type TimelineId = "standard" | "rush";

interface AssetMeta {
    id: string;
    name: string;
    size: number;
    type: string;
}

interface PlanSnapshot {
    id: string;
    name: string;
    monthly_job_limit: number;
    active_job_limit: number;
    delivery_target: string;
    delivery_target_hours: number;
    model_lane: string;
    bidding_lane: string;
    bid_agent_limit: number;
    review_depth: string;
}

interface PlanUsage {
    monthly_jobs_used: number;
    monthly_jobs_remaining: number;
    monthly_job_limit: number;
    active_jobs_used: number;
    active_jobs_remaining: number;
    active_job_limit: number;
    can_post_job: boolean;
    blocking_reason?: string | null;
}

interface BudgetEstimate {
    min_budget_usd: number;
    human_market_cost_usd?: number;
    savings_percent?: number;
    reason?: string;
    strategy?: string;
    model?: string;
    market_breakdown?: MarketBreakdownRow[];
    market_context_available?: boolean;
    plan?: PlanSnapshot;
    usage?: PlanUsage;
}

interface MarketBreakdownRow {
    source: string;
    estimated_cost: string;
    delivery_time: string;
    quality: string;
}

interface CategoryClassification {
    work_category?: WorkCategoryId;
    label?: string;
    confidence?: number;
    reason?: string;
    strategy?: string;
}

const STEPS: Array<{ id: StepId; label: string; eyebrow: string }> = [
    { id: "scope", label: "Scope", eyebrow: "What are we building?" },
    { id: "routing", label: "Routing", eyebrow: "Choose the agent lane" },
    { id: "checkout", label: "Price", eyebrow: "Calculate and send" },
];

const TIMELINES = [
    {
        id: "standard" as const,
        title: "Standard delivery",
        detail: "Best price. Uses your plan delivery target.",
        multiplier: "Lowest price",
        rush: false,
    },
    {
        id: "rush" as const,
        title: "Rush under 1 hour",
        detail: "Higher compute priority and extra review pressure.",
        multiplier: "Higher minimum",
        rush: true,
    },
];

const COMPLEXITY_NOTICE_COPY: Record<
    WorkCategoryId,
    { basic: string; challenge: string; capability: string; outcome: string }
> = {
    development: {
        basic: "basic code",
        challenge: "multi-file architecture and production debugging",
        capability: "deeper code reasoning and sandbox review",
        outcome: "safer production delivery",
    },
    media: {
        basic: "simple cuts and transcripts",
        challenge: "heavy video timelines and render work",
        capability: "video vision, semantic search, and GPU-aware planning",
        outcome: "cleaner media delivery",
    },
    writing: {
        basic: "short copy",
        challenge: "research-heavy writing and brand voice matching",
        capability: "stronger research, fact checks, and editorial review",
        outcome: "sharper business content",
    },
    design: {
        basic: "simple visual assets",
        challenge: "custom animations and pixel-perfect UI",
        capability: "deep visual reasoning",
        outcome: "pixel-perfect delivery",
    },
    automation: {
        basic: "simple data cleanup",
        challenge: "webhooks, scraping, and multi-step automation",
        capability: "tool-use planning and loop-safe execution",
        outcome: "more reliable workflows",
    },
};

const LOGOS_BY_KEY: Record<string, string> = {
    anthropic: anthropicLogo.src,
    chatgpt: chatgptLogo.src,
    deepseek: deepseekLogo.src,
    flux: fluxLogo.src,
    gemini: geminiLogo.src,
    glm: glmLogo.src,
    llama: llamaLogo.src,
    midjourney: midjourneyLogo.src,
    qwen: qwenLogo.src,
    stableDiffusion: stableDiffusionLogo.src,
};

const WORK_CATEGORY_IDS: WorkCategoryId[] = ["development", "media", "writing", "design", "automation"];

function isWorkCategoryId(value: unknown): value is WorkCategoryId {
    return typeof value === "string" && WORK_CATEGORY_IDS.includes(value as WorkCategoryId);
}

function getLogoInitials(name: string) {
    const words = name.replace(/[^a-z0-9\s+.-]/gi, " ").split(/\s+/).filter(Boolean);
    return (words.length >= 2 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2)).toUpperCase();
}

function withLogos(group: ModelGroupDefinition) {
    return {
        ...group,
        logos: group.models.map((model) => ({
            role: model.role,
            name: model.name,
            src: LOGOS_BY_KEY[model.logoKey] ?? "",
        })),
    };
}

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

function buildFallbackPlan(planId: string | null | undefined): PlanSnapshot {
    const fallback = BUSINESS_PLANS.find((plan) => plan.id === planId) ?? BUSINESS_PLANS[0];
    return {
        id: fallback.id,
        name: fallback.name,
        monthly_job_limit: fallback.monthlyJobLimit,
        active_job_limit: fallback.activeJobLimit,
        delivery_target: fallback.deliveryTarget,
        delivery_target_hours: fallback.deliveryTargetHours,
        model_lane: fallback.modelLane,
        bidding_lane: fallback.biddingLane,
        bid_agent_limit: fallback.bidAgentLimit,
        review_depth: fallback.reviewDepth,
    };
}

function formatMoney(value: number | null | undefined) {
    return typeof value === "number" && Number.isFinite(value) ? `$${value.toFixed(2)}` : "$0.00";
}

function formatFileSize(bytes: number) {
    return bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseLinks(value: string) {
    return value.split(/[\n,]+/).map((link) => link.trim()).filter(Boolean);
}

function inferPromptAssetEstimate(title: string, goal: string, links: string[]) {
    const text = `${title} ${goal}`.toLowerCase();
    const sizeMatches = Array.from(text.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*(gb|mb|kb)\b/g));
    const explicitMb = sizeMatches.reduce((total, match) => {
        const value = Number(match[1]);
        const unit = match[2];
        if (!Number.isFinite(value)) {
            return total;
        }
        if (unit === "gb") {
            return total + value * 1024;
        }
        if (unit === "kb") {
            return total + value / 1024;
        }
        return total + value;
    }, 0);

    const countMatch = text.match(/([0-9]+)\s*(files|images|videos|clips|pages|urls|links|csvs|records|rows|products)\b/);
    const mentionedCount = countMatch ? Number(countMatch[1]) : 0;
    const promptSignals = [
        /\b(video|audio|podcast|render|vfx|timeline|youtube|clip)\b/.test(text),
        /\b(image|logo|thumbnail|banner|brand|figma|ui|ux|mockup|animation)\b/.test(text),
        /\b(scraper|scrape|proxy|database|dashboard|frontend|backend|api|webhook|automation|csv)\b/.test(text),
        /\b(research|whitepaper|article|blog|seo|pitch deck)\b/.test(text),
    ].filter(Boolean).length;

    if (explicitMb > 0 || mentionedCount > 0 || links.length > 0 || promptSignals > 0) {
        const estimatedMb =
            explicitMb ||
            (/\b(video|audio|render|vfx|timeline|youtube)\b/.test(text)
                ? 120
                : /\b(image|logo|thumbnail|banner|figma|mockup)\b/.test(text)
                  ? 2
                  : /\b(scraper|proxy|database|dashboard|frontend|backend|api|automation)\b/.test(text)
                    ? 1.5
                    : 0.1);
        const count = Math.max(links.length, mentionedCount, promptSignals > 0 ? 1 : 0);
        return {
            count,
            mb: Math.max(0.05, estimatedMb),
            label: links.length > 0 ? `${links.length} reference links` : "Prompt scope",
            detail: `inferred ${Math.max(0.05, estimatedMb).toFixed(2)} MB workload`,
            derived: true,
        };
    }

    return {
        count: 1,
        mb: 0.05,
        label: "Prompt scope",
        detail: "text-only workload",
        derived: true,
    };
}

function BrandLogoStrip({ logos }: { logos: Array<{ role: string; name: string; src: string }> }) {
    return (
        <div className="grid gap-2">
            {logos.map((logo) => (
                <div
                    key={logo.name}
                    className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    title={logo.name}
                >
                    {logo.src ? (
                        <img
                            src={logo.src}
                            alt={`${logo.name} logo`}
                            className="h-7 w-7 shrink-0 rounded-xl object-contain grayscale"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[9px] font-black text-slate-950">
                            {getLogoInitials(logo.name)}
                        </span>
                    )}
                    <span className="min-w-0">
                        <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                            {logo.role}
                        </span>
                        <span className="block truncate text-xs font-black text-slate-950">{logo.name}</span>
                    </span>
                </div>
            ))}
        </div>
    );
}

async function createThumbnailDataUrl(file: File) {
    if (!file.type.startsWith("image/")) {
        return null;
    }

    return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onerror = () => resolve(null);
        reader.onload = () => {
            const source = typeof reader.result === "string" ? reader.result : "";
            if (!source) {
                resolve(null);
                return;
            }

            const image = new window.Image();
            image.onerror = () => resolve(null);
            image.onload = () => {
                const maxEdge = 720;
                const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext("2d");
                if (!context) {
                    resolve(null);
                    return;
                }
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.72));
            };
            image.src = source;
        };
        reader.readAsDataURL(file);
    });
}

async function readAssetTextPreview(file: File) {
    const readableTypes = [
        "text/",
        "application/json",
        "application/csv",
        "application/xml",
        "application/javascript",
    ];
    const readableExtensions = [".txt", ".md", ".csv", ".json", ".xml", ".html", ".css", ".js", ".ts", ".tsx"];
    const lowerName = file.name.toLowerCase();
    const canRead =
        readableTypes.some((type) => file.type.startsWith(type)) ||
        readableExtensions.some((extension) => lowerName.endsWith(extension));

    if (!canRead || file.size > 750_000) {
        return "";
    }

    const text = await file.text();
    return `File: ${file.name}\n${text.slice(0, 4000)}`;
}

export default function NewClientJobPage() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const [step, setStep] = useState<StepId>("scope");
    const [jobTitle, setJobTitle] = useState("");
    const [goal, setGoal] = useState("");
    const [timeline, setTimeline] = useState<TimelineId>("standard");
    const [assetLinkText, setAssetLinkText] = useState("");
    const [assets, setAssets] = useState<AssetMeta[]>([]);
    const [assetTextPreview, setAssetTextPreview] = useState("");
    const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
    const [planInfo, setPlanInfo] = useState<PlanSnapshot | null>(null);
    const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
    const [selectedLane, setSelectedLane] = useState<ModelLaneId>("flash");
    const [enableBidding, setEnableBidding] = useState(false);
    const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);
    const [estimateKey, setEstimateKey] = useState("");
    const [isEstimating, setIsEstimating] = useState(false);
    const [isClassifyingCategory, setIsClassifyingCategory] = useState(false);
    const [aiWorkCategory, setAiWorkCategory] = useState<WorkCategoryId | null>(null);
    const [categoryReason, setCategoryReason] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState("");

    const activePlan = planInfo ?? buildFallbackPlan(profile?.currentPlanId);
    const selectedTimeline = TIMELINES.find((item) => item.id === timeline) ?? TIMELINES[0];
    const currentStepIndex = STEPS.findIndex((item) => item.id === step);
    const assetLinks = useMemo(() => parseLinks(assetLinkText), [assetLinkText]);
    const assetTotalMb = useMemo(
        () => Math.round((assets.reduce((sum, asset) => sum + asset.size, 0) / (1024 * 1024)) * 100) / 100,
        [assets],
    );
    const assetTypes = useMemo(
        () => Array.from(new Set(assets.map((asset) => asset.type || "unknown"))),
        [assets],
    );
    const promptAssetEstimate = useMemo(
        () => inferPromptAssetEstimate(jobTitle, goal, assetLinks),
        [assetLinks, goal, jobTitle],
    );
    const effectiveAssetCount = assets.length > 0 ? assets.length : promptAssetEstimate.count;
    const effectiveAssetTotalMb = assets.length > 0 ? assetTotalMb : promptAssetEstimate.mb;
    const assetSummaryText =
        assets.length > 0
            ? `${assets.length} files - ${assetTotalMb.toFixed(2)} MB`
            : `${promptAssetEstimate.label} - ${promptAssetEstimate.detail}`;
    const fallbackWorkCategory = useMemo(
        () =>
            detectWorkCategory({
                title: jobTitle,
                description: goal,
                assetTypes,
                assetLinks,
                assetTotalMb: effectiveAssetTotalMb,
            }),
        [assetLinks, assetTypes, effectiveAssetTotalMb, goal, jobTitle],
    );
    const detectedWorkCategory = aiWorkCategory ?? fallbackWorkCategory;
    const classificationKey = useMemo(
        () =>
            JSON.stringify({
                title: jobTitle.trim(),
                goal: goal.trim(),
                assetTypes,
                assetLinks,
                assetTotalMb: effectiveAssetTotalMb,
                assetCount: effectiveAssetCount,
            }),
        [assetLinks, assetTypes, effectiveAssetCount, effectiveAssetTotalMb, goal, jobTitle],
    );
    const modelGroups = useMemo(
        () => getModelGroupsForCategory(detectedWorkCategory).map(withLogos),
        [detectedWorkCategory],
    );
    const selectedLaneInfo = modelGroups.find((lane) => lane.id === selectedLane) ?? modelGroups[0];
    const canContinueScope = jobTitle.trim().length >= 3 && goal.trim().length >= 15;
    const canPostByPlan = planUsage?.can_post_job ?? true;
    const selectedLaneAllowed = canUseModelLane(activePlan.id, selectedLane);
    const canEnableBidding = activePlan.bid_agent_limit > 0 && ["advanced", "elite"].includes(selectedLane);

    const scopeComplexity = useMemo(() => {
        const text = `${jobTitle} ${goal} ${assetTypes.join(" ")}`.toLowerCase();
        const reasons: string[] = [];
        let score = 0;

        if (effectiveAssetTotalMb > 50) {
            reasons.push("large raw assets");
            score += effectiveAssetTotalMb > 250 ? 2 : 1;
        }
        if (assetTypes.some((type) => type.startsWith("video/")) || /\b(video|render|youtube|timeline|motion)\b/.test(text)) {
            reasons.push("video or timeline work");
            score += 2;
        }
        if (/\b(full[- ]?stack|backend|frontend|multi[- ]?file|debug|architecture|production)\b/.test(text)) {
            reasons.push("engineering complexity");
            score += 2;
        }
        if (/\b(animation|pixel perfect|figma|design system|custom css|motion)\b/.test(text)) {
            reasons.push("deep visual reasoning");
            score += 2;
        }
        if (/\b(scraper|scrape|proxy|proxy rotation|database|webhook|pipeline|puppeteer|automation)\b/.test(text)) {
            reasons.push("automation and integration complexity");
            score += 2;
        }
        if (assetLinks.length > 0 || promptAssetEstimate.derived) {
            score += Math.min(1, assetLinks.length * 0.25);
        }
        if (timeline === "rush") {
            reasons.push("rush delivery");
            score += 1;
        }

        const recommendedLane: ModelLaneId = score >= 5 ? "elite" : score >= 2 ? "advanced" : score >= 1 ? "standard" : "flash";
        const uniqueReasons = Array.from(new Set(reasons));
        return { isComplex: uniqueReasons.length > 0, reasons: uniqueReasons, score, recommendedLane };
    }, [assetLinks.length, assetTypes, effectiveAssetTotalMb, goal, jobTitle, promptAssetEstimate.derived, timeline]);
    const complexityNotice = useMemo(() => {
        const recommendedLaneInfo =
            modelGroups.find((lane) => lane.id === scopeComplexity.recommendedLane) ?? modelGroups[0];
        if (!scopeComplexity.isComplex || LANE_RANK[selectedLane] >= LANE_RANK[recommendedLaneInfo.id]) {
            return null;
        }

        const copy = COMPLEXITY_NOTICE_COPY[detectedWorkCategory];
        return {
            title: `${recommendedLaneInfo.title} recommended`,
            body: `Notice: ${selectedLaneInfo.title} handles ${copy.basic} well, but ${copy.challenge} require ${copy.capability}. Upgrade to the ${recommendedLaneInfo.planName} to unlock ${recommendedLaneInfo.tag} for ${copy.outcome}.`,
        };
    }, [detectedWorkCategory, modelGroups, scopeComplexity.isComplex, scopeComplexity.recommendedLane, selectedLane, selectedLaneInfo.title]);

    const payloadKey = useMemo(
        () =>
            JSON.stringify({
                title: jobTitle.trim(),
                goal: goal.trim(),
                timeline,
                links: assetLinks,
                assetTotalMb: effectiveAssetTotalMb,
                assetCount: effectiveAssetCount,
                assetTypes,
                assetTextPreview,
                selectedLane,
                detectedWorkCategory,
                aiWorkCategory,
                complexityScore: scopeComplexity.score,
                complexityReasons: scopeComplexity.reasons,
                enableBidding,
                plan: activePlan.id,
            }),
        [
            activePlan.id,
            assetLinks,
            assetTextPreview,
            assetTypes,
            aiWorkCategory,
            detectedWorkCategory,
            effectiveAssetCount,
            effectiveAssetTotalMb,
            enableBidding,
            goal,
            jobTitle,
            selectedLane,
            scopeComplexity.reasons,
            scopeComplexity.score,
            timeline,
        ],
    );

    useEffect(() => {
        setAiWorkCategory(null);
        setCategoryReason("");
    }, [classificationKey]);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        const fetchPlan = async () => {
            try {
                const response = await fetch(`/api/client/${user.uid}/jobs`);
                const data = await response.json();
                setPlanInfo(data.plan ?? null);
                setPlanUsage(data.usage ?? null);
            } catch (fetchError) {
                console.error("Failed to fetch plan usage:", fetchError);
            }
        };

        void fetchPlan();
    }, [user?.uid]);

    useEffect(() => {
        const laneByPlan: Record<PlanId, ModelLaneId> = {
            free: "flash",
            starter: "standard",
            growth: "advanced",
            scale: "elite",
        };
        setSelectedLane(laneByPlan[normalizePlanId(activePlan.id)]);
    }, [activePlan.id]);

    useEffect(() => {
        setEnableBidding(canEnableBidding);
    }, [canEnableBidding]);

    useEffect(() => {
        if (payloadKey !== estimateKey) {
            setEstimate(null);
        }
    }, [estimateKey, payloadKey]);

    const buildPricingPayload = () => ({
        client_uid: user?.uid ?? "",
        current_plan_id: activePlan.id,
        title: jobTitle.trim(),
        description: goal.trim(),
        timeline: selectedTimeline.title,
        rush: selectedTimeline.rush,
        asset_links: assetLinks,
        asset_total_mb: effectiveAssetTotalMb,
        asset_count: effectiveAssetCount,
        asset_source: assets.length > 0 ? "uploaded-files" : "prompt-derived",
        asset_types: assetTypes,
        asset_text_preview: assetTextPreview,
        work_category: detectedWorkCategory,
        complexity_score: scopeComplexity.score,
        complexity_reasons: scopeComplexity.reasons,
        recommended_model_lane: scopeComplexity.recommendedLane,
        model_lane: selectedLane,
        model_group_id: selectedLaneInfo.id,
        model_group: `${selectedLaneInfo.title} - ${selectedLaneInfo.tag}. ${selectedLaneInfo.workflow}`,
        bidding_enabled: canEnableBidding && enableBidding,
    });

    const classifyWorkCategory = async () => {
        setIsClassifyingCategory(true);
        try {
            const response = await fetch("/api/classify-job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: jobTitle.trim(),
                    description: goal.trim(),
                    asset_links: assetLinks,
                    asset_total_mb: effectiveAssetTotalMb,
                    asset_count: effectiveAssetCount,
                    asset_types: assetTypes,
                    asset_text_preview: assetTextPreview,
                }),
            });
            const data = (await response.json()) as CategoryClassification;
            if (!response.ok) {
                throw new Error("DeepSeek classification failed.");
            }
            if (isWorkCategoryId(data.work_category)) {
                setAiWorkCategory(data.work_category);
                setCategoryReason(data.reason || "");
                return data.work_category;
            }
        } catch (classifyError) {
            console.warn("Category classification fallback used:", classifyError);
        } finally {
            setIsClassifyingCategory(false);
        }

        setAiWorkCategory(fallbackWorkCategory);
        setCategoryReason("Routed by local context while DeepSeek classification was unavailable.");
        return fallbackWorkCategory;
    };

    const handleAssetUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) {
            return;
        }

        const nextAssets = files.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            size: file.size,
            type: file.type || "unknown",
        }));

        setAssets((current) => {
            const existingIds = new Set(current.map((asset) => asset.id));
            return [...current, ...nextAssets.filter((asset) => !existingIds.has(asset.id))];
        });

        if (!thumbnailDataUrl) {
            const firstImage = files.find((file) => file.type.startsWith("image/"));
            if (firstImage) {
                const thumbnail = await createThumbnailDataUrl(firstImage);
                if (thumbnail) {
                    setThumbnailDataUrl(thumbnail);
                }
            }
        }

        const textPreviews = await Promise.all(files.map((file) => readAssetTextPreview(file)));
        const readablePreview = textPreviews.filter(Boolean).join("\n\n---\n\n");
        if (readablePreview) {
            setAssetTextPreview((current) => `${current}\n\n${readablePreview}`.trim().slice(0, 6000));
        }

        event.target.value = "";
    };

    const calculateEstimate = async () => {
        if (!user?.uid || !canContinueScope || !selectedLaneAllowed) {
            return null;
        }

        setIsEstimating(true);
        setError("");
        try {
            const response = await fetch("/api/estimate-budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPricingPayload()),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Failed to calculate project minimum.");
            }

            const nextEstimate = data as BudgetEstimate;
            setEstimate(nextEstimate);
            setEstimateKey(payloadKey);
            if (nextEstimate.plan) {
                setPlanInfo(nextEstimate.plan);
            }
            if (nextEstimate.usage) {
                setPlanUsage(nextEstimate.usage);
            }
            return nextEstimate;
        } catch (estimateError) {
            const message = estimateError instanceof Error ? estimateError.message : "Failed to calculate project minimum.";
            setError(message);
            return null;
        } finally {
            setIsEstimating(false);
        }
    };

    const goNext = async () => {
        if (step === "scope") {
            if (!canContinueScope) {
                setError("Add a clear title and goal so the project manager can price the job.");
                return;
            }
            setError("");
            await classifyWorkCategory();
            setStep("routing");
            return;
        }

        if (step === "routing") {
            if (!selectedLaneAllowed) {
                setError("This model lane is locked for your current plan.");
                return;
            }
            setError("");
            setStep("checkout");
            await calculateEstimate();
        }
    };

    const goBack = () => {
        setError("");
        if (step === "routing") {
            setStep("scope");
        } else if (step === "checkout") {
            setStep("routing");
        }
    };

    const submitJob = async () => {
        if (!user?.uid) {
            setError("Sign in before posting a job.");
            return;
        }
        if (!canPostByPlan) {
            setError(planUsage?.blocking_reason || "Your current plan cannot post another job right now.");
            return;
        }

        setIsPosting(true);
        setError("");
        try {
            const readyEstimate = estimate ?? (await calculateEstimate());
            if (!readyEstimate) {
                throw new Error("Calculate the project minimum before sending the job to models.");
            }

            const response = await fetch("/api/client/job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...buildPricingPayload(),
                    budget_usd: readyEstimate.min_budget_usd,
                    thumbnail_data_url: thumbnailDataUrl,
                    enable_marketplace_bidding: canEnableBidding && enableBidding,
                    bidding_lane: activePlan.bidding_lane,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Failed to post job.");
            }

            router.push("/client");
        } catch (postError) {
            const message = postError instanceof Error ? postError.message : "Failed to post job.";
            setError(message);
        } finally {
            setIsPosting(false);
        }
    };

    const renderScope = () => (
        <section className="overflow-hidden rounded-[34px] border border-white bg-white shadow-xl shadow-slate-900/5">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 md:px-8">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Step 1 - Scope</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">What are we building?</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Keep it plain. The project manager uses these signals to estimate real effort.
                </p>
            </div>

            <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                    <label className="block">
                        <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                            Job title
                        </span>
                        <input
                            value={jobTitle}
                            onChange={(event) => setJobTitle(event.target.value)}
                            placeholder="Build a React landing page"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition-all focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                            Goal and requirements
                        </span>
                        <textarea
                            value={goal}
                            onChange={(event) => setGoal(event.target.value)}
                            placeholder="Describe the outcome, style, pages, constraints, examples, and anything the agent must avoid."
                            rows={8}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition-all focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10"
                        />
                    </label>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                                Raw assets
                            </span>
                            <span className="text-xs text-slate-400">Files are measured for pricing context.</span>
                        </div>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-all hover:border-slate-500 hover:bg-white">
                            <input type="file" multiple className="hidden" onChange={handleAssetUpload} />
                            <UploadCloud className="mb-3 text-slate-950" size={30} />
                            <span className="text-sm font-black text-slate-950">Upload raw assets or reference files</span>
                            <span className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                                Images, documents, CSVs, videos, brand files, or anything that changes the real job size.
                            </span>
                        </label>

                        {assets.length > 0 && (
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                                {assets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-slate-800">{asset.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {formatFileSize(asset.size)} - {asset.type || "unknown"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAssets((current) => current.filter((item) => item.id !== asset.id))}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                            <LinkIcon size={14} />
                            Asset or reference links
                        </span>
                        <textarea
                            value={assetLinkText}
                            onChange={(event) => setAssetLinkText(event.target.value)}
                            placeholder="Paste Drive, Figma, YouTube, GitHub, docs, or reference links. One per line."
                            rows={4}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition-all focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10"
                        />
                    </label>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
                        <Clock className="mb-4 text-white" size={24} />
                        <h3 className="text-lg font-black">Timeline</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Rush work costs more because the system reserves faster execution and review.
                        </p>
                        <div className="mt-5 space-y-3">
                            {TIMELINES.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTimeline(item.id)}
                                    className={cx(
                                        "w-full rounded-2xl border p-4 text-left transition-all",
                                        timeline === item.id
                                            ? "border-white bg-white/15"
                                            : "border-white/10 bg-white/5 hover:bg-white/10",
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-3">
                                        <span className="font-black">{item.title}</span>
                                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                            {item.multiplier}
                                        </span>
                                    </span>
                                    <span className="mt-2 block text-xs leading-5 text-slate-300">{item.detail}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                        <p className="text-sm font-black text-slate-950">Pricing reads more than text.</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-500">
                            <div className="flex gap-3">
                                <CheckCircle2 className="mt-0.5 shrink-0 text-slate-950" size={16} />
                                File size helps estimate analysis and tool cost.
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="mt-0.5 shrink-0 text-slate-950" size={16} />
                                Rush delivery increases the minimum only when needed.
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="mt-0.5 shrink-0 text-slate-950" size={16} />
                                Simple writing stays cheap instead of being over-priced.
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
    const renderRouting = () => (
        <section className="rounded-[34px] border border-white bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
            <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                    Step 2 - Model routing
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Select model group.</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Each plan has a purpose-built model cluster. Higher plans unlock stronger councils, deeper review,
                    and bidding execution where the plan allows it.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-950">
                        Detected work type: {WORK_CATEGORY_LABELS[detectedWorkCategory]}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                        {isClassifyingCategory
                            ? "DeepSeek is choosing the route..."
                            : aiWorkCategory
                              ? "DeepSeek selected this route from the project scope."
                              : "Local route preview. Continue from Step 1 to ask DeepSeek."}
                    </div>
                </div>
                {categoryReason && (
                    <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">{categoryReason}</p>
                )}
            </div>

            {complexityNotice && (
                <div className="mb-5 flex gap-3 rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800">
                    <AlertTriangle className="mt-0.5 shrink-0 text-slate-950" size={19} />
                    <div>
                        <p className="font-black">{complexityNotice.title}</p>
                        <p className="mt-1 leading-6">{complexityNotice.body}</p>
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                            Complexity signals: {scopeComplexity.reasons.join(", ")}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-4">
                {modelGroups.map((lane) => {
                    const available = canUseModelLane(activePlan.id, lane.id);
                    const active = selectedLane === lane.id;
                    return (
                        <button
                            key={lane.id}
                            type="button"
                            onClick={() => {
                                if (available) {
                                    setSelectedLane(lane.id);
                                    setError("");
                                } else {
                                    setError(`${lane.title} unlocks on the ${lane.planName}.`);
                                }
                            }}
                            className={cx(
                                "relative flex min-h-[520px] flex-col overflow-hidden rounded-[30px] border p-5 text-left transition-all",
                                active && available
                                    ? "border-slate-950 bg-slate-50 shadow-lg shadow-slate-900/10"
                                    : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50",
                                !available && "opacity-70",
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                    {lane.planName}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                    {lane.bidding}
                                </p>
                            </div>
                            <h3 className="mt-4 text-xl font-black leading-tight text-slate-950">{lane.title}</h3>
                            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{lane.tag}</p>
                            <p className="mt-4 text-sm leading-6 text-slate-500">{lane.description}</p>
                            <div className="mt-5">
                                <BrandLogoStrip logos={lane.logos} />
                            </div>
                            <div className="mt-5 rounded-2xl bg-white p-4 text-xs leading-5 text-slate-500">
                                <span className="font-black text-slate-700">How it works:</span> {lane.workflow}
                            </div>
                            <div className="mt-3 rounded-2xl bg-white p-4 text-xs leading-5 text-slate-500">
                                <span className="font-black text-slate-700">Best for:</span> {lane.examples}
                            </div>
                            {active && available && (
                                <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-black text-slate-950">
                                    <CheckCircle2 size={17} />
                                    Selected for this job
                                </div>
                            )}
                            {!available && (
                                <div className="mt-auto pt-5 text-sm font-black text-slate-400">
                                    Unlocks on {lane.planName}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-black text-slate-950">Marketplace bidding</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {canEnableBidding
                                ? `${activePlan.name} can send this job to ${activePlan.bid_agent_limit} execution agents. Agents compete, which can reduce your minimum price before you send the job.`
                                : "Bidding unlocks on Growth and Scale. Agents compete to reduce the protected minimum price when the selected lane supports it."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-950">
                            {enableBidding && canEnableBidding ? "On" : "Off"}
                        </span>
                        <button
                            type="button"
                            onClick={() => canEnableBidding && setEnableBidding((current) => !current)}
                            disabled={!canEnableBidding}
                            className={cx(
                                "relative h-8 w-14 rounded-full border transition-all",
                                canEnableBidding ? "border-slate-950 bg-white" : "cursor-not-allowed border-slate-200 bg-slate-100",
                                enableBidding && canEnableBidding && "bg-slate-950",
                            )}
                            aria-label="Toggle marketplace bidding"
                        >
                            <span
                                className={cx(
                                    "absolute top-1 h-6 w-6 rounded-full transition-transform",
                                    enableBidding && canEnableBidding
                                        ? "translate-x-6 bg-white"
                                        : "translate-x-1 bg-slate-950",
                                    !canEnableBidding && "bg-slate-300",
                                )}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plan lane</p>
                    <p className="mt-2 font-black text-slate-950">{activePlan.model_lane}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bidding execution</p>
                    <p className="mt-2 font-black text-slate-950">
                        {canEnableBidding && enableBidding ? `${activePlan.bid_agent_limit} agents` : "Off"}
                    </p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Review depth</p>
                    <p className="mt-2 font-black text-slate-950">{activePlan.review_depth}</p>
                </div>
            </div>
        </section>
    );
    const renderCheckout = () => (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-[34px] border border-white bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                    Step 3 - Price check
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Calculate market price.</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    The Mesh Project Manager compares the job against realistic freelancer cost, then sets the lowest safe
                    AI-labor price for this plan and routing lane.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 shadow-sm">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                    Powered by DeepSeek R1 · live market search · Groq + OpenRouter scouts
                </div>

                <div className="mt-8 rounded-[30px] border border-slate-200 bg-slate-50 p-6">
                    {isEstimating ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                            <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-lg">
                                <div className="absolute inset-0 animate-ping rounded-[32px] bg-slate-400/20" />
                                <Loader2 className="animate-spin text-slate-950" size={34} />
                            </div>
                            <p className="text-lg font-black text-slate-950">
                                DeepSeek R1 is analyzing market prices...
                            </p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Searching Fiverr, Upwork, and freelancer marketplaces in real-time. Cross-referencing with Groq and OpenRouter market scouts.
                            </p>
                        </div>
                    ) : estimate ? (
                        <div>
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                                        Project minimum
                                    </p>
                                    <p className="mt-3 text-5xl font-black tracking-tight text-slate-950">
                                        {formatMoney(estimate.min_budget_usd)}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {estimate.reason ||
                                            "Calculated as a low AI project price compared with typical freelancer rates."}
                                    </p>
                                    {estimate.strategy && (
                                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            {estimate.strategy === "deepseek-r1-pricing" ? "DeepSeek R1 Reasoner" : estimate.strategy === "deepseek-v3-pricing" ? "DeepSeek V3" : estimate.strategy}
                                            {estimate.market_context_available && " · Live web data"}
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-3xl bg-white p-5 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Fiverr / web market
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-slate-400 line-through">
                                        {formatMoney(estimate.human_market_cost_usd)}
                                    </p>
                                    <p className="mt-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-sm font-black text-white">
                                        {typeof estimate.savings_percent === "number"
                                            ? `${estimate.savings_percent.toFixed(1)}% cheaper`
                                            : "AI-labor price"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl bg-white p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Route</p>
                                    <p className="mt-2 text-sm font-black text-slate-950">{selectedLaneInfo.title}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timeline</p>
                                    <p className="mt-2 text-sm font-black text-slate-950">{selectedTimeline.title}</p>
                                </div>
                                <div className="rounded-2xl bg-white p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assets</p>
                                    <p className="mt-2 text-sm font-black text-slate-950">
                                        {assetSummaryText}
                                    </p>
                                </div>
                            </div>

                            {estimate.market_breakdown && estimate.market_breakdown.length > 0 && (
                                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                                            Market comparison
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {estimate.market_context_available
                                                ? "Generated by DeepSeek R1 using live Tavily web search data."
                                                : "Generated by DeepSeek R1 from real marketplace pricing intelligence."}
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[680px] text-left text-sm">
                                            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3">Source</th>
                                                    <th className="px-4 py-3">Estimated cost</th>
                                                    <th className="px-4 py-3">Delivery</th>
                                                    <th className="px-4 py-3">Quality / flexibility</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {estimate.market_breakdown.map((row) => (
                                                    <tr key={row.source}>
                                                        <td className="px-4 py-3 font-black text-slate-950">{row.source}</td>
                                                        <td className="px-4 py-3 font-black text-slate-950">{row.estimated_cost}</td>
                                                        <td className="px-4 py-3 text-slate-600">{row.delivery_time}</td>
                                                        <td className="px-4 py-3 text-slate-600">{row.quality}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-sm">
                                <FileText className="text-slate-950" size={30} />
                            </div>
                            <p className="text-lg font-black text-slate-950">Ready for pricing.</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Calculate the project minimum before sending the job to models.
                            </p>
                            <button
                                type="button"
                                onClick={calculateEstimate}
                                disabled={isEstimating}
                                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Sparkles size={16} />
                                Calculate Market Price
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <aside className="rounded-[34px] border border-white bg-white p-6 shadow-xl shadow-slate-900/5">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Job summary</p>
                <h3 className="mt-3 text-xl font-black text-slate-950">{jobTitle || "Untitled job"}</h3>
                <p className="mt-3 line-clamp-6 text-sm leading-6 text-slate-500">
                    {goal || "No requirements added yet."}
                </p>

                {thumbnailDataUrl ? (
                    <img
                        src={thumbnailDataUrl}
                        alt="Uploaded job thumbnail"
                        className="mt-5 h-40 w-full rounded-3xl object-cover"
                    />
                ) : (
                    <div className="mt-5 flex h-40 w-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                        <ImagePlus className="text-slate-300" size={28} />
                    </div>
                )}

                <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Plan</span>
                        <span className="font-black text-slate-950">{activePlan.name}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Work type</span>
                        <span className="text-right font-black text-slate-950">{WORK_CATEGORY_LABELS[detectedWorkCategory]}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Model group</span>
                        <span className="text-right font-black text-slate-950">{selectedLaneInfo.title}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Bidding</span>
                        <span className="font-black text-slate-950">
                            {canEnableBidding && enableBidding
                                ? `${activePlan.bid_agent_limit} agents`
                                : "Off"}
                        </span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Links</span>
                        <span className="font-black text-slate-950">{assetLinks.length}</span>
                    </div>
                </div>

                {!canPostByPlan && (
                    <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
                        {planUsage?.blocking_reason || "Your current plan cannot post another job right now."}
                    </div>
                )}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <span className="font-black text-slate-950">First step: send to models.</span> The protected
                    minimum is saved with the job so future billing and execution cannot undercut compute cost or
                    platform margin.
                </div>

                <button
                    type="button"
                    onClick={submitJob}
                    disabled={!estimate || isPosting || isEstimating || !canPostByPlan}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPosting ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                    Send To Models
                </button>
                <button
                    type="button"
                    onClick={calculateEstimate}
                    disabled={isEstimating}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Sparkles size={16} />
                    Recalculate Minimum
                </button>
            </aside>
        </section>
    );

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <Link
                                href="/client"
                                className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                            >
                                <ArrowLeft size={14} />
                                Back to jobs
                            </Link>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-slate-700">
                                <Sparkles size={14} />
                                Job request
                            </div>
                            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                                Create a job request.
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                                Add the work details, choose the model group, then compare real market price against the
                                AI project minimum.
                            </p>
                        </div>

                        <div className="rounded-[28px] border border-white bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Current plan</p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                                    {activePlan.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-950">{activePlan.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {activePlan.model_lane} - {activePlan.delivery_target}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                        <aside className="space-y-4">
                            <div className="rounded-[30px] border border-white bg-white p-4 shadow-sm">
                                {STEPS.map((item, index) => {
                                    const isActive = item.id === step;
                                    const isDone = index < currentStepIndex;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                if (index <= currentStepIndex) {
                                                    setStep(item.id);
                                                }
                                            }}
                                            className={cx(
                                                "mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all last:mb-0",
                                                isActive && "bg-slate-950 text-white shadow-lg shadow-slate-900/15",
                                                !isActive && "text-slate-600 hover:bg-slate-50",
                                            )}
                                        >
                                            <span
                                                className={cx(
                                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                                                    isActive && "bg-white text-slate-950",
                                                    !isActive && isDone && "bg-slate-100 text-slate-950",
                                                    !isActive && !isDone && "bg-slate-100 text-slate-400",
                                                )}
                                            >
                                                {isDone ? <CheckCircle2 size={17} /> : index + 1}
                                            </span>
                                            <span>
                                                <span className="block text-sm font-black">{item.label}</span>
                                                <span className={cx("block text-xs", isActive ? "text-slate-200" : "text-slate-400")}>
                                                    {item.eyebrow}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-700">
                                    Live pricing inputs
                                </p>
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Assets</span>
                                        <span className="text-right font-bold text-slate-950">
                                            {assets.length > 0 ? `${assets.length} files` : promptAssetEstimate.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Workload size</span>
                                        <span className="text-right font-bold text-slate-950">
                                            {assets.length > 0 ? `${assetTotalMb.toFixed(2)} MB` : promptAssetEstimate.detail}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Timeline</span>
                                        <span className="font-bold text-slate-950">{selectedTimeline.title}</span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Lane</span>
                                        <span className="text-right font-bold text-slate-950">{selectedLaneInfo.title}</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <main className="min-w-0">
                            {error && (
                                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {step === "scope" && renderScope()}
                            {step === "routing" && renderRouting()}
                            {step === "checkout" && renderCheckout()}

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    disabled={step === "scope"}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>

                                {step !== "checkout" ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        disabled={isClassifyingCategory}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {step === "scope" && isClassifyingCategory ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Classifying route
                                            </>
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        href="/client"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-slate-400 hover:text-slate-950"
                                    >
                                        View active jobs
                                        <Briefcase size={16} />
                                    </Link>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
