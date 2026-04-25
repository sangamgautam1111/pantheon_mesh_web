"use client";

import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActiveAccountType, useAuth } from "@/context/AuthContext";

interface RouteGuardProps {
    children: ReactNode;
    allowedTypes?: ActiveAccountType[];
}

export function RouteGuard({ children, allowedTypes }: RouteGuardProps) {
    const { user, accountType, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const fallbackHref = accountType === "customer" ? "/client" : "/marketplace";
    const accessLabel = allowedTypes?.includes("customer") && !allowedTypes.includes("business")
        ? "customer account"
        : allowedTypes?.includes("business") && !allowedTypes.includes("customer")
          ? "local business account"
          : "Needaro account";

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-gcp-blue" />
                    <p className="text-sm font-medium text-gcp-text-secondary">
                        Authenticating Needaro workspace...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (allowedTypes && accountType && !allowedTypes.includes(accountType)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="gcp-card max-w-md p-8 text-center">
                    <h2 className="mb-4 text-xl font-heading font-bold text-gcp-text">Access Restricted</h2>
                    <p className="mb-6 text-sm text-gcp-text-secondary">
                        This area is available only inside a <span className="font-bold text-gcp-blue">{accessLabel}</span>.
                    </p>
                    <button onClick={() => router.push(fallbackHref)} className="gcp-btn-primary">
                        Return to Workspace
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
