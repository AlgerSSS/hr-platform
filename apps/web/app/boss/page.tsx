import Nav from "@/components/shared/Nav";
import Link from "next/link";

export default function BossPage() {
  return (
    <main style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "80px 24px 24px" }}>
        <div style={{ paddingTop: "32px" }}>
          <Link href="/" style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", color: "#0066cc", textDecoration: "none", letterSpacing: "-0.224px" }}>
            ← 返回首页
          </Link>
        </div>

        <div style={{ marginTop: "40px", marginBottom: "48px" }}>
          <h1 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "40px", fontWeight: 600, lineHeight: 1.1, color: "#1d1d1f", marginBottom: "12px" }}>
            BOSS 直聘
          </h1>
          <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "17px", color: "rgba(0,0,0,0.6)", lineHeight: 1.47, letterSpacing: "-0.374px" }}>
            搜索候选人，查看简历，AI 智能匹配分析。
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {[
            { href: "/boss/candidates", label: "候选人列表", desc: "浏览推荐候选人", icon: "👥" },
            { href: "/boss/jd", label: "JD 管理", desc: "管理岗位描述", icon: "📋" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: "12px", padding: "28px 24px", boxShadow: "rgba(0,0,0,0.06) 0px 2px 16px", cursor: "pointer" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "21px", fontWeight: 600, color: "#1d1d1f", marginBottom: "6px" }}>{item.label}</div>
                <div style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.5)", letterSpacing: "-0.224px" }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
