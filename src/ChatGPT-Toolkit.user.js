// ==UserScript==
// @name         ChatGPT Toolkit
// @source       https://github.com/poychang/TampermonkeyUserscripts/raw/main/src/ChatGPT-Toolkit.user.js
// @namespace    https://github.com/poychang/TampermonkeyUserscripts/raw/main/src/ChatGPT-Toolkit.user.js
// @updateURL    https://github.com/poychang/TampermonkeyUserscripts/raw/main/src/ChatGPT-Toolkit.user.js
// @downloadURL  https://github.com/poychang/TampermonkeyUserscripts/raw/main/src/ChatGPT-Toolkit.user.js
// @version      0.1
// @description  提升 ChatGPT 網站的使用體驗，提供一些好用功能。像是自動從 URL 填入提示、在回應的地方出現自動提示按鈕
// @author       You
// @match        *://chat.openai.com/chat*
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    let button;
    let textarea;

    const AutoFillFromURI = () => {

        // 解析 hash 中的查詢字串並取得所需的參數
        var hash = location.hash.substring(1);
        if (!hash) return;

        var params = new URLSearchParams(hash);

        // 解析參數
        let prompt = params.get('prompt')
        .replace(/\r/g, '')
        .replace(/\s+$/g, '')
        .replace(/\n{3,}/sg, '\n\n')
        .replace(/^\s+|\s+$/sg, '')
        let submit = params.get("autoSubmit");

        let autoSubmit = false;
        if (submit == '1' || submit == 'true') {
            autoSubmit = true
        }

        if (prompt) {
            textarea.value = prompt;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length); //將選擇範圍設定為文本的末尾
            textarea.scrollTop = textarea.scrollHeight; // 自動捲動到最下方

            if (autoSubmit) {
                button.click();
            }

            history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
    }

    const AddInitPrompButton = () =>{
        let defaultManualSubmitText = [];

        defaultManualSubmitText.push({ id: 'C# Expert', text: "C# Expert", value: "你現在是一個C#/.NET專家，請使用繁體中文和我討論開發程式的問題。接下來，請等我提供下個提示之後，你再回應。" });
        defaultManualSubmitText.push({ id: 'IT Expert', text: "IT Expert", value: "I want you to act as an IT Expert. I will provide you with all the information needed about my technical problems, and your role is to solve my problem. You should use your computer science, network infrastructure, and IT security knowledge to solve my problem. Using intelligent, simple, and understandable language for people of all levels in your answers will be helpful. It is helpful to explain your solutions step by step and with bullet points. Try to avoid too many technical details, but use them when necessary. I want you to reply with the solution, not write any explanations." });
        defaultManualSubmitText.push({ id: 'Midjourney Prompt Generator', text: "Midjourney Prompt Generator", value: "我希望你能擔任Midjourney人工智慧程式的提示生成器，你的工作是提供詳細且富有創意的描述，以激發AI生成獨特且有趣的圖像。請牢記，AI能夠理解多種語言並解釋抽象的概念，因此請盡可能想像豐富、描述詳細。例如，你可以描述一個未來城市的場景，或是充滿奇怪生物的超現實風景。描述得越詳細、越富有想像力，生成的圖像就越有趣。接下來，請等我提供下個提示之後，你再回應。" });

        let globalButtons = [];
        let buttonsArea;
        let talkBlockToInsertButtons;

        const main = document.querySelector("body");

        let mutationObserverTimer = undefined;
        const obs = new MutationObserver(() => {

            // 尋找新聊天記錄的空白區，用來插入按鈕
            const talkBlocks = document.querySelectorAll(
                ".text-4xl.font-semibold.text-center.text-gray-200.dark\\:text-gray-600.ml-auto.mr-auto.mb-10.sm\\:mb-16.flex.gap-2.items-center.justify-center.flex-grow:not(.custom-buttons-area)"
            );
            if (!talkBlocks || !talkBlocks.length) {
                return;
            }

            if (talkBlockToInsertButtons != talkBlocks[talkBlocks.length - 1]) {
                if (buttonsArea) {
                    // 重新將按鈕區和按鈕移除
                    buttonsArea.remove();
                }
            }

            clearTimeout(mutationObserverTimer);
            mutationObserverTimer = setTimeout(() => {

                // 先停止觀察，避免自訂畫面變更被觀察到
                stop();

                if (talkBlockToInsertButtons != talkBlocks[talkBlocks.length - 1]) {
                    // 要被插入按鈕的區塊
                    talkBlockToInsertButtons = talkBlocks[talkBlocks.length - 1];

                    // 重新建立回應按鈕
                    rebuild_buttons();
                }

                // 重新開始觀察
                start();

            }, 600);

        });

        function rebuild_buttons() {

            // remove custom buttons
            globalButtons = [];

            // create a new buttons area
            buttonsArea = document.createElement("div");
            buttonsArea.classList = "custom-buttons-area flex items-center justify-center gap-2";
            buttonsArea.style.overflowY = "auto";
            buttonsArea.style.display = "flex";
            buttonsArea.style.flexWrap = "wrap";
            buttonsArea.style.paddingTop = 0;
            buttonsArea.style.paddingLeft = "calc(30px + 0.75rem)";
            talkBlockToInsertButtons.before(buttonsArea);

            // add buttons
            defaultManualSubmitText.forEach((item) => {

                let lastText = talkBlockToInsertButtons.innerText;

                const button = document.createElement("button");
                button.style.border = "1px solid rgba(129, 120, 106, 0.5)";
                button.style.borderRadius = "5px";
                button.style.padding = "0.5rem 1rem";
                button.style.margin = "0.5rem";

                button.innerText = item.text;
                button.addEventListener("click", () => {

                    // 填入 prompt
                    const textarea = document.querySelector("textarea");
                    textarea.value = item.value;
                    textarea.dispatchEvent(new Event("input", { bubbles: true }));
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length); //將選擇範圍設定為文本的末尾
                    textarea.scrollTop = textarea.scrollHeight; // 自動捲動到最下方

                    // 預設的送出按鈕
                    const button = textarea.parentElement.querySelector("button:last-child");
                    button.click();

                });

                buttonsArea.append(button);
                globalButtons.push(button);
            });
        }

        const start = () => {
            obs.observe(main.parentElement, {
                childList: true,
                attributes: true,
                subtree: true,
            });
        };

        const stop = () => {
            obs.disconnect();
        };

        start();
    };

    const StartMonitoringResponse = () => {

        const defaultManualSubmitText = [
          // continue
          { text: "繼續", value: "繼續" },
          // exemplify
          { text: "舉例說明", value: "請舉例說明" },
          // expand
          { text: "提供細節", value: "請提供更多細節說明" },
          // explain
          { text: "解釋清楚", value: "請用更清楚的方式解釋" },
          // list explain
          { text: "條列總結", value: "請以條列式的方式總結上述內容" },
          // rewrite
          { text: "重寫內容", value: "請重寫上述內容" },
          // short
          { text: "簡化內容", value: "請用簡短的方式說明上述內容" },
          // translate to TC
          { text: "翻譯成繁中", value: "請將上述內容翻譯成流暢的繁體中文" },
          // translate to EN
          { text: "翻譯成英文", value: "請將上述內容翻譯成流暢的英文" },
        ];

        let globalButtons = [];
        let buttonsArea;
        let talkBlockToInsertButtons;

        const main = document.querySelector("body");

        let mutationObserverTimer = undefined;
        const obs = new MutationObserver(() => {

            // 尋找聊天記錄的最後一筆，用來插入按鈕
            const talkBlocks = document.querySelectorAll(
                ".text-base.gap-4.md\\:gap-6.m-auto.md\\:max-w-2xl.lg\\:max-w-2xl.xl\\:max-w-3xl.p-4.md\\:py-6.flex.lg\\:px-0:not(.custom-buttons-area)"
            );
            if (!talkBlocks || !talkBlocks.length) {
                return;
            }

            if (talkBlockToInsertButtons != talkBlocks[talkBlocks.length - 1]) {
                if (buttonsArea) {
                    // 重新將按鈕區和按鈕移除
                    buttonsArea.remove();
                }
            }

            clearTimeout(mutationObserverTimer);
            mutationObserverTimer = setTimeout(() => {

                // 先停止觀察，避免自訂畫面變更被觀察到
                stop();

                if (talkBlockToInsertButtons != talkBlocks[talkBlocks.length - 1]) {
                    // 要被插入按鈕的區塊
                    talkBlockToInsertButtons = talkBlocks[talkBlocks.length - 1];

                    // 重新建立回應按鈕
                    rebuild_buttons();
                }

                // 重新開始觀察
                start();

            }, 600);

            function rebuild_buttons() {

                // remove custom buttons
                globalButtons = [];

                // create a new buttons area
                buttonsArea = document.createElement("div");
                buttonsArea.classList = "custom-buttons-area text-base m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0";
                buttonsArea.style.overflowY = "auto";
                buttonsArea.style.display = "flex";
                buttonsArea.style.flexWrap = "wrap";
                buttonsArea.style.paddingTop = 0;
                buttonsArea.style.paddingLeft = "calc(30px + 0.75rem)";
                talkBlockToInsertButtons.after(buttonsArea);

                // add buttons
                defaultManualSubmitText.forEach((item) => {

                    let lastText = talkBlockToInsertButtons.innerText;

                    const isPunctuation = (str) => {
                        const punctuationRegex = /^[\p{P}\p{S}]$/u;
                        return punctuationRegex.test(str);
                    }

                    // 如果回應的最後一個字元是個標點符號，就不需要顯示「繼續」按鈕
                    if (item.id == 'continue') {
                        let lastChar = lastText.charAt(lastText.length - 1);
                        if (isPunctuation(lastChar)) {
                            // 如果最後一個字元是逗號，通常代表要繼續，因為句子尚未完成
                            if (lastChar === ',' || lastChar === '，') {
                                // 如果是逗號，通常代表要繼續，因為句子尚未完成
                            } else {
                                // 如果最後一個字元是「。」或「！」或「？」，則不顯示「繼續」按鈕
                                return;
                            }
                        } else {
                            // 如果不是標點符號，就需要顯示「繼續」按鈕
                        }
                    }

                    const button = document.createElement("button");
                    button.style.border = "1px solid rgba(129, 120, 106, 0.5)";
                    button.style.borderRadius = "5px";
                    button.style.padding = "0.5rem 1rem";
                    button.style.margin = "0.5rem";

                    button.innerText = item.text;
                    button.addEventListener("click", () => {

                        // 填入 prompt
                        const textarea = document.querySelector("textarea");
                        textarea.value = item.value;
                        textarea.dispatchEvent(new Event("input", { bubbles: true }));
                        textarea.focus();
                        textarea.setSelectionRange(textarea.value.length, textarea.value.length); //將選擇範圍設定為文本的末尾
                        textarea.scrollTop = textarea.scrollHeight; // 自動捲動到最下方

                        // 預設的送出按鈕
                        const button = textarea.parentElement.querySelector("button:last-child");
                        button.click();

                    });

                    buttonsArea.append(button);
                    globalButtons.push(button);
                });
            }

        });

        const start = () => {
            obs.observe(main.parentElement, {
                childList: true,
                attributes: true,
                subtree: true,
            });
        };

        const stop = () => {
            obs.disconnect();
        };

        start();
    };

    const it = setInterval(() => {
        textarea = document.activeElement;
        if (textarea.tagName === 'TEXTAREA' && textarea.nextSibling.tagName === 'BUTTON') {

            // 預設的送出按鈕
            button = textarea.parentElement.querySelector("button:last-child");

            // 自動從 URL 填入提詞(Prompt)
            AutoFillFromURI();

            AddInitPrompButton();

            // 自動監控所有 ChatGPT 回應，用以判斷何時要顯示回應按鈕
            StartMonitoringResponse();

            clearInterval(it);
        };
    }, 60);

})();
