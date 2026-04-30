# OpenRouter Setup Guide for Students

This project has been rewritten to use **OpenRouter API** instead of Gemini, making it completely free for students!

## What is OpenRouter?

OpenRouter is an API gateway that provides access to multiple LLMs (including open-source models) at a unified endpoint. The best part: **it's free** and requires no credit card.

## ✅ Getting a Free OpenRouter API Key

1. Go to [openrouter.io](https://openrouter.io)
2. Click **"Sign in"** (or create an account)
3. You'll see your API key in the dashboard
4. Copy the API key

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root directory (same level as `.env.example`):
```
OPENROUTER_API_KEY=your_api_key_here
PORT=5000
```

### 3. Run the Backend
```bash
cd backend
npm start    # Production mode
# OR
npm run dev  # Development mode with auto-reload
```

The backend will start on `http://localhost:5000`

### 4. Run the Frontend (in another terminal)
```bash
cd client
npm install
npm run dev
```

## 📚 Available Free Models on OpenRouter

The project uses **Mistral 7B Instruct** by default. Here are other free options you can use:

| Model | ID | Speed | Quality |
|-------|-----|-------|---------|
| Mistral 7B Instruct | `mistral-7b-instruct` | ⚡ Fast | Good |
| Llama 2 7B Chat | `meta-llama/llama-2-7b-chat` | ⚡ Fast | Good |
| OpenHermes 2.5 | `teknium/openhermes-2.5-mistral-7b` | ⚡ Fast | Good |
| Neural Chat 7B | `intel/neural-chat-7b-v3-1` | ⚡ Fast | Good |

### To Switch Models
Edit `backend/routes/chat.js` and change the `model` parameter:

```javascript
const stream = await client.chat.completions.create({
  model: "mistral-7b-instruct", // Change this to another model ID
  // ... rest of config
});
```

## 💡 Key Differences from Google Gemini

| Feature | Before (Gemini) | After (OpenRouter) |
|---------|-----------------|------------------|
| API | Google Generative AI | OpenAI-compatible |
| Cost | Limited free tier | Free forever |
| Models | Gemini family only | 100+ models available |
| Setup | Requires Google Cloud | No credit card needed |

## 🚀 How It Works

- **System Prompts**: Each persona has a detailed system prompt stored in `personas.js`
- **Streaming**: Responses are streamed character-by-character for a chat-like experience
- **OpenAI SDK**: Uses the standard OpenAI SDK pointed to OpenRouter's endpoints
- **Stateless**: Each request is independent (no conversation history stored on server)

## ⚠️ Important Notes

1. **Rate Limits**: OpenRouter's free tier has reasonable rate limits. If you hit them, wait a bit before retrying.
2. **Model Availability**: Not all models are available 24/7. If you get an error, try another model.
3. **HTTP-Referer Header**: The code includes a referer header (required by OpenRouter).
4. **Temperature**: Set to 0.7 for balanced creativity and coherence.

## 🐛 Troubleshooting

### Issue: "OPENROUTER_API_KEY is not set"
- Ensure your `.env` file exists and has the correct API key
- Restart the backend server after updating `.env`

### Issue: "Model not found" or rate limit error
- Try switching to a different model ID
- Wait a few minutes before retrying
- Check OpenRouter dashboard for any service status

### Issue: Slow responses
- This is normal for free models. Consider upgrading to a paid model on OpenRouter for faster responses.

## 📖 Resources

- [OpenRouter Documentation](https://openrouter.io/docs)
- [OpenAI SDK Documentation](https://github.com/openai/node-sdk)
- [Available Models on OpenRouter](https://openrouter.io/models)

---

**Happy learning! 🎓**
