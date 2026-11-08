/**
 * 数值钳位，限制 value 在[min, max]之间
 * @param value 待限制数值
 * @param min 最小值
 * @param max 最大值
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * 三次方缓入缓出：开始与结束慢，中间快
 * @function easeInOutCubic()
 * @param t 动画进度 0~1
*/
function easeInOutCubic(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}