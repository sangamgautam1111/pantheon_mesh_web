"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface GuideStep {
    elementId: string;
    label: string;
    description?: string;
}

interface GuideContextType {
    steps: GuideStep[];
    currentStep: number;
    isActive: boolean;
    isChatOpen: boolean;
    setChatOpen: (open: boolean) => void;
    startGuide: (steps: GuideStep[], targetPath?: string) => void;
    nextStep: () => void;
    stopGuide: () => void;
    navigateAndHighlight: (path: string, elementId: string, label: string) => void;
}

const GuideContext = createContext<GuideContextType>({
    steps: [], currentStep: 0, isActive: false, isChatOpen: false,
    setChatOpen: () => { },
    startGuide: () => { }, nextStep: () => { }, stopGuide: () => { },
    navigateAndHighlight: () => { },
});

export const useGuide = () => useContext(GuideContext);

export const GuideProvider = ({ children }: { children: React.ReactNode }) => {
    const [steps, setSteps] = useState<GuideStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const pendingHighlight = useRef<{ elementId: string; label: string } | null>(null);

    const startGuide = useCallback((newSteps: GuideStep[], targetPath?: string) => {
        if (targetPath && targetPath !== pathname) {
            router.push(targetPath);
        }
        setSteps(newSteps);
        setCurrentStep(0);
        setIsActive(true);
    }, [router, pathname]);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsActive(false);
            setSteps([]);
            setCurrentStep(0);
        }
    }, [currentStep, steps.length]);

    const stopGuide = useCallback(() => {
        setIsActive(false);
        setSteps([]);
        setCurrentStep(0);
    }, []);

    const navigateAndHighlight = useCallback((path: string, elementId: string, label: string) => {
        if (path !== pathname) {
            pendingHighlight.current = { elementId, label };
            router.push(path);
        } else {
            setSteps([{ elementId, label }]);
            setCurrentStep(0);
            setIsActive(true);
        }
    }, [router, pathname]);

    useEffect(() => {
        if (pendingHighlight.current) {
            const { elementId, label } = pendingHighlight.current;
            pendingHighlight.current = null;
            const timer = setTimeout(() => {
                setSteps([{ elementId, label }]);
                setCurrentStep(0);
                setIsActive(true);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return (
        <GuideContext.Provider value={{
            steps, currentStep, isActive, isChatOpen, setChatOpen,
            startGuide, nextStep, stopGuide, navigateAndHighlight
        }}>
            {children}
        </GuideContext.Provider>
    );
};
