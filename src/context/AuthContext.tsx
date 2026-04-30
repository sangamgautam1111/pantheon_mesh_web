"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import {
    User,
    createUserWithEmailAndPassword,
    getRedirectResult,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
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
    phoneNumber?: string | null;
    location?: string | null;
    savedAddress?: string | null;
    country?: string | null;
    countryCode?: string | null;
    state?: string | null;
    stateCode?: string | null;
    city?: string | null;
    area?: string | null;
    currency?: string | null;
    currentAddress?: string | null;
    category?: string | null;
    openingHours?: string | null;
    services?: string | null;
    warrantyPolicy?: string | null;
    shopPhotos?: string[] | null;
    deliveryAddress?: string | null;
    deliveryCoords?: { lat: number; lng: number } | null;
    username?: string | null;
    shortBio?: string | null;
    preferredServiceMethod?: string | null;
    language?: string | null;
    emailNotifications?: boolean | null;
    smsNotifications?: boolean | null;
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
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
    updateUserProfile: async () => {},
    signOut: async () => {},
});

const DEFAULT_ACCOUNT_TYPE: ActiveAccountType = "customer";
const PENDING_ACCOUNT_TYPE_KEY = "needero-pending-account-type";

const isActiveAccountType = (value: unknown): value is ActiveAccountType =>
    value === "customer" || value === "business";

const getPendingAccountType = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const value = window.localStorage.getItem(PENDING_ACCOUNT_TYPE_KEY);
    return isActiveAccountType(value) ? value : null;
};

const setPendingAccountType = (value: ActiveAccountType) => {
    if (typeof window !== "undefined") {
        window.localStorage.setItem(PENDING_ACCOUNT_TYPE_KEY, value);
    }
};

const clearPendingAccountType = () => {
    if (typeof window !== "undefined") {
        window.localStorage.removeItem(PENDING_ACCOUNT_TYPE_KEY);
    }
};

