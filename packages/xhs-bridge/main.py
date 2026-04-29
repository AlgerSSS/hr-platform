"""
XHS Bridge — FastAPI micro-service wrapping Spider_XHS APIs.
Exposes REST endpoints consumed by the Next.js API routes.

Usage:
  cd packages/xhs-bridge
  pip install -r requirements.txt
  uvicorn main:app --port 8001 --reload
"""

from __future__ import annotations

import sys
import os

# Add spider_xhs to path so its internal imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "spider_xhs"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "spider_xhs", "apis"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "spider_xhs", "xhs_utils"))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from xhs_pc_apis import XHS_Apis
from xhs_util import generate_request_params, generate_x_rap_param

app = FastAPI(title="XHS Bridge", version="2.0.0")
xhs = XHS_Apis()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class SearchRequest(BaseModel):
    query: str
    page: int = 1
    sort_type: int = 0   # 0综合 1最新 2最多点赞 3最多评论 4最多收藏
    note_type: int = 0   # 0不限 1视频 2图文
    cookies: str


class NoteRequest(BaseModel):
    note_url: str        # full XHS note URL with xsec_token
    cookies: str


class UserRequest(BaseModel):
    user_id: str
    cookies: str


class UserNotesRequest(BaseModel):
    user_url: str        # full XHS user URL with xsec_token
    cookies: str


class EngageRequest(BaseModel):
    note_id: str
    xsec_token: str = ""
    comment_text: str = ""
    cookies: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "xhs-bridge"}


@app.post("/search")
def api_search(req: SearchRequest):
    success, msg, notes = xhs.search_some_note(
        req.query, 20, req.cookies,
        sort_type_choice=req.sort_type,
        note_type=req.note_type,
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"notes": [_normalize_note_card(n, i) for i, n in enumerate(notes)], "has_more": len(notes) >= 20}


@app.post("/note")
def api_note(req: NoteRequest):
    success, msg, res = xhs.get_note_info(req.note_url, req.cookies)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    items = res.get("data", {}).get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail="note not found")
    return _normalize_note_detail(items[0].get("note_card", items[0]))


@app.post("/user")
def api_user(req: UserRequest):
    success, msg, res = xhs.get_user_info(req.user_id, req.cookies)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return _normalize_user(res.get("data", {}))


@app.post("/user/notes")
def api_user_notes(req: UserNotesRequest):
    success, msg, notes = xhs.get_user_all_notes(req.user_url, req.cookies)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"notes": [_normalize_note_card(n) for n in notes]}


@app.post("/note/comments")
def api_comments(req: NoteRequest):
    success, msg, comments = xhs.get_note_all_comment(req.note_url, req.cookies)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"comments": comments}


BASE_URL = "https://edith.xiaohongshu.com"


@app.post("/note/engage")
def api_engage(req: EngageRequest):
    """Collect (star) a note and optionally post a comment. Called when adding a candidate."""
    results = {}

    # 1. Collect / star the note
    try:
        api = "/api/sns/web/v1/note/collect"
        data = {"note_id": req.note_id}
        headers, cookies, body = generate_request_params(req.cookies, api, data, "POST")
        resp = requests.post(BASE_URL + api, headers=headers, data=body.encode("utf-8"), cookies=cookies, timeout=15)
        rj = resp.json()
        results["collect"] = {"success": rj.get("success", False), "msg": rj.get("msg", "")}
    except Exception as e:
        results["collect"] = {"success": False, "msg": str(e)}

    # 2. Post comment (only if comment_text provided)
    if req.comment_text.strip():
        try:
            api = "/api/sns/web/v1/comment/post"
            data = {
                "note_id": req.note_id,
                "content": req.comment_text,
                "at_users": [],
            }
            headers, cookies, body = generate_request_params(req.cookies, api, data, "POST")
            resp = requests.post(BASE_URL + api, headers=headers, data=body.encode("utf-8"), cookies=cookies, timeout=15)
            rj = resp.json()
            results["comment"] = {"success": rj.get("success", False), "msg": rj.get("msg", "")}
        except Exception as e:
            results["comment"] = {"success": False, "msg": str(e)}
    else:
        results["comment"] = {"success": True, "msg": "skipped"}

    return results


# ---------------------------------------------------------------------------
# Normalizers
# ---------------------------------------------------------------------------

def _extract_cover(note: dict) -> str:
    cover = note.get("cover", {})
    if isinstance(cover, dict):
        return cover.get("url_default", cover.get("url", ""))
    img_list = note.get("image_list", [])
    if img_list:
        return img_list[0].get("url_default", "")
    return ""


def _normalize_note_card(note: dict, idx: int = 0) -> dict:
    card = note.get("note_card", note)
    note_id = card.get("id") or card.get("note_id") or f"__unknown_{idx}"
    return {
        "id": note_id,
        "title": card.get("display_title") or card.get("title", ""),
        "desc": card.get("desc", ""),
        "cover": _extract_cover(card),
        "author": {
            "id": card.get("user", {}).get("user_id", ""),
            "name": card.get("user", {}).get("nickname", ""),
            "avatar": card.get("user", {}).get("avatar", ""),
        },
        "tags": [t.get("name", "") for t in card.get("tag_list", [])],
        "liked_count": str(card.get("interact_info", {}).get("liked_count", "0")),
        "comment_count": str(card.get("interact_info", {}).get("comment_count", "0")),
        "type": card.get("type", "normal"),
        "created_at": card.get("time", 0),
        "xsec_token": card.get("xsec_token", ""),
    }


def _normalize_note_detail(note: dict) -> dict:
    return {
        "id": note.get("note_id", ""),
        "title": note.get("title", ""),
        "desc": note.get("desc", ""),
        "cover": _extract_cover(note),
        "images": [img.get("url_default", "") for img in note.get("image_list", [])],
        "author": {
            "id": note.get("user", {}).get("user_id", ""),
            "name": note.get("user", {}).get("nickname", ""),
            "avatar": note.get("user", {}).get("avatar", ""),
            "desc": note.get("user", {}).get("desc", ""),
        },
        "tags": [t.get("name", "") for t in note.get("tag_list", [])],
        "liked_count": str(note.get("interact_info", {}).get("liked_count", "0")),
        "comment_count": str(note.get("interact_info", {}).get("comment_count", "0")),
        "collect_count": str(note.get("interact_info", {}).get("collected_count", "0")),
        "type": note.get("type", "normal"),
        "created_at": note.get("time", 0),
        "ip_location": note.get("ip_location", ""),
    }


def _normalize_user(data: dict) -> dict:
    info = data.get("basic_info", {})
    interactions = data.get("interactions", [])
    tags = data.get("tags", [])
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
