import { createApp } from "vue";
import App from "./App.vue";
import * as vant from "vant";
import "vant/lib/index.css";
import "@vant/touch-emulator";
// ✅ 提取公共初始化逻辑
function initApp() {
  console.log("body 已就绪:", document.body);

  // 創建獨立的容器
  const container = document.createElement("div");
  container.id = "agent-ui-root";
  document.body.appendChild(container);

  // 创建应用实例
  const app = createApp(App);

  // 使用 Vant 插件
  app.use(vant);

  // 挂载到 DOM
  app.mount(container);
}

// ✅ 简化的 DOM 就绪检查
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
