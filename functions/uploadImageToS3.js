const aws = require('aws-sdk')

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const uploadImageToS3 = async (file, fileName) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `templates/${fileName}.png`, // File name you want to save as in S3
        Body: file,
        ContentType: "image/png",
        ACL: 'public-read'
    }

    let data = await s3.upload(params).promise();

    return data.Location;

}

module.exports = uploadImageToS3