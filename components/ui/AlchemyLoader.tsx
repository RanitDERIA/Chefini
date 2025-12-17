'use client';

import { motion } from 'framer-motion';
import { ChefHat, Sparkles, Utensils } from 'lucide-react';

export default function AlchemyLoader({ text = "Cooking up magic..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-8">
                {/* Pot/Bowl Container */}
                <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                >
                    <div className="w-24 h-24 bg-black rounded-b-full border-4 border-chefini-yellow flex items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,199,44,1)]">
                        <ChefHat size={40} className="text-white" />

                        {/* Liquid Bubbles */}
                        <motion.div
                            className="absolute bottom-0 left-0 w-full h-1/2 bg-chefini-yellow/20"
                            animate={{ height: ["40%", "60%", "40%"] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Floating Ingredients */}
                <motion.div
                    className="absolute -top-6 left-0 text-chefini-yellow"
                    animate={{ y: [0, -20, 0], opacity: [0, 1, 0], x: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                >
                    <Sparkles size={20} />
                </motion.div>

                <motion.div
                    className="absolute -top-4 right-0 text-chefini-yellow"
                    animate={{ y: [0, -25, 0], opacity: [0, 1, 0], x: [0, 10, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                >
                    <Utensils size={16} />
                </motion.div>

                {/* Shadow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-2 bg-black/20 rounded-full blur-sm" />
            </div>

            <motion.p
                className="font-black text-xl uppercase tracking-widest text-black"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {text}
            </motion.p>
        </div>
    );
}
