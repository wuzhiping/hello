<template>
  <div class="message-list" ref="scrollBoxRef" @scroll="onScroll">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
// 声明可触发的自定义事件
const emit = defineEmits(["scroll", "scrollEnd"]);

const scrollBoxRef = ref(null); // 滚动框引用
const scrollOption = {
  scrollTop: 0, // 已经滚动的距离
  scrollHeight: 0, // 容器内内容总高度，包含超出可视区的部分
  clientHeight: 0, // 可视区高度
  scrollStartDiff: 60, // 头部偏移值
  scrollEndDiff: 60, // 底部偏移值
}; // 滚动条配置对象

let scrollEventTimer = null; // 用 setTimeout 确保滚动事件停止 50ms 后才执行逻辑，避免频繁触发

// 判断在底部的时候是否要隐藏回到底部的按钮
function handleScrollBottom() {
  emit("scrollEnd");
}

// 判断在我们滚动后是否需要显示回到底部的按钮
function onScroll(e) {
  // 避免频繁触发
  if (scrollEventTimer !== null) {
    clearTimeout(scrollEventTimer);
    scrollEventTimer = null;
  }

  scrollEventTimer = window.setTimeout(() => {
    scrollOption.scrollTop = e.target.scrollTop;
    scrollOption.scrollHeight = e.target.scrollHeight;
    scrollOption.clientHeight = e.target.clientHeight;
    // 滚动后只要不是在底部就会显示回到底部的按钮
    emit("scroll", { ...scrollOption });
    // 滚动容器的高度减去可视区的高度减去已经滚动的高度如果小于60就隐藏回到底部的按钮
    let isAtBottom =
      scrollOption.scrollHeight -
        scrollOption.scrollTop -
        scrollOption.clientHeight <= scrollOption.scrollEndDiff;
        
    if (isAtBottom) {
      handleScrollBottom();
    }
    // if (
    //   scrollOption.scrollHeight - scrollOption.clientHeight >
    //   scrollOption.scrollTop
    // ) {
    //   // 不是在底部了，显示回到底部按钮
    //   this.isShowBottomBtn = true;
    // }
  }, 50);
}
// 消息滚动到最底部 --- 供父组件调用
const scrollToBottom = () => {
  nextTick(() => {
    scrollBoxRef.value.scrollTop = scrollBoxRef.value.scrollHeight + 1;
  });
};
// 暴漏事件供父组件使用
defineExpose({
  scrollToBottom,
});
</script>

<style scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 4px; /*  设置纵轴（y轴）轴滚动条 */
  height: 4px; /*  设置横轴（x轴）轴滚动条 */
}
/* 滚动条滑块（里面小方块） */
.message-list::-webkit-scrollbar-thumb {
  cursor: pointer;
  border-radius: 0px;
  background: transparent;
}
/* 滚动条轨道 */
.message-list::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}

/* hover时显色 */
.message-list:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}
.message-list:hover::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
</style>
