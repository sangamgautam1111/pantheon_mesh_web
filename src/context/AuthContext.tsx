"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { get, onValue, ref, set } from "firebase/database";
import { auth, db, githubProvider, googleProvider } from "@/lib/firebase";

export type AccountType = "business" | null;

interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    accountType: AccountType;
    createdAt: number;
    companyName?: string | null;
    currentPlanId?: string | null;
    totalSpent?: number;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    accountType: AccountType;
    loading: boolean;
    signInWithGitHub: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    syncProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    accountType: null,
    loading: true,
    signInWithGitHub: async () => {},
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    syncProfile: async () => {},
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [accountType, setAccountType] = useState<AccountType>(null);
    const [loading, setLoading] = useState(true);

    const sanitizeForRealtimeDb = <T,>(value: T): T => {
        if (Array.isArray(value)) {
            return value.map((item) => sanitizeForRealtimeDb(item)) as T;
        }

        if (value && typeof value === "object") {
            const sanitizedEntries = Object.entries(value as Record<string, unknown>)
                .filter(([, entryValue]) => entryValue !== undefined)
                .map(([key, entryValue]) => [key, sanitizeForRealtimeDb(entryValue)]);

            return Object.fromEntries(sanitizedEntries) as T;
        }

        return value;
    };

    const syncWithBackend = async (uid: string, displayName: string, email: string, currentPlanId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    display_name: displayName || "Business User",
                    email: email || "",
                    role: "client",
                    current_plan_id: currentPlanId,
                }),
            });
            if (!response.ok) {
                return null;
            }
            return (await response.json()) as { current_plan_id?: string | null } | null;
        } catch (error) {
            console.error("Backend sync failed:", error);
            return null;
        }
    };

    const upsertBusinessProfile = async (
        firebaseUser: User,
        overrides: Partial<UserProfile> = {},
    ) => {
        const existingSnapshot = await get(ref(db, `users/${firebaseUser.uid}`));
        const existing = existingSnapshot.exists() ? (existingSnapshot.val() as Partial<UserProfile>) : {};

        const displayName =
            overrides.displayName ||
            firebaseUser.displayName ||
            existing.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Business User";

        const companyName =
            (typeof overrides.companyName === "string" && overrides.companyName.trim()) ||
            (typeof existing.companyName === "string" && existing.companyName.trim()) ||
            displayName;
        const requestedPlanId =
            typeof overrides.currentPlanId === "string"
                ? overrides.currentPlanId
                : typeof existing.currentPlanId === "string"
                  ? existing.currentPlanId
                  : "free";

        if (displayName !== firebaseUser.displayName) {
            try {
                await updateProfile(firebaseUser, { displayName });
            } catch (error) {
                console.warn("Unable to update Firebase display name:", error);
            }
        }

        const backendProfile = await syncWithBackend(
            firebaseUser.uid,
            displayName || "Business User",
            firebaseUser.email || existing.email || "",
            requestedPlanId,
        );
        const resolvedPlanId =
            typeof backendProfile?.current_plan_id === "string" && backendProfile.current_plan_id.trim()
                ? backendProfile.current_plan_id
                : requestedPlanId;

        const profileData: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || existing.email || null,
            displayName,
            photoURL: firebaseUser.photoURL || existing.photoURL || null,
            accountType: "business",
            createdAt: existing.createdAt || Date.now(),
            companyName,
            currentPlanId: resolvedPlanId,
            totalSpent:
                typeof overrides.totalSpent === "number"
                    ? overrides.totalSpent
                    : typeof existing.totalSpent === "number"
                      ? existing.totalSpent
                      : 0,
        };

        await set(ref(db, `users/${firebaseUser.uid}`), sanitizeForRealtimeDb(profileData));
        await set(ref(db, `accounts/business/${firebaseUser.uid}`), sanitizeForRealtimeDb({
            uid: firebaseUser.uid,
            email: profileData.email,
            displayName: profileData.displayName,
            joinedAt: profileData.createdAt,
            companyName: profileData.companyName,
            currentPlanId: profileData.currentPlanId,
        }));

        setProfile(profileData);
        setAccountType("business");

        return profileData;
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;

        const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            setUser(firebaseUser);

            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = undefined;
            }

            if (!firebaseUser) {
                setProfile(null);
                setAccountType(null);
                setLoading(false);
                return;
            }

            await upsertBusinessProfile(firebaseUser);

            const profileRef = ref(db, `users/${firebaseUser.uid}`);
            profileUnsubscribe = onValue(profileRef, (snapshot) => {
                if (!snapshot.exists()) {
                    setProfile(null);
                    setAccountType(null);
                    return;
                }

                const data = snapshot.val() as UserProfile;
                setProfile({ ...data, accountType: "business" });
                setAccountType("business");
            });

            setLoading(false);
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) {
                profileUnsubscribe();
            }
        };
    }, []);

    const signInWithGitHub = async () => {
        const result = await signInWithPopup(auth, githubProvider);
        await upsertBusinessProfile(result.user);
    };

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        await upsertBusinessProfile(result.user);
    };

    const signInWithEmail = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await upsertBusinessProfile(result.user);
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await upsertBusinessProfile(result.user, { displayName, companyName: displayName });
    };

    const syncProfile = async () => {
        if (!user) {
            return;
        }

        await upsertBusinessProfile(user);
    };

    const handleSignOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
        setAccountType(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                accountType,
                loading,
                signInWithGitHub,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                syncProfile,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
