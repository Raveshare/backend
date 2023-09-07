const adminRouter = require('express').Router();

const deleteDuplicates = require('../../scripts/deleteDuplicates');

adminRouter.get('/deleteDuplicates', async (req, res) => {
    await deleteDuplicates();
    res.send('Duplicates deleted');
});

module.exports = adminRouter;