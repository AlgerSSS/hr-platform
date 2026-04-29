"use client";

import { Candidate } from "@/app/boss/candidates/page";

interface Props {
  candidate: Candidate;
  selected: boolean;
  jd: string;
  onClick: () => void;
}

export default function CandidateCard({ candidate: c, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "#fff" : "#fff",
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        border: selected ? "2px solid #0071e3" : "2px solid transparent",
        boxShadow: selected ? "rgba(0,113,227,0.15) 0px 4px 20px" : "rgba(0,0,0,0.06) 0px 2px 12px",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Avatar */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          background: "#e8e8ed", flexShrink: 0, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px",
        }}>
          {c.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.avatar} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : "👤"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "17px", fontWeight: 600, color: "#1d1d1f" }}>
              {c.name || "未知"}
            </span>
            {c.activeTime && (
              <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.35)", letterSpacing: "-0.12px" }}>
                {c.activeTime}
              </span>
            )}
          </div>

          <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.55)", marginBottom: "8px", letterSpacing: "-0.224px" }}>
            {[c.expectPosition, c.experience, c.degree].filter(Boolean).join(" · ")}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {c.expectSalary && (
              <span style={{ background: "#f0f7ff", color: "#0071e3", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontFamily: "'SF Pro Text', sans-serif" }}>
                {c.expectSalary}
              </span>
            )}
            {c.city && (
              <span style={{ background: "#f5f5f7", color: "rgba(0,0,0,0.5)", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontFamily: "'SF Pro Text', sans-serif" }}>
                {c.city}
              </span>
            )}
            {c.jobStatus && (
              <span style={{ background: "#f0fff4", color: "#34c759", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontFamily: "'SF Pro Text', sans-serif" }}>
                {c.jobStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
