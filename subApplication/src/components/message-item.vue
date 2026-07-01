<template>
  <!-- messageItemClasses动态控制是用户还是机器人 -->
  <div :class="messageItemClasses" class="message-item" :id="'msg-' + index">
    <!-- 头像部分 -->
    <div
      class="message-item-left"
      :style="{
        backgroundColor: props.msg.member == 'user' ? '#21ba45' : '#1976d2',
      }"
    >
      <van-icon v-if="props.msg.member == 'user'" size="22" name="manager-o" />
      <van-icon v-else name="smile-comment-o" size="22" />
    </div>
    <!-- 消息体容器 -->
    <div class="message-item-body">
      <!-- 消息内容 -->
      <div class="message-content">
        <!-- 可以评价 -->
        <template v-if="props.msg.member == 'rebot'">
          <!-- 消息内容 -->
          <div class="text-message" v-if="props.msg.output || props.msg.txt">
            <cherryMarkdown
              :content="props.msg.output?.text || props.msg.txt"
            ></cherryMarkdown>
            <!-- 来源 -->
            <div
              v-if="
                props.msg?.txt?.refList?.length || props.msg.refList?.length
              "
            >
              {{ language.source }}：
              <van-button
                v-for="(url, index) in props.msg?.txt?.refList ||
                props.msg.refList"
                @click="openNewPage(url, index)"
                :key="index"
                :title="
                  url.document_keyword
                    ? '\n' +
                      language.referenceDocuments +
                      '：' +
                      url.document_keyword
                    : ''
                "
                rounds
                style="
                  width: 32px;
                  height: 28px;
                  border-radius: 44%;
                  background-color: #e0e0e0;
                  margin-right: 5px;
                  cursor: pointer;
                "
                >{{ index + 1 }}</van-button
              >
            </div>
            <!-- 最后一条消息始终显示评价 -->
            <div v-if="isShowCopy && props.msg.runId" class="operation">
              <div class="operation-right" v-if="!isCustomerMessage">
                <span
                  v-if="props.msg?.metrics?.predict_time"
                  style="color: grey"
                >
                  <van-icon name="clock-o" />
                  {{ language.timeConsuming }}:
                  {{
                    language.second == "秒"
                      ? parseInt(props.msg.metrics.predict_time)
                      : numberToEnglish(
                          parseInt(props.msg.metrics.predict_time),
                        )
                  }}
                  {{ language.second }}
                </span>
                <span
                  v-if="tokenTotal"
                  @mouseleave="handleMouseLeave"
                  :title="tokenTotal"
                  class="col"
                  align="left"
                  style="cursor: pointer"
                  ><van-icon name="info-o" />
                </span>
                <span
                  v-else
                  :title="
                    props.msg?.tokenTotal ? props.msg.tokenTotal : tokenTotal
                  "
                  class="col"
                  align="left"
                  style="cursor: pointer"
                >
                  <van-icon
                    @mouseover="handleMouseOver(props.msg)"
                    name="info-o"
                  />
                </span>
                <van-button
                  @click="handlePraise(msg, true, '评价')"
                  class="praise-block"
                  :disabled="activeStatus !== null"
                  type="default"
                  ><van-icon
                    :color="activeStatus == true ? 'blue' : '#757575'"
                    size="18px"
                    name="good-job"
                /></van-button>
                <!-- 不好的评价内容 -->
                <van-popover
                  placement="top-end"
                  v-if="showPopup"
                  v-model:show="showPopup"
                >
                  <div ref="feedbackModal" class="feedback-modal">
                    <div class="modal-title">結果反饋</div>
                    <div class="content">
                      <textarea
                        class="text-input"
                        v-model="feedbackContent"
                        placeholder="請反饋妳覺得回答不滿意的地方"
                      ></textarea>
                    </div>
                    <div class="btn-box">
                      <div
                        v-if="feedbackContent.trim() == '' && showHint"
                        style="font-size: 14px; color: red"
                      >
                        請提出妳寶貴的意見
                      </div>
                      <van-button
                        class="model-btn cancel-btn"
                        type="default"
                        @click="onCancel"
                        >取消</van-button
                      >
                      <van-button
                        class="model-btn submit-btn"
                        type="primary"
                        @click="handlePraise(msg, false, feedbackContent)"
                        >提交</van-button
                      >
                    </div>
                  </div>
                  <template #reference>
                    <van-button
                      @click="showPopup = false"
                      style="transform: rotate(180deg)"
                      class="trample-block"
                      :disabled="activeStatus !== null"
                    >
                      <van-icon
                        :color="activeStatus == false ? 'blue' : '#757575'"
                        size="18px"
                        name="good-job"
                      />
                    </van-button>
                  </template>
                </van-popover>
                <van-button
                  v-else
                  @click="showPopup = true"
                  style="transform: rotate(180deg)"
                  class="trample-block"
                  :disabled="activeStatus !== null"
                >
                  <van-icon
                    :color="activeStatus == false ? 'blue' : '#757575'"
                    size="18px"
                    name="good-job"
                  />
                </van-button>
              </div>
            </div>
            <!-- 悬浮时显示评价 -->
            <div
              class="hover-copy-tool-block"
              v-if="isShowHoverCopy && props.msg.member == 'rebot'"
            >
              <div class="operation-right">
                <template v-if="!isCustomerMessage">
                  <span
                    v-if="tokenTotal"
                    @mouseleave="handleMouseLeave"
                    :title="tokenTotal"
                    class="col"
                    align="left"
                    style="cursor: pointer"
                    ><van-icon name="info-o" />
                  </span>
                  <span
                    v-else
                    :title="
                      props.msg?.tokenTotal ? props.msg.tokenTotal : tokenTotal
                    "
                    class="col"
                    align="left"
                    style="cursor: pointer"
                  >
                    <van-icon
                      @mouseover="handleMouseOver(props.msg)"
                      name="info-o"
                    />
                  </span>
                  <van-button
                    @click="handlePraise(msg, true, '评价')"
                    class="praise-block"
                    :disabled="activeStatus !== null"
                    type="default"
                    ><van-icon
                      :color="activeStatus == true ? 'blue' : '#757575'"
                      size="18px"
                      name="good-job"
                  /></van-button>
                  <!-- 不好的评价内容 -->
                  <van-popover
                    placement="top-end"
                    v-if="showPopup"
                    v-model:show="showPopup"
                  >
                    <div ref="feedbackModal" class="feedback-modal">
                      <div class="modal-title">結果反饋</div>
                      <div class="content">
                        <textarea
                          class="text-input"
                          v-model="feedbackContent"
                          placeholder="請反饋妳覺得回答不滿意的地方"
                        ></textarea>
                      </div>
                      <div class="btn-box">
                        <div
                          v-if="feedbackContent.trim() == '' && showHint"
                          style="font-size: 14px; color: red"
                        >
                          請提出妳寶貴的意見
                        </div>
                        <van-button
                          class="model-btn cancel-btn"
                          type="default"
                          @click="onCancel"
                          >取消</van-button
                        >
                        <van-button
                          class="model-btn submit-btn"
                          type="primary"
                          @click="handlePraise(msg, false, feedbackContent)"
                          >提交</van-button
                        >
                      </div>
                    </div>
                    <template #reference>
                      <van-button
                        @click="showPopup = false"
                        style="transform: rotate(180deg)"
                        class="trample-block"
                        :disabled="activeStatus !== null"
                      >
                        <van-icon
                          :color="activeStatus == false ? 'blue' : '#757575'"
                          size="18px"
                          name="good-job"
                        />
                      </van-button>
                    </template>
                  </van-popover>
                  <van-button
                    v-else
                    @click="showPopup = true"
                    style="transform: rotate(180deg)"
                    class="trample-block"
                    :disabled="activeStatus !== null"
                  >
                    <van-icon
                      size="18px"
                      :color="activeStatus == false ? 'blue' : '#757575'"
                      name="good-job"
                    />
                  </van-button>
                </template>
              </div>
            </div>
            <!-- 回答参考消息格式 -->
            <div
              class="answer-reference-box"
              v-if="
                props.msg.is_customer != 1 &&
                props.msg.quote_file &&
                props.msg.quote_file.length
              "
            >
              <div class="title-block">回答參考</div>
              <div
                class="list-item"
                v-for="(item, index) in props.msg.quote_file"
                :key="index"
              >
                <van-icon name="link-o" />
                <span @click="handleToLink(item)" style="font-size: 12px">{{
                  item.file_name
                }}</span>
              </div>
            </div>
          </div>
          <!-- 推荐询问的问题列表 -->
          <div
            class="question-list"
            v-if="props.msg.recommendQ && props.msg.recommendQ?.length"
          >
            <!-- tab切换 -->
            <div class="message-tabs">
              <div
                @click="switchTab(true)"
                class="tab-item"
                :class="{ active: tabType }"
              >
                推薦問題
              </div>
              <div class="v-line"></div>
              <div
                @click="switchTab(false)"
                class="tab-item"
                :class="{ active: !tabType }"
              >
                常見問題
              </div>
            </div>
            <div
              class="question-item"
              v-for="item in tabType
                ? props.msg.recommendQ
                : props.msg.common_question_list"
              :key="item"
              @click="sendTextMessage(item)"
            >
              <span>{{ item }}</span>
            </div>
          </div>
        </template>
        <!-- 不可以评价 -->
        <template
          v-else-if="props.msg.member == 'user' || props.msg.member == 'wait'"
        >
          <!-- 文本 -->
          <div v-if="props.msg.text" class="text-message">
            <cherryMarkdown :content="props.msg.text"></cherryMarkdown>
          </div>
          <!-- 显示等待标志 -->
          <div v-else class="text-message">
            {{ textMessage }}
          </div>
          <!-- 推荐询问的问题列表 -->
          <div
            class="question-list"
            style="width: 350px"
            v-if="props.msg.menu_json && props.msg.menu_json.question?.length"
          >
            <div
              class="question-item"
              v-for="item in props.msg.menu_json.question"
              :key="item"
              @click="sendTextMessage(item)"
            >
              <span>{{ item.question }}</span>
            </div>
          </div>
        </template>
        <!-- 错误类型 -->
        <template v-else-if="props.msg.status == 'filed'">
          <!-- 文本 -->
          <div class="text-message">
            <cherryMarkdown content="系統發生錯誤"></cherryMarkdown>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import cherryMarkdown from "./cherry-markdown.vue";
