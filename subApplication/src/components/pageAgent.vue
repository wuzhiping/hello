<template>
  <div class="chat-container">
    <!-- 1. 顶部导航栏 -->
    <div class="chat-header">
      pageAgent
      <van-button
        plain
        type="primary"
        size="mini"
        @click="handleSetSize('large')"
        style="margin-left: 8px"
        >大</van-button
      >
      <van-button
        plain
        type="primary"
        size="mini"
        @click="handleSetSize('middle')"
        >中</van-button
      >
      <van-button
        plain
        type="primary"
        size="mini"
        @click="handleSetSize('little')"
        >小</van-button
      >
      <van-icon @click="handleClose" class="close-btn" name="close" />
    </div>
    <!-- 2. 聊天消息区 -->
    <div class="chat-page-body"></div>
  </div>
</template>

<script>
export default {
  inject: {
    // 从父组件注入的回调函数（非 iframe 模式）
    onClose: {
      default: null,
    },
    onSetSize: {
      default: null,
    },
  },
  data() {
    return {};
  },
  mounted() {
    // ✅ 添加这个，方便调试
    if (this.isInIframe()) {
      console.log("[子应用] 运行在 iframe 模式");
    } else {
      console.log("[子应用] 运行在独立模式（使用注入回调）");
    }
  },
  methods: {
    // ========== 关闭弹窗（简化版） ==========
    handleClose() {
      console.log("[子应用] 点击关闭按钮");

      if (this.isInIframe()) {
        // iframe 模式：通过 postMessage 通知父组件
        window.parent.postMessage(
          { type: "closeDialog", data: {}, timestamp: Date.now() },
          "*",
        );
      } else {
        // 非 iframe 模式：使用注入的回调
        if (this.onClose && typeof this.onClose === "function") {
          this.onClose();
        } else {
          console.warn("[子应用] 非 iframe 模式下未找到 onClose 回调");
        }
      }
    },

    // ========== 切换尺寸（简化版） ==========
    handleSetSize(size) {
      console.log("[子应用] 点击尺寸按钮:", size);

      if (this.isInIframe()) {
        // iframe 模式：通过 postMessage 通知父组件
        window.parent.postMessage(
          { type: "setSize", data: { size: size }, timestamp: Date.now() },
          "*",
        );
      } else {
        // 非 iframe 模式：使用注入的回调
        if (this.onSetSize && typeof this.onSetSize === "function") {
          this.onSetSize(size);
        } else {
          console.warn("[子应用] 非 iframe 模式下未找到 onSetSize 回调");
        }
      }
    },

    // ========== 判断是否在 iframe 中 ==========
    isInIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return false;
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  width: 100%;
  max-height: 100%;
  overflow: hidden;
  background-color: #f0f2f5;
  z-index: 100000;
}

.chat-header {
  position: relative;
  padding: 16px;
  color: #fff;
  background-image: linear-gradient(90deg, #3f6dc9 0%, #00a0fb 100%);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
}

.close-btn {
  position: absolute;
  right: 4px;
  top: 15px;
  font-size: 24px;
  cursor: pointer;
}

.chat-page-body {
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
}

.chat-page-body .messages-list-wrap {
  flex: 1;
  overflow: hidden;
}

.message-input {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  min-width: 350px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: #fff;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  margin: 0 12px;
}

.send-btn {
  position: absolute;
  right: 10px;
  font-size: 26px;
  color: white;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  background-color: #97c8ff;
  border: none;
  border-radius: 50%;
}

.send-btn-active {
  background-color: #2475fc;
}

.text-input {
  max-height: 10em;
  line-height: 1.2em;
  overflow: auto;
  white-space: pre-wrap;
  resize: none;
  border: none;
  width: 100%;
  margin: 0 50px 0 12px;
  color: rgb(26, 26, 26);
  font-size: 16px;
  min-height: 23px;
  field-sizing: content;
}

.text-input::placeholder {
  font-size: 16px;
  font-weight: 400;
  color: rgb(191, 191, 191);
}

.text-input::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.text-input::-webkit-scrollbar-thumb {
  cursor: pointer;
  border-radius: 5px;
  background: transparent;
}

.text-input::-webkit-scrollbar-track {
  border-radius: 5px;
  background: transparent;
}

.text-input:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

.text-input:hover::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.technical-support-text {
  line-height: 20px;
  padding: 4px 0;
  font-size: 12px;
  color: #bfbfbf;
  text-align: center;
}

.bottom-btn-box {
  display: flex;
  width: 20px;
  height: 20px;
  padding: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 40px;
  border: 1px solid #fff;
  background: #fff;
  box-shadow: 0 4px 16px 0 #0000001f;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
  left: 50%;
  margin-left: -20px;
}

.bottom-btn-box .bottom-btn {
  font-size: 16px;
  color: #659efc;
}

.bottom-btn-box:hover {
  border: 1px solid #659dfc;
}

.slide-down-enter-active {
  animation: slide-down-in 0.3s ease-in;
  position: absolute;
  z-index: 1;
}

.slide-down-enter-from {
  transform: translateY(150%);
}

.slide-down-leave-active {
  animation: slide-down-out 0.3s ease-out;
  position: absolute;
  z-index: 1;
}

.slide-down-leave-to {
  transform: translateY(150%);
}

@keyframes slide-down-in {
  from {
    transform: translateY(150%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-down-out {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(150%);
  }
}
</style>
