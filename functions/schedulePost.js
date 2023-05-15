const agenda = require('../utils/scheduler/scheduler')
const publishCanvas = require('./jobs/publishCanvas')

agenda.schedule('in 1 minute', 'publishCanvas', {
    canvasId: 1
});

