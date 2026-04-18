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
    companyName?: string;
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
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [accountType, setAccountType] = useState<AccountType>(null);
    const [loading, setLoading] = useState(true);

    const syncWithBackend = async (uid: string, displayName: string, email: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    display_name: displayName || "Business User",
                    email: email || "",
                    role: "client",
                }),
            });
        } catch (error) {
            console.error("Backend sync failed:", error);
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

        if (displayName !== firebaseUser.displayName) {
            try {
                await updateProfile(firebaseUser, { displayName });
            } catch (error) {
                console.warn("Unable to update Firebase display name:", error);
            }
        }

        const profileData: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || existing.email || null,
            displayName,
            photoURL: firebaseUser.photoURL || existing.photoURL || null,
            accountType: "business",
            createdAt: existing.createdAt || Date.now(),
            companyName: overrides.companyName || existing.companyName,
            totalSpent:
                typeof overrides.totalSpent === "number"
                    ? overrides.totalSpent
                    : typeof existing.totalSpent === "number"
                      ? existing.totalSpent
                      : 0,
        };

        await set(ref(db, `users/${firebaseUser.uid}`), profileData);
        await set(ref(db, `accounts/business/${firebaseUser.uid}`), {
            uid: firebaseUser.uid,
            email: profileData.email,
            displayName: profileData.displayName,
            joinedAt: profileData.createdAt,
        });

        setProfile(profileData);
        setAccountType("business");
        await syncWithBackend(firebaseUser.uid, profileData.displayName || "", profileData.email || "");

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
        await upsertBusinessProfile(result.user, { displayName });
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
