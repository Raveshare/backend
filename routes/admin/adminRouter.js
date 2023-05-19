const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dumpContent = require('../../scripts/dumpContent');

adminRouter.get('/', async (req, res) => {
    res.send("Admin Router");
});


adminRouter.get('/dumpContent', async (req, res) => {
    let collectionDetails = {
        address: "0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD",
        name: "tubby cats",
        openseaLink: "https://opensea.io/collection/tubby-cats",
        image : "https://i.seadn.io/gae/TyPJi06xkDXOWeK4wYBCIskRcSJpmtVfVcJbuxNXDVsC39IC_Ls5taMlxpZPYMoUtlPH7YkQ4my1nwUGDIB5C01r97TPlYhkolk-TA"
    };

    let result = await dumpContent("tubby-cats.json", collectionDetails);

    res.send(result);
});

module.exports = adminRouter;