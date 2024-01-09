// const nftSchema = require("../schema/nftSchema");
const prisma = require("../prisma");
const deleteDuplicates = async () => {
  try {

    // Find the distinct values of the field you want to filter.
    const distinctValues = await prisma.nftData.findMany({
      select: {
        chainId: true,
        address: true,
        tokenId: true,
      },
    });
    
    // Loop through the distinct values and delete rows with duplicate values.
    for (const { chainId, address, tokenId } of distinctValues) {
      const rowsToDelete = await prisma.nftData.findMany({
        where: {
          chainId,
          address,
          tokenId
        },
      });

      console.log(rowsToDelete.length);
      
      if (rowsToDelete.length > 1) {
        // Delete all but one row with the same field value.
        await prisma.nftData.deleteMany({
          where: {
            chainId,
            tokenId,
            address,
            NOT: {
              id: {
                equals: rowsToDelete[0].id,
              },
            },
          },
        });
      }

      console.log("Rows with duplicate field values have been deleted.");
    }
    

    console.log("Rows with duplicate field values have been deleted.");
  } catch (error) {
    console.error("Error deleting rows:", error);
  }
};

module.exports = deleteDuplicates;
