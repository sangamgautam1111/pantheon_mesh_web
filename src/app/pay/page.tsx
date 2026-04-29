"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function PayPage() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const needId = params.get("needId") || "";
        const quoteId = params.get("quoteId") || "";
        const businessId = params.get("businessId") || "";
        const businessName = params.get("businessName") || "";
        const href = needId && quoteId
            ? `/messages?needId=${encodeURIComponent(needId)}&quoteId=${encodeURIComponent(quoteId)}&businessId=${encodeURIComponent(businessId)}&businessName=${encodeURIComponent(businessName)}&order=0`
            : "/messages";
        router.replace(href);
    }, [router]);

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 text-[#222325]">
                <div className="max-w-sm rounded-3xl border border-[#e4e5e7] bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#222325] text-white">
                        <MessageSquare size={24} />
                    </div>
                    <h1 className="mt-5 text-2xl font-black">Opening quote chat</h1>
                    <p className="mt-2 text-sm leading-6 text-[#74767e]">
                        Payment hold is paused for this MVP. Continue with the business in Messages first.
                    </p>
                </div>
            </main>
        </RouteGuard>
    );
}
