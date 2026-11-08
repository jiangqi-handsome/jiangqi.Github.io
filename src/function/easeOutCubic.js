/**
 * 数值钳位，限制 value 在[min, max]之间
 * @param value 待限制数值
 * @param min 最小值
 * @param max 最大值
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * 三次方缓出：开始快，结束慢
 * @function easeOutCubic()
 * @param t 动画进度 0~1
*/
function easeOutCubic(t) {
    return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}