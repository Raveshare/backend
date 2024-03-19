const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findCanvasOwnersByHandle(targetHandle) {
  // Fetch all canvases
  const canvases = await prisma.canvases.findMany({
    select: {
      ownerId: true,
      assetsRecipientElementData: true, // Assuming this field exists and contains the data structure you described
    }
  });

  // Filter canvases to find those with the matching handle
  const matchingOwnerIds = canvases.filter(canvas => {
    return canvas.assetsRecipientElementData.some(element => 
      element?.handle?.toLowerCase() === targetHandle.toLowerCase()
    );
  }).map(canvas => canvas.ownerId);

  console.log(matchingOwnerIds);
  return matchingOwnerIds;
}


module.exports = findCanvasOwnersByHandle;