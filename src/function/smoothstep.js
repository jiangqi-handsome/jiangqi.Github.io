/**
 * 数值钳位，限制 value 在[min, max]之间
 * @param value 待限制数值
 * @param min 最小值
 * @param max 最大值
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * S型平滑过渡
 * 在min~max区间内映射到0→1，自带缓入缓出，起止柔和不突兀
 * @function smoothstep()
 * @param {number} min 区间下限
 * @param {number} max 区间上限
 * @param {number} value 输入数值
 */
function smoothstep(min, max, value) {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t); // S曲线公式：t^2(3-2t)
}