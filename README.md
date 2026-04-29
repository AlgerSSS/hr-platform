# HR Platform

一个面向招聘场景的 AI 辅助平台，整合 BOSS 直聘候选人管理与 AI 匹配分析，以及小红书招聘内容运营两大模块。

## 功能概览

| 模块 | 功能 |
|------|------|
| **BOSS 直聘** | 候选人列表、简历查看、AI 匹配评分、批量匹配排序 |
| **小红书** | 笔记搜索、用户主页、候选人管理、自动收藏+评论 |
| **TikTok** | 开发中 |

---

## 系统架构

```
hr-platform/
├── apps/
│   └── web/                    # Next.js 15 前端 + API Routes
│       ├── app/
│       │   ├── page.tsx         # 首页（平台入口）
│       │   ├── boss/            # BOSS 直聘模块
│       │   │   └── candidates/  # 候选人列表页
│       │   ├── xiaohongshu/     # 小红书模块
│       │   ├── tiktok/          # TikTok 模块（开发中）
│       │   └── api/
│       │       ├── boss/        # BOSS API Routes（调用 Python bridge）
│       │       └── xiaohongshu/ # 小红书 API Routes（代理 xhs-bridge）
│       ├── components/
│       │   ├── boss/            # CandidateCard, ResumePanel, JdPanel
│       │   └── shared/          # Nav
│       └── lib/
│           └── boss-bridge.ts   # Node.js → Python 子进程调用封装
├── packages/
│   ├── boss-bridge/
│   │   └── boss_bridge.py       # Python bridge：调用 boss-cli 库
│   └── xhs-bridge/
│       ├── main.py              # FastAPI 微服务（端口 8001）
│       └── spider_xhs/          # 小红书逆向 API 库
└── boss-cli/                    # BOSS 直聘 Python 客户端库（独立仓库）
    └── .venv/                   # Python 虚拟环境
```

### 数据流

**BOSS 直聘模块**

```
浏览器 → Next.js API Route → boss-bridge.ts (spawn) → boss_bridge.py → boss-cli → BOSS 直聘 API
                                                                                        ↓
浏览器 ← Next.js API Route ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←← JSON
```

**小红书模块**

```
浏览器 → Next.js API Route → HTTP → xhs-bridge (FastAPI :8001) → spider_xhs → 小红书 API
```

**AI 匹配**

```
浏览器 → /api/boss/match → OpenRouter API (openai/gpt-5.5) → 结构化 JSON 评分
```

---

## 技术栈

### 前端
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- 纯内联样式，Apple Design System（SF Pro 字体，#0071e3 蓝色，#f5f5f7 背景）
- 无 UI 组件库依赖

### 后端
- **Next.js API Routes**（Edge-compatible，Node.js runtime）
- **Python 3.10+** 子进程桥接（boss-bridge）
- **FastAPI + uvicorn**（xhs-bridge 微服务）

### AI
- **OpenRouter API**，模型 `openai/gpt-5.5`
- 结构化 JSON 输出（score / summary / strengths / risks / greeting）

### 依赖管理
- **pnpm** workspaces（前端 monorepo）
- **uv** / pip（Python 虚拟环境）

---

## 模块详解

### BOSS 直聘模块

**页面：** `/boss/candidates`

**功能：**
- 按岗位筛选候选人（从 BOSS 直聘推荐列表拉取，最多 300 人）
- 客户端关键词过滤（姓名、期望职位、学历等）
- 点击候选人卡片，右侧展开完整简历面板
- 设置 JD（岗位描述），对单个或全部候选人执行 AI 匹配
- 批量 AI 匹配：顺序处理，实时进度条，匹配结果持久化（切换候选人不丢失）
- 匹配完成后按评分降序排列候选人列表

**AI 匹配输出：**
- `score`：0-100 匹配分数
- `summary`：一句话总结
- `strengths`：优势亮点列表
- `risks`：风险点列表
- `greeting`：推荐招呼话术

**API Routes：**

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/boss/jobs` | GET | 获取已沟通岗位列表 |
| `/api/boss/candidates` | GET | 获取候选人列表（`?jobId=`） |
| `/api/boss/resume` | GET | 获取候选人完整简历（`?geekId=&jobId=&securityId=`） |
| `/api/boss/match` | POST | AI 匹配分析（body: `{jd, resume}`） |

**Python Bridge（boss_bridge.py）：**

```bash
python boss_bridge.py jobs
python boss_bridge.py candidates [--job <encJobId>] [--page <n>]
python boss_bridge.py resume <encryptGeekId> --job <encryptJobId> [--security-id <id>]
```

- 候选人列表优先使用 `get_boss_recommend_geeks`（推荐列表，返回活跃候选人）
- 简历数据从 `geekDetailInfo` 结构中提取，包含工作/教育/项目经历
- 所有输出为 JSON，通过 stdout 返回给 Node.js

### 小红书模块

**页面：** `/xiaohongshu`

**功能：**
- Cookie 认证（粘贴浏览器 Cookie 字符串，存储于 localStorage）
- 关键词搜索笔记（支持排序：综合/最新/最多点赞/最多评论/最多收藏）
- 查看笔记详情（标题、正文、图片、标签、互动数据）
- 查看作者主页（粉丝数、关注数、互动量、标签）
- 候选人管理：添加到候选人列表，支持自定义评论模板
- 自动互动：添加候选人时自动收藏笔记 + 发送评论
- 导出候选人列表（CSV）

**API Routes：**

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/xiaohongshu/search` | POST | 搜索笔记 |
| `/api/xiaohongshu/note` | POST | 获取笔记详情 |
| `/api/xiaohongshu/user` | POST | 获取用户信息 |
| `/api/xiaohongshu/engage` | POST | 收藏 + 评论笔记 |
| `/api/xiaohongshu/export` | POST | 导出候选人 CSV |

