"""
XHS Bridge — FastAPI micro-service wrapping Spider_XHS APIs.
Exposes REST endpoints consumed by the Next.js API routes.

Usage:
  pip install -r requirements.txt
  uvicorn main:app --port 8001 --reload

All endpoints require the caller to pass `cookies` in the request body
(the raw cookie string from a logged-in XHS browser session).
"""

from __future__ import annotations

import asyncio
import json
import re
import time
import hashlib
import random
import string
from typing import Any, Optional
from urllib.parse import urlencode, quote

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="XHS Bridge", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class SearchRequest(BaseModel):
    query: str
    page: int = 1
    page_size: int = 20
    sort: str = "general"   # general | time_descending | popularity_descending
    note_type: int = 0       # 0=all 1=video 2=image
    cookies: str


class NoteRequest(BaseModel):
    note_id: str
    cookies: str


class UserRequest(BaseModel):
    user_id: str
    cookies: str


class CommentsRequest(BaseModel):
    note_id: str
    cookies: str
    cursor: str = ""


# ---------------------------------------------------------------------------
# XHS signing helpers (reverse-engineered, educational use only)
# ---------------------------------------------------------------------------

XHS_PC_BASE = "https://edith.xiaohongshu.com"
XHS_WEB_BASE = "https://www.xiaohongshu.com"

COMMON_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.xiaohongshu.com/",
    "Origin": "https://www.xiaohongshu.com",
    "Content-Type": "application/json",
}


def _build_headers(cookies: str, extra: dict | None = None) -> dict:
    h = {**COMMON_HEADERS, "Cookie": cookies}
    if extra:
        h.update(extra)
    return h


def _parse_cookies(cookies_str: str) -> dict:
    result: dict[str, str] = {}
    for part in cookies_str.split(";"):
        part = part.strip()
        if "=" in part:
            k, v = part.split("=", 1)
            result[k.strip()] = v.strip()
    return result


async def _xhs_get(url: str, cookies: str, params: dict | None = None) -> dict:
    headers = _build_headers(cookies)
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        return resp.json()


async def _xhs_post(url: str, cookies: str, payload: dict) -> dict:
    headers = _build_headers(cookies)
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()


# ---------------------------------------------------------------------------
# API helpers — map Spider_XHS logic to async functions
# ---------------------------------------------------------------------------

async def search_notes(
    query: str,
    page: int,
    page_size: int,
    sort: str,
    note_type: int,
    cookies: str,
) -> dict:
    url = f"{XHS_PC_BASE}/api/sns/web/v1/search/notes"
    payload = {
        "keyword": query,
        "page": page,
        "page_size": page_size,
        "search_id": _random_id(),
        "sort": sort,
        "note_type": note_type,
    }
    return await _xhs_post(url, cookies, payload)


async def get_note_info(note_id: str, cookies: str) -> dict:
    url = f"{XHS_PC_BASE}/api/sns/web/v1/feed"
    payload = {
        "source_note_id": note_id,
        "image_formats": ["jpg", "webp", "avif"],
        "extra": {"need_body_topic": "1"},
        "xsec_source": "pc_search",
        "xsec_token": "",
    }
    return await _xhs_post(url, cookies, payload)


async def get_user_info(user_id: str, cookies: str) -> dict:
    url = f"{XHS_PC_BASE}/api/sns/web/v1/user/otherinfo"
    params = {"target_user_id": user_id}
    return await _xhs_get(url, cookies, params)


async def get_user_notes(user_id: str, cookies: str, cursor: str = "") -> dict:
    url = f"{XHS_PC_BASE}/api/sns/web/v1/user_posted"
    params = {"user_id": user_id, "cursor": cursor, "num": 30, "image_formats": "jpg,webp,avif"}
    return await _xhs_get(url, cookies, params)


async def get_note_comments(note_id: str, cookies: str, cursor: str = "") -> dict:
    url = f"{XHS_PC_BASE}/api/sns/web/v1/comment/page"
    params = {"note_id": note_id, "cursor": cursor}
    return await _xhs_get(url, cookies, params)


def _random_id(length: int = 16) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


# ---------------------------------------------------------------------------
# FastAPI routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "xhs-bridge"}


