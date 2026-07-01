<style>
.vue-markdown {
  white-space: initial;
  width: 100%;

  /* ============== 文本样式 (SGR) ============== */
  .ansi1 {
    font-weight: bold;
  } /* 粗体 [1m */
  .ansi2 {
    font-weight: lighter;
  } /* 淡色 [2m */
  .ansi3 {
    font-style: italic;
  } /* 斜体 [3m */
  .ansi4 {
    text-decoration: underline;
  } /* 下划线 [4m */
  .ansi5 {
    text-decoration: blink;
  } /* 闪烁 [5m */
  .ansi6 {
    text-decoration: blink;
  } /* 快速闪烁 [6m */
  .ansi7 {
    text-decoration: reverse;
  } /* 反显 [7m */
  .ansi8 {
    text-decoration: hidden;
  } /* 隐藏 [8m */
  .ansi9 {
    text-decoration: line-through;
  } /* 删除线 [9m */

  /* ============== 标准前景色 30-37 ============== */
  .ansi30 {
    color: #000316;
  } /* 黑色 */
  .ansi31 {
    color: #aa0000;
  } /* 红色 */
  .ansi32 {
    color: #00aa00;
  } /* 绿色 */
  .ansi33 {
    color: #aa5500;
  } /* 黄色/棕色 */
  .ansi34 {
    color: #0000aa;
  } /* 蓝色 */
  .ansi35 {
    color: #aa00aa;
  } /* 洋红 */
  .ansi36 {
    color: #00aaaa;
  } /* 青色 */
  .ansi37 {
    color: #aaaaaa;
  } /* 白色/灰色 */

  /* ============== 标准背景色 40-47 ============== */
  .ansi40 {
    background-color: #000316;
  } /* 黑底 */
  .ansi41 {
    background-color: #aa0000;
  } /* 红底 */
  .ansi42 {
    background-color: #00aa00;
  } /* 绿底 */
  .ansi43 {
    background-color: #aa5500;
  } /* 黄底 */
  .ansi44 {
    background-color: #0000aa;
  } /* 蓝底 */
  .ansi45 {
    background-color: #aa00aa;
  } /* 洋红底 */
  .ansi46 {
    background-color: #00aaaa;
  } /* 青底 */
  .ansi47 {
    background-color: #aaaaaa;
  } /* 白底 */

  /* ============== 高亮/明亮前景色 90-97 ============== */
  .ansi90 {
    color: #7f7f7f;
  } /* 亮黑/深灰 [90m */
  .ansi91 {
    color: #ff0000;
  } /* 亮红 */
  .ansi92 {
    color: #00ff00;
  } /* 亮绿 */
  .ansi93 {
    color: #ffff00;
  } /* 亮黄 */
  .ansi94 {
    color: #5c5cff;
  } /* 亮蓝 */
  .ansi95 {
    color: #ff00ff;
  } /* 亮洋红 */
  .ansi96 {
    color: #00ffff;
  } /* 亮青 */
  .ansi97 {
    color: #ffffff;
  } /* 亮白 */

  /* ============== 高亮/明亮背景色 100-107 ============== */
  .ansi100 {
    background-color: #555555;
  } /* 亮黑底 */
  .ansi101 {
    background-color: #ff5555;
  } /* 亮红底 */
  .ansi102 {
    background-color: #55ff55;
  } /* 亮绿底 */
  .ansi103 {
    background-color: #ffff55;
  } /* 亮黄底 */
  .ansi104 {
    background-color: #5555ff;
  } /* 亮蓝底 */
  .ansi105 {
    background-color: #ff55ff;
  } /* 亮洋红底 */
  .ansi106 {
    background-color: #55ffff;
  } /* 亮青底 */
  .ansi107 {
    background-color: #ffffff;
  } /* 亮白底 */

  /* ============== 重置 ============== */
  .ansi0 {
    color: inherit;
    background-color: inherit;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
  } /* 重置 [0m */

  /* ============== 组合样式示例 ============== */
  .ansi1.ansi31 {
    /* 粗体红色 */
  }
  .ansi1.ansi4.ansi31 {
    /* 粗体下划线红色 */
  }
  .ansi3.ansi90 {
    /* 斜体灰色 - 你的案例 */
  }

  /* ============== 暗色模式适配 ============== */
  @media (prefers-color-scheme: dark) {
    .ansi30 {
      color: #767676;
    } /* 暗色下黑色变灰 */
    .ansi37 {
      color: #c0c0c0;
    } /* 白色更亮 */
    .ansi90 {
      color: #a0a0a0;
    } /* 亮灰更浅 */
  }

  ul,
  ol {
    list-style-type: circle;
    margin-block-start: 0px;
    margin-block-end: 0px;
    margin-left: 10px;
  }
  ol {
    display: block;
    list-style-type: decimal;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;
    unicode-bidi: isolate;
  }
  img {
    /* width: auto; */
    width: 600px;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    display: block;
    margin-top: 8px;
  }
  p:last-child {
    margin-bottom: 0 !important;
  }
  div:last-child {
    margin-bottom: 0 !important;
  }
  /* sub标签的样式 */
  sub {
    display: inline-block;
    height: 16px;
    min-width: 16px;
    text-align: center;
    line-height: 16px;
    border-radius: 50%;
    margin-right: 2px;
    background-color: #e0e0e0;
    vertical-align: baseline !important;
  }
  h1 {
    font-size: large;
    margin-top: 16px;
    margin-bottom: 16px;
  }
  h3 {
    font-size: large;
  }
}
</style>

<template>
  <div class="vue-markdown cherry-markdown" v-html="html"></div>
</template>

<script setup>
// cherry-markdow 配置详解 https://github.com/Tencent/cherry-markdown/wiki/%E9%85%8D%E7%BD%AE%E9%A1%B9%E5%85%A8%E8%A7%A3
import CherryEngine from "cherry-markdown/dist/cherry-markdown.engine.core";
import { computed } from "vue";
// import textParseProcessing from '@/utils/textParseProcessing'

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});

const md = new CherryEngine({
  engine: {
    global: {
      classicBr: true,
      flowSessionContext: true,
    },
    syntax: {
      codeBlock: {
        theme: "dark", // 默认为深色主题
        wrap: true, // 超出长度是否换行，false则显示滚动条
        lineNumber: false, // 默认显示行号
        copyCode: true, // 是否显示“复制”按钮
        editCode: false, // 是否显示“编辑代码”按钮
        changeLang: true, // 是否显示“切换语言”按钮
      },
      autoLink: {
        enableShortLink: false,
      },
      header: {
        anchorStyle: "none",
      },
      link: {
        target: "_blank",
      },
    },
  },
});

const html = computed(() => {
  //   let str = textParseProcessing(props.content)
  let str = props.content;
  var s = md.makeHtml(str);
  return s;
});
</script>
