<template>
  <div class="chat-container">
    <!-- 1. 顶部导航栏 -->
    <div class="chat-header">
      pageAgent
      <van-icon @click="$emit('close')" class="close-btn" name="close" />
    </div>
    <!-- 2. 聊天消息区 -->
    <div class="chat-page-body">
      <div class="messages-list-wrap">
        <MessageList
          ref="messageListRef"
          @scrollEnd="onScrollEnd"
          @scroll="onScroll"
        >
          <template v-for="(item, index) in history" :key="item.uid">
            <MessageItem
              :index="index"
              :messageLength="history?.length"
              :msg="item"
              :language="language"
              @sendTextMessage="sendMessage"
            />
          </template>
          <MessageItem v-if="showWaitFlag" :msg="{ member: 'wait' }" />
        </MessageList>
      </div>
      <transition name="slide-down">
        <div
          class="bottom-btn-box"
          @click="onScrollBottom"
          v-if="isShowBottomBtn"
        >
          <van-icon class="bottom-btn" name="arrow-down" />
        </div>
      </transition>
    </div>
    <!-- 3. 底部输入栏 -->
    <div class="chat-page-footer">
      <div class="message-input">
        <textarea
          @focus="onFocus"
          @blur="onBlur"
          @keydown.enter.prevent="sendMessage(undefined)"
          ref="textareaRef"
          v-model="inputText"
          class="text-input"
          :placeholder="language.placeholder"
        ></textarea>
        <van-button
          @click="sendMessage(undefined)"
          :disabled="disableSend"
          :class="{ 'send-btn-active': inputText.trim() && !disableSend }"
          class="send-btn"
          rounds
          ><van-icon name="guide-o"
        /></van-button>
      </div>
      <div class="technical-support-text">
        {{ language.footerText }}
      </div>
    </div>
  </div>
</template>

<script>
function randomUUID() {
  const hexDigits = "0123456789abcdef";
  let uuid = "";

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += "-";
    } else if (i === 14) {
      uuid += "4";
    } else if (i === 19) {
      uuid += hexDigits[Math.floor(Math.random() * 4) + 8];
    } else {
      uuid += hexDigits[Math.floor(Math.random() * 16)];
    }
  }
  return uuid;
}
import MessageList from "./message-list.vue";
import MessageItem from "./message-item.vue";
import { runAgentSSE, runAgentWS } from "../js/agent.js";
export default {
  components: { MessageList, MessageItem },
  data() {
    return {
      isShowBottomBtn: false, // 是否显示底部按钮
      runId: "",
      sub$: [],
      inputText: "",
      showWaitFlag: false,
      history: [],
      disableSend: false, // 是否在回复中
      language: {}, // 当前语言
      Chineselanguage: {
        placeholder: "在此輸入您想了解的內容",
        footerText: "由 AIFE 提供服務",
        timeConsuming: "耗時",
        second: "秒",
        source: "來源",
        referenceDocuments: "參考文件",
      },
      Englishlanguage: {
        placeholder: "Enter the content you want to know here",
        footerText: "Powered by AIFE",
        timeConsuming: "time",
        second: "(s)", // Second
        source: "Source",
        referenceDocuments: "Reference documents",
      },
    };
  },
  methods: {
    // 格式化时间
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    // 获取输入框焦点时
    onFocus(event) {
      event.target.parentNode.style.borderColor = "#2475FC";
    },
    // 失去输入框焦点时
    onBlur(event) {
      event.target.parentNode.style.borderColor = "#DDD";
    },
    // 滚动到最底部
    onScrollBottom() {
      this.$refs.messageListRef.scrollToBottom();
      this.isShowBottomBtn = false;
    },
    // 监听滚动
    onScroll(event) {
      if (event.scrollHeight - event.clientHeight > event.scrollTop) {
        // 不是在底部了，显示回到底部按钮
        this.isShowBottomBtn = true;
      }
    },
    // 监听滚动到底部
    onScrollEnd() {
      this.isShowBottomBtn = false;
    },
    initSub1(params, add) {
      let vm = this;
      let sub = runAgentSSE(
        "https://abc.feg.com.tw/BDD/API/AI/studio/ml/chat2",
        params,
      ).subscribe({
        next(data) {
          console.log("收到数据", data);
          add(data);
        },
        error(err) {
          vm.showWaitFlag = false;
          vm.disableSend = false;
          vant.showFailToast("網絡或系統錯誤，請稍後重新嘗試");
          console.error("错误:", err);
        },
        complete() {
          vm.showWaitFlag = false;
          vm.disableSend = false;
          console.log("任务已完成");
          vm.sub$ = [...vm.sub$];
        },
      });
      return {
        id: this.runId,
        sub: sub,
        agent: "https://abc.feg.com.tw/BDD/API/AI/studio/ml/chat2",
        params: params,
      };
    },
    sendMessage() {
      if (this.disableSend) {
        return;
      }
      if (this.inputText.length == "") {
        vant.showFailToast("輸入框不能爲空");
        return;
      }
      this.disableSend = true;
      // 用户消息
      this.userSend();
      // 监听回复的消息
      this.onMessage();
    },
    userSend() {
      this.runId = randomUUID(); //  每条消息对话的唯一标识
      // 用户消息
      this.history.push({
        text: this.inputText,
        time: this.formatDate(new Date()),
        member: "user",
        id: this.runId,
      });
      this.onScrollBottom();
      this.showWaitFlag = true;
    },
    onMessage() {
      console.log("sub列表", this.sub$);
      // 创建会话
      this.sub$.push(
        this.initSub1(
          {
            prompt: this.inputText,
          },

          (data) => {
            console.log("data", data);
            data.member = "rebot";
            if (data.status == "tips") {
              this.showWaitFlag = false;
              this.history[this.history.length - 1].status == "tips"
                ? (this.history[this.history.length - 1].txt = data.txt)
                : this.history.push(data);
            } else if (data.status == "streaming") {
              this.showWaitFlag = false;
              data.time = this.formatDate(new Date());
              // 判断是否有类型，如果没有设置为默认类型text
              if (!data.messageType) {
                data.messageType = "text";
              }
              // 某个消息是否已经存在 -- 存在则更新状态，不存在则新增
              let index = this.history.findIndex((item) => item.id == data.id);
              if (index == -1) {
                if (this.history[this.history.length - 1].status == "tips") {
                  this.history[this.history.length - 1] = data;
                } else {
                  this.history.push(data);
                }
              } else {
                this.history[index] = { ...data };
              }
            } else if (data.status == "succeeded") {
              this.disableSend = false;
              console.log("历史记录", this.history);
              if (this.history[this.history.length - 1].member == "user") {
                this.history.push(data);
              } else {
                this.history[this.history.length - 1].output.text = data.output.text;
                this.history[this.history.length - 1].runId = data.id;
                this.history[this.history.length - 1].metrics = data.metrics;
                this.history[this.history.length - 1].status = data.status;
              }
              //   this.saveMoeChatUpdateName(data.output.topic);
            } else if (data.status == "failed") {
              console.log("历史记录", this.history);
              this.showWaitFlag = false;
              data.time = this.formatDate(new Date());
              if (this.history[this.history.length - 1].status !== "failed") {
                this.history.push(data);
              }
            }
            this.onScrollBottom();
          },
        ),
      );
      this.inputText = "";
    },
  },
  created() {},
};
</script>
<style scoped>
.custom-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.custom-menu div {
  padding: 8px 16px;
  cursor: pointer;
}

