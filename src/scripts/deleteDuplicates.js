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
    for (const { imageURL } of distinctValues) {
      const rowsToDelete = await prisma.nftData.findMany({
        where: {
          imageURL, // Filter rows with the same field value.
        },
      });
      
      if (rowsToDelete.length > 1) {
        // Delete all but one row with the same field value.
        await prisma.nftData.deleteMany({
          where: {
            imageURL,
            NOT: {
              id: {
                equals: rowsToDelete[0].id,
              },
            },
          },
        });
      }
    }
    

    console.log("Rows with duplicate field values have been deleted.");
  } catch (error) {
    console.error("Error deleting rows:", error);
  }
};

module.exports = deleteDuplicates;
