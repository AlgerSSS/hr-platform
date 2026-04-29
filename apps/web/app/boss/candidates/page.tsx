"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  jobName: string;
  skills: string[];
  encryptJobId: string;
  friendId: string;
  securityId: string;
}

export interface MatchResult {
  score: number;
  summary: string;
  strengths: string[];
  risks: string[];
  greeting: string;
}

interface Job {
  encryptJobId: string;
  jobName: string;
  salaryDesc: string;
  address: string;
  jobOnlineStatus?: number;
}

export default function CandidatesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [jd, setJd] = useState("");
  const [showJd, setShowJd] = useState(false);

  // Per-candidate match results — persists across selections
  const [matchScores, setMatchScores] = useState<Record<string, MatchResult>>({});
  const [matchingAll, setMatchingAll] = useState(false);
  const [matchProgress, setMatchProgress] = useState({ done: 0, total: 0 });

  // Load jobs on mount
  useEffect(() => {
    fetch("/api/boss/jobs")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setJobs(data.data ?? []); })
      .finally(() => setJobsLoading(false));
  }, []);

  // Load candidates when job selection changes
  useEffect(() => {
    setLoading(true);
    setError("");
    setSelected(null);
    setMatchScores({});
    const params = new URLSearchParams();
    if (selectedJob) params.set("jobId", selectedJob.encryptJobId);
    fetch(`/api/boss/candidates?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setAllCandidates(data.data ?? []);
        else setError(data.error ?? "获取候选人失败");
      })
      .catch(() => setError("网络请求失败"))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  // Client-side keyword filter
  const filteredCandidates = useMemo(() => {
    if (!keyword.trim()) return allCandidates;
    const q = keyword.toLowerCase();
    return allCandidates.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.jobName?.toLowerCase().includes(q) ||
      c.expectPosition?.toLowerCase().includes(q) ||
      c.degree?.toLowerCase().includes(q)
    );
  }, [allCandidates, keyword]);

  // Sort by score descending when scores available
  const candidates = useMemo(() => {
    const hasScores = Object.keys(matchScores).length > 0;
    if (!hasScores) return filteredCandidates;
    return [...filteredCandidates].sort((a, b) => {
      const sa = matchScores[a.encryptGeekId]?.score ?? -1;
      const sb = matchScores[b.encryptGeekId]?.score ?? -1;
      return sb - sa;
    });
  }, [filteredCandidates, matchScores]);

  // Batch AI match all candidates sequentially
  const runBatchMatch = useCallback(async () => {
    if (!jd || filteredCandidates.length === 0 || matchingAll) return;
    setMatchingAll(true);
    setMatchProgress({ done: 0, total: filteredCandidates.length });

    for (const c of filteredCandidates) {
      if (matchScores[c.encryptGeekId]) {
        setMatchProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }
      try {
        const resumeRes = await fetch(
          `/api/boss/resume?geekId=${c.encryptGeekId}&jobId=${c.encryptJobId}&securityId=${encodeURIComponent(c.securityId ?? "")}`
        );
        const resumeData = await resumeRes.json();
        if (!resumeData.ok) { setMatchProgress((p) => ({ ...p, done: p.done + 1 })); continue; }

        const matchRes = await fetch("/api/boss/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd, resume: resumeData.data }),
        });
        const matchData = await matchRes.json();
        if (matchData.ok) {
          setMatchScores((prev) => ({ ...prev, [c.encryptGeekId]: matchData.data }));
        }
      } catch {
        // skip failed
      }
      setMatchProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setMatchingAll(false);
  }, [jd, filteredCandidates, matchingAll, matchScores]);

  const scoreColor = (s: number) => s >= 80 ? "#34c759" : s >= 60 ? "#ff9f0a" : "#ff3b30";

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
            候选人列表
          </h1>
        </div>

        {/* Filter Panel */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "rgba(0,0,0,0.06) 0px 2px 12px" }}>

          {/* Job selector */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
              按岗位筛选
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
                  全部
                </button>
                {jobs.map((j) => (
                  <button
                    key={j.encryptJobId}
                    onClick={() => setSelectedJob(selectedJob?.encryptJobId === j.encryptJobId ? null : j)}
                    style={{
                      borderRadius: "980px", padding: "5px 14px", fontSize: "13px", cursor: "pointer",
                      fontFamily: "'SF Pro Text', sans-serif", border: "none", transition: "all 0.15s",
                      background: selectedJob?.encryptJobId === j.encryptJobId ? "#0071e3" : "#f5f5f7",
                      color: selectedJob?.encryptJobId === j.encryptJobId ? "#fff" : "rgba(0,0,0,0.6)",
                      opacity: j.jobOnlineStatus === 0 ? 0.5 : 1,
                    }}
                  >
                    {j.jobName} · {j.salaryDesc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keyword filter + JD */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="关键词过滤，如「运营」「本科」"
              style={{
                flex: 1,
                background: "#f5f5f7", border: "2px solid transparent", borderRadius: "10px",
                padding: "10px 14px", fontSize: "14px", fontFamily: "'SF Pro Text', sans-serif",
                color: "#1d1d1f", outline: "none", transition: "all 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#0071e3"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "#f5f5f7"; }}
            />
            <button
              onClick={() => setShowJd(true)}
              style={{
                background: jd ? "#f0f7ff" : "#f5f5f7",
                color: jd ? "#0071e3" : "rgba(0,0,0,0.5)",
                border: jd ? "1.5px solid #0071e3" : "1.5px solid transparent",
                borderRadius: "10px", padding: "10px 16px", fontSize: "14px",
                fontFamily: "'SF Pro Text', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {jd ? "✓ JD 已设置" : "设置 JD"}
            </button>
          </div>

          {/* Batch match bar */}
          {jd && candidates.length > 0 && (
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={runBatchMatch}
                disabled={matchingAll}
                style={{
                  background: matchingAll ? "#f5f5f7" : "#000",
                  color: matchingAll ? "rgba(0,0,0,0.4)" : "#fff",
                  border: "none", borderRadius: "10px", padding: "9px 18px",
                  fontSize: "13px", fontFamily: "'SF Pro Text', sans-serif",
                  cursor: matchingAll ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                }}
              >
                {matchingAll
                  ? `AI 匹配中 ${matchProgress.done}/${matchProgress.total}...`
                  : Object.keys(matchScores).length > 0
                    ? `重新匹配全部 (${candidates.length}人)`
                    : `一键 AI 匹配全部 (${candidates.length}人)`}
              </button>
              {Object.keys(matchScores).length > 0 && !matchingAll && (
                <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)", fontFamily: "'SF Pro Text', sans-serif" }}>
                  已完成 {Object.keys(matchScores).length}/{allCandidates.length} · 按匹配度排序
                </span>
              )}
              {matchingAll && (
                <div style={{ flex: 1, maxWidth: "200px", height: "4px", background: "#e8e8ed", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${matchProgress.total > 0 ? (matchProgress.done / matchProgress.total) * 100 : 0}%`,
                    background: "#0071e3", borderRadius: "2px", transition: "width 0.3s ease",
                  }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "380px 1fr" : "1fr", gap: "20px", alignItems: "start" }}>

          <div>
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.4)", fontFamily: "'SF Pro Text', sans-serif" }}>
                加载中...
              </div>
            )}
            {error && (
              <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px" }}>
                <p style={{ color: "#ff3b30", fontSize: "14px", fontFamily: "'SF Pro Text', sans-serif" }}>{error}</p>
              </div>
            )}
            {!loading && !error && candidates.length === 0 && (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.4)" }}>
                  {allCandidates.length > 0 ? "没有匹配的候选人" : "暂无候选人数据"}
                </p>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.3)", marginTop: "6px" }}>
                  {allCandidates.length > 0 ? "尝试清空关键词" : "请先在 BOSS 直聘上与候选人沟通"}
                </p>
              </div>
            )}
            {candidates.length > 0 && (
              <div>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", marginBottom: "12px" }}>
                  {candidates.length} 位候选人
                  {Object.keys(matchScores).length > 0 ? " · 按 AI 匹配度排序" : jd ? " · 点击查看简历及 AI 匹配" : " · 点击查看简历详情"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {candidates.map((c) => (
                    <CandidateCard
                      key={c.encryptGeekId}
                      candidate={c}
                      selected={selected?.encryptGeekId === c.encryptGeekId}
                      jd={jd}
                      score={matchScores[c.encryptGeekId]?.score}
                      scoreSummary={matchScores[c.encryptGeekId]?.summary}
                      scoreColor={matchScores[c.encryptGeekId] ? scoreColor(matchScores[c.encryptGeekId].score) : undefined}
                      onClick={() => setSelected(selected?.encryptGeekId === c.encryptGeekId ? null : c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {selected && (
            <ResumePanel
              candidate={selected}
              jd={jd}
              initialMatch={matchScores[selected.encryptGeekId]}
              onMatchResult={(result) => setMatchScores((prev) => ({ ...prev, [selected.encryptGeekId]: result }))}
            />
          )}
        </div>
      </div>

      {showJd && (
        <JdPanel jd={jd} onSave={(v) => { setJd(v); setShowJd(false); }} onClose={() => setShowJd(false)} />
      )}
    </main>
  );
}
