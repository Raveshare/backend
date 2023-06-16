const fs = require('fs');
const axios = require('axios');
const uploadImageToS3 = require('./uploadImageToS3');

const uploadImageFromLinkToS3 = async (link,address ,fileName , format) => {
    try {
        let response = await axios.get(link, { responseType: 'arraybuffer' });

        console.log(response.data);

        let filepath = `user/${address}/nft/${fileName}.${format}`

        let data = await uploadImageToS3(response.data, filepath);
        return data;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = uploadImageFromLinkToS3;