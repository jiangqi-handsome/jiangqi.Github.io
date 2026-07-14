"use strict"

function throttle(fn, wait) {
    let lastTime = 0; // 私有变量

    return function (...args) {
        const now = new Date().getTime();

        if (now - lastTime > wait) {
            lastTime = now;

            return fn.apply(this.args);
        }
    };
}
