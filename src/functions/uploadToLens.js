
const createPostViaDispatcher = require("../lens/api").createPostViaDispatcher;
const uploadMetadataToIpfs = require("./uploadToIPFS").uploaddMetadataToIpfs;
const getProfileAddressFromHandle =
  require("../lens/api").getProfileAddressFromHandle;

const uploadToLens = async (postMetadata, ownerData, params) => {
  try {
    Object.assign(postMetadata, {
      handle: ownerData.lens_handle,
    });

    const ipfsData = await uploadMetadataToIpfs(postMetadata);

    let { accessToken, refreshToken } = ownerData.lens_auth_token;

    if (!accessToken || !refreshToken) {
      return {
        status: "error",
        message: "User not authenticated",
      };
    }

    if (!params) {
      params = {
        collectModule: {
          freeCollectModule: { followerOnly: true },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      };
    } else {
      params = await getLensParam(params);
    }

    let createPostRequest = {
      profileId: ownerData.profileId,
      contentURI: "ipfs://" + ipfsData,
    };

    createPostRequest = Object.assign(createPostRequest, params);

    const result = await createPostViaDispatcher(
      createPostRequest,
      accessToken,
      refreshToken,
      ownerData.address
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
    if (referredFrom[i].recipient.startsWith("@")) {
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
    let multirecipientFeeCollectModule = {};

    multirecipientFeeCollectModule.amount = {
      currency: charge.currency,
      value: charge.value,
    };

    recipients = await updateLensHandles(recipients);

    multirecipientFeeCollectModule.recipients = recipients;

    if (collectLimit) {
      multirecipientFeeCollectModule.collectLimit = collectLimit;
    }

    if (endTimestamp) {
      multirecipientFeeCollectModule.endTimestamp = endTimestamp;
    }

    if (referralFee) {
      multirecipientFeeCollectModule.referralFee = referralFee;
    }

    if (followerOnly) {
      multirecipientFeeCollectModule.followerOnly = true;
    } else {
      multirecipientFeeCollectModule.followerOnly = false;
    }

    collectModule.multirecipientFeeCollectModule =
      multirecipientFeeCollectModule;
  } else {
    let simpleCollectModule = {};

    if (collectLimit) {
      simpleCollectModule.collectLimit = collectLimit;
    }

    if (endTimestamp) {
      simpleCollectModule.endTimestamp = endTimestamp;
    }

    if (followerOnly) {
      simpleCollectModule.followerOnly = true;
    } else {
      simpleCollectModule.followerOnly = false;
    }

    collectModule.simpleCollectModule = simpleCollectModule;
  }

  return {
    collectModule: collectModule,
  };
};


module.exports = uploadToLens;