**XHS Bridge（FastAPI 微服务）：**

```bash
cd packages/xhs-bridge
uvicorn main:app --port 8001 --reload
```

- 封装 `spider_xhs` 逆向 API 库
- 请求签名通过 `generate_request_params` 生成（X-S / X-T 等 Header）
- 支持搜索、笔记详情、用户信息、评论、收藏等操作

---

## 快速开始

### 前置条件

- Node.js 18+ 和 pnpm
- Python 3.10+ 和 uv（或 pip）
- BOSS 直聘账号（已通过 `boss login` 登录）
- OpenRouter API Key
- 小红书账号 Cookie（可选）

### 安装

```bash
# 克隆仓库
git clone https://github.com/AlgerSSS/hr-platform.git
cd hr-platform

# 安装前端依赖
pnpm install

# 安装 Python 依赖（boss-bridge 使用 boss-cli 的虚拟环境）
cd ../boss-cli
uv sync   # 或 pip install -r requirements.txt

# 安装 xhs-bridge 依赖
cd ../hr-platform/packages/xhs-bridge
pip install -r requirements.txt
```

### 配置环境变量

在 `apps/web/` 目录创建 `.env.local`：

```env
OPENROUTER_API_KEY=sk-or-...
XHS_BRIDGE_URL=http://localhost:8001   # 可选，默认值
```

### 启动服务

```bash
# 1. 启动 xhs-bridge（小红书模块需要）
cd packages/xhs-bridge
uvicorn main:app --port 8001 --reload

# 2. 启动 Next.js 开发服务器
cd apps/web
pnpm dev
```

访问 `http://localhost:3000`

### BOSS 直聘登录

```bash
cd boss-cli
python -m boss_cli login
```

按提示完成登录后，凭证会保存到本地，boss_bridge.py 自动读取。

---

## 设计规范

遵循 Apple Design System：

- **字体：** SF Pro Display（标题）/ SF Pro Text（正文）
- **主色：** `#0071e3`（蓝色，仅用于强调）
- **背景：** `#f5f5f7`（页面）/ `#ffffff`（卡片）
- **文字：** `#1d1d1f`（主）/ `rgba(0,0,0,0.55)`（次）
- **圆角：** 12-16px（卡片）/ 980px（胶囊按钮）
- **阴影：** `rgba(0,0,0,0.06) 0px 2px 12px`

---

## 项目结构（详细）

```
apps/web/
├── app/
│   ├── page.tsx                    # 首页
│   ├── boss/
│   │   ├── page.tsx                # BOSS 直聘入口
│   │   └── candidates/
│   │       └── page.tsx            # 候选人列表 + AI 匹配
│   ├── xiaohongshu/
│   │   └── page.tsx                # 小红书运营工作台
│   ├── tiktok/
│   │   └── page.tsx                # TikTok（开发中）
│   └── api/
│       ├── boss/
│       │   ├── jobs/route.ts
│       │   ├── candidates/route.ts
│       │   ├── resume/route.ts
│       │   └── match/route.ts
│       └── xiaohongshu/
│           ├── search/route.ts
│           ├── note/route.ts
│           ├── user/route.ts
│           ├── engage/route.ts
│           └── export/route.ts
├── components/
│   ├── boss/
│   │   ├── CandidateCard.tsx       # 候选人卡片（含 AI 评分徽章）
│   │   ├── ResumePanel.tsx         # 简历详情面板 + AI 匹配标签页
│   │   └── JdPanel.tsx             # JD 输入弹窗
│   └── shared/
│       └── Nav.tsx                 # 顶部导航
└── lib/
    └── boss-bridge.ts              # spawn Python 子进程工具函数

packages/
├── boss-bridge/
│   └── boss_bridge.py              # BOSS 直聘 Python 桥接脚本
└── xhs-bridge/
    ├── main.py                     # FastAPI 应用入口
    └── spider_xhs/                 # 小红书逆向 API 实现
        ├── apis/                   # 各类 API 封装
        └── xhs_utils/              # 签名、Cookie、HTTP 工具
```

---

## License

MIT
