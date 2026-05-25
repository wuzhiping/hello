# AGENTS.md

## 项目目标

本项目使用 `vite + vue3` 作为前端 UI 开发基础模板。
所有 Agent 在进行前端页面、组件、交互、样式开发时，必须基于统一模板结构与规范进行实现。

---

## 初始化项目

使用以下命令创建项目：

```bash
npx degit github:wuzhiping/hello/Clear ./
```

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

---

## 技术栈要求

默认技术栈：

* Vue 3
* Vite
* Composition API
* `<script setup>` 语法
* Vue Router（如模板已包含）
* Pinia（如模板已包含）
* SCSS / CSS Modules（按模板现有结构）

Agent 不应主动引入：

* Nuxt
* React
* Next.js
* jQuery
* 大型 UI 框架（除非用户明确要求）

---

## 开发规范

### Vue 组件规范

统一使用：

```vue
<script setup>
</script>
```

禁止使用：

```js
export default {}
```

组件文件命名：

* 使用 PascalCase
* 示例：

  * `UserCard.vue`
  * `LoginPanel.vue`

页面文件放置：

```text
src/views
```

通用组件放置：

```text
src/components
```

---

## UI 开发要求

### 默认目标

Agent 生成 UI 时，应优先满足：

* 简洁
* 可维护
* 响应式
* 移动端兼容
* 现代化视觉

### 推荐布局

优先使用：

* Flex
* Grid

避免：

* 绝对定位堆叠布局
* 内联样式泛滥

### 样式要求

推荐：

* scoped style
* CSS Variables
* 统一间距
* 统一字体层级

示例：

```vue
<style scoped>
.container {
  padding: 16px;
}
</style>
```

---

## 目录结构建议

推荐结构：

```text
src/
 ├── assets/
 ├── components/
 ├── views/
 ├── router/
 ├── stores/
 ├── styles/
 ├── utils/
 └── App.vue
```

Agent 在新增文件时，必须遵循该结构。

---

## 代码风格

### JavaScript / TypeScript

推荐：

* 使用 `const`
* 使用箭头函数
* 使用 async/await
* 避免 callback hell

避免：

* 大量嵌套
* 冗余逻辑
* 未使用变量

---

## 组件设计原则

组件应：

* 单一职责
* 可复用
* Props 明确
* Emits 明确
* 避免超大组件

当组件超过约 300 行时，应考虑拆分。

---

## 状态管理

如果项目已包含 Pinia：

* 全局状态放入 store
* 页面局部状态优先使用 `ref/reactive`

避免：

* 不必要的全局状态
* 跨组件直接修改状态

---

## 网络请求

推荐：

* 封装 API 请求
* 统一错误处理
* 使用 async/await

建议目录：

```text
src/api
```

---

## Agent 行为要求

Agent 在修改代码前应：

1. 先阅读现有目录结构
2. 保持已有风格一致
3. 优先复用已有组件
4. 不随意新增依赖
5. 不破坏现有功能

Agent 在生成代码时：

* 优先生成可直接运行代码
* 避免伪代码
* 避免省略关键实现
* 保持代码完整

---

## 默认开发策略

当用户需求不明确时：

* 优先实现最小可运行版本
* 保持 UI 简洁
* 保持结构清晰
* 不添加复杂动画
* 不过度抽象

---

## 推荐命令

安装依赖：

```bash
npm install
```

启动开发：

```bash
npm run dev
```

类型检查（如支持）：

```bash
npm run type-check
```

构建：

```bash
npm run build
```

---

## 提交规范（推荐）

推荐使用：

```text
feat: 新增功能
fix: 修复问题
refactor: 重构
style: 样式调整
chore: 工程维护
```

---

## 最终要求

所有 Agent：

* 默认基于 vite + vue3 模板开发
* 保持现代前端工程结构
* 保持组件化设计
* 保持代码可维护性
* 优先保证可运行与可读性

---

## Hostc Public Preview

Use `hostc` when the user or task needs a temporary public URL for a local development server.

### Quick start

If the local app is running on port `3000`:

```bash
npx hostc@latest 3000
```

Use the printed public URL for previews, webhook callbacks, mobile-device testing, or sharing the local app with another person.

### Agent workflow

1. Confirm or infer the local port from the dev server output.
2. Prefer `npx hostc@latest <port>` so the CLI stays compatible with the current protocol.
3. Wait for hostc to print the public URL.
4. Give the user the public URL and keep the command running while the preview is needed.
5. If the tunnel fails, first check that the local server is reachable on the requested port.
6. To stop the preview, terminate the running hostc process. In an interactive terminal this is usually Ctrl+C. If the agent started hostc as a background process, stop or kill that process.

### Safety notes

- Do not expose sensitive admin panels, database consoles, credential dashboards, or private internal services unless the user explicitly asks and understands the risk.
- Treat the public URL as temporary. Do not use it as a permanent production endpoint.
- If hostc reports a protocol mismatch, ask the user to run `npx hostc@latest <port>` or upgrade their installed CLI.
- If the local service is unavailable, fix the local server first; hostc cannot proxy a port that is not serving traffic.
