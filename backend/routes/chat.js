import express from "express";
import { personas } from "../personas.js";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const router = express.Router();

if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not set. Set it in .env or environment variables.");
}

router.post("/", async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set. Set it in .env or environment variables.");
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
    }

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.io/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com", // Required by OpenRouter
        "X-Title": "Persona Chat", // Optional
      },
    });

    const { persona, message } = req.body;

    console.log("[chat] incoming request", { persona, message: typeof message === 'string' ? message.slice(0,120) : message });

    const systemPrompt = personas[persona];
    if (!systemPrompt) {
      return res.status(400).json({ error: "Unknown persona" });
    }

    // Using a free model from OpenRouter: mistral-7b-instruct
    // Other free options: meta-llama/llama-2-7b-chat, teknium/openhermes-2.5-mistral-7b
    const stream = await client.chat.completions.create({
      model: "mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 2048,
      stream: true,
      temperature: 0.7,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        for (const char of delta) {
          res.write(`data: ${JSON.stringify({ text: char })}\n\n`);
          await new Promise(r => setTimeout(r, 15));
        }
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Something went wrong. Try again.",
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Something went wrong. Try again." })}\n\n`);
      res.end();
    }
  }
});

export default router;
