// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import * as vant from "vant";
import "vant/lib/index.css";
import "@vant/touch-emulator";
import axios from "axios";
import config from "/build.config.json";

let app = null;

export async function mount(props) {
  console.log("[子应用] mount 被调用，props:", props);
  let container = props.container;
  if (!container) {
    console.log("[子应用] 父应用未传入容器，创建默认容器");
    container = document.createElement("div");
    container.id = config.entryFileNames || "agent-default-container";
    container.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 30px;
      width: 400px;
      max-width: 90vw;
      height: 600px;
      max-height: 90vh;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(container);
  }
  if (typeof container === "string") {
    container = document.querySelector(container);
  }

  if (!container || !(container instanceof HTMLElement)) {
    console.error("[子应用] 无效的容器:", container);
    throw new Error("无效的容器");
  }

  container.innerHTML = "";

  app = createApp(App);
  app.use(vant);
  app.config.globalProperties.$vant = vant;
  app.config.globalProperties.$axios = axios;

  if (props.onClose) {
    app.provide("onClose", props.onClose);
  }
  if (props.onSetSize) {
    app.provide("onSetSize", props.onSetSize);
  }

  app.mount(container);
  console.log("[子应用] 挂载完成，容器:", container);
}

// ========== 独立运行模式（开发调试用） ==========
const isStandalone = () => {
  // 检查是否在 iframe 中
  try {
    if (window.self !== window.top) {
      return false;
    }
  } catch (e) {
    return false;
  }

  // ✅ 关键修复：检查是否被父应用动态导入
  // 如果存在 __FROM_PARENT_APP__ 标记，说明是被父应用加载的
  if (window.__FROM_PARENT_APP__) {
    return false;
  }

  // 检查是否通过动态 import 加载（ES module 方式）
  // 动态 import 的模块中，import.meta.url 存在，但这不是决定性因素
  // 使用一个额外的标记更可靠

  return true;
};

// ✅ 只有在真正独立运行时才自动挂载
if (isStandalone()) {
  console.log("[子应用] 独立运行模式，自动挂载");
  const init = () => {
    // ✅ 直接创建容器，不查询已有的元素
    const defaultContainer = document.createElement("div");
    defaultContainer.id = config.entryFileNames || "agent-ui-root";
    defaultContainer.style.cssText = `
      width: 100%;
      height: 100%;
      background: #ffffff;
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(defaultContainer);

    mount({ container: defaultContainer });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
} else {
  console.log("[子应用] 被父应用加载，等待 mount 调用");
}
