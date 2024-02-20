const prisma = require("../../prisma");
const { ethers } = require("ethers");

const getOrCreateWallet = async (userId) => {
  let userWallet = await prisma.user_funds.findUnique({
    where: {
      userId: userId,
    },
  });

  if (userWallet) {
    return {
      publicAddress: userWallet.wallet,
      balance: userWallet.topup,
      sponsored : userWallet.sponsored
    };
  } else {
    let wallet = ethers.Wallet.createRandom();
    let userWallet = await prisma.user_funds.create({
      data: {
        userId: userId,
        wallet: wallet.address,
        wallet_pvtKey: wallet.privateKey,
      },
    });
    return {
        publicAddress: userWallet.wallet,
        balance: userWallet.topup,
        sponsored : userWallet.sponsored
    }
  }
};

module.exports = getOrCreateWallet;