<template>
  <div class="icon">
    <van-floating-bubble axis="xy">
      <van-loading v-if="showIcon == 'spinner'" type="spinner" />
      <van-icon v-else-if="showIcon == 'success'" size="30px" name="success" />
      <van-icon v-else-if="showIcon == 'chat'" size="30px" name="chat" />
    </van-floating-bubble>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
const showIcon = ref("spinner");
import { runAgentSSE, runAgentWS } from "./js/agent.js";

onMounted(() => {
  // 等待组件渲染完成
  setTimeout(() => {
    // 找到气泡元素
    const bubble = document.querySelector(".van-floating-bubble");

    if (bubble) {
      // 创建一个 style 标签，注入动画
      const style = document.createElement("style");
      style.textContent = `
          @keyframes gentleGlow {
            0% {
              filter: drop-shadow(0 0 2px rgba(64, 224, 208, 0.3));
              opacity: 0.95;
            }
            50% {
              filter: drop-shadow(0 0 12px rgba(64, 224, 208, 0.7)) 
                      drop-shadow(0 0 5px rgba(30, 144, 255, 0.5));
              opacity: 1;
            }
            100% {
              filter: drop-shadow(0 0 2px rgba(64, 224, 208, 0.3));
              opacity: 0.95;
            }
          }
          
          @keyframes pulseRing {
            0% {
              box-shadow: 0 0 0 0 rgba(64, 224, 208, 0.4);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(64, 224, 208, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(64, 224, 208, 0);
            }
          }
          
          .van-floating-bubble {
            animation: gentleGlow 1.5s ease-in-out infinite !important;
          }
        `;
      document.head.appendChild(style);

      console.log("动画已添加！");
    } else {
      console.log("未找到气泡元素");
    }
  }, 500);

  setTimeout(() => {
    showIcon.value = "success";
  }, 5000);
  setTimeout(() => {
    showIcon.value = "chat";
  }, 6000);
});
</script>