import axios from "axios";
const emit = defineEmits(["sendTextMessage", "scrollBottom"]); // 派发发送消息事件
const textMessage = ref("."); // 等待机器人回复增加动态...
let interval;

const props = defineProps({
  msg: {
    type: Object,
    required: true,
  }, // 每一条消息内容
  index: {
    type: [Number, String],
  }, // 每一条消息下标
  messageLength: {
    type: Number,
    default: 0,
  }, // 总消息的长度
  language: {
    type: Object,
  }, // 最后一条消息的下标
});
const tabType = ref(true); // 控制tab栏显示的内容  -- true推荐问题 false常见问题
const activeStatus = ref(null); // 点赞状态
const showPopup = ref(false); // 是否显示评价反馈面板
const feedbackContent = ref(""); // 评价反馈的内容
const showHint = ref(false); // 是否显示提示信息
const quoteModalRef = ref(null); // 参考内容
const tokenTotal = ref(""); // 跟踪使用情况
const timeout = ref(null);
const openNewPage = (item) => {
  if (window.__TAURI__) {
    // 运行在 Tauri 环境
    // 生成唯一窗口 ID（时间戳 ）
    window.__TAURI__.shell.open(item.url);
  } else {
    // 运行在浏览器环境
    window.open(item.url);
  }
};
// 最后一条消息显示评价
const isShowCopy = computed(() => {
  // 最后一条消息 机器人的消息 消息类型为1 不是正在发送
  return (
    props.index === props.messageLength - 1 && // 最后一条消息
    props.msg.member == "rebot" && // 消息是可评价的类型---1可以评价 2不可以评价
    !isCustomerMessage.value // 判断是用户还是机器人---true为用户false为机器人
  );
});
// 检查是否为用户消息
const isCustomerMessage = computed(() => props.msg.member == "user");
// 计算消息项的类
const messageItemClasses = computed(() => ({
  "user-message-item": isCustomerMessage.value === true,
  "robot-message-item": isCustomerMessage.value === false,
}));

