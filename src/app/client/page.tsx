"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { BUSINESS_PLANS } from "@/lib/businessPlans";
import {
    AlertCircle,
    Briefcase,
    Check,
    Clock,
    Crown,
    ExternalLink,
    Filter,
    History,
    ImagePlus,
    Plus,
    Search,
    Send,
    Sparkles,
    X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_MINIMUM_BUDGET = 0.01;
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_THUMBNAIL_DATA_URL_LENGTH = 1_200_000;
const MAX_THUMBNAIL_EDGE = 1200;

interface Job {
    id: string;
    title: string;
    description: string;
    budget_usd: number;
    estimated_api_cost_usd?: number | null;
    minimum_budget_usd?: number | null;
    status: string;
    created_at: string;
    thumbnail_data_url?: string | null;
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

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(file);
    });
}

function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load the image."));
        image.src = source;
    });
}

async function createThumbnailDataUrl(file: File) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files can be attached as job thumbnails.");
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("Please upload an image smaller than 6 MB.");
    }

    const source = await readFileAsDataUrl(file);
    const image = await loadImage(source);
    const scale = Math.min(1, MAX_THUMBNAIL_EDGE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Your browser could not prepare the thumbnail.");
    }

    context.drawImage(image, 0, 0, width, height);

    let quality = 0.86;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > MAX_THUMBNAIL_DATA_URL_LENGTH && quality > 0.5) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    if (dataUrl.length > MAX_THUMBNAIL_DATA_URL_LENGTH) {
        throw new Error("That image is still too large after compression. Try a smaller thumbnail.");
    }

    return dataUrl;
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
        review_depth: fallback.reviewDepth,
    };
}

