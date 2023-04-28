const { NFTStorage } = require('nft.storage'); 

/**
 * A function to upload a canvas to IPFS
 * @param {*} blob Blob of the canvas 
 * @param {*} name Name of the canvas
 * @param {*} fileType File type of the canvas 
 * @returns 
 */
async function uploadCanvasToIpfs(blob , name , fileType) {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
    fileType = fileType.split("/")[1];

    try { 
        const result = await client.store({
            name: name,
            fileType: fileType,
            image : new File([blob], `${name}.${fileType}`, { type: fileType })
        })
        return result;
    } catch (error) {
        console.log(error);
    }
}

module.exports = uploadCanvasToIpfs;

