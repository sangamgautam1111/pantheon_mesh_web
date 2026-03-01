"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get, onValue } from "firebase/database";
import { auth, db, githubProvider, googleProvider } from "@/lib/firebase";

export type AccountType = "developer" | "personal" | "business" | null;

interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    accountType: AccountType;
    createdAt: number;
    githubUsername?: string;
    agents?: Record<string, unknown>;
    earnings?: number;
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
    signInWithGitHub: async () => { },
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [accountType, setAccountType] = useState<AccountType>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const profileRef = ref(db, `users/${firebaseUser.uid}`);
                const snapshot = await get(profileRef);
                if (snapshot.exists()) {
                    const data = snapshot.val() as UserProfile;
                    setProfile(data);
                    setAccountType(data.accountType);
                }

                onValue(profileRef, (snap) => {
                    if (snap.exists()) {
                        const data = snap.val() as UserProfile;
                        setProfile(data);
                        setAccountType(data.accountType);
                    }
                });
            } else {
                setProfile(null);
                setAccountType(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const createUserProfile = async (
        firebaseUser: User,
        type: AccountType,
        extra: Record<string, unknown> = {}
    ) => {
        const profileData: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            accountType: type,
            createdAt: Date.now(),
            earnings: 0,
            ...extra,
        };

        await set(ref(db, `users/${firebaseUser.uid}`), profileData);

        const accountIndex = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            joinedAt: Date.now(),
        };
        await set(ref(db, `accounts/${type}/${firebaseUser.uid}`), accountIndex);

        setProfile(profileData);
        setAccountType(type);
    };

    const signInWithGitHub = async () => {
        const result = await signInWithPopup(auth, githubProvider);
        const firebaseUser = result.user;

        const profileRef = ref(db, `users/${firebaseUser.uid}`);
        const snapshot = await get(profileRef);

        if (!snapshot.exists()) {
            const githubUsername = firebaseUser.providerData[0]?.displayName || firebaseUser.displayName || "";
            await createUserProfile(firebaseUser, "developer", {
                githubUsername,
                agents: {},
                earnings: 0,
            });
        }
    };

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        const profileRef = ref(db, `users/${firebaseUser.uid}`);
        const snapshot = await get(profileRef);

        if (!snapshot.exists()) {
            await createUserProfile(firebaseUser, "business", {
                gigs: {},
                totalSpent: 0,
            });
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = result.user;

        await createUserProfile(firebaseUser, "personal", {
            displayName,
        });
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
