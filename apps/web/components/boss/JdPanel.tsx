"use client";

import { useState } from "react";

interface Props {
  jd: string;
  onSave: (jd: string) => void;
  onClose: () => void;
}

export default function JdPanel({ jd, onSave, onClose }: Props) {
  const [value, setValue] = useState(jd);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "600px", overflow: "hidden", boxShadow: "rgba(0,0,0,0.3) 0px 20px 60px" }}>
        <div style={{ background: "#000", padding: "24px 28px" }}>
          <h2 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "21px", fontWeight: 600, color: "#fff", margin: 0 }}>
            岗位 JD
          </h2>
          <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
            粘贴岗位描述，AI 将据此分析候选人匹配度
          </p>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="粘贴岗位描述（JD）内容..."
            style={{
              width: "100%", height: "280px", border: "1.5px solid #e0e0e5", borderRadius: "10px",
              padding: "14px 16px", fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px",
              lineHeight: 1.6, color: "#1d1d1f", resize: "vertical", outline: "none",
              letterSpacing: "-0.224px",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#0071e3"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e0e0e5"; }}
          />
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "#f5f5f7", color: "#1d1d1f", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "14px", cursor: "pointer", fontFamily: "'SF Pro Text', sans-serif" }}>
              取消
            </button>
            <button onClick={() => onSave(value)} className="btn-primary" style={{ fontSize: "14px" }}>
              保存 JD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
