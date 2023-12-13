const prisma = require("../prisma");

const cleanLenny = async () => {
  await prisma.nftData.deleteMany({
    where: {
      address: "0xdb46d1dc155634fbc732f92e853b10b288ad5a1d",
    },
  });
};

cleanLenny();
