const prisma = require("../../src/prisma");
const fs = require("fs");
// const deleteS3DataForUserId = require("./deleteS3DataForUserId");

const inactiveUser = [];
const deleteInactiveUsers = async () => {
  try {
    let promises = [];
    let totalDeleted = 0
    for (let i = 0; i < inactiveUser.length; i++) {
      let userId = inactiveUser[i];
      let nft = prisma.nftData.deleteMany({
        where:{ 
          ownerId: userId
        }
      })
      promises.push(nft);
    }
    // await Promise.all(promises);
    totalDeleted = await prisma.$transaction(promises);
    console.log("Deleted S3 data for all users");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

module.exports = deleteInactiveUsers;
