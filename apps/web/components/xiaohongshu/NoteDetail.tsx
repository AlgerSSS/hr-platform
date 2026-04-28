"use client";

import { XhsNote, XhsNoteDetail } from "./types";

interface Props {
  note: XhsNote | null;
  detail: XhsNoteDetail | null;
  loading: boolean;
  onClose: () => void;
  onViewUser: (userId: string) => void;
  onAddCandidate: (note: XhsNote) => void;
  isCandidate: boolean;
}

export default function NoteDetail({
  note,
  detail,
  loading,
  onClose,
  onViewUser,
  onAddCandidate,
  isCandidate,
}: Props) {
  const data = detail ?? note;
  if (!data) return null;

  const date = data.created_at
    ? new Date(data.created_at * 1000).toLocaleDateString("zh-CN")
    : "";

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      padding: "24px",
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1c1c1e",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "rgba(0,0,0,0.5) 0 20px 60px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {data.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.author.avatar} alt={data.author.name}
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#272729" }} />
            )}
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", letterSpacing: "-0.224px" }}>
                {data.author.name}
              </p>
              {date && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{date}</p>
              )}
            </div>
          </div>
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

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>
              加载中...
            </div>
          ) : (
            <>
              {/* Cover / images */}
              {detail?.images && detail.images.length > 0 ? (
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px" }}>
                  {detail.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img} alt=""
                      style={{ height: "200px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  ))}
                </div>
              ) : data.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.cover} alt={data.title}
                  style={{ width: "100%", borderRadius: "8px", objectFit: "cover", marginBottom: "16px", maxHeight: "280px" }} />
              ) : null}

              {/* Title */}
              {data.title && (
                <h2 style={{
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: "21px",
                  fontWeight: 600,
                  lineHeight: 1.19,
                  letterSpacing: "0.231px",
                  color: "#fff",
                  marginBottom: "12px",
                }}>
                  {data.title}
                </h2>
              )}

              {/* Desc */}
              <p style={{
                fontFamily: "'SF Pro Text', sans-serif",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "16px",
                whiteSpace: "pre-wrap",
              }}>
                {data.desc}
              </p>

              {/* Tags */}
              {data.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  {data.tags.map((tag) => (
                    <span key={tag} style={{
                      background: "rgba(0,113,227,0.15)",
                      color: "#2997ff",
                      fontSize: "12px",
                      padding: "3px 10px",
                      borderRadius: "980px",
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
                {[
                  { label: "❤ 点赞", val: data.liked_count },
                  { label: "💬 评论", val: data.comment_count },
                  ...("collect_count" in data ? [{ label: "⭐ 收藏", val: (data as XhsNoteDetail).collect_count }] : []),
                  ...("ip_location" in data && (data as XhsNoteDetail).ip_location
                    ? [{ label: "📍", val: (data as XhsNoteDetail).ip_location }]
                    : []),
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
        }}>
          <button
            onClick={() => onViewUser(data.author.id)}
            style={{
              background: "transparent",
              border: "1px solid #0066cc",
              color: "#2997ff",
              borderRadius: "980px",
              padding: "7px 16px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'SF Pro Text', sans-serif",
            }}
          >
            查看作者 ›
          </button>
          <button
            onClick={() => onAddCandidate(data)}
            style={{
              background: isCandidate ? "#272729" : "#0071e3",
              border: "none",
              color: isCandidate ? "rgba(255,255,255,0.5)" : "#fff",
              borderRadius: "8px",
              padding: "7px 16px",
              fontSize: "13px",
              cursor: isCandidate ? "default" : "pointer",
              fontFamily: "'SF Pro Text', sans-serif",
            }}
            disabled={isCandidate}
          >
            {isCandidate ? "已加入候选" : "加入候选人"}
          </button>
        </div>
      </div>
    </div>
  );
}
