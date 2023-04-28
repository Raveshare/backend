const { NFTStorage , File} = require('nft.storage'); 

/**
 * A function to upload a canvas to IPFS
 * @param {*} blob Blob of the canvas 
 * @param {*} name Name of the canvas
 * @param {*} description Description of the canvas
 * @param {*} fileType File type of the canvas 
 * @returns 
 */
async function uploadCanvasToIpfs(blob , name , description,fileType) {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
    let fileExtension = fileType.split("/")[1];

    name = name.replace(" ", "_");
    console.log(name);

    try { 
        const result = await client.store({
            name: name,
            description: description,
            fileType: fileExtension,
            image : new File([blob], `${name}.${fileExtension}`, { type: fileType })
        })
        return result;
    } catch (error) {
        console.log(error);
    }
}

module.exports = uploadCanvasToIpfs;

