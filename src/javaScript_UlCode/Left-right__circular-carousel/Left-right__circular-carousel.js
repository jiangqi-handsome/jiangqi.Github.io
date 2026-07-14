/* ========== 1、获取DOm节点 ========== */
// 获取轮播图的容器元素节点
const carousel = document.querySelector('.carousel'), 
      // 获取图片元素的容器击节点
      sliderTrack = document.querySelector('.slider-track'),
      // 获取所有图片元素
      sliderSlides = document.querySelectorAll('.slider-slide'),
      // 获取左右控制按钮的节点
      prevBtn = document.querySelector('.prev'),
      nextBtn = document.querySelector('.next');



/* ========== 2、配置所需参数和初始化 ========== */
// 单张图片的宽度和（CSS一致800）

const slideWidth = 800; // 没有用的声明

// 初始索引 = 1（对应每张图片，然后索引2的位置);
/**
 * 首 --> 0,
 * 第一张图1 --> 1,
 * 第二张图2 --> 2，
 * 第三张图3 --> 3，
 * 尾 --> 4
 */
let currentIndex = 1; // 初始为1，就从图片1开始播放，而不是首

// 图片总数量
const slideTotal = sliderSlides.length; // length：就是总结轮播图里面有多少图片

// 添加（过渡状态锁），防止动画中重复点击
let isSliding = false;
let timer = null; // 自动轮播定时器



/* ========== 3、轮播图片更新位置和无缝轮播效果配置 ========== */
// 核心函数：更新轮播图图片的位置
function updateCarousel() {
    sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`
}

sliderTrack.addEventListener('transitionend', function () {
    isSliding = false; // 动画结束，锁定点击

    // 滑到最后一张复制图（原图1），切回原图第一张（index = 1）
    if (currentIndex === slideTotal - 1) {
        // 图片最后的（尾 --- 跳回 ---> 首），跳回的过程删除：CSS transition属性值
        sliderTrack.style.transition = 'none';

        // 从首平滑到索引1，也就是图片1
        currentIndex = 1;

        // 调用核心函数更新位置
        updateCarousel();

        
        // 强制重绘，避免浏览器忽略样式修改
        void sliderTrack.offsetWidth;
        sliderTrack.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1';
    }

    // 滑到最前面复制图（首 --> 原图3)切回原最后一张（index = slidTotal - 2）
    else if (currentIndex === 0) {
        // 图片最前的（首 --- 跳回 ---> 尾），跳回的过程删除：CSS transition属性值
        sliderTrack.style.transition = 'none';

        // 从尾平滑到索引3，也就是图片2
        currentIndex = slideTotal - 2;

        // 调用核心函数更新位置
        updateCarousel();

        // 强制重绘，避免浏览器忽略样式修改
        void sliderTrack.offsetWidth;
        sliderTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1';
    }
});

// 封装轮播方向函数，加锁和索引
function moveSlide(direction) {
    // 如果正在滑动，直接返回，禁止重复点击
    if (isSliding) return;
    isSliding = true; // 加锁，动画结束前不能点击

    // 方向：1 = 下一张，-1 = 上一张
    currentIndex += direction;
    updateCarousel();
    // 重复自动轮播（手动点击后，重新开始计时）
    resetAutoPlay();
}

/* ========== 4、手动点击按钮添加事件 ========== */
prevBtn.addEventListener('click', function () {
    moveSlide(-1);
});

nextBtn.addEventListener('click', function () {
    moveSlide(1);
});

/* ========== 5、封装自动轮播函数 ========== */
function autoPlay() {
    timer = setInterval(function () {
        moveSlide(1); // 自动轮播默认下一张
    }, 2000); // 2秒一次
}

// 重置自动轮播（手动点击后调用）
function resetAutoPlay() {
    clearInterval(timer);
    autoPlay();
}

// 鼠标悬停暂停/离开继续保留原效果
carousel.addEventListener('mouseenter', function () {
    clearInterval(timer);
});

carousel.addEventListener('mouseleave', function () {
    autoPlay();
});

autoPlay()
// 初始化：调用函数
updateCarousel()