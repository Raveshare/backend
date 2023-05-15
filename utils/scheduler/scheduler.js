const { Agenda } = require('@hokify/agenda');

const agenda = new Agenda({
    db: {
        address: process.env.MONGO_URL,
        collection: 'agendaJobs',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
});


module.exports = agenda;