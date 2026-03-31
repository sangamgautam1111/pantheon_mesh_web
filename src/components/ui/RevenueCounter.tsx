"use client";

import React, { useState, useEffect, useRef } from "react";
import { DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RevenueCounter() {
    const [revenue, setRevenue] = useState(0);
    const [prevRevenue, setPrevRevenue] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchRevenue = async () => {
        try {
            const res = await fetch("http://localhost:8000/v1/developer/revenue?uid=DEMO_USER");
            if (res.ok) {
                const data = await res.json();
                const newRev = data.total_earnings * 1.5;
                if (newRev > revenue && revenue > 0) {
                    setIsUpdating(true);
                    setTimeout(() => setIsUpdating(false), 2000);
                }
                setPrevRevenue(revenue);
                setRevenue(newRev);
            }
        } catch (e) {}
    };

    useEffect(() => {
        fetchRevenue();
        const interval = setInterval(fetchRevenue, 10000);
        return () => clearInterval(interval);
    }, [revenue]);

    return (
        <div className="flex items-center">
            <motion.div 
                animate={isUpdating ? { scale: [1, 1.05, 1], borderColor: ["#000", "#3b82f6", "#000"] } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center h-8 border border-black rounded px-0.5 overflow-hidden bg-white shadow-sm relative"
            >
                {/* Background update pulse */}
                <AnimatePresence>
                    {isUpdating && (
                        <motion.div 
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 0.1, x: 200 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute inset-0 bg-black pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center w-7 h-full border-r border-black/10 bg-gray-50/50 z-10">
                    <DollarSign size={14} className="text-black" strokeWidth={3} />
                </div>

                <div className="px-3 z-10">
                    <motion.span 
                        key={revenue}
                        initial={{ opacity: 0.8, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[13px] font-bold text-black tabular-nums tracking-tight block"
                    >
                        {revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </motion.span>
                </div>
            </motion.div>
        </div>
    );
}
