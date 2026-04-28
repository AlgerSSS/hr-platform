import Nav from "@/components/shared/Nav";
import Link from "next/link";

export default function JdPage() {
  return (
    <main style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "80px 24px 24px" }}>
        <div style={{ paddingTop: "16px" }}>
          <Link href="/boss" style={{ fontSize: "14px", color: "#0066cc", textDecoration: "none" }}>← BOSS 直聘</Link>
        </div>
        <h1 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "32px", fontWeight: 600, color: "#1d1d1f", marginTop: "16px" }}>
          JD 管理
        </h1>
        <p style={{ fontFamily: "'SF Pro Text', sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.5)", marginTop: "8px" }}>
          在候选人列表页点击「设置 JD」即可配置岗位描述，AI 将据此进行匹配分析。
        </p>
        <div style={{ marginTop: "32px" }}>
          <Link href="/boss/candidates" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
            前往候选人列表
          </Link>
        </div>
      </div>
    </main>
  );
}
