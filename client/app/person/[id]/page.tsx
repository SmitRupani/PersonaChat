"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import ChatClient from "../../components/ChatClient";
import { personaMap, type PersonaId } from "../../lib/personas";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

export default function PersonaPage() {
  const params = useParams();
  const id = params.id as string;
  const persona = personaMap[id as PersonaId];

  if (!persona) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-rose-50 overflow-hidden">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: persona.accent }}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-orange-100">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-950 font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Back</span>
        </Link>

        <div className="flex items-center gap-3">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: persona.accent }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm font-bold" style={{ color: persona.accent }}>
            {persona.name}
          </span>
        </div>
      </nav>

      {/* Chat area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <ChatClient personaId={id as PersonaId} />
      </div>
    </div>
  );
}
