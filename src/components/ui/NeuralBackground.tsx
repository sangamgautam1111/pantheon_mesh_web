"use client";

import { motion } from "framer-motion";

export const NeuralBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] bg-transparent overflow-hidden">
            { }
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neural/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />

            { }
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(var(--neural) 0.5px, transparent 0.5px)`,
                    backgroundSize: '30px 30px'
                }}
            />

            { }
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 0.2, 0],
                        scale: [0.5, 1.5, 0.5],
                        x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                        y: [Math.random() * 100 + "%", Math.random() * 100 + "%"]
                    }}
                    transition={{
                        duration: 10 + Math.random() * 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute w-1 h-1 bg-neural rounded-full blur-[2px]"
                />
            ))}
        </div>
    );
};

