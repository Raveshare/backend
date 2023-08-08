const createPostViaDispatcher = require("../lens/api").createPostViaDispatcher;
const uploadMetadataToIpfs = require("./uploadToIPFS").uploaddMetadataToIpfs;

const uploadToLens = async (postMetadata, ownerData, params) => {
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
