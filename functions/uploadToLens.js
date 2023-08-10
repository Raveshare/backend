const createPostViaDispatcher = require("../lens/api").createPostViaDispatcher;
const uploadMetadataToIpfs = require("./uploadToIPFS").uploaddMetadataToIpfs;

const uploadToLens = async (postMetadata, ownerData, params, referred) => {
  const ipfsData = await uploadMetadataToIpfs(postMetadata);

  let { accessToken, refreshToken } = ownerData.lens_auth_token;

  if (!accessToken || !refreshToken) {
    res.status(401).send({
      status: "error",
      message: "User not authenticated",
    });
    return;
  }

  // TODO : Test with params for once
  if (!params) {
    params = {
      collectModule: {
        freeCollectModule: { followerOnly: true },
      },
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };
  }

  let createPostRequest = {
    profileId: ownerData.profileId,
    contentURI: "ipfs://" + ipfsData,
  };

  let recipients = [];
  if (params.collectModule.multirecipientFeeCollectModule.recipients) {
    recipients = params.collectModule.multirecipientFeeCollectModule.recipients;

    if (referred) {
      recipients.push({
        recipient: "0x77fAD8D0FcfD481dAf98D0D156970A281e66761b",
        split: 10,
      });
      recipients.push({
        recipient: referred,
        split: 10,
      });
    } else {
      recipients.push({
        recipient: "0x77fAD8D0FcfD481dAf98D0D156970A281e66761b",
        split: 10,
      });
      recipients[0].split = recipients[0].split + 10;
    }

    let totalSplit = 0;
    for (let i = 0; i < recipients.length; i++) {
      totalSplit += recipients[i].split;
    }
    if (totalSplit > 100) {
      return {
        status: "error",
        message: "Split is more than 100%",
      };
    }
  }

  console.log(params.collectModule.multirecipientFeeCollectModule.recipients);

  // return;

  createPostRequest = Object.assign(createPostRequest, params);

  const result = await createPostViaDispatcher(
    createPostRequest,
    accessToken,
    refreshToken,
    ownerData.address
  );

  console.log("result", result);

  return result;
};

module.exports = uploadToLens;
