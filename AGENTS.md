# HR Platform — Agent 协作说明

## 仓库结构

```
hr-platform/
├── apps/web/                  # Next.js 15 前端（三模块共享）
│   ├── app/
│   │   ├── page.tsx           # 首页三平台入口（已完成，勿修改）
│   │   ├── boss/              # BOSS 模块 — Agent A 负责
│   │   ├── xiaohongshu/       # 小红书模块 — Agent B 负责
│   │   ├── tiktok/            # TikTok 模块 — Agent C 负责
│   │   └── api/
│   │       ├── boss/          # BOSS API 路由 — Agent A
│   │       ├── xiaohongshu/   # 小红书 API 路由 — Agent B
│   │       └── tiktok/        # TikTok API 路由 — Agent C
│   └── components/
│       ├── shared/            # 共用组件（Nav 等）— 修改需在 develop 讨论
│       ├── boss/              # Agent A
│       ├── xiaohongshu/       # Agent B
│       └── tiktok/            # Agent C
├── packages/boss-bridge/      # Python 桥接层 — Agent A
├── DESIGN.md                  # 设计规范（必读）
└── AGENTS.md                  # 本文件
```

## 分支规则

| 分支 | 用途 |
|------|------|
| `main` | 生产分支，只接受来自 develop 的 PR |
| `develop` | 集成分支，三模块 PR 目标 |
| `feature/boss-module` | Agent A — BOSS 模块 |
| `feature/xiaohongshu-module` | Agent B — 小红书模块 |
| `feature/tiktok-module` | Agent C — TikTok 模块 |

## 技术栈

- Next.js 15 App Router + TypeScript
- Tailwind CSS（严格遵循 DESIGN.md Apple 设计系统）
- API 路由在 `app/api/` 下

## 设计规范（必须遵守）

详见根目录 `DESIGN.md`，核心要点：

- 背景色：黑 `#000000` 与浅灰 `#f5f5f7` 交替
- 主色：Apple Blue `#0071e3`（仅用于交互元素）
- 字体：SF Pro Display（20px+）/ SF Pro Text（<20px）
- 导航：毛玻璃 `rgba(0,0,0,0.8)` + `backdrop-filter: blur(20px)`
- 按钮：pill 形 CTA（980px radius）

## Agent B — 小红书模块说明

**分支：** `feature/xiaohongshu-module`

**职责范围：**
- `apps/web/app/xiaohongshu/` 页面
- `apps/web/app/api/xiaohongshu/` API 路由
- `apps/web/components/xiaohongshu/` 组件

**功能需求：**
- 搜索小红书求职帖子（关键词 + 岗位筛选）
- 展示帖子基本信息（用户名、内容摘要、标签、发布时间）
- 候选人详情页（完整帖子内容）
- 支持导出候选人信息为 JSON

**注意：**
- 不要修改 `shared/`、`boss/`、`tiktok/` 目录
- 完成后 PR → `develop` 分支

## Agent C — TikTok 模块说明

**分支：** `feature/tiktok-module`

**职责范围：**
- `apps/web/app/tiktok/` 页面
- `apps/web/app/api/tiktok/` API 路由
- `apps/web/components/tiktok/` 组件

**功能需求：**
- 搜索 TikTok 求职相关用户 / 视频
- 展示用户基本信息（头像、简介、粉丝数、标签）
- 候选人详情页（视频列表）
- 支持导出候选人信息为 JSON

**注意：**
- 不要修改 `shared/`、`boss/`、`xiaohongshu/` 目录
- 完成后 PR → `develop` 分支
