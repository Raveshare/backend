const NODE_ENV = process.env.NODE_ENV || 'development'

const jobs = [
    {
        name: 'update-collects',
        interval : NODE_ENV === 'local' ? 'every 5 hours' : 'every 5 minutes',
    }
]

module.exports = jobs