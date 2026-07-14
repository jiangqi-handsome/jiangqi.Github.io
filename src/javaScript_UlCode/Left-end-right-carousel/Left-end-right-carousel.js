/* =============================================================================
  功能清单：
  1. 鼠标悬浮轮播容器不暂停自动播放
  2. 左右切换按钮独立节流，快速连点无撕裂、互不干扰
  3. 点击按钮/底部圆点触发冷却，防止手动切换后立刻自动连跳两张
  4. 冷却倒计时仅触发一次，狂点不会无限延长暂停时间
  5. 兜底重置节流状态，消除偶发点击卡住的隐性bug
  全部异步仅含宏任务 setTimeout / setInterval，无微任务
============================================================================= */

// ====================== 一、页面DOM元素获取 ======================
// 获取轮播滑动轨道容器，控制左右位移
const track = document.getElementById('sliderTrack');
// 获取所有轮播图片DOM集合
const slides = document.querySelectorAll('.slider__slide');
// 上一张切换按钮
const prevBtn = document.getElementById('prevBtn');
// 下一张切换按钮
const nextBtn = document.getElementById('nextBtn');
// 底部指示圆点存放容器
const dotsContainer = document.getElementById('sliderDots');

// ====================== 二、全局基础配置变量 ======================
// 统计轮播图片总数量
const slideCount = slides.length;
// 记录当前展示图片下标，从0开始计数
let currentIndex = 0;

// ====================== 三、动态生成底部切换指示圆点 ======================
// 根据图片总数循环创建对应个数圆点按钮
for (let i = 0; i < slideCount; i++) {
    // 创建button圆点元素
    const dot = document.createElement('button');
    // 绑定圆点基础样式类名
    dot.className = 'slider__dot';
    // 默认第一个圆点激活高亮
    if (i === 0) dot.classList.add('active');

    // 给单个圆点绑定点击事件
    dot.addEventListener('click', () => {
        // 将当前下标修改为点击圆点对应的序号
        currentIndex = i;
        // 更新轨道位移 + 同步圆点高亮状态
        updateSlider();
        // 触发冷却逻辑，暂停自动播放
        handleClickCool();
    });

    // 将创建完成的圆点插入圆点容器
    dotsContainer.appendChild(dot);
}

// ====================== 四、核心工具函数：更新轮播滑动位置 ======================
/**
 * 功能：修改轨道位移实现图片切换，同步更新底部圆点激活样式
 */
