import Link from "next/link";
import Nav from "@/components/shared/Nav";

const platforms = [
  {
    href: "/boss",
    name: "BOSS 直聘",
    tagline: "智能候选人匹配",
    description: "搜索候选人、查看简历、AI 匹配度分析，一站式招聘管理。",
    accent: "#0071e3",
    icon: "💼",
  },
  {
    href: "/xiaohongshu",
    name: "小红书",
    tagline: "发现求职达人",
    description: "挖掘小红书求职帖，触达主动求职的优质候选人。",
    accent: "#ff2442",
    icon: "📕",
  },
  {
    href: "/tiktok",
    name: "TikTok",
    tagline: "视频简历新趋势",
    description: "浏览 TikTok 求职视频，发现有创意、有表达力的候选人。",
    accent: "#1d1d1f",
    icon: "🎵",
  },
];

export default function HomePage() {
  return (
    <main style={{ background: "#000000", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section
        style={{
          background: "#000000",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h1
          style={{
            fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
            fontSize: "clamp(40px, 6vw, 56px)",
            fontWeight: 600,
            lineHeight: 1.07,
            letterSpacing: "-0.28px",
            color: "#ffffff",
            marginBottom: "16px",
            maxWidth: "700px",
          }}
        >
          招聘，重新定义。
        </h1>
        <p
          style={{
            fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
            fontSize: "clamp(19px, 2.5vw, 21px)",
            fontWeight: 400,
            lineHeight: 1.19,
            letterSpacing: "0.231px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "40px",
            maxWidth: "500px",
          }}
        >
          三大平台，一个界面。AI 驱动的候选人匹配系统。
        </p>
        <a href="#platforms" className="btn-pill btn-pill-outline-white">
          开始使用 ›
        </a>
      </section>

      {/* Platform Cards */}
      <section
        id="platforms"
        style={{ background: "#f5f5f7", padding: "80px 24px" }}
      >
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
              fontSize: "40px",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "#1d1d1f",
              textAlign: "center",
              marginBottom: "56px",
            }}
          >
            选择平台
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {platforms.map((p) => (
              <Link key={p.href} href={p.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "40px 32px",
                    boxShadow: "rgba(0,0,0,0.08) 0px 4px 24px",
                    cursor: "pointer",
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="platform-card"
                >
                  <div style={{ fontSize: "40px", marginBottom: "20px" }}>{p.icon}</div>
                  <div
                    style={{
                      fontFamily: "'SF Pro Text', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: p.accent,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    {p.tagline}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
                      fontSize: "28px",
                      fontWeight: 400,
                      lineHeight: 1.14,
                      letterSpacing: "0.196px",
                      color: "#1d1d1f",
                      marginBottom: "12px",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'SF Pro Text', sans-serif",
                      fontSize: "14px",
                      lineHeight: 1.43,
                      letterSpacing: "-0.224px",
                      color: "rgba(0,0,0,0.6)",
                      marginBottom: "24px",
                    }}
                  >
                    {p.description}
                  </p>
                  <span style={{ fontSize: "14px", color: "#0066cc", letterSpacing: "-0.224px" }}>
                    进入 ›
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#f5f5f7",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.48)" }}>
          HR Platform · 内部招聘系统
        </p>
      </footer>
    </main>
  );
}
