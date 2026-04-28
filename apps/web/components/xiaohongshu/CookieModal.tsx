"use client";

import { useState } from "react";

interface Props {
  onSave: (cookies: string) => void;
  onClose: () => void;
}

export default function CookieModal({ onSave, onClose }: Props) {
  const [value, setValue] = useState("");

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      padding: "24px",
    }}>
      <div style={{
        background: "#1c1c1e",
        borderRadius: "18px",
        width: "100%",
        maxWidth: "520px",
        padding: "32px",
        boxShadow: "rgba(0,0,0,0.6) 0 20px 60px",
      }}>
        <h2 style={{
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          color: "#fff",
          marginBottom: "8px",
        }}>
          配置小红书 Cookies
        </h2>
        <p style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.6,
          marginBottom: "20px",
        }}>
          请在浏览器中登录小红书，打开开发者工具 → Network → 任意请求 → 复制 Cookie 请求头的值，粘贴到下方。
          <br />
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>
            Cookies 仅存储在本地浏览器，不会上传到服务器。
          </span>
        </p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="a1=xxx; web_id=xxx; ..."
          style={{
            width: "100%",
            height: "120px",
            background: "#272729",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: "11px",
            padding: "12px 14px",
            color: "#fff",
            fontSize: "13px",
            fontFamily: "monospace",
            resize: "vertical",
            outline: "none",
            marginBottom: "20px",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0071e3")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: "980px",
              padding: "8px 18px",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "'SF Pro Text', sans-serif",
            }}
          >
            取消
          </button>
          <button
            onClick={() => value.trim() && onSave(value.trim())}
            disabled={!value.trim()}
            style={{
              background: value.trim() ? "#0071e3" : "#272729",
              border: "none",
              color: value.trim() ? "#fff" : "rgba(255,255,255,0.3)",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              cursor: value.trim() ? "pointer" : "default",
              fontFamily: "'SF Pro Text', sans-serif",
            }}
          >
            保存并继续
          </button>
        </div>
      </div>
    </div>
  );
}
