'use strict'

// 定义一个数组对象
const users = [
    { name: '龙傲天', sex: '男', age: 16},
    { name: '叶良辰', sex: '男', age: 20},
    { name: '欧阳吹雪', sex: '女', age: 20},
    { name: '日天', sex: '男', age: 13},
    { name: '王尼玛', sex: '男', age: 20},
    { name: '福尔康', sex: '男', age: 18},
    { name: '霍水铃', sex: '女', age: 20},
]

/**
 * @function : 统计年龄、数量、性别、判断
 * @param: arr: Object, generateKey: 键
 * @return:
 * 
 */

function groupBy(arr, generateKey) {
    // 定义一个空对象存储
    const result = {}

    // 遍历循环数组对象给item
    for (const item of arr) {
      // groupKey = 箭头函数/一个对象 =====>  u => u.age({ name: '龙傲天', sex: '男', age: 16}) 需要拿对象里面的age
        const groupKey = generateKey(item);

        // 然后做判断 result空对象和groupKey，这里要看是调用什么，如果是年龄第一次16 ==> name: '龙傲天', sex: '男', 这个 ---> "|age: 16|"
        if (result[groupKey]) {
            result[groupKey]++
        } else {
            result[groupKey] = 1
        }
    }

    return result
}

// 调佣函数
// 参数1：object，参数2: 回调函数 ====> 箭头函数
console.log(groupBy(users, u => u.age)) // 年龄 ---> 出现次数 13 = 1，16 = 1， 18 = 1，20 = 4
console.log(groupBy(users, u => u.sex)) // 性别 ---> 一样
console.log(groupBy(users, u => u.name.length)) // 数量 ---> 一样
console.log(groupBy(users, u => u.age < 18 ? '未成年' : '成年')) // 判断年龄