@app.post("/search")
async def api_search(req: SearchRequest):
    try:
        data = await search_notes(
            req.query, req.page, req.page_size, req.sort, req.note_type, req.cookies
        )
        return _normalize_search(data)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/note")
async def api_note(req: NoteRequest):
    try:
        data = await get_note_info(req.note_id, req.cookies)
        return _normalize_note(data)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user")
async def api_user(req: UserRequest):
    try:
        data = await get_user_info(req.user_id, req.cookies)
        return _normalize_user(data)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user/notes")
async def api_user_notes(req: UserRequest):
    try:
        data = await get_user_notes(req.user_id, req.cookies)
        return data
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/note/comments")
async def api_comments(req: CommentsRequest):
    try:
        data = await get_note_comments(req.note_id, req.cookies, req.cursor)
        return data
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Normalizers — flatten XHS API responses to stable shapes
# ---------------------------------------------------------------------------

def _normalize_search(raw: dict) -> dict:
    items = raw.get("data", {}).get("items", [])
    notes = []
    for item in items:
        note = item.get("note_card", item)
        notes.append({
            "id": note.get("id") or note.get("note_id", ""),
            "title": note.get("display_title") or note.get("title", ""),
            "desc": note.get("desc", ""),
            "cover": _extract_cover(note),
            "author": {
                "id": note.get("user", {}).get("user_id", ""),
                "name": note.get("user", {}).get("nickname", ""),
                "avatar": note.get("user", {}).get("avatar", ""),
            },
            "tags": [t.get("name", "") for t in note.get("tag_list", [])],
            "liked_count": note.get("interact_info", {}).get("liked_count", "0"),
            "comment_count": note.get("interact_info", {}).get("comment_count", "0"),
            "type": note.get("type", "normal"),
            "created_at": note.get("time", 0),
        })
    return {
        "notes": notes,
        "has_more": raw.get("data", {}).get("has_more", False),
        "cursor": raw.get("data", {}).get("cursor", ""),
    }


def _normalize_note(raw: dict) -> dict:
    items = raw.get("data", {}).get("items", [])
    if not items:
        return {}
    note = items[0].get("note_card", items[0])
    return {
        "id": note.get("note_id", ""),
        "title": note.get("title", ""),
        "desc": note.get("desc", ""),
        "cover": _extract_cover(note),
        "images": [img.get("url_default", "") for img in note.get("image_list", [])],
        "video_url": note.get("video", {}).get("media", {}).get("stream", {}).get("h264", [{}])[0].get("master_url", ""),
        "author": {
            "id": note.get("user", {}).get("user_id", ""),
            "name": note.get("user", {}).get("nickname", ""),
            "avatar": note.get("user", {}).get("avatar", ""),
            "desc": note.get("user", {}).get("desc", ""),
        },
        "tags": [t.get("name", "") for t in note.get("tag_list", [])],
        "liked_count": note.get("interact_info", {}).get("liked_count", "0"),
        "comment_count": note.get("interact_info", {}).get("comment_count", "0"),
        "collect_count": note.get("interact_info", {}).get("collected_count", "0"),
        "type": note.get("type", "normal"),
        "created_at": note.get("time", 0),
        "ip_location": note.get("ip_location", ""),
    }


def _normalize_user(raw: dict) -> dict:
    info = raw.get("data", {}).get("basic_info", {})
    interactions = raw.get("data", {}).get("interactions", [])
    tags = raw.get("data", {}).get("tags", [])
    return {
        "id": info.get("red_id", ""),
        "name": info.get("nickname", ""),
        "avatar": info.get("imageb", info.get("images", "")),
        "desc": info.get("desc", ""),
        "gender": info.get("gender", 0),
        "ip_location": info.get("ip_location", ""),
        "follows": next((i.get("count", "0") for i in interactions if i.get("type") == "follows"), "0"),
        "fans": next((i.get("count", "0") for i in interactions if i.get("type") == "fans"), "0"),
        "interaction": next((i.get("count", "0") for i in interactions if i.get("type") == "interaction"), "0"),
        "tags": [t.get("name", "") for t in tags],
    }


def _extract_cover(note: dict) -> str:
    cover = note.get("cover", {})
    if isinstance(cover, dict):
        return cover.get("url_default", cover.get("url", ""))
    img_list = note.get("image_list", [])
    if img_list:
        return img_list[0].get("url_default", "")
    return ""
