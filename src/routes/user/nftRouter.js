const nftRouter = require("express").Router();
const prisma = require("../../prisma");

const updateNFTsForOwner = require("../../functions/nfts/updateNFTsForOwner");
const cache = require("../../middleware/cache");
const sendError = require("../../functions/webhook/sendError.webhook");

const {
  getCache,
  setCache,
  deleteCacheMatchPattern,
} = require("../../functions/cache/handleCache");

nftRouter.post("/update", async (req, res) => {
  let user_id = req.user.user_id;

  await deleteCacheMatchPattern(`nfts_${user_id}`);
  await deleteCacheMatchPattern(`total_nfts_${user_id}`);

  let user;
  let userCache = await getCache(`user_${user_id}`);
  if (!userCache) {
    user = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });

    await setCache(`user_${user_id}`, JSON.stringify(user));
  } else {
    user = JSON.parse(userCache);
  }

  if (!user) {
    res.status(404).send({
      message: "User not found",
    });
    return;
  }

  user = {
    user_id: user.id,
    evm_address: user.evm_address,
    solana_address: user.solana_address,
  };

  updateNFTsForOwner(user);

  res.status(200).send({
    status: "success",
    message: "NFTs are getting updated",
  });
});

nftRouter.get("/:id", async (req, res) => {
  let user_id = req.user.user_id;

  if (!req.params.id) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let id = req.params.id;

  if (isNaN(id)) {
    res.status(400).send({
      status: "failed",
      message: "Invalid Request Parameters",
    });
    return;
  }

  let nftCache = await getCache(`nfts_${user_id}`);
  let nft;

  if (!nftCache) {
    nft = await prisma.nftData.findUnique({
      where: {
        id: id,
        // ownerAddress: ownerAddress,
        ownerId: user_id,
      },
    });

    await setCache(`nfts_${user_id}`, JSON.stringify(nft));
  } else {
    nft = JSON.parse(nftCache);
  }

  if (!nft) {
    res.status(404).send({
      status: "failed",
      message: "NFT not found",
    });
    return;
  }

  if (nft.ownerAddress != ownerAddress) {
    res.status(401).send({
      status: "error",
      message: "forbidden",
    });
    return;
  }

  res.send(nft);
});

nftRouter.get("/", async (req, res) => {
  let user_id = req.user.user_id;
  let query = req.query.query;

  let queriedNFTs = [];

  if (query) {
    let nftsCache = await getCache(`nfts_${user_id}`);

    let nfts;
    if (!nftsCache) {
      console.log("nfts cache not found");
      nfts = await prisma.nftData.findMany({
        where: {
          ownerId: user_id,
        },
      });

      await setCache(`nfts_${user_id}`, JSON.stringify(nfts));
    } else {
      nfts = JSON.parse(nftsCache);
    }

    for (let i = 0; i < nfts.length; i++) {
      let nft = nfts[i];
      let id = nft.tokenId;
      let title = nft.title;
      let description = nft.description;

      if (id == parseInt(query)) {
        queriedNFTs.push(nft);
        continue;
      }

      if (title.toLowerCase().includes(query.toLowerCase())) {
        queriedNFTs.push(nft);
        continue;
      }

      if (description.toLowerCase().includes(query.toLowerCase())) {
        queriedNFTs.push(nft);
        continue;
      }
    }

    res.send({
      assets: queriedNFTs,
    });
  } else {
    let page = req.query.page || 1;

    let chainId = req.query.chainId || 1;

    page = parseInt(page);
    chainId = parseInt(chainId);

    page = page < 1 ? 1 : page;

    let limit = req.query.limit || 50;

    let offset = (page - 1) * limit;

    let queriedNFTs;
    let queriedNFTsCache = await getCache(`nfts_${user_id}_${chainId}_${page}`);
    // console.log(queriedNFTsCache);
    // let queriedNFTsCache = null;
    if (!queriedNFTsCache) {
      console.log("nfts cache not found");
      queriedNFTs = await prisma.nftData.findMany({
        where: {
          ownerId: user_id,
          chainId: chainId,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: limit,
        skip: offset,
      });

      await setCache(
        `nfts_${user_id}_${chainId}_${page}`,
        JSON.stringify(queriedNFTs)
      );
    } else {
      queriedNFTs = JSON.parse(queriedNFTsCache);
    }

    let totalAssets;
    let totalAssetsCache = await getCache(`total_nfts_${user_id}_${chainId}`);
    if (!totalAssetsCache) {
      totalAssets = await prisma.nftData.count({
        where: {
          ownerId: user_id,
          chainId: chainId,
        },
      });

      await setCache(`total_nfts_${user_id}_${chainId}`, totalAssets);
    } else {
      totalAssets = totalAssetsCache;
    }

    let totalPage = Math.ceil(totalAssets / limit);

    res.send({
      assets: queriedNFTs,
      totalPage: totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
  }
});

module.exports = nftRouter;
