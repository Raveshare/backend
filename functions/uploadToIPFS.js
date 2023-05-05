const { validateMetadata } = require('../lens/api')

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const getIpfsClient = async () => {
    const { create } = await import("ipfs-http-client");

    const ipfsClient = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
            authorization: auth,
        },
    });

    return ipfsClient;
}

const uploadMediaToIpfs = async (blob, mimeType) => {
    const ipfsClient = await getIpfsClient();
    const result = await ipfsClient.add({
        content: blob,
        path: `media.${mimeType.split('/')[1]}`
    });

    return result.cid.toString();
}

const uploaddMetadataToIpfs = async (postData) => {
    const ipfsClient = await getIpfsClient();

    const metaData = {
        version: "2.0.0",
        content: postData.content,
        description: postData.content,
        name: postData.name,
        external_url: `https://lenstube.xyz/${handle}`,
        metadata_id: uuid(),
        mainContentFocus: "IMAGE",
        attributes: [],
        locale: "en-US",
        media: [
            {
                type: "image/png",
                item: postData.image,
            },
        ],
        appId: "lensfrens",
    };

    const { valid, reason } = await validateMetadata(metaData);

    if (!valid) {
        throw new Error(reason);
    }

    const { path } = await ipfsClient.add(JSON.stringify(metaData));

    return path.toString();
}

module.exports = {
    uploadMediaToIpfs,
    uploaddMetadataToIpfs
}