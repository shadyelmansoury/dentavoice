# DentaVoice 🦷

Voice-to-clinical-notes app for dental practice. Dictate patient notes and get them automatically structured into standard SOAP format with AI-powered clinical recommendations.

## Features

- **Voice Dictation** — Tap and speak, real-time transcription
- **SOAP Template** — AI structures notes into standard dental clinical format (Subjective, Objective, Assessment, Plan)
- **Clinical Recommendations** — AI-generated suggestions the dentist can accept or dismiss
- **Edit & Copy** — Edit any section, copy formatted notes for your EMR
- **Note History** — Saved notes persist in browser storage

## Setup

This app is designed to be deployed on **Netlify** with a secure serverless function that handles AI API calls.

### 1. Deploy to Netlify
- Connect your GitHub repo to Netlify
- Netlify will automatically detect the `netlify.toml` configuration

### 2. Add your API Key
- In Netlify dashboard, go to **Site settings → Environment variables**
- Add: `ANTHROPIC_API_KEY` = your Anthropic API key
- Redeploy the site

### 3. Use
- Open your site URL on Chrome (desktop or mobile)
- Allow microphone access when prompted
- Dictate patient notes and tap "Structure with AI"

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no build step needed)
- **Backend**: Netlify Functions (serverless)
- **AI**: Claude API (Anthropic)
- **Speech**: Web Speech API (Chrome)

## File Structure

```
├── index.html              # Main app
├── netlify.toml             # Netlify config
├── netlify/
│   └── functions/
│       └── claude-proxy.js  # Secure API proxy
└── README.md
```

---
Built with ❤️ for Dr. Amira