.custom-menu div:hover {
  background: #f5f5f5;
}
.chat-container {
  display: flex;
  flex-flow: column nowrap;
  width: 380px;
  height: 820px;
  max-height: 95vh;
  overflow: hidden;
  background-color: #f0f2f5;
  position: fixed;
  bottom: 30px;
  right: 2%;
  z-index: 1000000000;
}
/* 头部样式--------------------------------------- */
.chat-header {
  position: relative;
  padding: 16px;
  color: #fff;
  background-image: linear-gradient(90deg, #3f6dc9 0%, #00a0fb 100%);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12);
}
.close-btn {
  position: absolute;
  right: 4px;
  top: 15px;
  font-size: 24px;
  cursor: pointer;
}
/* 身体的样式------------------------------------- */
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
/* 输入框样式------------------------------------------------ */
.chat-page-footer {
  width: 100%;
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
  /* transition: all 0.2s; */
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
  white-space: pre-wrap; /* 保持内容的换行，并允许自动换行 */
  resize: none; /* 禁止用户通过拖动改变元素的大小 */
  border: none;
  width: 100%;
  margin: 0 50px 0 12px;
  color: rgb(26, 26, 26);
  font-size: 16px;
  /* transition: height 0.1s ease-in-out; */
  min-height: 23px;
  field-sizing: content;
}
.text-input::placeholder {
  font-size: 16px;
  font-weight: 400;
  color: rgb(191, 191, 191);
}
/* 滚动条样式 */
.text-input::-webkit-scrollbar {
  width: 4px; /*  设置纵轴（y轴）轴滚动条 */
  height: 4px; /*  设置横轴（x轴）轴滚动条 */
}
/* 滚动条滑块（里面小方块） */
.text-input::-webkit-scrollbar-thumb {
  cursor: pointer;
  border-radius: 5px;
  background: transparent;
}
/* 滚动条轨道 */
.text-input::-webkit-scrollbar-track {
  border-radius: 5px;
  background: transparent;
}

/* hover时显色 */
.text-input:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}
.text-input:hover::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
/* 输入框下面文字的样式 */
.technical-support-text {
  line-height: 20px;
  padding: 4px 0;
  font-size: 12px;
  color: #bfbfbf;
  text-align: center;
}
/* 底部滚动消息按钮的样式- */
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

/* 定义进入动画 */
.slide-down-enter-active {
  animation: slide-down-in 0.3s ease-in;
  position: absolute;
  z-index: 1;
}

/* 定义进入完成后的状态 */
.slide-down-enter-from {
  transform: translateY(150%);
}

/* 定义退出动画 */
.slide-down-leave-active {
  animation: slide-down-out 0.3s ease-out;
  position: absolute;
  z-index: 1;
}

/* 定义退出完成后的状态 */
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
