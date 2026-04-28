"use client";

import { useState, useCallback, useEffect } from "react";
import Nav from "@/components/shared/Nav";
import Link from "next/link";
import NoteCard from "@/components/xiaohongshu/NoteCard";
import NoteDetail from "@/components/xiaohongshu/NoteDetail";
import UserProfile from "@/components/xiaohongshu/UserProfile";
import CookieModal from "@/components/xiaohongshu/CookieModal";
import { XhsNote, XhsNoteDetail, XhsUser } from "@/components/xiaohongshu/types";

const SORT_OPTIONS = [
  { value: "general", label: "综合" },
  { value: "time_descending", label: "最新" },
  { value: "popularity_descending", label: "最热" },
];

const TYPE_OPTIONS = [
  { value: 0, label: "全部" },
  { value: 2, label: "图文" },
  { value: 1, label: "视频" },
];

export default function XiaohongshuPage() {
  const [cookies, setCookies] = useState<string>("");
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("general");
  const [noteType, setNoteType] = useState(0);
  const [notes, setNotes] = useState<XhsNote[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Detail panel
  const [activeNote, setActiveNote] = useState<XhsNote | null>(null);
  const [noteDetail, setNoteDetail] = useState<XhsNoteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // User panel
  const [activeUser, setActiveUser] = useState<XhsUser | null>(null);
  const [userNotes, setUserNotes] = useState<XhsNote[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);

  // Candidates
  const [candidates, setCandidates] = useState<XhsNote[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);

  // Load cookies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("xhs_cookies");
    if (saved) setCookies(saved);
  }, []);

  const saveCookies = (c: string) => {
    setCookies(c);
    localStorage.setItem("xhs_cookies", c);
    setShowCookieModal(false);
  };

  const doSearch = useCallback(async (resetPage = true) => {
    if (!query.trim()) return;
    if (!cookies) { setShowCookieModal(true); return; }

    const p = resetPage ? 1 : page;
    setSearching(true);
    setError("");
    if (resetPage) { setNotes([]); setPage(1); }

    try {
      const res = await fetch("/api/xiaohongshu/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), page: p, sort_type: ["general","time_descending","popularity_descending"].indexOf(sort), note_type: noteType, cookies }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "搜索失败");
      setNotes((prev) => {
        if (resetPage) return data.notes;
        const existingIds = new Set(prev.map((n: XhsNote) => n.id));
        return [...prev, ...data.notes.filter((n: XhsNote) => !existingIds.has(n.id))];
      });
      setHasMore(data.has_more);
      if (!resetPage) setPage(p + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "搜索失败");
    } finally {
      setSearching(false);
    }
  }, [query, sort, noteType, cookies, page]);

  const openNote = async (note: XhsNote) => {
    setActiveNote(note);
    setNoteDetail(null);
    setDetailLoading(true);
    try {
      // Build full XHS URL with xsec_token so Spider_XHS can sign correctly
      const noteUrl = `https://www.xiaohongshu.com/explore/${note.id}?xsec_token=${note.xsec_token ?? ""}&xsec_source=pc_search`;
      const res = await fetch("/api/xiaohongshu/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_url: noteUrl, cookies }),
      });
      if (res.ok) setNoteDetail(await res.json());
    } finally {
      setDetailLoading(false);
    }
  };

  const openUser = async (userId: string) => {
    setShowUserPanel(true);
    setActiveUser(null);
    setUserNotes([]);
    setUserLoading(true);
    try {
      const res = await fetch("/api/xiaohongshu/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, cookies }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveUser(data.user);
        setUserNotes(data.notes?.notes ?? []);
      }
    } finally {
      setUserLoading(false);
    }
  };

  const toggleCandidate = (note: XhsNote) => {
    setCandidates((prev) =>
      prev.find((c) => c.id === note.id) ? prev.filter((c) => c.id !== note.id) : [...prev, note]
    );
  };

  const addUserAsCandidate = (user: XhsUser) => {
    const synthetic: XhsNote = {
      id: user.id,
      title: user.name,
      desc: user.desc,
      cover: user.avatar,
      author: { id: user.id, name: user.name, avatar: user.avatar },
      tags: user.tags,
      liked_count: user.interaction,
      comment_count: "0",
      type: "user",
      created_at: 0,
    };
    setCandidates((prev) =>
      prev.find((c) => c.id === user.id) ? prev : [...prev, synthetic]
    );
  };

  const exportCandidates = async () => {
    const res = await fetch("/api/xiaohongshu/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xhs-candidates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelectedToCandidate = () => {
    const toAdd = notes.filter((n) => selected.has(n.id));
    setCandidates((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      return [...prev, ...toAdd.filter((n) => !existingIds.has(n.id))];
    });
    setSelected(new Set());
  };

  return (
    <main style={{ background: "#000", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section style={{
        background: "#000",
        paddingTop: "96px",
        paddingBottom: "48px",
        textAlign: "center",
        padding: "96px 24px 48px",
      }}>
        <p style={{
          fontFamily: "'SF Pro Text', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          color: "#ff2442",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>
          小红书招聘
        </p>
        <h1 style={{
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 600,
          lineHeight: 1.07,
          letterSpacing: "-0.28px",
          color: "#fff",
          marginBottom: "12px",
        }}>
          发现求职达人
        </h1>
        <p style={{
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: "21px",
          fontWeight: 400,
          lineHeight: 1.19,
          color: "rgba(255,255,255,0.6)",
          marginBottom: "40px",
        }}>
          搜索小红书求职帖，触达主动求职的优质候选人。
        </p>

        {/* Search bar */}
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="搜索关键词，如「求职 产品经理」"
            style={{
              flex: 1,
              background: "#fafafc",
              border: "3px solid rgba(0,0,0,0.04)",
              borderRadius: "11px",
              padding: "12px 16px",
              fontSize: "15px",
              fontFamily: "'SF Pro Text', sans-serif",
              color: "#1d1d1f",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.outline = "2px solid #0071e3")}
            onBlur={(e) => (e.target.style.outline = "none")}
          />
          <button
            onClick={() => doSearch()}
            disabled={searching || !query.trim()}
            className="btn-primary"
            style={{ whiteSpace: "nowrap", opacity: searching || !query.trim() ? 0.5 : 1 }}
          >
            {searching ? "搜索中…" : "搜索"}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
          {SORT_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setSort(o.value)} style={{
              background: sort === o.value ? "#0071e3" : "rgba(255,255,255,0.08)",
              color: sort === o.value ? "#fff" : "rgba(255,255,255,0.7)",
              border: "none",
              borderRadius: "980px",
              padding: "5px 14px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'SF Pro Text', sans-serif",
              transition: "background 0.15s",
            }}>
              {o.label}
            </button>
          ))}
          <div style={{ width: "1px", background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
          {TYPE_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setNoteType(o.value)} style={{
              background: noteType === o.value ? "#0071e3" : "rgba(255,255,255,0.08)",
              color: noteType === o.value ? "#fff" : "rgba(255,255,255,0.7)",
              border: "none",
              borderRadius: "980px",
              padding: "5px 14px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'SF Pro Text', sans-serif",
              transition: "background 0.15s",
            }}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* Toolbar */}
      {notes.length > 0 && (
        <div style={{
          background: "#f5f5f7",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)", fontFamily: "'SF Pro Text', sans-serif" }}>
            找到 {notes.length} 条结果
            {selected.size > 0 && <span style={{ color: "#0071e3" }}> · 已选 {selected.size} 条</span>}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {selected.size > 0 && (
              <button onClick={addSelectedToCandidate} className="btn-primary" style={{ fontSize: "13px", padding: "6px 14px" }}>
                加入候选人 ({selected.size})
              </button>
            )}
            {candidates.length > 0 && (
              <button onClick={() => setShowCandidates(true)} style={{
                background: "transparent",
                border: "1px solid #0066cc",
                color: "#0066cc",
                borderRadius: "980px",
                padding: "6px 14px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'SF Pro Text', sans-serif",
              }}>
                候选人列表 ({candidates.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results grid */}
      <section style={{ background: "#f5f5f7", padding: "32px 24px 64px" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          {error && (
            <div style={{
              background: "rgba(255,59,48,0.1)",
              border: "1px solid rgba(255,59,48,0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#ff3b30",
              fontSize: "14px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer" }}>×</button>
            </div>
          )}

          {notes.length === 0 && !searching && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(0,0,0,0.3)" }}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>📕</p>
              <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "17px" }}>
                输入关键词开始搜索小红书求职帖
              </p>
              <button
                onClick={() => setShowCookieModal(true)}
                style={{
                  marginTop: "16px",
                  background: "transparent",
                  border: "none",
                  color: "#0066cc",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'SF Pro Text', sans-serif",
                }}
              >
                {cookies ? "✓ Cookies 已配置 · 重新配置" : "配置 Cookies ›"}
              </button>
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}>
            {notes.map((note, idx) => (
              <NoteCard
                key={`${note.id}-${idx}`}
                note={note}
                selected={selected.has(note.id)}
                onSelect={toggleSelect}
                onClick={openNote}
              />
            ))}
          </div>

          {searching && (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.4)" }}>
              <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px" }}>搜索中…</p>
            </div>
          )}

          {hasMore && !searching && notes.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button
                onClick={() => doSearch(false)}
                className="btn-pill btn-pill-outline-blue"
              >
                加载更多 ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#f5f5f7",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "24px",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}>
        <Link href="/" style={{ fontSize: "12px", color: "rgba(0,0,0,0.48)", fontFamily: "'SF Pro Text', sans-serif", textDecoration: "none" }}>
          ← 返回首页
        </Link>
        <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.2)" }}>·</span>
        <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.48)" }}>
          HR Platform · 小红书模块
        </p>
      </footer>

      {/* Modals */}
      {showCookieModal && (
        <CookieModal onSave={saveCookies} onClose={() => setShowCookieModal(false)} />
      )}

      {activeNote && (
        <NoteDetail
          note={activeNote}
          detail={noteDetail}
          loading={detailLoading}
          onClose={() => { setActiveNote(null); setNoteDetail(null); }}
          onViewUser={(uid) => { setActiveNote(null); setNoteDetail(null); openUser(uid); }}
          onAddCandidate={toggleCandidate}
          isCandidate={candidates.some((c) => c.id === activeNote.id)}
        />
      )}

      {showUserPanel && (
        <UserProfile
          user={activeUser}
          notes={userNotes}
          loading={userLoading}
          onClose={() => { setShowUserPanel(false); setActiveUser(null); }}
          onNoteClick={(n) => { setShowUserPanel(false); openNote(n); }}
          onAddCandidate={addUserAsCandidate}
          isCandidate={activeUser ? candidates.some((c) => c.id === activeUser.id) : false}
        />
      )}

      {/* Candidates drawer */}
      {showCandidates && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
        }}
          onClick={() => setShowCandidates(false)}
        >
          <div
            style={{
              background: "#1c1c1e",
              borderRadius: "18px 18px 0 0",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "70vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                候选人列表 ({candidates.length})
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={exportCandidates} className="btn-primary" style={{ fontSize: "13px", padding: "6px 14px" }}>
                  导出 JSON
                </button>
                <button onClick={() => setShowCandidates(false)} style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  ×
                </button>
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>
              {candidates.map((c) => (
                <div key={c.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {c.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover} alt={c.author.name}
                      style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#272729", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>
                      {c.author.name}
                    </p>
                    <p style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {c.title || c.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setCandidates((prev) => prev.filter((x) => x.id !== c.id))}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.3)",
                      cursor: "pointer",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .note-card:hover { transform: translateY(-2px); }
        .platform-card:hover { transform: translateY(-2px); box-shadow: rgba(0,0,0,0.14) 0px 8px 32px; }
      `}</style>
    </main>
  );
}
