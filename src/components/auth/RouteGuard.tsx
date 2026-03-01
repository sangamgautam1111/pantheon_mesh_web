"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
    children: ReactNode;
    allowedTypes?: ("developer" | "personal" | "business")[];
}

export function RouteGuard({ children, allowedTypes }: RouteGuardProps) {
    const { user, accountType, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-gcp-blue" />
                    <p className="text-sm text-gcp-text-secondary font-medium">Authenticating shard identity...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (allowedTypes && accountType && !allowedTypes.includes(accountType)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="gcp-card p-8 max-w-md text-center">
                    <h2 className="text-xl font-heading font-bold text-gcp-text mb-4">Access Restricted</h2>
                    <p className="text-sm text-gcp-text-secondary mb-6">
                        This section requires a <span className="font-bold text-gcp-blue">{allowedTypes.join(" or ")}</span> account.
                        Your current account type is <span className="font-bold">{accountType}</span>.
                    </p>
                    <button onClick={() => router.push("/dashboard")} className="gcp-btn-primary">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
