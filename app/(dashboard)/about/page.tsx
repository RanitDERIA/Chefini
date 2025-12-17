'use client';

import { ChefHat, Heart, Lightbulb, Target, Users, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={item} className="bg-black border-4 border-chefini-yellow p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <ChefHat size={40} className="text-chefini-yellow" />
          <h1 className="text-4xl font-black text-chefini-yellow">THE CHEFINI STORY</h1>
        </div>

        <div className="space-y-6 text-gray-300">
          <motion.section variants={item}>
            <h2 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
              <Sparkles className="text-chefini-yellow" />
              The Inspiration
            </h2>
            <p className="mb-4">
              The soul of Chefini was born in a simple Indian kitchen. I grew up watching my Maa perform a daily magic trick: opening a refrigerator that everyone else claimed was "empty" and pulling out a gourmet dinner an hour later.
            </p>
            <p>
              She didn't see prawn shells, vegetable stems, or stale bread as waste—rather an opportunity.
              She saw <em>Chingri Macher Matha Bata</em> (spicy prawn head paste) and <em>Chanchra</em> (a royal medley of vegetable trimmings).
              To a child, this wasn't just cooking—it was alchemy. Chefini is my attempt to digitize that maternal intuition—the
              "Chef + Houdini" spirit—so every user can look at a handful of scraps and see a feast.
            </p>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
              <Target className="text-chefini-yellow" />
              Our Mission
            </h2>
            <p>
              To cure the "failure of imagination" regarding food waste. We believe that throwing food away is a tragedy not just for the planet, but for the plate. We want to empower every student, bachelor, and busy parent to create magic with whatever they have on hand.
            </p>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
              <Lightbulb className="text-chefini-yellow" />
              How The Magic Works
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-chefini-yellow text-black font-black flex items-center justify-center border-2 border-black flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Open Your "Empty" Fridge</h3>
                  <p className="text-sm">
                    List your random ingredients. The lonely tomato, the leftover rice, the wilting spinach. Don't worry about quantities; just tell us what exists.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-chefini-yellow text-black font-black flex items-center justify-center border-2 border-black flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">The Digital Mother Thinks</h3>
                  <p className="text-sm">
                    Our AI (powered by Llama 3.3) mimics the resourcefulness of an Indian home cook. It finds connections, substitutes missing items, and invents recipes instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-chefini-yellow text-black font-black flex items-center justify-center border-2 border-black flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Perform Alchemy</h3>
                  <p className="text-sm">
                    Follow the steps and read our "Magic Tips" to understand *why* the flavors work. Turn your scraps into a table full of love.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
              <Users className="text-chefini-yellow" />
              The Alchemist
            </h2>
            <div className="bg-white text-black p-6 border-4 border-chefini-yellow">
              <div className="flex items-center gap-4 mb-4">
                {/* AVATAR IMAGE HERE */}
                <img
                  src="/avatar.png"
                  alt="Ranit Deria"
                  className="w-16 h-16 border-4 border-black object-cover bg-chefini-yellow"
                />

                <div>
                  <h3 className="text-2xl font-black">Ranit Deria</h3>
                  <p className="text-sm font-bold mt-1 text-gray-400">
                    Full Stack Engineer | B.Tech CSE '26
                  </p>
                </div>
              </div>
              <p className="text-sm">
                Just a student trying to translate his mother's kitchen logic into code. Built Chefini because I missed home cooked meals in college and realized that "resourcefulness" is the most valuable algorithm of all.
              </p>
              <div className="mt-4 pt-4 border-t-2 border-dashed border-black">
                <p className="text-xs text-gray-600">
                  <strong>The Tech Behind The Magic:</strong> Next.js 16, TypeScript, MongoDB, Groq AI, and a lot of nostalgia.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
              <Heart className="text-red-500 fill-red-500" />
              The Philosophy
            </h2>
            <div className="p-6 bg-chefini-yellow bg-opacity-10 border-2 border-chefini-yellow">
              <p className="mb-3">
                In a Indian household, wasting food isn't just bad economics; it's considered a sin against Annapurna (the Goddess of Food).
              </p>
              <p>
                Chefini is built on that value. We believe that sustainability doesn't start in a boardroom; it starts in the kitchen, with a single decision to use that "useless" broccoli stem instead of throwing it away.
              </p>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-2xl font-black text-white mb-3">Join The Family</h2>
            <p className="mb-4">
              Whether you are a student trying to survive on a budget or a pro cook looking for inspiration, we'd love to hear your story.
            </p>
            <div className="space-y-2">
              <p className="font-bold">
                <span className="text-chefini-yellow">Email:</span> <a href="mailto:bytebardderia@gmail.com" className="hover:underline">gmail.com/RanitDeria</a>
              </p>
              <p className="font-bold">
                <span className="text-chefini-yellow">GitHub:</span> <a href='https://github.com/RanitDERIA' target='_black' className="hover:underline">github.com/RanitDERIA</a>
              </p>
              <p className="font-bold">
                <span className="text-chefini-yellow">LinkedIn:</span> <a href='https://www.linkedin.com/in/ranit-deria-916864257/' target='_blank' className="hover:underline">linkedin.com/ranit-deria</a>
              </p>
            </div>
          </motion.section>

          <motion.div variants={item} className="text-center pt-8 border-t-2 border-dashed border-gray-700">
            <p className="text-lg font-black text-chefini-yellow mb-2">
              Dedicated to মা <Heart size={20} className="inline text-red-500 fill-red-500 animate-pulse mx-1" /> The original Kitchen Alchemist
            </p>
            <p className="text-sm text-gray-500">
              Coded with love at Chittaranjan, India
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}