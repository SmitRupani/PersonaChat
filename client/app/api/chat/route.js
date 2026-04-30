import { NextResponse } from 'next/server';
import personas from '../../../../backend/personas.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, persona } = body;

    const msgs = messages || (body.message ? [{ role: 'user', content: body.message }] : null);
    if (!msgs || !persona) {
      return NextResponse.json({ error: 'Invalid message or persona' }, { status: 400 });
    }

    const systemPrompt = personas[persona];
    if (!systemPrompt) {
      return NextResponse.json({ error: `Persona not found: ${persona}` }, { status: 400 });
    }

    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'API Key missing.' }, { status: 401 });
    }

    const formattedMessages = msgs.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content ?? m.text
    }));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`OpenRouter Error ${response.status}:`, text);
      return NextResponse.json({ error: `OpenRouter API error: ${response.status}`, details: text }, { status: 502 });
    }

    const data = await response.json();

    let reply = null;
    if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    } else if (data?.output?.[0]?.content) {
      const c = data.output[0].content;
      reply = Array.isArray(c) ? c.map(x => x.text || x).join('\n') : c.text || c;
    } else {
      reply = JSON.stringify(data);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Failed to communicate with AI.' }, { status: 500 });
  }
}
