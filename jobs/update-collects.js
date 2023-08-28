const canvasSchema = require('../schema/canvasSchema');
const updateCollectsForPublication = require('../functions/updateCollectsForPublication');

const updateCollects = async (job, done) => {
    
    let canvas = await canvasSchema.findAll({
        where: {
            isPublic: true,
            isGated: true
        },
        attributes : ['gatedWith']
    });

    console.log(canvas);

}

updateCollects();