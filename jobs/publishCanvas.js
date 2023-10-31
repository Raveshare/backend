// const agenda = require('../utils/scheduler/scheduler')

// agenda.define('publishCanvas', async (job, done) => {
//     console.log("Publishing Canvas");
//     let canvasId = job.attrs.data.canvasId;
//     let canvasSchema = require('../../models/canvasSchema');
//     let canvasData = await canvasSchema.findOne({
//         where: {
//             id: canvasId
//         }
//     });
//     canvasData.isPublic = true;
//     await canvasData.save();
//     done();
// }
// );

