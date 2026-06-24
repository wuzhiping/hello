<template>
  <div class="page-container">
    <van-floating-bubble
      v-if="!showDialog"
      axis="xy"
      @click="handleBubbleClick"
    >
      <van-loading v-if="showIcon === 'spinner'" type="spinner" />
      <van-icon v-else-if="showIcon === 'chat'" size="28px" name="chat-o" />
    </van-floating-bubble>

    <transition name="slide-up">
      <div
        v-show="showDialog"
        class="floating-div"
        :style="{
          width: dialogSize.width,
          height: dialogSize.height,
          maxWidth: `calc(100vw - 40px)`,
          maxHeight: `calc(100vh - 30px - 20px)`,
        }"
      >
        <div v-if="subAppLoading" class="loading-state">
          <van-loading size="30px" vertical>
            <span class="loading-text">加载中...</span>
          </van-loading>
        </div>

        <iframe
          v-if="useIframe"
          ref="iframeRef"
          :src="iframeSrc"
          class="content-iframe"
          frameborder="0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-top-navigation"
          allow="microphone; camera; clipboard-read; clipboard-write"
          @load="onIframeLoad"
        ></iframe>

        <div v-else ref="myCustomContainer" class="my-custom-container"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { showToast } from "vant";

// ========== 配置 ==========
// 🟡 修改为你的 API 地址
const API_URL = "https://abc.feg.com.tw/oauth2/getAgentSetting";

// 🟡 iframe 地址模板（保持不变）
const IFRAME_BASE_URL =
  "https://abc.feg.com.tw/share/ehr/pages/dev/chatbotPage/online/randomIframe.html";

const sizeMap = {
  large: { width: "90%", height: "90%" },
  middle: { width: "70%", height: "80%" },
  little: { width: "40%", height: "80%" },
  default: { width: "400px", height: "auto" },
};

// ========== 响应式数据 ==========
const showDialog = ref(false);
const useIframe = ref(false);
const entryUrl = ref("");
const iframeSrc = ref("");
const subAppLoading = ref(false);
const currentSize = ref("default");
const subAppReady = ref(false);
const isMounted = ref(false); // 子应用是否已挂载

const showIcon = computed(() => {
  return subAppReady.value ? "chat" : "spinner";
});

const iframeRef = ref(null);
const myCustomContainer = ref(null);

const dialogSize = computed(() => {
  const size = sizeMap[currentSize.value] || sizeMap.default;
  return {
    width: size.width,
    height: size.height,
  };
});

// ========== 私有变量 ==========
let subAppModule = null;

// ========== 获取配置 ==========
const fetchAgentConfig = async () => {
  try {
    console.log("[父组件] 获取配置");
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // 🟡 根据你的 API 结构调整
    if (!data.entry) throw new Error("缺少 entry 字段");

    // entryUrl.value = data.entry;
    entryUrl.value =
      "https://abc.feg.com.tw/share/ehr/pages/dev/chatbotPage/js/user-micro/agent.36165d1c.js";
    useIframe.value = data.iframe === true;

    const size = data.size;
    if (size === "large" || size === "middle" || size === "little") {
      currentSize.value = size;
    }

    if (useIframe.value) {
      iframeSrc.value = `${IFRAME_BASE_URL}?entry=${encodeURIComponent(entryUrl.value)}`;
      console.log("[父组件] iframe 模式，URL:", iframeSrc.value);
    } else {
      console.log("[父组件] 非 iframe 模式，预加载子应用");
      await preloadSubApp(entryUrl.value);
    }
  } catch (err) {
    console.error("获取配置失败:", err);
    showToast({ message: err.message || "加载失败", type: "fail" });
  }
};

// ========== 预加载子应用（非 iframe 模式） ==========
const preloadSubApp = async (scriptUrl) => {
  try {
    console.log("[父组件] 预加载子应用:", scriptUrl);
    window.__FROM_PARENT_APP__ = true;
    subAppModule = await import(/* @vite-ignore */ scriptUrl);
    console.log("[父组件] 子应用模块加载完成", Object.keys(subAppModule));
    subAppReady.value = true;
  } catch (err) {
    console.error("[父组件] 子应用加载失败:", err);
    showToast({ message: "子应用加载失败", type: "fail" });
    throw err;
  }
};

// ========== 挂载子应用到容器（非 iframe 模式） ==========
const mountSubAppToContainer = async (containerElement) => {
  if (!containerElement) {
    console.error("[父组件] 容器不存在");
    return false;
  }

  if (!subAppModule || typeof subAppModule.mount !== "function") {
    console.error("[父组件] 子应用未正确加载或未导出 mount", subAppModule);
    showToast({ message: "子应用未正确加载", type: "fail" });
    return false;
  }

  try {
    console.log("[父组件] 开始挂载子应用到容器:", containerElement);
    containerElement.innerHTML = "";

    await subAppModule.mount({
      container: containerElement,
      onClose: () => closeDialog(),
      onSetSize: (size) => setDialogSize(size),
    });

    console.log("[父组件] 子应用挂载成功");
    isMounted.value = true;
    return true;
  } catch (err) {
    console.error("[父组件] 子应用挂载失败:", err);
    showToast({ message: "子应用挂载失败", type: "fail" });
    isMounted.value = false;
    return false;
  }
};

