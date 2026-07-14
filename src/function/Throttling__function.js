"use strict"

 /**
  * 时间戳版节流函数
  * 
  * 原理：记录上次执行时间，当前时间和上次差值超过间隔才执行
  * 
  * 类比：拖动一张图片，拖动的过程中节流函数任然在执行，如果没有这个节流函数，
  * 则cpu运行爆满导致卡顿。节流函数就是解决这个刷新的问题，
  * 把之前拖动图片要刷新好几回，改为拖动图片过程中，按时间执行函数刷新
  * 
  * 属于是人在干活，也在执行
  * 
  * 特点：事件触发时只要到时间就立刻执行，开头一定会触发一次，拖拽/滚动流畅度更好
  * 
  * @param {Function} fn 要节流的业务函数
  * @param {number} wait 节流间隔毫秒数
  * @returns {Function} 包装后的节流函数
  * 
  */
 function throttle(fn, wait) {
   // 闭包私有变量：保存上一次执行的时间戳，不会被外部修改
   let lastTime = 0;

   // 返回包装后的事件处理函数
   return function (...args) {
     // 获取当前最新时间戳（毫秒）
     const now = new Date().getTime();

     // 判断：当前时间 - 上次执行时间 > 设定间隔，代表冷却完成，可以执行
     if (now - lastTime > wait) {
       // 更新上次执行时间为当前时间
       lastTime = now;
       
       // 执行原函数，绑定正确this、透传所有事件参数
       return fn.apply(this, args);
     }
     // 冷却期内，直接不执行，无返回
   }
 }
