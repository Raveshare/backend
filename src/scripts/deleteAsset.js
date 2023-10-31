const prisma = require("../prisma");

async function deleteAsset() {
  assetSchema.destroy({
    where: {
      author: "nouns",
    },
  });
}

async function updateCanvas() {
  const owners = await prisma.owners.findMany();

  for (const owner of owners) {
    await prisma.canvases.updateMany({
      where: {
        ownerAddress: owner.address,
      },
      data: {
        ownerId: owner.id,
      },
    });
  }
}

async function deleteNFT() {
  await prisma.nftData.deleteMany({
    where: {
      ownerId: null,
    },
  });
}

async function deleteCanvas() {
  canvasSchema.destroy({
    where: {
      imageLink: null,
    },
    truncate: true,
  });
}

async function deleteTemplate() {
  templateSchema.destroy({
    where: {},
    truncate: true,
  });
}

async function deleteCollection(id) {
  await content.destroy({
    where: {},
  });

  await collections.destroy({
    where: {
      // id : id
    },
  });
}

module.exports = {
  deleteAsset,
  deleteNFT,
  deleteCanvas,
  deleteTemplate,
  deleteCollection,
  updateCanvas,
};
