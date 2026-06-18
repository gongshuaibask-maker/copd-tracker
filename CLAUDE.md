# CLAUDE.md — 慢阻肺（COPD）患者自我管理 APP

> AI 辅助开发项目指引文件  
> 最后更新：2026-06-07

---

## 📂 项目路径

```
项目根目录：D:\copdAPP
工作区规则：D:\workspace\RULES.md
黑账本：D:\workspace\pitfall-log.md
对话纪要：D:\workspace\session-log.md
命名规范：D:\workspace\naming-standard.md
环境检查：D:\workspace\env-checklist.md
```

## 📋 标准文件路径

| 文档 | 路径 | 说明 |
|------|------|------|
| **开发需求文档** | `docs/需求文档/开发需求文档.md` | 9 大功能模块详细需求 |
| **技术选型规范** | `docs/技术规范/技术选型规范.md` | 技术栈、依赖、目录结构、OCR/图表方案 |
| **数据结构设计** | `docs/技术规范/数据结构与接口设计.md` | SQLite 10 张表结构、TS 类型、正常范围常量 |
| **设计规范** | `docs/设计规范/设计规范.md` | 色彩、字体、布局、交互规范、组件复用清单 |
| **开发执行步骤** | `docs/执行计划/开发执行步骤.md` | 分 10 个 Phase 的详细任务清单和验收标准 |
| **开发日志** | `开发日志/README.md` | 每日开发记录索引 |
| **当日日志** | `开发日志/YYYY-MM-DD.md` | 格式：`开发日志/2026-06-04.md` |

---

## 🎯 核心工作原则

### 1. 阶段性推进
- 严格按照 `开发执行步骤` 中定义的 Phase 0 → 10 顺序推进
- **每次只做一个 Phase**，完成并验证后再进入下一 Phase
- 每个 Phase 结束必须：
  1. 编译通过（无 TS 错误）
  2. iOS + Android 双端验证通过
  3. 更新当日开发日志

### 2. 开发日志 + 黑账本
- **每次对话开始前，必须先执行启动清单**：
  1. 确认项目放在 `D:\workspace\project-XXX` 这类规范目录，不乱放
  2. 如果是新项目，先读 `D:\workspace\naming-standard.md` 取名称
  3. 先读 `D:\workspace\pitfall-log.md` 和 `D:\workspace\session-log.md`，避免重复踩坑
  4. 扫一眼项目文件变更，发现其他 AI 改过代码时先检查是否有冲突
- **每天结束工作前**：更新当日的 `开发日志/YYYY-MM-DD.md`
  - ✅ 今日完成事项
  - 📝 新增待办
  - ⚠️ 遇到的风险/阻塞
- 新坑/新教训：立刻追加到 `D:\workspace\pitfall-log.md`
- 如果没有当天的日志文件，新建一个

### 3. 技术决策引用
- 任何技术选型的讨论都先查阅 `技术选型规范.md`
- 设计方案争议查阅 `设计规范.md`
- 数据结构变更查阅 `数据结构与接口设计.md`

### 4. 代码质量标准
- TypeScript strict mode
- 所有函数有类型标注
- 每轮改完先执行 `npx tsc --noEmit`，确保无类型错误
- npm 装包报错优先尝试 `--legacy-peer-deps`
- Node.js 优先使用 LTS 稳定版（不要用最新版 v24+）
- 组件使用函数式组件 + Hooks
- 命名规范：
  - 组件：PascalCase（`TrendChart.tsx`）
  - 工具/服务：camelCase（`ocrService.ts`）
  - 常量：UPPER_SNAKE_CASE（`NORMAL_RANGES`）
  - 数据库列：snake_case（`record_date`）

---

## 🛠️ 常用命令

```bash
# 开发
npx expo start                    # 启动 Expo 开发服务器
npx expo start --ios              # iOS 模拟器
npx expo start --android          # Android 模拟器

# 代码质量
npx eslint .                      # ESLint 检查
npx tsc --noEmit                  # TypeScript 类型检查
npx prettier --check .            # 格式检查

# 构建
eas build --platform ios          # iOS 构建
eas build --platform android      # Android 构建
```

---

## 🗂️ 项目代码目录结构（参考）

```
├── app/                          # Expo Router 页面
│   ├── (tabs)/                   # 底部 Tab
│   │   ├── index.tsx             # 首页仪表盘
│   │   ├── records.tsx           # 记录列表
│   │   ├── charts.tsx            # 趋势图表
│   │   └── profile.tsx           # 我的/档案
│   └── record/                   # 各模块记录页
│       ├── pulmonary.tsx
│       ├── inflammation.tsx
│       ├── symptom.tsx
│       ├── exercise.tsx
│       ├── vitals.tsx
│       ├── nutrition.tsx
│       ├── exacerbation.tsx
│       ├── medication.tsx
│       └── comorbidity.tsx
├── src/
│   ├── components/               # 通用组件
│   ├── database/
│   │   ├── index.ts              # 数据库初始化
│   │   ├── schema.ts             # 建表 SQL
│   │   └── repositories/         # 各模块数据操作
│   ├── services/                 # 业务逻辑服务
│   ├── hooks/                    # 自定义 Hooks
│   ├── types/                    # TypeScript 类型
│   ├── constants/                # 常量/配置
│   └── utils/                    # 工具函数
├── assets/                       # 静态资源
├── docs/                         # 项目文档
│   ├── 需求文档/
│   ├── 技术规范/
│   ├── 设计规范/
│   └── 执行计划/
├── 开发日志/                     # 每日日志
├── app.json                      # Expo 配置
└── tsconfig.json
```

---

## ⚡ AI 助手指令

当用户要求执行开发任务时，按以下流程操作：

1. **先读黑账本与纪要**：查 `D:\workspace\pitfall-log.md`、`D:\workspace\session-log.md`，避免重复踩坑
2. **确认当前阶段**：查阅 `开发执行步骤.md` 和最新开发日志，确定当前应做哪个 Phase
3. **检查环境**：先确认 Node.js 为 LTS、依赖安装是否可用；若 npm 报错先尝试 `--legacy-peer-deps`
4. **查阅规范**：根据任务类型，引用对应的规范文档
5. **逐步执行**：严格按照该 Phase 的 task list 逐项完成
6. **验证**：每轮修改后先执行 `npx tsc --noEmit`，再做运行验证
7. **记录**：更新开发日志并把新坑追加到 `D:\workspace\pitfall-log.md`

**不要跨越 Phase 工作** — 如果一个任务涉及多个 Phase，先做完当前 Phase，得到用户确认后再继续。
