const prisma = require("../prisma");
const getUserBalance = require("../functions/mint/getUserBalance");
async function getBalance() {
  let user_address_list = await prisma.user_funds.findMany({
    select: {
      wallet: true,
    },
  });

  let total_balance = 0;

  for (let i = 0; i < user_address_list.length; i++) {
    let wallet = user_address_list[i].wallet;
    let balance = await getUserBalance(wallet);
    total_balance += parseFloat(balance);
    console.log(balance);
  }

    console.log("Total balance: ", total_balance);
}

module.exports = getBalance;

