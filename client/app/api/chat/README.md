# Chat API (Next.js App Router)

Quick instructions for using the `POST /api/chat` endpoint from the frontend.

1) Environment
- Add your OpenRouter API key to the `client` app root in `.env.local`:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Restart the Next dev server after adding the env var.

2) Request shape
- POST JSON body: `{ persona: string, messages: [{ role: 'user'|'system'|'assistant'|'model', content:string }], message?: string }`
- The route supports a fallback `message` string for simple callers.

3) Example fetch from the frontend

```js
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    persona: 'anshuman',
    messages: [ { role: 'user', content: 'Help me structure my DSA practice.' } ]
  })
});
const data = await res.json();
console.log(data.reply);
```

4) Notes
- The API route imports persona prompts from `backend/personas.js`.
- It calls OpenRouter's chat completions endpoint using the free model `nvidia/nemotron-3-nano-30b-a3b:free`.
- Ensure `OPENROUTER_API_KEY` is set in `client/.env.local` (not in public code).
