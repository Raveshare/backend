const { isEmpty } = require("lodash");

const createPostViaDispatcher = require("../lens/api").createPostViaDispatcher;
const uploadMetadataToIpfs = require("./uploadToIPFS").uploaddMetadataToIpfs;
const getProfileAddressFromHandle =
  require("../lens/api").getProfileAddressFromHandle;

const uploadToLens = async (postMetadata, ownerData, params, referred) => {
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
      let recipients = [];
      if (params.collectModule.multirecipientFeeCollectModule.recipients) {
        
        params.collectModule.multirecipientFeeCollectModule.recipients =
          await updateLensHandles(
            params.collectModule.multirecipientFeeCollectModule.recipients
          );

        recipients =
          params.collectModule.multirecipientFeeCollectModule.recipients;

        // if (!isEmpty(referred)) {
        //   if (!referred.includes("0x77fAD8D0FcfD481dAf98D0D156970A281e66761b"))
        //     return {
        //       status: "error",
        //       message: "Invalid referred address",
        //     };
        // }

        let totalSplit = 0;
        for (let i = 0; i < recipients.length; i++) {
          totalSplit += recipients[i].split;
        }
        if (totalSplit != 100) {
          return {
            status: "error",
            message: "Split is not 100%",
          };
        }
      }
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

const getLensParam = (params) => {
  let { charge , collectLimit , timeLimit , followerOnly } = params;


  // charge for collection - $price , $currency , $referral-fees , $split-fee[]
  // limited edition - $collect-limit
  // time limit - $collect-time
  // who can collect - $collect-who
}

// params = {
//   charge : {
//     price : 0.1,
//     currency : "address",
//     referralFees : 0.1,
//     split  : [
//       [handle, split],
//     ]
//   },
//   collectLimit : 10,
//   timeLimit : utc_time,
//   whoCanCollect : true
// }

module.exports = uploadToLens;
