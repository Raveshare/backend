const nftSchema = require('../schema/nftSchema');

const deleteDuplicates = async () => {
    const nfts = await nftSchema.find({}).sort({ _id: 1 });

    

    console.log(nfts);
}

module.exports = deleteDuplicates;