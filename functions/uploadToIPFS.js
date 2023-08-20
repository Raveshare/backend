const { validateMetadata } = require('../lens/api')

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const { v4: uuid } = require('uuid');


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
    const result = await ipfsClient.add(blob);


    return result.cid.toString();
}

const uploaddMetadataToIpfs = async (postData) => {
    const ipfsClient = await getIpfsClient();

    let media = [];
    for(let i = 0; i < postData.image.length; i++) {
        media.push({
            type: "image/png",
            item: `ipfs://${postData.image[i]}`
        })
    }

    

    const metaData = {
        version: "2.0.0",
        content: postData.content + "\n\n ~ 𝙈𝙖𝙙𝙚 𝙤𝙣 @𝙡𝙚𝙣𝙨𝙥𝙤𝙨𝙩𝙭𝙮𝙯.𝙇𝙚𝙣𝙨 - 𝙔𝙤𝙪𝙧 𝙒𝙚𝙗3 𝙎𝙤𝙘𝙞𝙖𝙡 𝙎𝙩𝙪𝙙𝙞𝙤",
        description: postData.content,
        name: `Post by ${postData.handle}`,
        external_url: `https://lenstube.xyz/${postData.handle}`,
        metadata_id: uuid(),
        mainContentFocus: "IMAGE",
        attributes: [],
        locale: "en-US",
        media,
        appId: "lenspost",
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