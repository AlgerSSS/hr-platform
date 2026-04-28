"use client";

import { XhsNote } from "./types";

interface Props {
  note: XhsNote;
  selected: boolean;
  onSelect: (id: string) => void;
  onClick: (note: XhsNote) => void;
}

export default function NoteCard({ note, selected, onSelect, onClick }: Props) {
  const date = note.created_at
    ? new Date(note.created_at * 1000).toLocaleDateString("zh-CN")
    : "";

  return (
    <div
      style={{
        background: selected ? "#1a1a2e" : "var(--color-dark-surface-1)",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        border: selected ? "1.5px solid #0071e3" : "1.5px solid transparent",
        transition: "border-color 0.15s, transform 0.15s",
        boxShadow: "var(--shadow-card)",
        position: "relative",
      }}
      className="note-card"
      onClick={() => onClick(note)}
    >
      {/* Checkbox */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 2,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: selected ? "#0071e3" : "rgba(0,0,0,0.5)",
          border: selected ? "none" : "1.5px solid rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(note.id);
        }}
      >
        {selected && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Cover */}
      <div style={{ width: "100%", aspectRatio: "4/3", background: "#1d1d1f", overflow: "hidden" }}>
        {note.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={note.cover}
            alt={note.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "32px", opacity: 0.3 }}>📕</span>
          </div>
        )}
        {note.type === "video" && (
          <div style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "11px",
            color: "#fff",
          }}>
            ▶ 视频
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{
          fontFamily: "'SF Pro Text', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: "-0.224px",
          color: "#ffffff",
          marginBottom: "6px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {note.title || note.desc || "无标题"}
        </p>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{
                background: "rgba(0,113,227,0.15)",
                color: "#2997ff",
                fontSize: "11px",
                padding: "2px 7px",
                borderRadius: "980px",
                letterSpacing: "-0.12px",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author + stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {note.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={note.author.avatar}
                alt={note.author.name}
                style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#272729" }} />
            )}
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "-0.12px" }}>
              {note.author.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>❤ {note.liked_count}</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>💬 {note.comment_count}</span>
          </div>
        </div>

        {date && (
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "6px", letterSpacing: "-0.12px" }}>
            {date}
          </p>
        )}
      </div>
    </div>
  );
}
