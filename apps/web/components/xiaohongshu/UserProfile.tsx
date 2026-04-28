"use client";

import { XhsUser, XhsNote } from "./types";

interface Props {
  user: XhsUser | null;
  notes: XhsNote[];
  loading: boolean;
  onClose: () => void;
  onNoteClick: (note: XhsNote) => void;
  onAddCandidate: (user: XhsUser) => void;
  isCandidate: boolean;
}

export default function UserProfile({
  user,
  notes,
  loading,
  onClose,
  onNoteClick,
  onAddCandidate,
  isCandidate,
}: Props) {
  if (!user && !loading) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 110,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(10px)",
      padding: "24px",
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1c1c1e",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "rgba(0,0,0,0.6) 0 20px 60px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>候选人详情</span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              color: "#fff",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>
              加载中...
            </div>
          ) : user ? (
            <>
              {/* Profile */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name}
                    style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#272729", flexShrink: 0 }} />
                )}
                <div>
                  <h2 style={{
                    fontFamily: "'SF Pro Display', sans-serif",
                    fontSize: "21px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "4px",
                  }}>
                    {user.name}
                  </h2>
                  {user.ip_location && (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>
                      📍 {user.ip_location}
                    </p>
                  )}
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                    {user.desc || "暂无简介"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}>
                {[
                  { label: "关注", val: user.follows },
                  { label: "粉丝", val: user.fans },
                  { label: "获赞与收藏", val: user.interaction },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "#272729",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                  }}>
                    <p style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>{s.val}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {user.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                  {user.tags.map((tag) => (
                    <span key={tag} style={{
                      background: "rgba(0,113,227,0.15)",
                      color: "#2997ff",
                      fontSize: "12px",
                      padding: "3px 10px",
                      borderRadius: "980px",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {notes.length > 0 && (
                <>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>
                    最近发布 ({notes.length})
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {notes.slice(0, 9).map((n) => (
                      <div key={n.id} onClick={() => onNoteClick(n)} style={{ cursor: "pointer" }}>
                        <div style={{ aspectRatio: "1", background: "#272729", borderRadius: "8px", overflow: "hidden" }}>
                          {n.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={n.cover} alt={n.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ opacity: 0.3 }}>📕</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        {user && (
          <div style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "flex-end",
          }}>
            <button
              onClick={() => onAddCandidate(user)}
              style={{
                background: isCandidate ? "#272729" : "#0071e3",
                border: "none",
                color: isCandidate ? "rgba(255,255,255,0.5)" : "#fff",
                borderRadius: "8px",
                padding: "8px 20px",
                fontSize: "14px",
                cursor: isCandidate ? "default" : "pointer",
                fontFamily: "'SF Pro Text', sans-serif",
              }}
              disabled={isCandidate}
            >
              {isCandidate ? "已加入候选" : "加入候选人"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
