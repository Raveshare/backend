const templateRouter = require('express').Router();
const templateSchema = require('../../schema/templateSchema');
const getImageBuffer = require('../../functions/getImageBuffer');

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
        console.log("here")
        let imageBuffer = await getImageBuffer(data);
        console.log("here 2")
        let template = await templateSchema.create({
            name: name,
            data: data,
            imageBuffer: imageBuffer
        });
        console.log("here 3")

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