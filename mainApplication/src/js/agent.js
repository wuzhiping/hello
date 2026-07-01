import { of, Observable, timer } from "rxjs";
import { ajax } from "rxjs/ajax";
import { take, map, catchError, switchMap } from "rxjs/operators";

// url = "/BDD/API/AI/studio/cherry/moe";

// payload = {}

function runAgentSSE(url, payload) {
  return new Observable((observer) => {
    let eventSource;
    let cancelUrl = null;

    // 请求任务开始
    const requestSub = ajax({
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .pipe(
        map((res) => res.response),
        catchError((err) => {
          observer.error(err);
          return of(null);
        }),
      )
      .subscribe((responseData) => {
        if (!responseData) return;

        // ? 如果返回中包含 result，直接发出并完成，不建立 SSE
        if (responseData.output !== undefined) {
          observer.next(responseData.output);
          observer.complete();
          return;
        }
        // 如果status == 409
        if (responseData.status != 200) {
          observer.error(responseData.status);
          return;
        }

        // 保存 cancel URL 供之后使用
        cancelUrl = responseData.api + "cancel";

        // 建立 SSE 连接
        eventSource = new EventSource(responseData.api + "sse");

        eventSource.addEventListener("close", function (event) {
          console.log("关闭通讯");
          eventSource.close();
          console.log(eventSource.readyState);
          observer.complete();
        });

        eventSource.onopen = () => {
          console.log("SSE 连接已建立");
        };

        const streamCache = {};
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);

            if (
              parsed &&
              parsed.status &&
              parsed.status == "streaming" &&
              parsed.id != null
            ) {
              const id = parsed.id;
              if (!streamCache[id]) {
                streamCache[id] = { ...parsed };
              } else {
                streamCache[id].txt += parsed.txt;
                streamCache[id].index = parsed.index || 0;
              }
              observer.next(streamCache[id]);
            } else {
              observer.next(parsed); // fallback
            }
          } catch (e) {
            observer.next(event.data); // 不是 JSON，直接推送
          }
        };

        eventSource.onerror = (err) => {
          console.error("SSE 错误:", err);
          eventSource.close();
          observer.error(err);
        };
      });

    // 返回 teardown 清理函数（在 unsubscribe 时触发）
    return () => {
      console.log("清理资源中...");

      if (eventSource) {
        eventSource.close();
        console.log("SSE 已关闭");
      }

      // 调用 cancel API（如果之前拿到过）
      if (cancelUrl) {
        timer(2000)
          .pipe(
            // 延迟 2 秒
            switchMap(() =>
              ajax.getJSON(cancelUrl).pipe(
                take(1),
                catchError((err) => {
                  console.error("取消请求失败:", err);
                  return of(null);
                }),
              ),
            ),
          )
          .subscribe(() => {
            console.log("已发送取消请求到:", cancelUrl);
          });
      }

      // 取消原始 AJAX 请求（如果还在进行）
      requestSub.unsubscribe();
    };
  });
}

function runAgentWS(url, payload) {
  return new Observable((observer) => {
    let ws;
    let cancelUrl = null;
    let runId = null;

    const requestSub = ajax({
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .pipe(
        map((res) => res.response),
        catchError((err) => {
          observer.error(err);
          return of(null);
        }),
      )
      .subscribe((responseData) => {
        if (!responseData) return;

        // 若是立即返回结果，直接输出结果，完成 Observable
        if (responseData.output !== undefined) {
          observer.next(responseData.output);
          observer.complete();
          return;
        }
        // 如果status == 409
        if (responseData.status != 200) {
          observer.error(responseData.status);
          return;
        }

        // 提取 cancel API 和 run_id（用于建立 WS）
        cancelUrl = responseData.api + "cancel";
        runId = responseData.run_id;

        // 构建 WebSocket 地址
        const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${responseData.api}ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket 已连接");
        };

        const streamCache = {};
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data === "CLOSE") {
              console.log("收到关闭信号，断开 WebSocket");
              ws.close();
              observer.complete();

              // 调用取消 API
              if (cancelUrl) {
                ajax
                  .getJSON(cancelUrl)
                  .pipe(
                    take(1),
                    catchError((err) => {
                      console.error("取消请求失败:", err);
                      return of(null);
                    }),
                  )
                  .subscribe(() => {
                    console.log("已发送取消请求:", cancelUrl);
                  });
              }

              return;
            }

            const parsed = data;

            if (
              parsed &&
              parsed.status &&
              parsed.status == "streaming" &&
              parsed.id != null
            ) {
              const id = parsed.id;
              if (!streamCache[id]) {
                streamCache[id] = { ...parsed };
              } else {
                streamCache[id].txt += parsed.txt;
                streamCache[id].index = parsed.index || 0;
              }
              observer.next(streamCache[id]);
            } else {
              observer.next(data); // fallback
            }
          } catch (err) {
            console.error("WebSocket 消息解析失败:", err);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket 错误:", err);
          observer.error(err);
          ws.close();
        };

        ws.onclose = (event) => {
          console.log("WebSocket 连接关闭，代码:", event.code);
          observer.complete();
        };
      });

    // teardown 清理函数：取消订阅时执行
    return () => {
      console.log("正在清理 WebSocket 资源...");
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      if (cancelUrl) {
        timer(2000)
          .pipe(
            switchMap(() =>
              ajax.getJSON(cancelUrl).pipe(
                take(1),
                catchError((err) => {
                  console.error("取消请求失败:", err);
                  return of(null);
                }),
              ),
            ),
          )
          .subscribe(() => {
            console.log("发出 cancel 请求");
          });
      }

      requestSub.unsubscribe();
    };
  });
}

// const sub$ = runAgentWS('/BDD/API/AI/studio/cherry/moe', {
//     agent_id: 'demo.loop',
//     token: {},
//     demo: true,
//     share: {}
// }).subscribe({
//     next(data) {
//         console.log('收到数据:', data);
//     },
//     error(err) {
//         console.error('错误:', err);
//     },
//     complete() {
//         console.log('任务已完成');
//     }
// });

// ?? 只在你手动取消订阅时才调用 cancel 接口
// setTimeout(() => {
//     sub$.unsubscribe(); // cancel API 调用
// }, 3000);

// module.exports = { runAgentSSE, runAgentWS };

// const sub = agent_run('/BDD/API/AI/studio/cherry/moe', {}).subscribe({
//     next(data) {
//         console.log('收到数据:', data);
//     },
//     error(err) {
//         console.error('错误:', err);
//     },
//     complete() {
//         console.log('任务已完成');
//     }
// });

// // ?? 只在你手动取消订阅时才调用 cancel 接口
// setTimeout(() => {
//     sub.unsubscribe(); // 会触发 SSE 关闭 + cancel API 调用
// }, 5000);
export { runAgentSSE, runAgentWS };
