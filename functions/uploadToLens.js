const createPostViaDispatcher = require("../lens/api").createPostViaDispatcher;
const uploadMetadataToIpfs = require("./uploadToIPFS").uploaddMetadataToIpfs;

const uploadToLens = async (postMetadata, ownerData) => {
  const ipfsData = await uploadMetadataToIpfs(postMetadata);

  let { accessToken, refreshToken } = ownerData.lens_auth_token;

  if (!accessToken || !refreshToken) {
    res.status(401).send({
      status: "error",
      message: "User not authenticated",
    });
    return;
  }

  const createPostRequest = {
    profileId: ownerData.profileId,
    contentURI: "ipfs://" + ipfsData,
    collectModule: {
      freeCollectModule: { followerOnly: true },
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  };

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