function updateSlider() {
    // 计算轨道横向偏移百分比，单张图片占100%宽度
    const offset = currentIndex * 100;
    // 通过transform控制轨道左右滑动
    track.style.transform = `translateX(-${offset}%)`;

    // 遍历所有圆点，匹配当前下标切换active高亮类
    document.querySelectorAll('.slider__dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

// ====================== 五、图片切换基础逻辑函数 ======================
/**
 * 功能：切换到下一张图片，到末尾则循环回到第一张
 */
function nextSlide() {
    // 下标自增1
    currentIndex++;
    // 判断下标超出图片总数，重置为0（第一张）
    if (currentIndex >= slideCount) currentIndex = 0;
    // 执行位移更新
    updateSlider();
}

/**
 * 功能：切换到上一张图片，到开头则循环跳转到最后一张
 */
function prevSlide() {
    // 下标自减1
    currentIndex--;
    // 判断下标小于0，重置为最后一张图片下标
    if (currentIndex < 0) currentIndex = slideCount - 1;
    // 执行位移更新
    updateSlider();
}

// ====================== 六、自动播放、节流、冷却控制模块（IIFE隔离私有变量） ======================
(function () {
    // 自动轮播循环定时器句柄 setInterval
    let autoTimer = null;
    // 点击后自动播放冷却倒计时句柄 setTimeout
    let coolDownTimer = null;

    // 左右按钮独立节流延时器，分开存储，互不干扰
    let prevThrottleTimer = null;
    let nextThrottleTimer = null;

    // 全局配置常量，统一管理所有延时时间，方便后期修改
    const AUTO_INTERVAL = 2000;    // 自动轮播间隔 2000ms=2秒
    const CLICK_COOL_TIME = 2000;  // 点击后自动播放冷却暂停时长
    const CLICK_THROTTLE = 250;    // 点击节流间隔，优化点击手感，防止画面撕裂

    // 全局冷却标记：true=冷却中，禁止自动播放；false=冷却结束，可自动播放
    let isClickCooling = false;
    // 左右按钮独立节流锁定标记，彻底解决两边点击状态互相干扰卡顿
    let canClickPrev = true;
    let canClickNext = true;

    /**
     * 功能：只清除全局公共定时器（自动轮播、冷却倒计时）
     * 不清理按钮私有节流延时，避免左右按钮状态互相破坏
     */
    function clearGlobalTimer() {
        // 销毁自动轮播循环定时器
        clearInterval(autoTimer);

        // 销毁冷却倒计时定时器
        clearTimeout(coolDownTimer);

        // 定时器变量置空，释放内存
        autoTimer = null;
        coolDownTimer = null;
    }

    /**
     * 功能：启动自动轮播，冷却期间直接禁止执行
     */
    function startAutoPlay() {
        // 判断：如果处于冷却阶段，直接终止函数，不开启自动播放
        if (isClickCooling) return;

        // 清空旧的全局定时器，防止多个自动轮播同时运行
        clearGlobalTimer();

        // 创建循环定时器，定时执行切换下一张
        autoTimer = setInterval(() => nextSlide(), AUTO_INTERVAL);
    }

    /**
     * 功能：点击按钮/圆点后统一执行冷却逻辑，挂载到window供外部圆点调用
     */
    window.handleClickCool = function () {
        // 判断：当前已经在冷却中，直接return，不再新建冷却定时器
        if (isClickCooling) return;

        // 清空自动轮播、旧冷却计时器
        clearGlobalTimer();

        // 开启冷却锁定，锁住自动播放
        isClickCooling = true;

        // 创建冷却倒计时宏任务
        coolDownTimer = setTimeout(() => {
            // 倒计时结束，解锁冷却标记
            isClickCooling = false;

            // 重新启动自动轮播
            startAutoPlay();
        }, CLICK_COOL_TIME);
    }

    /**
     * 功能：下一张按钮节流处理函数，兜底修复节流标记卡死bug
     */
    function throttleNext() {
        // 先清空自身残留节流延时，强制解锁标记，杜绝偶现卡住
        clearTimeout(nextThrottleTimer);
        canClickNext = true;

        // 判断节流锁定状态，锁定则拦截本次点击
        if (!canClickNext) return;

        // 节流上锁，短时间禁止重复点击
        canClickNext = false;

        // 执行切换下一张图片
        nextSlide();

        // 触发冷却逻辑，暂停自动播放
        handleClickCool();

        // 创建节流解锁延时宏任务
        nextThrottleTimer = setTimeout(() => {
            canClickNext = true;
        }, CLICK_THROTTLE);
    }

    /**
     * 功能：上一张按钮节流处理函数，和下一张完全独立隔离
     */
    function throttlePrev() {
        // 清空自身残留节流延时，强制重置标记，解决偶发点击无响应
        clearTimeout(prevThrottleTimer);
        canClickPrev = true;

        // 判断节流锁定，锁定则拦截点击
        if (!canClickPrev) return;

        // 节流上锁
        canClickPrev = false;

        // 执行切换上一张图片
        prevSlide();

        // 触发冷却暂停自动播放
        handleClickCool();

        // 创建节流解锁延时
        prevThrottleTimer = setTimeout(() => {
            canClickPrev = true;
        }, CLICK_THROTTLE);
    }

    // 给下一张按钮绑定节流点击事件
    nextBtn.addEventListener('click', throttleNext);
    
    // 给上一张按钮绑定节流点击事件
    prevBtn.addEventListener('click', throttlePrev);

    // 页面初始化，启动自动轮播
    startAutoPlay();
})();

// ====================== 七、页面初始化渲染执行 ======================
// 页面加载完成后，初始化轨道位置，默认展示第一张轮播图
updateSlider();
