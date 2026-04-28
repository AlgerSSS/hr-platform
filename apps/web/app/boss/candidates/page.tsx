"use client";

import { useState, useCallback, useEffect } from "react";
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
  skills: string[];
  encryptJobId: string;
  friendId: string;
}

interface Job {
  encryptJobId: string;
  jobName: string;
  salaryDesc: string;
  address: string;
  jobOnlineStatus?: number;
}

const CITIES = ["上海", "北京", "深圳", "广州", "杭州", "成都", "武汉", "南京", "全国"];

export default function CandidatesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("上海");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [jd, setJd] = useState("");
  const [showJd, setShowJd] = useState(false);

  // Load jobs on mount
  useEffect(() => {
    fetch("/api/boss/jobs")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setJobs(data.data ?? []);
      })
      .finally(() => setJobsLoading(false));
  }, []);

  const doSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setSelected(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({ keyword, city });
      if (selectedJob) params.set("jobId", selectedJob.encryptJobId);
      const res = await fetch(`/api/boss/candidates?${params}`);
      const data = await res.json();
      if (data.ok) {
        setCandidates(data.data ?? []);
      } else {
        setError(data.error ?? "搜索失败");
        setCandidates([]);
      }
    } catch {
      setError("网络请求失败");
    } finally {
      setLoading(false);
    }
  }, [keyword, city, selectedJob]);

  return (
    <main style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 24px 40px" }}>

        {/* Header */}
        <div style={{ paddingTop: "16px", marginBottom: "24px" }}>
          <Link href="/boss" style={{ fontSize: "14px", color: "#0066cc", textDecoration: "none" }}>
            ← BOSS 直聘
          </Link>
          <h1 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "32px", fontWeight: 600, color: "#1d1d1f", marginTop: "8px", lineHeight: 1.1 }}>
            候选人搜索
          </h1>
        </div>

        {/* Search Panel */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "rgba(0,0,0,0.06) 0px 2px 12px" }}>

          {/* Job selector */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
              关联岗位（可选）
            </p>
            {jobsLoading ? (
              <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.3)", fontFamily: "'SF Pro Text', sans-serif" }}>加载岗位中...</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button
                  onClick={() => setSelectedJob(null)}
                  style={{
                    borderRadius: "980px", padding: "5px 14px", fontSize: "13px", cursor: "pointer",
                    fontFamily: "'SF Pro Text', sans-serif", border: "none", transition: "all 0.15s",
                    background: !selectedJob ? "#0071e3" : "#f5f5f7",
                    color: !selectedJob ? "#fff" : "rgba(0,0,0,0.6)",
                  }}
                >
                  不限
                </button>
                {jobs.filter(j => j.jobOnlineStatus !== 0).map((j) => (
                  <button
                    key={j.encryptJobId}
                    onClick={() => setSelectedJob(selectedJob?.encryptJobId === j.encryptJobId ? null : j)}
                    style={{
                      borderRadius: "980px", padding: "5px 14px", fontSize: "13px", cursor: "pointer",
                      fontFamily: "'SF Pro Text', sans-serif", border: "none", transition: "all 0.15s",
                      background: selectedJob?.encryptJobId === j.encryptJobId ? "#0071e3" : "#f5f5f7",
                      color: selectedJob?.encryptJobId === j.encryptJobId ? "#fff" : "rgba(0,0,0,0.6)",
                    }}
                  >
                    {j.jobName} · {j.salaryDesc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search input row */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="输入岗位关键词，如「产品经理」「运营」"
              style={{
                flex: 1, minWidth: "200px",
                background: "#f5f5f7", border: "2px solid transparent", borderRadius: "10px",
                padding: "10px 14px", fontSize: "15px", fontFamily: "'SF Pro Text', sans-serif",
                color: "#1d1d1f", outline: "none", transition: "all 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#0071e3"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "#f5f5f7"; }}
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                background: "#f5f5f7", border: "2px solid transparent", borderRadius: "10px",
                padding: "10px 14px", fontSize: "14px", fontFamily: "'SF Pro Text', sans-serif",
                color: "#1d1d1f", outline: "none", cursor: "pointer",
              }}
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={doSearch}
              disabled={loading || !keyword.trim()}
              className="btn-primary"
              style={{ opacity: loading || !keyword.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}
            >
              {loading ? "搜索中..." : "搜索候选人"}
            </button>
            <button
              onClick={() => setShowJd(true)}
              style={{
                background: jd ? "#f0f7ff" : "#f5f5f7",
                color: jd ? "#0071e3" : "rgba(0,0,0,0.5)",
                border: jd ? "1.5px solid #0071e3" : "1.5px solid transparent",
                borderRadius: "10px", padding: "10px 14px", fontSize: "14px",
                fontFamily: "'SF Pro Text', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {jd ? "✓ JD 已设置" : "设置 JD"}
            </button>
          </div>

          {jd && (
            <p style={{ marginTop: "10px", fontSize: "12px", color: "rgba(0,0,0,0.4)", fontFamily: "'SF Pro Text', sans-serif" }}>
              JD 已配置 · 点击候选人后可进行 AI 匹配分析
            </p>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "380px 1fr" : "1fr", gap: "20px", alignItems: "start" }}>

          {/* Left: list */}
          <div>
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.4)", fontFamily: "'SF Pro Text', sans-serif" }}>
                搜索中...
              </div>
            )}

            {error && (
              <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px" }}>
                <p style={{ color: "#ff3b30", fontSize: "14px", fontFamily: "'SF Pro Text', sans-serif", marginBottom: "12px" }}>{error}</p>
                <button onClick={doSearch} className="btn-primary" style={{ fontSize: "13px" }}>重试</button>
              </div>
            )}

            {!loading && !error && !searched && (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <p style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "21px", fontWeight: 400, color: "#1d1d1f", marginBottom: "8px" }}>
                  搜索候选人
                </p>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)" }}>
                  输入岗位关键词，从 BOSS 直聘搜索匹配候选人
                </p>
              </div>
            )}

            {!loading && !error && searched && candidates.length === 0 && (
              <div style={{ background: "#fff", borderRadius: "12px", padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.4)" }}>未找到候选人</p>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.3)", marginTop: "8px" }}>尝试换个关键词或城市</p>
              </div>
            )}

            {candidates.length > 0 && (
              <div>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", marginBottom: "12px" }}>
                  找到 {candidates.length} 位候选人 · 点击查看简历详情{jd ? "及 AI 匹配" : ""}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
            )}
          </div>

          {/* Right: resume + AI match */}
          {selected && <ResumePanel candidate={selected} jd={jd} />}
        </div>
      </div>

      {showJd && (
        <JdPanel jd={jd} onSave={(v) => { setJd(v); setShowJd(false); }} onClose={() => setShowJd(false)} />
      )}
    </main>
  );
}
