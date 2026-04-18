"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    Briefcase,
    Clock,
    ExternalLink,
    Filter,
    History,
    ImagePlus,
    Plus,
    Search,
    Send,
    X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_THUMBNAIL_DATA_URL_LENGTH = 1_200_000;
const MAX_THUMBNAIL_EDGE = 1200;

interface Job {
    id: string;
    title: string;
    description: string;
    budget_usd: number;
    status: string;
    created_at: string;
    thumbnail_data_url?: string | null;
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

export default function ClientDashboard() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(10.0);
    const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
    const [thumbnailName, setThumbnailName] = useState("");
    const [thumbnailError, setThumbnailError] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (user) {
            void fetchJobs();
        }
    }, [user]);

    const filteredJobs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return jobs;
        }

        return jobs.filter((job) =>
            [job.title, job.description, job.status, job.id].some((field) =>
                field?.toLowerCase().includes(query),
            ),
        );
    }, [jobs, searchQuery]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/v1/client/${user?.uid}/jobs`);
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : []);
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
        if (!title || !description || budget <= 0) {
            return;
        }

        setPosting(true);
        try {
            const response = await fetch(`${API}/v1/client/job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_uid: user?.uid,
                    title,
                    description,
                    budget_usd: budget,
                    thumbnail_data_url: thumbnailDataUrl,
                }),
            });
            const result = await response.json();
            if (result.id) {
                setTitle("");
                setDescription("");
                setBudget(10.0);
                resetThumbnail();
                await fetchJobs();
            }
        } catch (error) {
            console.error("Failed to post job:", error);
        } finally {
            setPosting(false);
        }
    };

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
                            Submit tasks, add a thumbnail when visuals matter, fund the workflow, and track delivery from one workspace.
                        </p>
                    </div>

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
                                                min="1"
                                                value={budget}
                                                onChange={(event) => setBudget(parseFloat(event.target.value) || 0)}
                                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-8 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={posting}
                                        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
                                            posting
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
