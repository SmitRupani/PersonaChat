import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import * as personas from '../personas.js';

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { persona, message } = req.body;
    
    if (!message || !persona) {
      return res.status(400).json({ error: 'Invalid message or persona' });
    }

    let systemPrompt = '';
    try {
      systemPrompt = personas[persona];
      if (!systemPrompt) {
        throw new Error("Persona not found");
      }
    } catch (err) {
      return res.status(400).json({ error: `Could not load persona for ${persona}` });
    }

    const key = process.env.OPENROUTER_API_KEY;

    if (!key) {
      return res.status(401).json({ error: 'API Key missing.' });
    }

    // Call OpenRouter API with correct endpoint
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Persona Chat",
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-3-nano-30b-a3b:free",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": message }
        ]
      })
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`OpenRouter Error ${response.status}:`, text);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Stream character by character for smooth animation
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for (const char of reply) {
      res.write(`data: ${JSON.stringify({ text: char })}\n\n`);
      await new Promise(r => setTimeout(r, 15));
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to communicate with AI.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
