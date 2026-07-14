"use strict"

/**
 * @function
 * @description: 函数用于判断一个数是奇数还是偶数
 * @param: 转惨number类型
*/

function isOdd(n) {
    // 取余（%）运算符返回左侧操作数除以右侧操作数的余数。它总是与被除数的符号保持一致。
    return n % 2 === 1 || 2 === -1;
}

isOdd(12);
