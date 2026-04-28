"use client";

import { useState } from "react";

interface Props {
  defaultText: string;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export default function CommentTemplateModal({ defaultText, onConfirm, onCancel }: Props) {
  const [text, setText] = useState(defaultText);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", padding: "24px",
    }}>
      <div style={{
        background: "#1c1c1e", borderRadius: "18px", width: "100%", maxWidth: "480px",
        padding: "28px", boxShadow: "rgba(0,0,0,0.6) 0 20px 60px",
      }}>
        <h2 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
          自动评论内容
        </h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "16px" }}>
          加入候选人时将自动收藏该帖子并发送以下评论。
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            width: "100%", background: "#272729", border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: "11px", padding: "12px 14px", color: "#fff", fontSize: "14px",
            fontFamily: "'SF Pro Text', sans-serif", resize: "vertical", outline: "none", marginBottom: "20px",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0071e3")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.7)", borderRadius: "980px", padding: "8px 18px",
            fontSize: "14px", cursor: "pointer", fontFamily: "'SF Pro Text', sans-serif",
          }}>
            取消
          </button>
          <button onClick={() => onConfirm(text.trim())} style={{
            background: "#0071e3", border: "none", color: "#fff", borderRadius: "8px",
            padding: "8px 20px", fontSize: "14px", cursor: "pointer", fontFamily: "'SF Pro Text', sans-serif",
          }}>
            确认加入
          </button>
        </div>
      </div>
    </div>
  );
}
