"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { personas } from "./lib/personas";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 }
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300 opacity-20 blur-3xl rounded-full" />
        <div className="absolute bottom-32 -left-20 w-96 h-96 bg-rose-300 opacity-15 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-yellow-300 opacity-10 blur-3xl rounded-full" />
      </div>

      {/* Header Section */}
      <motion.div
        className="relative z-10 px-6 pt-16 pb-8 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-block mb-8">
          <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-full px-5 py-2.5 text-sm font-semibold text-orange-900">
            ✨ Meet Your Learning Mentors
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 text-orange-950 tracking-tight leading-tight">
          Wisdom at Your <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-orange-600 bg-clip-text text-transparent">Fingertips</span>
        </h1>

        <p className="text-lg md:text-xl text-orange-800 max-w-2xl mx-auto leading-relaxed font-light">
          Three unique perspectives. One powerful learning experience. Choose your mentor and start a conversation that inspires growth.
        </p>
      </motion.div>

      {/* Personas Grid */}
      <motion.div
        className="relative z-10 px-6 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {personas.map((persona, i) => (
            <motion.div key={persona.id} variants={itemVariants}>
              <Link href={`/person/${persona.id}`}>
                <motion.div
                  whileHover={{ y: -12, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative h-full"
                >
                  {/* Card Container */}
                  <div
                    className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-500 relative overflow-hidden cursor-pointer h-full flex flex-col"
                    style={{
                      background: `linear-gradient(135deg, ${persona.accent}08 0%, white 50%)`,
                      borderColor: `${persona.accent}20`,
                      borderWidth: "1px",
                    }}
                  >
                    {/* Accent glow on hover */}
                    <div
                      className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-3xl"
                      style={{ backgroundColor: persona.accent }}
                    />

                    {/* Gradient accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(90deg, ${persona.accent}, transparent)` }}
                    />

                    {/* Number badge */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6 relative z-10" 
                      style={{ backgroundColor: `${persona.accent}15`, color: persona.accent }}>
                      <span className="text-lg font-bold">{i + 1}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative z-10">
                      <h2 className="text-2xl font-black text-orange-950 mb-2 leading-tight">
                        {persona.name}
                      </h2>
                      <p className="text-sm font-semibold mb-4" style={{ color: persona.accent }}>
                        {persona.title}
                      </p>
                      <p className="text-orange-800 text-sm leading-relaxed mb-6">
                        {persona.description}
                      </p>
                    </div>

                    {/* Philosophy tags */}
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                      {persona.philosophy.slice(0, 2).map((phil, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium px-3 py-1.5 rounded-full border-2"
                          style={{
                            color: persona.accent,
                            borderColor: `${persona.accent}40`,
                            backgroundColor: `${persona.accent}08`,
                          }}
                        >
                          {phil}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div
                      className="inline-flex items-center gap-2 font-bold text-sm relative z-10 group/cta"
                      style={{ color: persona.accent }}
                    >
                      <span>Start Learning</span>
                      <span className="transition-transform group-hover/cta:translate-x-2">→</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="relative z-10 px-6 py-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-sm text-orange-700">
          Powered by OpenRouter • Free AI Models for Students
        </p>
      </motion.div>
    </main>
  );
}
