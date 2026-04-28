"use client";

import { useState, useEffect } from "react";
import { Candidate, MatchResult } from "@/app/boss/candidates/page";

interface Resume {
  encryptGeekId: string;
  name: string;
  age: string;
  gender: string;
  degree: string;
  experience: string;
  city: string;
  avatar: string;
  activeTime: string;
  jobStatus: string;
  expectPosition: string;
  expectSalary: string;
  expectCity: string;
  selfEvaluation: string;
  skills: string[];
  workExperiences: { company: string; position: string; startDate: string; endDate: string; description: string }[];
  educationExperiences: { school: string; major: string; degree: string; startDate: string; endDate: string }[];
  projectExperiences: { name: string; role: string; startDate: string; endDate: string; description: string }[];
}

interface Props {
  candidate: Candidate;
  jd: string;
  initialMatch?: MatchResult;
  onMatchResult?: (result: MatchResult) => void;
}

export default function ResumePanel({ candidate, jd, initialMatch, onMatchResult }: Props) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(initialMatch ?? null);
  const [matching, setMatching] = useState(false);
  const [tab, setTab] = useState<"resume" | "match">(initialMatch ? "match" : "resume");

  // When switching to a different candidate, reset resume but keep match if initialMatch provided
  useEffect(() => {
    setResume(null);
    setLoading(true);
    setError("");
    const newMatch = initialMatch ?? null;
    setMatch(newMatch);
    setTab(newMatch ? "match" : "resume");

    fetch(`/api/boss/resume?geekId=${candidate.encryptGeekId}&jobId=${candidate.encryptJobId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setResume(data.data);
        else setError(data.error ?? "获取简历失败");
      })
      .catch(() => setError("网络请求失败"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.encryptGeekId, candidate.encryptJobId]);

  // Sync if parent updates initialMatch (e.g. batch match completes while panel is open)
  useEffect(() => {
    if (initialMatch && !match) {
      setMatch(initialMatch);
    }
  }, [initialMatch, match]);

  const runMatch = async () => {
    if (!resume || !jd) return;
    setMatching(true);
    setTab("match");
    try {
      const res = await fetch("/api/boss/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, resume }),
      });
      const data = await res.json();
      if (data.ok) {
        setMatch(data.data);
        onMatchResult?.(data.data);
      }
    } finally {
      setMatching(false);
    }
  };

  const scoreColor = (s: number) => s >= 80 ? "#34c759" : s >= 60 ? "#ff9f0a" : "#ff3b30";

  return (
    <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "rgba(0,0,0,0.08) 0px 4px 24px", position: "sticky", top: "72px" }}>

      {/* Panel Header */}
      <div style={{ background: "#000", padding: "24px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#272729", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
            {candidate.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={candidate.avatar} alt={candidate.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : "👤"}
          </div>
          <div>
            <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "21px", fontWeight: 600, color: "#fff", lineHeight: 1.19 }}>
              {candidate.name}
            </div>
            <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "2px" }}>
              {[candidate.expectPosition, candidate.experience, candidate.degree].filter(Boolean).join(" · ")}
            </div>
          </div>
          {jd && (
            <button
              onClick={runMatch}
              disabled={matching || loading}
              style={{
                marginLeft: "auto", background: "#0071e3", color: "#fff", border: "none",
                borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer",
                fontFamily: "'SF Pro Text', sans-serif", opacity: (matching || loading) ? 0.6 : 1,
              }}
            >
              {matching ? "分析中..." : "AI 匹配"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0" }}>
          {(["resume", "match"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 20px", fontSize: "14px",
                fontFamily: "'SF Pro Text', sans-serif",
                color: tab === t ? "#fff" : "rgba(255,255,255,0.45)",
                borderBottom: tab === t ? "2px solid #0071e3" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {t === "resume" ? "简历" : "AI 匹配"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
        {loading && <p style={{ textAlign: "center", color: "rgba(0,0,0,0.4)", fontFamily: "'SF Pro Text', sans-serif", padding: "40px 0" }}>加载简历中...</p>}
        {error && <p style={{ color: "#ff3b30", fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px" }}>{error}</p>}

        {/* Resume Tab */}
        {!loading && !error && resume && tab === "resume" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Basic Info */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[resume.expectSalary, resume.expectCity, resume.jobStatus].filter(Boolean).map((tag, i) => (
                <span key={i} style={{ background: "#f5f5f7", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontFamily: "'SF Pro Text', sans-serif", color: "rgba(0,0,0,0.6)" }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Skills */}
            {resume.skills?.length > 0 && (
              <Section title="技能">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {resume.skills.map((s, i) => (
                    <span key={i} style={{ background: "#f0f7ff", color: "#0071e3", borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontFamily: "'SF Pro Text', sans-serif" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Self Evaluation */}
            {resume.selfEvaluation && (
              <Section title="自我评价">
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", lineHeight: 1.6, color: "rgba(0,0,0,0.7)", letterSpacing: "-0.224px" }}>
                  {resume.selfEvaluation}
                </p>
              </Section>
            )}

            {/* Work Experience */}
            {resume.workExperiences?.length > 0 && (
              <Section title="工作经历">
                {resume.workExperiences.map((w, i) => (
                  <div key={i} style={{ marginBottom: i < resume.workExperiences.length - 1 ? "16px" : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1d1d1f" }}>{w.company}</span>
                      <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>{w.startDate} ~ {w.endDate}</span>
                    </div>
                    <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "#0071e3", marginTop: "2px" }}>{w.position}</div>
                    {w.description && (
                      <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)", lineHeight: 1.6, marginTop: "6px", letterSpacing: "-0.224px" }}>
                        {w.description}
                      </p>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* Education */}
            {resume.educationExperiences?.length > 0 && (
              <Section title="教育经历">
                {resume.educationExperiences.map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1d1d1f" }}>{e.school}</span>
                      <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.55)", marginLeft: "8px" }}>{e.major} · {e.degree}</span>
                    </div>
                    <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>{e.startDate} ~ {e.endDate}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Projects */}
            {resume.projectExperiences?.length > 0 && (
              <Section title="项目经历">
                {resume.projectExperiences.map((p, i) => (
                  <div key={i} style={{ marginBottom: i < resume.projectExperiences.length - 1 ? "16px" : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1d1d1f" }}>{p.name}</span>
                      <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)" }}>{p.startDate} ~ {p.endDate}</span>
                    </div>
                    {p.role && <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "#0071e3", marginTop: "2px" }}>{p.role}</div>}
                    {p.description && (
                      <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)", lineHeight: 1.6, marginTop: "6px" }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}

        {/* Match Tab */}
        {tab === "match" && (
          <div>
            {!jd && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.4)" }}>请先设置 JD 再进行匹配分析</p>
              </div>
            )}
            {jd && matching && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.4)" }}>AI 分析中，请稍候...</p>
              </div>
            )}
            {jd && !matching && match && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Score */}
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "64px", fontWeight: 700, color: scoreColor(match.score), lineHeight: 1 }}>
                    {match.score}
                  </div>
                  <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", marginTop: "4px" }}>匹配分数 / 100</div>
                  <div style={{ margin: "16px auto", maxWidth: "240px", height: "6px", background: "#e8e8ed", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${match.score}%`, background: scoreColor(match.score), borderRadius: "3px", transition: "width 0.6s ease" }} />
                  </div>
                  <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "#1d1d1f", fontWeight: 500 }}>{match.summary}</p>
                </div>

                {/* Strengths */}
                <Section title="优势亮点">
                  {match.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                      <span style={{ color: "#34c759", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </Section>

                {/* Risks */}
                <Section title="风险点">
                  {match.risks.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                      <span style={{ color: "#ff9f0a", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>⚠</span>
                      <span style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </Section>

                {/* Greeting */}
                <Section title="推荐招呼话术">
                  <div style={{ background: "#f5f5f7", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", color: "#1d1d1f", lineHeight: 1.6, margin: 0 }}>
                      {match.greeting}
                    </p>
                  </div>
                </Section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
