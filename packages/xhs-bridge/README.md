# XHS Bridge

FastAPI micro-service that wraps Spider_XHS APIs and exposes REST endpoints for the Next.js frontend.

## Setup

```bash
cd packages/xhs-bridge
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/search` | Search notes by keyword |
| POST | `/note` | Get note detail |
| POST | `/user` | Get user profile |
| POST | `/user/notes` | Get user's published notes |
| POST | `/note/comments` | Get note comments |

## Authentication

All endpoints require a `cookies` field in the request body — the raw cookie string from a logged-in XHS browser session.

## Environment

Set `XHS_BRIDGE_URL` in the Next.js environment to point to this service (default: `http://localhost:8001`).
