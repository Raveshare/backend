const router = require("express").Router();
const prisma = require("../../prisma");
const mintToERC721 = require("../../functions/mint/mintToERC721");
const mintToERC721Sponsored = require("../../functions/mint/mintToERC721Sponsored");
const getOrCreateWallet = require("../../functions/mint/getOrCreateWallet");
const auth = require("../../middleware/auth/auth");
const getUserBalance = require("../../functions/mint/getUserBalance");
const mintedFrame = require("../../functions/events/mintedFrame.event");
const withdrawFunds = require("../../functions/mint/withdrawFunds");
const mintAsZoraERC721 = require("../../functions/mint/mintAsZoraERC721");
const mintFromZoraERC721 = require("../../functions/mint/mintFromZoraERC721");
const { v4: uuidv4 } = require("uuid");
const { handleAddRewards } = require("../../functions/poster/posterService");
const NODE_ENV = process.env.NODE_ENV;

const BaseContractAddress =
  NODE_ENV === "production"
    ? "0x769C1417485ad9d74FbB27F4be47890Fd00A96ad"
    : "0x14a60C55a51b40B5A080A6E175a8b0FDae3565cF";

router.post("/", async (req, res) => {
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

  let host = req.get("host");

  let NODE_ENV = process.env.NODE_ENV;

  if (NODE_ENV === "production") {
    if (host != "api.lenspost.xyz") {
      return res.status(400).json({ message: "Invalid host" });
    }
  }

  console.log("Minting request received");

  let { frameId, recipientAddress } = req.body;

  frameId = parseInt(frameId);

  let frame = await prisma.frames.findUnique({
    where: {
      id: frameId,
    },
    select: {
      owner: true,
      id: true,
      chainId: true,
      contract_address: true,
    },
  });

  if (!frame?.owner) {
    return res.status(400).json({ message: "Frame not found" });
  }

  let user = await prisma.owners.findUnique({
    where: {
      evm_address: frame.owner,
    },
    select: {
      id: true,
      evm_address: true,
    },
  });

  if (!user?.id) {
    return res.status(400).json({ message: "User not found" });
  }

  let sponsored = await prisma.user_funds.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      sponsored: true,
    },
  });

  let sponsoredMint = sponsored.sponsored || 0;
  if (sponsoredMint <= 0) {
    if (frame.contract_address === BaseContractAddress) {
      console.log("Minting to ERC721");
      let tx = await mintToERC721(frame.id, recipientAddress);

      if (tx.status === 400) {
        res.status(400).json({ message: "Gas not enough" });
      } else {
        mintedFrame(user.id, frameId, recipientAddress, false);
        await handleAddRewards(user.id, user.evm_address, 5);

        res.send({
          message: "Minted successfully",
          tx: tx.hash,
        });
      }
    } else {
      console.log("Minting to Zora");
      let tx = await mintFromZoraERC721(
        user.id,
        frame.chainId,
        frame.contract_address,
        recipientAddress,
        false
      );
      if (tx.status === 400) {
        res.status(400).json({ message: "Insufficient funds" });
        return;
      }
      res.send({
        message: "Minted successfully",
        tx: tx.hash,
        tokenId: tx.tokenId.toString(),
      });
      await handleAddRewards(user.id, user.evm_address, 5);
    }
  } else {
    if (frame.contract_address === BaseContractAddress) {
      console.log("Minting to ERC721 Sponsored");
      let tx = await mintToERC721Sponsored(frame.id, recipientAddress);
      if (tx.status === 400) {
        res.status(400).json({ message: "Gas not enough" });
      } else {
        mintedFrame(user.id, frameId, recipientAddress, true);

        res.send({
          message: "Minted successfully",
          tx: tx.hash,
        });
        await handleAddRewards(user.id, user.evm_address, 5);
      }
    } else {
      console.log("Minting to Zora Sponsored");
      let tx = await mintFromZoraERC721(
        user.id,
        frame.chainId,
        frame.contract_address,
        recipientAddress,
        true
      );
      if (tx.status === 400) {
        res.status(400).json({ message: "Insufficient funds" });
        return;
      }
      res.send({
        message: "Minted successfully",
        tx: tx.hash,
        tokenId: tx.tokenId.toString(),
      });
      await handleAddRewards(user.id, user.evm_address, 5);
    }
  }
});

router.get("/", auth, async (req, res) => {
  let userWallet = await getOrCreateWallet(req.user.user_id);
  let balance = await getUserBalance(userWallet.publicAddress);
  res.send({
    publicAddress: userWallet.publicAddress,
    balance: balance,
    sponsored: userWallet.sponsored,
  });
});

router.post("/withdraw", auth, async (req, res) => {
  let userId = req.user.user_id;
  let { to, amount } = req.body;

  if (!to) {
    return res.status(400).json({ message: "Invalid input" });
  }

  let tx = await withdrawFunds(userId, to, amount);
  if (tx.code === 503) {
    return res.status(503).json({ message: "Insufficient funds" });
  }
  res.send({
    message: "Withdrawn successfully",
    tx: tx.success,
  });
});

router.post("/deploy-contract", auth, async (req, res) => {
  try {
    let user_id = req.user.user_id;
    let { contract_type, canvasId, chainId, args } = req.body;

    if (!contract_type || !chainId || !args) {
      return res.status(400).json({ message: "Invalid input" });
    }

  let sponsored = await prisma.user_funds.findUnique({
    where: {
      userId: user_id,
    },
    select: {
      sponsored: true,
    },
  });

  sponsored = sponsored.sponsored > 0 ? true : false;

    if (contract_type == 721) {
      let tx = await mintAsZoraERC721(user_id, chainId, args, sponsored);

      const uuid = uuidv4();

      let slug = "lp-canvas" + "-" + canvasId + "-" + uuid.split("-")[0];

      console.log({
        slug: slug,
        canvasId: canvasId,
        contract: tx.contract,
        hash: tx.hash,
        chainId: chainId,
        contractType: "ERC721",
      });

      await prisma.shared_mint_canvas.create({
        data: {
          slug: slug,
          canvasId: canvasId,
          contract: tx.contract,
          hash: tx.hash,
          chainId: chainId,
          contractType: "ERC721",
        },
      });

      if (tx.status == 200) {
        res.send({
          message: "Minted successfully",
          tx: tx.hash,
          contract_address: tx.contract,
          slug: slug,
        });
      } else {
        res.status(400).json({ message: tx.message });
      }
    } else {
      res.status(400).json({ message: "Invalid contract type" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e });
  }
});

module.exports = router;