const isSafeExternalPhotoUrl = (value?: string | null) =>
    typeof value === "string" && /^https?:\/\//i.test(value) && value.length < 2048;

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
            const response = await fetch("/api/needero/v1/auth/sync", {
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
        let existing: Partial<UserProfile> = {};
        try {
            const existingSnapshot = await get(ref(db, `users/${firebaseUser.uid}`));
            existing = existingSnapshot.exists() ? (existingSnapshot.val() as Partial<UserProfile>) : {};
        } catch (error) {
            console.warn("Unable to read existing profile. Continuing with Firebase Auth user:", error);
        }
        
        const resolvedAccountType = requestedAccountType || (isActiveAccountType(existing.accountType)
            ? existing.accountType
            : DEFAULT_ACCOUNT_TYPE);

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

        const backendProfile =
            resolvedAccountType === "business"
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
            ...existing,
            uid: firebaseUser.uid,
            email: firebaseUser.email || existing.email || null,
            displayName,
            photoURL: existing.photoURL || firebaseUser.photoURL || null,
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
            ...overrides,
        };

        try {
            await set(ref(db, `users/${firebaseUser.uid}`), sanitizeForRealtimeDb(profileData));
        } catch (error) {
            console.warn("Unable to save primary user profile. Check Firebase Realtime Database rules:", error);
        }

        try {
            const mirrorData = sanitizeForRealtimeDb({
                uid: firebaseUser.uid,
                email: profileData.email,
                displayName: profileData.displayName,
                joinedAt: profileData.createdAt,
                accountType: resolvedAccountType,
                companyName: profileData.companyName,
                currentPlanId: profileData.currentPlanId,
                phoneNumber: profileData.phoneNumber,
                country: profileData.country,
                countryCode: profileData.countryCode,
                state: profileData.state,
                stateCode: profileData.stateCode,
                city: profileData.city,
                area: profileData.area,
                currentAddress: profileData.currentAddress,
                photoURL: profileData.photoURL,
                deliveryAddress: profileData.deliveryAddress,
                deliveryCoords: profileData.deliveryCoords,
                category: profileData.category,
                openingHours: profileData.openingHours,
                services: profileData.services,
                warrantyPolicy: profileData.warrantyPolicy,
                username: profileData.username,
                shortBio: profileData.shortBio,
                preferredServiceMethod: profileData.preferredServiceMethod,
                language: profileData.language,
                emailNotifications: profileData.emailNotifications,
                smsNotifications: profileData.smsNotifications,
            });
            
            // Sync to the specific account type mirror
            await set(ref(db, `accounts/${resolvedAccountType}/${firebaseUser.uid}`), mirrorData);
            
            // If the master profile has another account type already set, consider syncing there too
            // but for now, ensuring the current role's mirror is full is the priority.
        } catch (error) {
            console.warn("Unable to save account mirror. Sign-in can continue:", error);
        }

        setProfile(profileData);
        setAccountType(resolvedAccountType);

        return profileData;
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;

        getRedirectResult(auth).catch((error) => {
            console.error("Redirect sign-in error:", error);
            clearPendingAccountType();
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

            const pending = getPendingAccountType();
            let syncedProfile: UserProfile;
            try {
                syncedProfile = await upsertProfile(firebaseUser, pending || undefined);
            } catch (error) {
                console.warn("Profile sync failed after auth. Keeping signed-in session:", error);
                const fallbackAccountType = pending || DEFAULT_ACCOUNT_TYPE;
                syncedProfile = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Customer",
                    photoURL: firebaseUser.photoURL,
                    accountType: fallbackAccountType,
                    createdAt: Date.now(),
                    companyName: fallbackAccountType === "business"
                        ? firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Local Business"
                        : null,
                    currentPlanId: fallbackAccountType === "business" ? "free" : null,
                    totalSpent: 0,
                };
                setProfile(syncedProfile);
                setAccountType(fallbackAccountType);
            }
            clearPendingAccountType();

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
            }, (error) => {
                console.warn("Unable to listen to Firebase profile. Keeping signed-in session:", error);
                setProfile(syncedProfile);
                setAccountType(syncedProfile.accountType);
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
        setPendingAccountType(selectedAccountType);
        try {
            const result = await signInWithPopup(auth, githubProvider);
            await upsertProfile(result.user, selectedAccountType);
            clearPendingAccountType();
        } catch (error) {
            const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
            if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
                await signInWithRedirect(auth, githubProvider);
                return;
            }
            clearPendingAccountType();
            throw error;
        }
    };

    const signInWithGoogle = async (selectedAccountType: ActiveAccountType = DEFAULT_ACCOUNT_TYPE) => {
        setPendingAccountType(selectedAccountType);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await upsertProfile(result.user, selectedAccountType);
            clearPendingAccountType();
        } catch (error) {
            const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
            if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
                await signInWithRedirect(auth, googleProvider);
                return;
            }
            clearPendingAccountType();
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

    const updateUserProfile = async (updates: Partial<UserProfile>) => {
        if (!user || !profile) return;
        const newProfile = { ...profile, ...updates };

        if (updates.displayName !== undefined && updates.displayName !== user.displayName) {
            try {
                await updateProfile(user, { displayName: updates.displayName || "" });
            } catch (error) {
                console.warn("Unable to update Firebase display name:", error);
            }
        }

        if (
            updates.photoURL !== undefined &&
            updates.photoURL !== user.photoURL &&
            isSafeExternalPhotoUrl(updates.photoURL)
        ) {
            try {
                await updateProfile(user, { photoURL: updates.photoURL || "" });
            } catch (error) {
                console.warn("Unable to update Firebase photo URL:", error);
            }
        }

        try {
            // Remove form-specific fields that shouldn't be in the database
            const cleanedProfile = { ...newProfile };
            delete (cleanedProfile as any).dialCode;
            delete (cleanedProfile as any).phoneNumberRaw;
            delete (cleanedProfile as any).manualLocation;

            await set(ref(db, `users/${user.uid}`), sanitizeForRealtimeDb(cleanedProfile));
            
            // Sync with ALL possible mirror nodes to ensure consistency across roles
            const mirrorData = sanitizeForRealtimeDb({
                uid: user.uid,
                email: newProfile.email,
                displayName: newProfile.displayName,
                joinedAt: newProfile.createdAt,
                accountType: newProfile.accountType,
                companyName: newProfile.companyName,
                currentPlanId: newProfile.currentPlanId,
                phoneNumber: newProfile.phoneNumber,
                country: newProfile.country,
                countryCode: newProfile.countryCode,
                state: newProfile.state,
                stateCode: newProfile.stateCode,
                city: newProfile.city,
                area: newProfile.area,
                currentAddress: newProfile.currentAddress,
                photoURL: newProfile.photoURL,
                deliveryAddress: newProfile.deliveryAddress,
                deliveryCoords: newProfile.deliveryCoords,
                category: newProfile.category,
                openingHours: newProfile.openingHours,
                services: newProfile.services,
                warrantyPolicy: newProfile.warrantyPolicy,
                username: newProfile.username,
                shortBio: newProfile.shortBio,
                preferredServiceMethod: newProfile.preferredServiceMethod,
                language: newProfile.language,
                emailNotifications: newProfile.emailNotifications,
                smsNotifications: newProfile.smsNotifications,
            });

            // Update both mirror paths to prevent stale data when switching roles.
            // Catch errors individually so that one failing (e.g. permission error) doesn't break the whole profile update.
            await Promise.all([
                set(ref(db, `accounts/customer/${user.uid}`), mirrorData).catch(e => console.warn("Failed to update customer mirror", e)),
                set(ref(db, `accounts/business/${user.uid}`), mirrorData).catch(e => console.warn("Failed to update business mirror", e))
            ]);

            setProfile(cleanedProfile);
        } catch (error) {
            console.error("Firebase update failed:", error);
            throw error;
        }
    };

    const handleSignOut = async () => {
        await firebaseSignOut(auth);
        clearPendingAccountType();
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
                updateUserProfile,
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
