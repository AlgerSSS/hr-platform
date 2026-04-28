import Nav from "@/components/shared/Nav";
import Link from "next/link";

export default function TikTokPage() {
  return (
    <main style={{ background: "#000", minHeight: "100vh" }}>
      <Nav />
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <h1 style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "56px", fontWeight: 600, lineHeight: 1.07, letterSpacing: "-0.28px", color: "#fff", marginBottom: "16px" }}>
          TikTok
        </h1>
        <p style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: "21px", fontWeight: 400, color: "rgba(255,255,255,0.6)", marginBottom: "40px" }}>
          模块开发中...
        </p>
        <Link href="/" className="btn-pill btn-pill-outline-white">← 返回首页</Link>
      </section>
    </main>
  );
}
