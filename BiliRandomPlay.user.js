// ==UserScript==
// @name         B站分P视频随机播放
// @namespace    https://github.com/GyanguStar
// @version      0.3.0
// @description  B站分P视频随机播放
// @author       GyanguStar & 琴梨梨
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @homepage     https://github.com/GyanguStar/BiliRandomPlay
// @supportURL   https://github.com/GyanguStar/BiliRandomPlay
// @license      GPLv3
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';
    GM_registerMenuCommand("调整视频音量", () => {
        const curVolume = Math.round(document.querySelector("bwp-video").volume * 100)
        const volumeStr = prompt("请输入音量(0-100)", curVolume)
        if (volumeStr === '') return
        let volume = Number(volumeStr)
        if (!Number.isNaN(volume) && volume >= 0 && volume <= 100) {
            document.querySelector("bwp-video").volume = volume / 100
        }
    });
    if (document.getElementById("multi_page")) {
        const utils = {
            parseInfo: text => {
                return {
                    now: text.substr(1, text.indexOf("/") - 1),
                    total: text.substr(text.indexOf("/") + 1, text.length - text.indexOf("/") - 2)
                }
            },
            random: (min, max) => {
                return Math.round(Math.random() * (max - min)) + min;
            }
        }
        let current = utils.parseInfo(document.getElementsByClassName("cur-page")[0].innerText);
        let next = 0;
        let noClick = true;
        //接管pushState来替换分P
        history.pushState.bind(history)
        const originPush = history.pushState
        window.history.pushState = (a, b, c) => {
            if (c.startsWith("/video")) {
                c = location.origin + c
            }
            const nextUrl = new URL(c)
            if ((nextUrl.pathname == location.pathname) && switchOn && noClick) {
                const nextParams = new URLSearchParams(nextUrl.search);
                nextParams.set('p', next);
                nextParams.set('random', 'on');
                location.href = nextUrl.pathname + "?" + nextParams.toString();
            } else {
                originPush.call(history, a, b, c)
                searchParams = new URLSearchParams(document.location.search);
            }
        }
        let switchOn = false;
        let searchParams = new URLSearchParams(document.location.search);
        if (searchParams.get("random") == "on") {
            switchOn = true
        }
        setTimeout(() => {
            const randomSpan = document.createElement("span")
            randomSpan.className = "next-button"
            if (switchOn) {
                randomSpan.innerHTML = '<span class="txt">随机播放</span> <span id="random-switch" class="switch-button on" style="margin-right: 4px;"></span>'
            }
            else {
                randomSpan.innerHTML = '<span class="txt">随机播放</span> <span id="random-switch" class="switch-button" style="margin-right: 4px;"></span>'
            }
            document.querySelector("#multi_page > div.head-con > div.head-right").insertBefore(randomSpan, document.querySelector("#multi_page > div.head-con > div.head-right > span.next-button"))
            document.querySelector('#random-switch').addEventListener("click", function () {
                switchOn = !switchOn
                if (switchOn) {
                    this.className = "switch-button on"
                }
                else {
                    this.className = "switch-button"
                }
                random()
            })
            random();
            document.querySelector("#multi_page > div.cur-list").addEventListener("click", () => {
                noClick = false;
                setTimeout(() => { noClick = true; }, 500)
            }, true);
        }, 5000);
        const random = () => {
            if (switchOn) {
                next = utils.random(1, current.total)
                searchParams.set('random', 'on');
                originPush.call(history, {}, '', location.pathname + "?" + searchParams.toString())
            } else {
                searchParams.delete('random');
                originPush.call(history, {}, '', location.pathname + "?" + searchParams.toString())
            }
        }
    }
})();
