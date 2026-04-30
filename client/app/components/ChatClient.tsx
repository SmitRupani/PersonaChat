"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personaMap, type PersonaId } from "../lib/personas";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = { id: string; sender: "user" | "assistant"; text: string };

const msgKey = (pid: PersonaId) => `pfy.msg.${pid}`;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function readMessages(pid: PersonaId): Message[] {
  try {
    const raw = localStorage.getItem(msgKey(pid));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveMessages(pid: PersonaId, msgs: Message[]) {
  localStorage.setItem(msgKey(pid), JSON.stringify(msgs));
}

export default function ChatClient({ personaId }: { personaId: PersonaId }) {
  const persona = personaMap[personaId];

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(readMessages(personaId));
    setHydrated(true);
  }, [personaId]);

  useEffect(() => {
    if (!hydrated) return;
    saveMessages(personaId, messages);
  }, [messages, hydrated, personaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  const send = useCallback(
    async (override?: string) => {
      const text = (override ?? draft).trim();
      if (!text || streaming) return;

      const userMsg: Message = { id: uid(), sender: "user", text };
      const asstId = uid();
      const asstMsg: Message = { id: asstId, sender: "assistant", text: "" };

      setMessages((prev) => [...prev, userMsg, asstMsg]);
      setDraft("");
      setStreaming(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_BACKEND_API || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ persona: personaId, message: text }),
          }
        );
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const dec = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          for (const line of chunk.split("\n\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") break;
            try {
              const { text: t, error: e } = JSON.parse(payload);
              if (t) setMessages((prev) => prev.map((m) => (m.id === asstId ? { ...m, text: m.text + t } : m)));
              if (e)
                setMessages((prev) =>
                  prev.map((m) => (m.id === asstId ? { ...m, text: m.text + `\n\n⚠️ ${e}` } : m))
                );
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err: any) {
        setMessages((prev) => prev.map((m) => (m.id === asstId ? { ...m, text: `⚠️ ${err.message}` } : m)));
      } finally {
        setStreaming(false);
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    },
    [draft, streaming, personaId]
  );

  if (!persona) return null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-rose-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex-1">
          <h1 className="text-xl font-black text-orange-950">{persona.name}</h1>
          <p className="text-sm text-orange-700">{persona.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: streaming ? persona.accent : "#10b981",
              }}
              animate={{ scale: streaming ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.6, repeat: streaming ? Infinity : 0 }}
            />
            <span className="text-xs font-semibold" style={{ color: streaming ? persona.accent : "#10b981" }}>
              {streaming ? "Thinking…" : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 ? (
          <motion.div
            className="h-full flex flex-col items-center justify-center text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Persona avatar */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-black mb-6 shadow-lg"
              style={{ backgroundColor: `${persona.accent}20`, color: persona.accent }}
            >
              {persona.name[0]}
            </div>

            <h2 className="text-2xl font-black text-orange-950 mb-2">{persona.name}</h2>
            <p className="text-orange-700 text-lg mb-8 font-light max-w-md">{persona.tagline}</p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {persona.prompts.slice(0, 4).map((prompt, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => send(prompt)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-2xl text-sm font-semibold text-left transition-all"
                  style={{
                    backgroundColor: `${persona.accent}12`,
                    borderColor: `${persona.accent}30`,
                    borderWidth: "2px",
                    color: persona.accent,
                  }}
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant avatar */}
                {msg.sender === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 mt-1"
                    style={{ backgroundColor: `${persona.accent}25`, color: persona.accent }}
                  >
                    {persona.name[0]}
                  </div>
                )}

                {/* Message bubble */}
                <div className={`max-w-xs md:max-w-md ${msg.sender === "user" ? "" : ""}`}>
                  <div
                    className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "text-white rounded-br-none"
                        : "text-orange-950 rounded-bl-none border-2"
                    }`}
                    style={
                      msg.sender === "user"
                        ? { backgroundColor: persona.accent }
                        : {
                            backgroundColor: `${persona.accent}10`,
                            borderColor: `${persona.accent}25`,
                          }
                    }
                  >
                    {msg.sender === "assistant" && msg.text === "" && streaming ? (
                      <div className="flex items-center gap-1.5 h-5">
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: persona.accent }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: persona.accent }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: persona.accent }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        />
                      </div>
                    ) : (
                      <div
                        className={`prose prose-sm max-w-none ${
                          msg.sender === "user"
                            ? "prose-invert"
                            : "[&_a]:font-semibold [&_a]:underline [&_strong]:font-bold [&_em]:italic"
                        } [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:text-sm [&_pre]:p-3 [&_pre]:rounded-lg`}
                        style={
                          msg.sender === "user"
                            ? {}
                            : {
                                "--tw-prose-body": persona.accent,
                                "--tw-prose-headings": persona.accent,
                                "--tw-prose-links": persona.accent,
                                "--tw-prose-code": persona.accent,
                                "--tw-prose-pre-bg": `${persona.accent}15`,
                                "--tw-prose-pre-border": `${persona.accent}30`,
                              } as React.CSSProperties
                        }
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-6 py-5 border-t border-orange-100 bg-white/50 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <div
            className="flex-1 flex items-end gap-3 rounded-3xl px-5 py-3 transition-all"
            style={{
              backgroundColor: `${persona.accent}08`,
              borderWidth: "2px",
              borderColor: `${persona.accent}25`,
            }}
          >
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Ask ${persona.name} anything…`}
              className="flex-1 bg-transparent outline-none resize-none min-h-[36px] max-h-32 py-0 text-sm font-medium placeholder-orange-400"
              style={{ color: persona.accent }}
              rows={1}
              disabled={streaming}
            />
            <motion.button
              onClick={() => send()}
              disabled={!draft.trim() || streaming}
              whileHover={{ scale: streaming || !draft.trim() ? 1 : 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-bold text-white shadow-lg hover:shadow-xl"
              style={{ backgroundColor: persona.accent }}
            >
              ↑
            </motion.button>
          </div>
        </div>
        <p className="text-center text-orange-600 text-xs mt-2 font-medium">
          Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}