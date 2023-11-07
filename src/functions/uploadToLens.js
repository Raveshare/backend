const postOnChain = require("../lens/api-v2").postOnChain;
const uploadMetadataToIpfs = require("./uploadToIPFS").uploaddMetadataToIpfs;
const getProfileAddressFromHandle =
  require("../lens/api-v2").getProfileAddressFromHandle;

const uploadToLens = async (postMetadata, ownerData, params) => {
  try {
    Object.assign(postMetadata, {
      handle: ownerData.lens_handle,
    });

    const permadata = await uploadMetadataToIpfs(postMetadata);

    let { accessToken, refreshToken } = ownerData.lens_auth_token;

    if (!accessToken || !refreshToken) {
      return {
        status: "error",
        message: "User not authenticated",
      };
    }

    if (!params) {
      params = {};
    } else {
      params = await getLensParam(params);
    }

    let createPostRequest = {
      contentURI: `ipfs://${permadata}`,
    };

    createPostRequest = Object.assign(createPostRequest, params);

    const result = await postOnChain(
      createPostRequest,
      accessToken,
      refreshToken,
      ownerData.evm_address,
      ownerData.id
    );

    return result;
  } catch (e) {
    console.log(e);
    return {
      status: "error",
      message: e,
    };
  }
};

const updateLensHandles = async (referredFrom) => {
  for (let i = 0; i < referredFrom.length; i++) {
    if (referredFrom[i].recipient?.startsWith("@")) {
      referredFrom[i].recipient = referredFrom[i].recipient.substring(1);
      referredFrom[i].recipient = await getProfileAddressFromHandle(
        referredFrom[i].recipient
      );
    }
  }

  return referredFrom;
};

const getLensParam = async (params) => {
  let {
    charge,
    collectLimit,
    endTimestamp,
    followerOnly,
    referralFee,
    recipients,
  } = params;

  let collectModule = {};

  if (charge) {
    let multirecipientCollectOpenAction = {};

    multirecipientCollectOpenAction.amount = {
      currency: charge.currency,
      value: charge.value,
    };

    recipients = await updateLensHandles(recipients);

    multirecipientCollectOpenAction.recipients = recipients;

    if (collectLimit) {
      multirecipientCollectOpenAction.collectLimit = collectLimit;
    }

    if (endTimestamp) {
      multirecipientCollectOpenAction.endsAt = endTimestamp;
    }

    if (referralFee) {
      multirecipientCollectOpenAction.referralFee = referralFee;
    }

    if (followerOnly) {
      multirecipientCollectOpenAction.followerOnly = true;
    } else {
      multirecipientCollectOpenAction.followerOnly = false;
    }

    collectModule.multirecipientCollectOpenAction =
      multirecipientCollectOpenAction;
  } else {
    let simpleCollectOpenAction = {};

    if (collectLimit) {
      simpleCollectOpenAction.collectLimit = collectLimit;
    }

    if (endTimestamp) {
      simpleCollectOpenAction.endsAt = endTimestamp;
    }

    if (followerOnly) {
      simpleCollectOpenAction.followerOnly = true;
    } else {
      simpleCollectOpenAction.followerOnly = false;
    }

    collectModule.simpleCollectOpenAction = simpleCollectOpenAction;
  }

  return {
    openActionModules: [
      {
        collectOpenAction: collectModule,
      },
    ],
  };
};

module.exports = uploadToLens;
