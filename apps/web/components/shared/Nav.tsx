import Link from "next/link";

export default function Nav() {
  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-6">
      <div className="max-w-[980px] mx-auto w-full flex items-center justify-between">
        <span
          style={{
            fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.28px",
          }}
        >
          HR Platform
        </span>
        <div className="flex items-center gap-6">
          {[
            { href: "/boss", label: "BOSS 直聘" },
            { href: "/xiaohongshu", label: "小红书" },
            { href: "/tiktok", label: "TikTok" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "'SF Pro Text', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.8)",
                textDecoration: "none",
                letterSpacing: "0",
              }}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