// 不是最后一条消息,悬浮时显示评价
const isShowHoverCopy = computed(() => {
  return !isShowCopy.value && props.index !== props.messageLength - 1;
});
// 等待机器人回复增加动态...
const startLoadingAnimation = () => {
  const dots = [".", "..", "..."];
  let dotIndex = 0;
  interval = window.setInterval(() => {
    dotIndex = (dotIndex + 1) % dots.length;
    textMessage.value = dots[dotIndex];
  }, 500);
};
// 切换tab -- true推荐问题 false常见问题
const switchTab = (item) => {
  tabType.value = item;
};
// 点击回答参考信息
const handleToLink = (item) => {
  quoteModalRef.value &&
    quoteModalRef.value.showPopup({
      item,
    });
};
// 关闭评价面板
const onCancel = () => {
  showPopup.value = false; // 关闭评价面板
  showHint.value = false; // 关闭提示信息
};
// 点赞
const handlePraise = (item, score, Comment) => {
  // 点踩的时候反馈的内容为空是显示提示信息让用户填写评价
  if (!score && feedbackContent.value.trim() == "") {
    showHint.value = true;
    return;
  }
  axios
    .post("/BDD/API/AI/studio/cherry/moe_trace_score", {
      runId: item.runId,
      score,
      Comment,
    })
    .then((res) => {
      console.log("评价成功", res.data);
      if (score) {
        activeStatus.value = true;
      } else {
        activeStatus.value = false;
        showPopup.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
// 获取跟踪使用情况
const getTraceUsage = (item) => {
  axios
    .post("/BDD/API/AI/studio/cherry/moe_trace_usage", {
      runId: item.runId,
    })
    .then((res) => {
      console.log("token信息", res.data);
      tokenTotal.value = `${
        "input:" +
        res.data.input +
        "\n" +
        "output:" +
        res.data.output +
        "\n" +
        "total:" +
        res.data.total +
        "\n" +
        "totalPrice:" +
        res.data.totalPrice
      }`;
      item.tokenTotal = tokenTotal.value;
    })
    .catch((err) => {
      console.log(err);
    });
};
// 鼠标移入时获取当前消息使用情况
const handleMouseOver = (item) => {
  clearTimeout(timeout.value);
  if (!item.tokenTotal) {
    timeout.value = setTimeout(() => {
      getTraceUsage(item);
    }, 500);
  }
};
// 鼠标移出对话的消息内容上时
const handleMouseLeave = () => {
  tokenTotal.value = "";
};
// 发送消息
const sendTextMessage = (text) => {
  emit("sendTextMessage", text);
  emit("scrollBottom");
};
const numberToEnglish = (num) => {
  const units = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "ten",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  if (num === 0) return "zero";
  if (num < 0) return "minus " + numberToEnglish(Math.abs(num));

  let result = "";

  // 处理百位数
  if (num >= 100) {
    result += units[Math.floor(num / 100)] + " hundred ";
    num %= 100;
  }

  // 处理十位数和个位数
  if (num >= 20) {
    result +=
      tens[Math.floor(num / 10)] + (num % 10 ? "-" + units[num % 10] : "");
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += units[num];
  }

  return result.trim();
};

onMounted(() => {
  // 创建等待机器人回复增加动态...
  startLoadingAnimation();
});
// 清除等待机器人回复增加动态...
onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.message-item-left {
  width: 34px;
  height: 34px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
}
/* 消息项基础样式 */
.message-item {
  display: flex;
  margin: 24px 12px;
}

/* 消息体容器 */
.message-item .message-item-body {
  flex: 1;
  padding-left: 8px;
  overflow-wrap: break-word;
  min-width: 0; /* 关键 */
}

/* 头像样式 */
.message-item .avatar {
  display: block;
  width: 40px;
  height: 40px;
  font-size: 29px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

/* 消息图片 */
.message-item .msg-img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}

/* 消息内容区域 */
.message-item .message-content {
  margin-right: 40px;
}

/* 悬停时显示复制工具 */
.message-item .message-content:hover .hover-copy-tool-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 文本消息样式 */
.message-item .text-message {
  position: relative;
  display: inline-block;
  padding: 12px;
  font-size: 14px;
  /* min-height: 44px; */
  line-height: 20px;
  text-align: left;
  font-weight: 400;
  white-space: pre-wrap;
  word-break: break-all;
  max-width: 100%;
}

/* 机器人消息特殊样式 */
.message-item.robot-message-item .text-message {
  color: #1a1a1a;
  background-color: #ffffff;
  border-radius: 4px 16px 16px 16px;
}
.message-item.robot-message-item .hover-copy-tool-block {
  right: -12px;
  padding-left: 6px;
}

/* 用户消息特殊样式 */
.message-item.user-message-item {
  flex-direction: row-reverse;
}
.message-item.user-message-item .message-item-body {
  text-align: right;
  padding-left: 0;
  padding-right: 8px;
}
.message-item.user-message-item .message-content {
  margin-left: 40px;
  margin-right: 0;
}
.message-item.user-message-item .text-message {
  border-radius: 16px 4px 16px 16px;
  /* color: #f5f9ff; */
  background-color: white;
}
.message-item.user-message-item .hover-copy-tool-block {
  left: -12px;
}

/* 欢迎消息特殊样式 */
.message-item .welcome-message-item .text-message {
  width: 100%;
  border-radius: 4px 16px 0 0;
}

/* 问题列表样式 */
.message-item .question-list {
  border: 1px solid #edeff2;
  border-radius: 0 0 16px 16px;
  background-color: #fff;
  margin-top: 8px;
  padding: 6px;
}
.message-item .question-list .message-tabs {
  display: flex;
  align-items: center;
  color: #8c8c8c;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}
.message-item .question-list .message-tabs {
  cursor: pointer;
}
.message-item .question-list .message-tabs .v-line {
  width: 1px;
  height: 14px;
  background: #d9d9d9;
  margin: 0 16px;
}
.message-item .question-list .message-tabs .active {
  font-weight: 800;
}
.message-item .question-list .question-item {
  line-height: 20px;
  padding: 6px 12px;
  margin: 6px;
  font-size: 14px;
  font-weight: 400;
  border-bottom: 1px solid #edeff2;
  background-color: #edefff;
  color: #2475fc;
  cursor: pointer;
}
.message-item .question-list .question-item:last-child {
  border-bottom: 0;
}
.message-item .question-list .question-item:hover {
  color: #4d94ff;
}

/* 操作区域样式 */
.message-item .operation {
  display: flex;
  align-items: center;
  justify-content: right;
}
.message-item .operation .operation-right {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
}

/* 点赞按钮 */
.message-item .praise-block {
  text-align: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  opacity: 1;
}
.message-item .praise-block:hover {
  background: #f2f4f7;
}

.message-item .trample-block {
  text-align: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  opacity: 1;
}

.message-item .trample-block:hover {
  background: #f2f4f7;
}
.message-item .hover-copy-tool-block {
  padding: 0;
  display: none;
  position: absolute;
  bottom: -12px;
  height: 28px;
  max-width: 89px;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #d8dde6;
  border-radius: 4.5px;
  transition: all 0.5s ease;
}

.message-item .hover-copy-tool-block .operation-right {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
}
.feedback-modal {
  padding: 16px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--Conditional-pop-over, #fff);
  box-shadow:
    0 6px 30px 5px #0000000d,
    0 16px 24px 2px #0000000a,
    0 8px 10px -5px #00000014;
}

.feedback-modal .modal-title {
  color: #262626;
  text-align: left;
  font-family: "PingFang SC";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 4px;
}

.feedback-modal .btn-box {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.feedback-modal .model-btn {
  width: 64px;
  height: 32px;
  display: flex;
  padding: 5px 16px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
}
.text-input {
  width: 245px;
  height: 98px;
  display: flex;
  padding: 5px 12px;
  color: #666;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 2px;
  border: 1px solid var(--Neutral-5, #d9d9d9);
  background: var(--Neutral-1, #fff);
}
/* 答案参考区块 */
.answer-reference-box {
  border-top: 1px solid #edeff2;
  padding-top: 12px;
  margin-top: 8px;
}
.answer-reference-box .title-block {
  color: #7a8699;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
}
.answer-reference-box .list-item {
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #164799;
}

/* 思考标签容器 */
.thinking-label-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.thinking-label-wrapper .thinking-label {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  background: #e4e6eb;
  cursor: pointer;
  transition: all 0.2s;
}
.thinking-label-wrapper .thinking-label:hover {
  background: #d8dde6;
}
.thinking-label-wrapper .thinking-label .think-icon,
.thinking-label-wrapper .thinking-label .loading {
  margin-right: 8px;
  font-size: 16px;
  color: #262626;
}
.thinking-label-wrapper .thinking-label .label-text {
  font-size: 14px;
  font-weight: 400;
  color: #262626;
}
.thinking-label-wrapper .thinking-label .arrow-down {
  margin-left: 8px;
  font-size: 16px;
  color: #262626;
  cursor: pointer;
}
.thinking-label-wrapper .tip {
  margin-left: 8px;
  font-size: 16px;
  color: #8c8c8c;
  cursor: pointer;
}
.thinking-label-wrapper.reasoning_open .down-arrow {
  transform: rotate(180deg);
}

/* 思考内容区域 */
.thinking-content {
  position: relative;
  line-height: 22px;
  padding-bottom: 16px;
  padding-left: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #8c8c8c;
  border-bottom: 1px solid #edeff2;
}
.thinking-content::before {
  display: block;
  position: absolute;
  content: "";
  left: 0;
  top: 4px;
  bottom: 20px;
  width: 4px;
  background-color: #d9d9d9;
}
</style>
