"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/shared/Nav";
import CandidateCard from "@/components/boss/CandidateCard";
import ResumePanel from "@/components/boss/ResumePanel";
import JdPanel from "@/components/boss/JdPanel";
import Link from "next/link";

export interface Candidate {
  encryptGeekId: string;
  name: string;
  age: string;
  gender: string;
  degree: string;
  experience: string;
  expectPosition: string;
  expectSalary: string;
  city: string;
  activeTime: string;
  avatar: string;
  jobStatus: string;
  friendId: string;
  encryptJobId: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jd, setJd] = useState("");
  const [showJd, setShowJd] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/boss/candidates");
      const data = await res.json();
      if (data.ok) {
        setCandidates(data.data ?? []);
      } else {
        setError(data.error ?? "获取候选人失败");
      }
    } catch {
      setError("网络请求失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  return (
    <main style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 24px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", paddingTop: "16px" }}>
          <div>
            <Link href="/boss" style={{ fontSize: "14px", color: "#0066cc", textDecoration: "none", letterSpacing: "-0.224px" }}>
              ← BOSS 直聘
            </Link>
            <h1 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "32px", fontWeight: 600, color: "#1d1d1f", marginTop: "8px", lineHeight: 1.1 }}>
              候选人列表
            </h1>
          </div>
          <button
            onClick={() => setShowJd(true)}
            className="btn-primary"
            style={{ fontSize: "14px", padding: "8px 16px" }}
          >
            设置 JD
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "360px 1fr" : "1fr", gap: "20px", alignItems: "start" }}>

          {/* Left: Candidate List */}
          <div>
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.4)", fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px" }}>
                加载中...
              </div>
            )}
            {error && (
              <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
                <p style={{ color: "#ff3b30", fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", marginBottom: "12px" }}>{error}</p>
                <button onClick={fetchCandidates} className="btn-primary" style={{ fontSize: "14px" }}>重试</button>
              </div>
            )}
            {!loading && !error && candidates.length === 0 && (
              <div style={{ background: "#fff", borderRadius: "12px", padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.4)" }}>暂无候选人数据</p>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.3)", marginTop: "8px" }}>请确认已登录 BOSS 直聘并有沟通记录</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {candidates.map((c) => (
                <CandidateCard
                  key={c.encryptGeekId}
                  candidate={c}
                  selected={selected?.encryptGeekId === c.encryptGeekId}
                  jd={jd}
                  onClick={() => setSelected(selected?.encryptGeekId === c.encryptGeekId ? null : c)}
                />
              ))}
            </div>
          </div>

          {/* Right: Resume + AI Match */}
          {selected && (
            <ResumePanel candidate={selected} jd={jd} />
          )}
        </div>
      </div>

      {/* JD Modal */}
      {showJd && (
        <JdPanel jd={jd} onSave={(v) => { setJd(v); setShowJd(false); }} onClose={() => setShowJd(false)} />
      )}
    </main>
  );
}
