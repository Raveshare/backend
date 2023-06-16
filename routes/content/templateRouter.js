const templateRouter = require('express').Router();
const templateSchema = require('../../schema/templateSchema');

const getImageBuffer = require('../../functions/getImageBuffer');
const uploadImageToS3 = require('../../functions/uploadImageToS3');

templateRouter.get('/', async (req, res) => {
    try {
        const templates = await templateSchema.findAll();
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json(error);
    }
}
);

templateRouter.post('/', async (req, res) => {
    let data, name;
    try {
        data = req.body.data;
        name = req.body.name;
        console.log(data,name)
    } catch (error) {
        res.status(400).json({
            'status': 'error',
            'message': 'Invalid request body'
        })
    }

    try {
        let json = JSON.stringify(data);
        let imageBuffer = await getImageBuffer(json);
        let random = Math.floor(Math.random() * 1000000000);
        let filepath = `templates/${name} - ${random}.png`
        let image = await uploadImageToS3(imageBuffer, filepath)
        let template = await templateSchema.create({
            name: name,
            data: data,
            image : image
        });

        res.status(200).json({
            'status': 'success',
            'message': 'Template created successfully',
        })
        console.log("here 4")

    } catch (error) {
        res.status(500).json(error);
    }
});

    module.exports = templateRouter;