// ========== 发送挂载指令给 iframe ==========
const sendMountCommandToIframe = () => {
  if (!iframeRef.value) {
    console.log("[父组件] iframe 未就绪");
    return;
  }

  try {
    iframeRef.value.contentWindow.postMessage(
      {
        type: "mount",
        data: {
          entryUrl: entryUrl.value,
        },
        timestamp: Date.now(),
      },
      "*",
    );
    console.log("[父组件] 发送挂载指令给 iframe");
  } catch (err) {
    console.error("发送挂载指令失败:", err);
  }
};

// ========== 设置对话框大小 ==========
const setDialogSize = (size) => {
  console.log("[父组件] 切换弹窗尺寸:", size);
  if (size === "large" || size === "middle" || size === "little") {
    currentSize.value = size;
    showToast({
      message: `切换为${size === "large" ? "大" : size === "middle" ? "中" : "小"}尺寸`,
      type: "success",
      duration: 1000,
    });
  }
};

// ========== 处理气泡点击 ==========
const handleBubbleClick = async () => {
  if (!subAppReady.value) {
    showToast({
      message: "内容正在加载中，请稍后...",
      type: "info",
      duration: 1500,
    });
    return;
  }

  showDialog.value = true;
  // iframe模式或非iframe模式挂载过不用重新挂载了
  if (isMounted.value) {
    console.log("[父组件] 子应用已挂载，直接显示");
    return;
  }

  subAppLoading.value = true;

  if (useIframe.value) {
    console.log("[父组件] iframe 模式，发送挂载指令");
    sendMountCommandToIframe();
  } else {
    console.log("[父组件] 非 iframe 模式，开始挂载子应用");
    await mountSubAppToContainer(myCustomContainer.value);
    subAppLoading.value = false;
  }
};

// ========== 关闭弹窗 ==========
const closeDialog = () => {
  console.log("[父组件] 关闭弹窗");
  showDialog.value = false;
  subAppLoading.value = false;
};

// ========== 处理 iframe 消息 ==========
const handleIframeMessage = (event) => {
  if (!event.data || typeof event.data !== "object") return;

  const { type, data } = event.data;
  if (!type) return;

  console.log(`[父组件] 收到 iframe 消息: ${type}`, data);

  switch (type) {
    case "subAppPreloaded":
      console.log("[父组件] iframe 内子应用预加载完成");
      subAppReady.value = true;
      break;

    case "subAppMounted":
      console.log("[父组件] iframe 内子应用挂载完成");
      isMounted.value = true;
      subAppLoading.value = false;
      break;

    case "closeDialog":
      console.log("[父组件] iframe 请求关闭弹窗");
      closeDialog();
      break;

    case "setSize":
      if (data && data.size) {
        setDialogSize(data.size);
      }
      break;

    case "error":
      console.error("[父组件] iframe 错误:", data);
      subAppLoading.value = false;
      showToast({ message: data?.message || "加载失败", type: "fail" });
      break;

    default:
      console.log("[父组件] 收到未知消息:", type, data);
  }
};

// ========== 处理 iframe 加载完成事件 ==========
const onIframeLoad = () => {
  console.log("[父组件] iframe DOM 加载完成");
  subAppLoading.value = true;
};

// ========== 生命周期 ==========
onMounted(() => {
  fetchAgentConfig();
  window.addEventListener("message", handleIframeMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleIframeMessage);
});
</script>

<style scoped>
.page-container {
  position: relative;
}

.floating-div {
  position: fixed;
  right: 20px;
  bottom: 30px;
  z-index: 999;
  overflow-y: auto; /* 从 .div-body 移过来 */
  transition: all 0.3s ease;
  min-height: 400px; /* 从 .div-body 移过来 */
}

.loading-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.loading-text {
  margin-top: 12px;
  color: #969799;
  font-size: 14px;
}

.content-iframe,
.my-custom-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
  background-color: #fff;
  display: block;
}

.floating-div::-webkit-scrollbar {
  width: 4px;
}

.floating-div::-webkit-scrollbar-thumb {
  background-color: #c8c9cc;
  border-radius: 2px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .floating-div {
    right: 12px;
    width: calc(100vw - 24px);
    max-width: none;
  }

  .content-iframe,
  .my-custom-container {
    min-height: 350px;
  }
}
</style>
