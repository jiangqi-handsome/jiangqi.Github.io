"use strict"

function bankAccount(initialBalance) {
    let balance = initialBalance; // 私有变量

    // 私有方法
    return {
        deposit: function(amount) {
            balance += amount;

            console.log(`Deposited: $${amount}`);
        },
        withdraw: function(amount) {
            if (balance >= amount) {
                balance -= amount;

                console.log(`Withdrew: $${amount}`);
            } else {
                console.log('Insufficient funds');
            }
        },
        getBalance: function() {
            return balance;
        }
    };
}
 
const myAccount = bankAccount(1000);
myAccount.deposit(500); // Deposited: $500
myAccount.withdraw(200); // Withdrew: $200
console.log(myAccount.getBalance()); // 1300
// 不能直接访问或修改 balance
