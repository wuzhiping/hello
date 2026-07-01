# AGENTS.md - Vue3 + RxJS 项目助手文档

## 项目概述

这是一个轻量级 Vue3 单页应用项目，使用 RxJS 进行API调用。
- **入口文件**: `src/App.vue`（所有页面逻辑都在这个单文件中）
- **状态管理**: RxJS (Observables、Subjects)
- **构建工具**: Vite
- **输出方式**: 通过 `npx vite build` 打包，产物为可直接在浏览器运行的静态 JS 文件

## 核心构建配置（重要！）

### 📄 `build.config.json` 的作用

这个文件控制打包行为，AI 在修改依赖或构建配置时必须读取和更新它：
