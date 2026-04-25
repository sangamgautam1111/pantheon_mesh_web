"use client";

import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { get, onValue, ref, set } from "firebase/database";
import { auth, db, githubProvider, googleProvider } from "@/lib/firebase";

export type ActiveAccountType = "customer" | "business";
export type AccountType = ActiveAccountType | null;

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
    signInWithGitHub: (accountType?: ActiveAccountType) => Promise<void>;
    signInWithGoogle: (accountType?: ActiveAccountType) => Promise<void>;
    signInWithEmail: (email: string, password: string, accountType?: ActiveAccountType) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string, accountType?: ActiveAccountType) => Promise<void>;
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

const DEFAULT_ACCOUNT_TYPE: ActiveAccountType = "customer";

const isActiveAccountType = (value: unknown): value is ActiveAccountType =>
    value === "customer" || value === "business";

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
                    display_name: displayName || "Local Business",
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

    const upsertProfile = async (
        firebaseUser: User,
        requestedAccountType?: ActiveAccountType,
        overrides: Partial<UserProfile> = {},
    ) => {
        const existingSnapshot = await get(ref(db, `users/${firebaseUser.uid}`));
        const existing = existingSnapshot.exists() ? (existingSnapshot.val() as Partial<UserProfile>) : {};
        const resolvedAccountType =
            requestedAccountType || (isActiveAccountType(existing.accountType) ? existing.accountType : DEFAULT_ACCOUNT_TYPE);
        const defaultName = resolvedAccountType === "business" ? "Local Business" : "Customer";

        const displayName =
            overrides.displayName ||
            firebaseUser.displayName ||
            existing.displayName ||
            firebaseUser.email?.split("@")[0] ||
            defaultName;

        const companyName = resolvedAccountType === "business"
            ? (typeof overrides.companyName === "string" && overrides.companyName.trim()) ||
              (typeof existing.companyName === "string" && existing.companyName.trim()) ||
              displayName
            : null;
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

        const backendProfile = resolvedAccountType === "business"
            ? await syncWithBackend(
                  firebaseUser.uid,
                  displayName || "Local Business",
                  firebaseUser.email || existing.email || "",
                  requestedPlanId,
              )
            : null;
        const resolvedPlanId =
            resolvedAccountType === "business"
                ? typeof backendProfile?.current_plan_id === "string" && backendProfile.current_plan_id.trim()
                    ? backendProfile.current_plan_id
                    : requestedPlanId
                : null;

        const profileData: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || existing.email || null,
            displayName,
            photoURL: firebaseUser.photoURL || existing.photoURL || null,
            accountType: resolvedAccountType,
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

        try {
            await set(ref(db, `users/${firebaseUser.uid}`), sanitizeForRealtimeDb(profileData));
        } catch (error) {
            console.warn("Unable to save primary user profile. Check Firebase Realtime Database rules:", error);
        }

        try {
            await set(ref(db, `accounts/${resolvedAccountType}/${firebaseUser.uid}`), sanitizeForRealtimeDb({
                uid: firebaseUser.uid,
                email: profileData.email,
                displayName: profileData.displayName,
                joinedAt: profileData.createdAt,
                accountType: resolvedAccountType,
                companyName: profileData.companyName,
                currentPlanId: profileData.currentPlanId,
            }));
        } catch (error) {
            console.warn("Unable to save account mirror. Sign-in can continue:", error);
        }

        setProfile(profileData);
        setAccountType(resolvedAccountType);

        return profileData;
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;

        // Handle redirect result
        getRedirectResult(auth).then(async (result) => {
            if (result?.user) {
                const pending = sessionStorage.getItem("pendingAccountType") as ActiveAccountType | null;
                await upsertProfile(result.user, pending || undefined);
                sessionStorage.removeItem("pendingAccountType");
            }
        }).catch((error) => {
            console.error("Redirect sign-in error:", error);
        });

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

            const pending = sessionStorage.getItem("pendingAccountType") as ActiveAccountType | null;
            const syncedProfile = await upsertProfile(firebaseUser, pending || undefined);
            sessionStorage.removeItem("pendingAccountType");

            const profileRef = ref(db, `users/${firebaseUser.uid}`);
            profileUnsubscribe = onValue(profileRef, (snapshot) => {
                if (!snapshot.exists()) {
                    setProfile(syncedProfile);
                    setAccountType(syncedProfile.accountType);
                    return;
                }

                const data = snapshot.val() as UserProfile;
                const resolvedAccountType = isActiveAccountType(data.accountType) ? data.accountType : DEFAULT_ACCOUNT_TYPE;
                setProfile({ ...data, accountType: resolvedAccountType });
                setAccountType(resolvedAccountType);
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

    const signInWithGitHub = async (selectedAccountType: ActiveAccountType = DEFAULT_ACCOUNT_TYPE) => {
        sessionStorage.setItem("pendingAccountType", selectedAccountType);
        try {
            await signInWithRedirect(auth, githubProvider);
        } catch (error) {
            console.error("GitHub redirect failed:", error);
            sessionStorage.removeItem("pendingAccountType");
            throw error;
        }
    };

    const signInWithGoogle = async (selectedAccountType: ActiveAccountType = DEFAULT_ACCOUNT_TYPE) => {
        sessionStorage.setItem("pendingAccountType", selectedAccountType);
        try {
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            console.error("Google redirect failed:", error);
            sessionStorage.removeItem("pendingAccountType");
            throw error;
        }
    };

    const signInWithEmail = async (
        email: string,
        password: string,
        selectedAccountType: ActiveAccountType = DEFAULT_ACCOUNT_TYPE,
    ) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await upsertProfile(result.user, selectedAccountType);
        } finally {
            // No cleanup needed
        }
    };

    const signUpWithEmail = async (
        email: string,
        password: string,
        displayName: string,
        selectedAccountType: ActiveAccountType = DEFAULT_ACCOUNT_TYPE,
    ) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await upsertProfile(result.user, selectedAccountType, {
                displayName,
                companyName: selectedAccountType === "business" ? displayName : null,
            });
        } finally {
            // No cleanup needed
        }
    };

    const syncProfile = async () => {
        if (!user) {
            return;
        }

        await upsertProfile(user, profile?.accountType || DEFAULT_ACCOUNT_TYPE);
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