export default function ClientDashboard() {
    const { user, profile } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(0);
    const [minimumBudget, setMinimumBudget] = useState(0);
    const [estimatedApiCost, setEstimatedApiCost] = useState(0);
    const [budgetReason, setBudgetReason] = useState("");
    const [budgetStrategy, setBudgetStrategy] = useState("");
    const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
    const [thumbnailName, setThumbnailName] = useState("");
    const [thumbnailError, setThumbnailError] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [planInfo, setPlanInfo] = useState<PlanSnapshot | null>(null);
    const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [enableMarketplaceBidding, setEnableMarketplaceBidding] = useState(true);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [estimatingBudget, setEstimatingBudget] = useState(false);
    const [formError, setFormError] = useState("");
    const previousMinimumBudgetRef = useRef(DEFAULT_MINIMUM_BUDGET);

    const activePlan = planInfo ?? buildFallbackPlan(profile?.currentPlanId);

    useEffect(() => {
        if (user?.uid) {
            void fetchJobs();
        }
    }, [user?.uid]);

    useEffect(() => {
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!user?.uid) {
            return;
        }

        if (!trimmedTitle || trimmedDescription.length < 10) {
            setEstimatingBudget(false);
            if (!trimmedTitle && !trimmedDescription) {
                previousMinimumBudgetRef.current = 0;
                setMinimumBudget(0);
                setEstimatedApiCost(0);
                setBudgetReason("");
                setBudgetStrategy("");
                setBudget(0);
            }
            return;
        }
    }, [user?.uid, title, description]);

    const calculateMinimumBudget = async () => {
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle || trimmedDescription.length < 10) {
            setFormError("Please provide a title and at least 10 characters in the description.");
            return;
        }

        setEstimatingBudget(true);
        setFormError("");
        try {
            const response = await fetch(`/api/estimate-budget`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: trimmedDescription,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Unable to estimate the minimum budget right now.");
            }

            const nextMinimumBudget =
                typeof data.min_budget_usd === "number" && Number.isFinite(data.min_budget_usd)
                    ? Math.round(data.min_budget_usd * 100) / 100
                    : DEFAULT_MINIMUM_BUDGET;
            const previousMinimumBudget = previousMinimumBudgetRef.current;
            previousMinimumBudgetRef.current = nextMinimumBudget;

            // Notice we do not set setPlanInfo / setPlanUsage here, 
            // as this feature isolates just the budget math without interacting with database.

            setMinimumBudget(nextMinimumBudget);
            setEstimatedApiCost(
                typeof data.estimated_api_cost_usd === "number" && Number.isFinite(data.estimated_api_cost_usd)
                    ? data.estimated_api_cost_usd
                    : 0,
            );
            setBudgetReason(typeof data.reason === "string" ? data.reason : "");
            setBudgetStrategy(typeof data.strategy === "string" ? data.strategy : "");

            setBudget((currentBudget) => {
                const roundedNext = Math.round(nextMinimumBudget * 100) / 100;
                if (activePlan.id === "free") {
                    return roundedNext;
                }
                if (!Number.isFinite(currentBudget) || currentBudget <= 0) {
                    return roundedNext;
                }
                const oldMinimum = Math.round(previousMinimumBudget * 100) / 100;
                if (Math.abs(currentBudget - oldMinimum) < 0.01) {
                    return roundedNext;
                }
                return currentBudget;
            });
        } catch (error) {
            console.error("Failed to estimate minimum budget:", error);
            setBudgetReason("We will still protect the minimum budget on submit if estimation is delayed.");
            setBudgetStrategy("fallback");
            setFormError("Failed to estimate budget via AI. You can still set it manually above $5.");
            setMinimumBudget(DEFAULT_MINIMUM_BUDGET);
            setBudget((prev) => Math.max(prev, DEFAULT_MINIMUM_BUDGET));
            previousMinimumBudgetRef.current = DEFAULT_MINIMUM_BUDGET;
        } finally {
            setEstimatingBudget(false);
        }
    };

    const filteredJobs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return jobs;
        }

        return jobs.filter((job) =>
            [job.title, job.description, job.status, job.id].some((field) => field?.toLowerCase().includes(query)),
        );
    }, [jobs, searchQuery]);

    const derivedUsage = useMemo<PlanUsage>(() => {
        if (planUsage) {
            return planUsage;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyJobsUsed = jobs.filter((job) => {
            const createdAt = new Date(job.created_at);
            return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        }).length;
        const activeJobsUsed = jobs.filter((job) => job.status !== "completed" && job.status !== "failed").length;
        const monthlyJobsRemaining = Math.max(activePlan.monthly_job_limit - monthlyJobsUsed, 0);
        const activeJobsRemaining = Math.max(activePlan.active_job_limit - activeJobsUsed, 0);

        return {
            monthly_jobs_used: monthlyJobsUsed,
            monthly_jobs_remaining: monthlyJobsRemaining,
            monthly_job_limit: activePlan.monthly_job_limit,
            active_jobs_used: activeJobsUsed,
            active_jobs_remaining: activeJobsRemaining,
            active_job_limit: activePlan.active_job_limit,
            can_post_job: monthlyJobsRemaining > 0 && activeJobsRemaining > 0,
            blocking_reason:
                monthlyJobsRemaining <= 0
                    ? `${activePlan.name} has reached its monthly job limit.`
                    : activeJobsRemaining <= 0
                      ? `${activePlan.name} has reached its active job limit.`
                      : null,
        };
    }, [activePlan, jobs, planUsage]);

    const fetchJobs = async () => {
        if (!user?.uid) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/client/${user.uid}/jobs`);
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : []);
            setPlanInfo(data.plan ?? null);
            setPlanUsage(data.usage ?? null);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetThumbnail = (clearError = true) => {
        setThumbnailDataUrl(null);
        setThumbnailName("");
        if (clearError) {
            setThumbnailError("");
        }
    };

    const handleThumbnailChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        setThumbnailError("");

        try {
            const nextThumbnailDataUrl = await createThumbnailDataUrl(file);
            setThumbnailDataUrl(nextThumbnailDataUrl);
            setThumbnailName(file.name);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not process that image.";
            setThumbnailError(message);
            resetThumbnail(false);
        }
    };

    const handlePostJob = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim() || !description.trim()) {
            return;
        }

        setPosting(true);
        setFormError("");
        try {
            const response = await fetch(`/api/client/job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_uid: user?.uid,
                    title: title.trim(),
                    description: description.trim(),
                    budget_usd: budget,
                    thumbnail_data_url: thumbnailDataUrl,
                    enable_marketplace_bidding: enableMarketplaceBidding,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMsg = Array.isArray(result.detail) 
                    ? result.detail.map((err: any) => err.msg).join(", ") 
                    : result.detail;
                throw new Error(errorMsg || "Failed to post the job.");
            }

            if (result.id) {
                setTitle("");
                setDescription("");
                setBudget(0);
                setMinimumBudget(0);
                setEstimatedApiCost(0);
                setBudgetReason("");
                setBudgetStrategy("");
                previousMinimumBudgetRef.current = 0;
                resetThumbnail();
                await fetchJobs();
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to post the job.";
            setFormError(message);
            console.error("Failed to post job:", error);
        } finally {
            setPosting(false);
        }
    };

    const budgetSourceLabel =
        budgetStrategy === "openrouter-deepseek-v3" ? "DeepSeek V3 minimum" : "Protected minimum";

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <Briefcase className="text-blue-600" size={28} />
                            Business Job Center
                        </h1>
                        <p className="text-sm text-gray-500">
                            Submit tasks, attach a visual brief when needed, and let the platform protect the minimum budget before work enters the queue.
                        </p>
                    </div>

                    <div className="mb-6 grid gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm md:grid-cols-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">Current plan</p>
                            <p className="mt-2 text-lg font-bold text-gray-900">{activePlan.name}</p>
                            <p className="mt-1 text-xs text-gray-500">{activePlan.model_lane}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">Jobs this month</p>
                            <p className="mt-2 text-lg font-bold text-gray-900">
                                {derivedUsage.monthly_jobs_used}/{derivedUsage.monthly_job_limit}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{derivedUsage.monthly_jobs_remaining} remaining</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">Active jobs</p>
                            <p className="mt-2 text-lg font-bold text-gray-900">
                                {derivedUsage.active_jobs_used}/{derivedUsage.active_job_limit}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{derivedUsage.active_jobs_remaining} available</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">Delivery target</p>
                            <p className="mt-2 text-lg font-bold text-gray-900">{activePlan.delivery_target}</p>
                            <p className="mt-1 text-xs text-gray-500">{activePlan.review_depth} review before delivery</p>
                        </div>
                    </div>

                    {derivedUsage.blocking_reason && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={18} />
                            <span>{derivedUsage.blocking_reason}</span>
                        </div>
                    )}

                    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
                        <div className="lg:col-span-1">
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-6 py-4">
                                    <Plus size={18} className="text-blue-600" />
                                    <span className="font-semibold text-gray-900">Post New Job</span>
                                </div>
                                <form onSubmit={handlePostJob} className="space-y-5 p-6">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500">
                                            JOB TITLE
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="e.g. Draft a launch email for a new feature"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500">
                                            REQUIREMENTS
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                            placeholder="Describe the outcome, tone, constraints, and any source material."
                                            rows={5}
                                            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            required
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={calculateMinimumBudget}
                                                disabled={estimatingBudget || !title.trim() || description.trim().length < 10}
                                                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                                                    estimatingBudget || !title.trim() || description.trim().length < 10
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                }`}
                                            >
                                                {estimatingBudget ? <Clock size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                {estimatingBudget ? "Calculating AI Cost..." : "Calculate Projected Min Amount"}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                            <label className="block text-xs font-semibold tracking-wide text-gray-500">
                                                THUMBNAIL IMAGE
                                            </label>
                                            <span className="text-[11px] text-gray-400">Optional visual brief</span>
                                        </div>

                                        <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="hidden"
                                            />
                                            {thumbnailDataUrl ? (
                                                <div className="space-y-3">
                                                    <img
                                                        src={thumbnailDataUrl}
                                                        alt=""
                                                        className="h-40 w-full rounded-xl object-cover"
                                                    />
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-gray-900">
                                                                {thumbnailName || "Attached thumbnail"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                This image will be attached to the job request.
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                resetThumbnail();
                                                            }}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:text-gray-900"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                        <ImagePlus size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Upload a thumbnail or reference image
                                                        </p>
                                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                                            Helpful for landing pages, banners, brand references, or tasks with a visual direction.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>

                                        {thumbnailError && (
                                            <p className="mt-2 text-xs font-medium text-red-600">{thumbnailError}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500">
                                            BUDGET (USD)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-sm font-medium text-gray-400">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min={0.01}
                                                readOnly={activePlan.id === "free"}
                                                value={Number.isFinite(budget) && budget > 0 ? budget : ""}
                                                onChange={(event) => {
                                                    if (activePlan.id === "free") return;
                                                    const nextBudget = parseFloat(event.target.value);
                                                    if (!Number.isFinite(nextBudget)) {
                                                        setBudget(0);
                                                        return;
                                                    }
                                                    setBudget(nextBudget);
                                                }}
                                                className={`w-full rounded-xl border py-2.5 pl-8 pr-4 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    activePlan.id === "free" 
                                                    ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" 
                                                    : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                                                }`}
                                                required
                                            />
                                        </div>

                                        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                                                        <Sparkles size={14} />
                                                        {budgetSourceLabel}
                                                    </div>
                                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                                        ${minimumBudget.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-xs leading-5 text-gray-600">
                                                {estimatingBudget
                                                    ? "Calculating the protected minimum budget using DeepSeek V3..."
                                                    : budgetReason || "The platform applies a protected minimum so the client budget stays above projected provider cost."}
                                            </p>
                                        </div>

                                        {/* Marketplace Bidding Feature */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 transition-all hover:bg-amber-50/60">
                                                <div className="flex flex-1 items-start gap-3">
                                                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600">
                                                        <Crown size={14} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[13px] font-bold text-amber-900">
                                                            Marketplace Bidding
                                                        </h4>
                                                        <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/80">
                                                            Allow global Mesh workers to bid on your task to potentially reduce cost and speed up delivery.
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    disabled={activePlan.id === "free"}
                                                    onClick={() => setEnableMarketplaceBidding(!enableMarketplaceBidding)}
                                                    className={`group relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                                                        enableMarketplaceBidding 
                                                        ? "border-amber-500 bg-amber-500 text-white" 
                                                        : "border-gray-200 bg-white"
                                                    } ${activePlan.id === "free" ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-95"}`}
                                                >
                                                    {enableMarketplaceBidding && <Check size={12} strokeWidth={4} />}
                                                    {activePlan.id === "free" && (
                                                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {activePlan.id === "free" && (
                                                <p className="mt-2 pl-9 text-[10px] font-medium text-amber-600">
                                                    Upgrade to Starter or higher to unlock marketplace bidding.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {formError && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {formError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={posting || !derivedUsage.can_post_job || minimumBudget === 0}
                                        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
                                            posting || !derivedUsage.can_post_job || minimumBudget === 0
                                                ? "cursor-not-allowed bg-blue-400 text-white"
                                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                                        }`}
                                    >
                                        {posting ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                        {posting ? "Creating Request..." : "Post Job"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <History size={18} className="text-gray-500" />
                                        <span className="font-semibold text-gray-900">Active Jobs & History</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="group relative flex items-center">
                                            <Search
                                                size={16}
                                                className="absolute left-3 text-gray-400 transition-colors group-focus-within:text-blue-600"
                                            />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(event) => setSearchQuery(event.target.value)}
                                                placeholder="Search jobs..."
                                                className="w-32 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-xs transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-48"
                                            />
                                        </div>
                                        <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
                                            <Filter size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-0">
                                    {loading ? (
                                        <div className="flex h-full flex-col items-center justify-center py-20 text-gray-400">
                                            <Clock className="mb-4 animate-spin text-blue-600" size={32} />
                                            <p className="text-sm font-medium">Loading workspace...</p>
                                        </div>
                                    ) : filteredJobs.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center py-24 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                                                <Briefcase className="text-gray-300" size={32} />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {jobs.length === 0 ? "No jobs active right now" : "No jobs match that search"}
                                            </p>
                                            <p className="mt-1 max-w-xs text-xs text-gray-400">
                                                {jobs.length === 0
                                                    ? "Requests you post using the form on the left will appear here."
                                                    : "Try a different title, job ID, or status keyword."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredJobs.map((job) => (
                                                <div
                                                    key={job.id}
                                                    className="group flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70 md:flex-row md:items-center md:justify-between"
                                                >
                                                    <div className="flex min-w-0 items-center gap-4">
                                                        {job.thumbnail_data_url ? (
                                                            <img
                                                                src={job.thumbnail_data_url}
                                                                alt=""
                                                                className="h-16 w-16 flex-shrink-0 rounded-2xl border border-gray-200 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                                                                <ImagePlus size={18} className="text-gray-300" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                                {job.title}
                                                            </p>
                                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                                                {job.description || "No description provided."}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <span className="text-[11px] font-mono text-gray-400">
                                                                    ID: {job.id.slice(0, 12)}
                                                                </span>
                                                                <span className="text-[11px] text-gray-400">•</span>
                                                                <span className="text-[11px] text-gray-400">
                                                                    {new Date(job.created_at).toLocaleDateString(undefined, {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    })}
                                                                </span>
                                                                {typeof job.minimum_budget_usd === "number" && (
                                                                    <>
                                                                        <span className="text-[11px] text-gray-400">•</span>
                                                                        <span className="text-[11px] text-blue-600">
                                                                            Floor ${job.minimum_budget_usd.toFixed(2)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${
                                                                job.status === "completed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : job.status === "queued" || job.status === "active"
                                                                      ? "bg-blue-100 text-blue-700"
                                                                      : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {job.status}
                                                        </span>
                                                        <span className="whitespace-nowrap text-sm font-semibold text-gray-700">
                                                            ${job.budget_usd.toFixed(2)}
                                                        </span>
                                                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
