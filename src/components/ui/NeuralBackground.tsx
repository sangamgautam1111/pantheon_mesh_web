"use client";

import { motion } from "framer-motion";

export const NeuralBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden">
            {/* Base Grid */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), 
                                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Subtle Horizontal Beams (Linear, not circular) */}
            <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`h-${i}`}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ 
                            opacity: [0, 0.05, 0],
                            scaleY: [1, 1.5, 1],
                            top: `${i * 30 + 10}%`
                        }}
                        transition={{
                            duration: 15 + i * 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute left-0 right-0 h-[300px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none"
                    />
                ))}
            </div>

            {/* Floating Data Points */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={`p-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.3, 0],
                        x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"],
                        y: [Math.random() * 100 + "vh", Math.random() * 100 + "vh"]
                    }}
                    transition={{
                        duration: 20 + Math.random() * 40,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute w-[1px] h-[1px] bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
            ))}

            {/* Subtle Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] opacity-60 pointer-events-none" />
        </div>
    );
};
