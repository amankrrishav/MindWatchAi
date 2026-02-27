# MindWatch Web

This is the React + TypeScript frontend I built for MindWatch. 

## Overview
It serves as the main dashboard where users can manage their daily 7-signal wellness check-ins, view their risk snapshots through interactive charts, and manage their privacy settings. It communicates directly with the `mindwatch-api` backend.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Boot the dev server
npm run dev
```
- Open `http://localhost:5173` in your browser.

## Configuration
Make sure the backend is running. Set `VITE_API_URL` in a `.env` file at this directory level if your API runs on a different port or host.
```env
VITE_API_URL=http://127.0.0.1:8000
```

## Features
- **Authentication:** Protected routing via JWTs stored securely.
- **Wellness Check-In:** Form flow for a 7-point check-in (mood, sleep, focus, etc).
- **Interactive Dashboards:** Visualizes `RiskSnapshots` and check-in history.
- **Privacy Controls:** Fine-grained data toggles linked to user consent mappings.

*Refer to the main repository `README.md` for full system insights.*
