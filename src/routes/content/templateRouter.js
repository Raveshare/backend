const templateRouter = require("express").Router();
const prisma = require("../../prisma");
const cache = require("../../middleware/cache");
const hasCollected = require("../../lens/api").hasCollected;
const jsonwebtoken = require("jsonwebtoken");
const {
  addElementToList,
  checkElementInList,
} = require("../../functions/handleCache");

templateRouter.get("/", cache("5 hours"), async (req, res) => {
  try {
    let page = req.query.page;
    page = parseInt(page);

    let limit = req.query.limit || 20;

    if (!page) page = 1;

    offset = limit * (page - 1);

    // this query can be cached again
    // as the templates are not changing frequently - 
    // so we can remove the cache middleware and cache till the templates are not updated
    const templates = await prisma.template_view.findMany({
      skip: offset,
    });

    let totalAssets = await prisma.template_view.count({});

    let totalPage = Math.ceil(totalAssets / limit);

    let nextPage = page + 1 > totalPage ? null : page + 1;

    res.status(200).json({
      assets: templates,
      totalPage,
      nextPage,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

templateRouter.get("/user", async (req, res) => {
  let evm_address = req.user.evm_address;
  let user_id = req.user.user_id;
  let page = req.query.page;
  page = parseInt(page);

  let limit = req.query.limit || 10;

  if (!page) page = 1;

  offset = limit * (page - 1);

  try {
    // this query can be cached again
    //  the cache for this query will get invalidated when a new template is created
    let publicTemplates = await prisma.public_canvas_templates.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        updatedAt: "desc",
      },
    });

    let publicTemplatesCount = await prisma.public_canvas_templates.count({});

    let owners = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
      select: {
        lens_auth_token: true,
        id: true,
      },
    });

    let accessToken, refreshToken;
    if (owners.lens_auth_token == null || evm_address == null) {
      accessToken = null;
      refreshToken = null;
    } else {
      accessToken = owners.lens_auth_token.accessToken;
      refreshToken = owners.lens_auth_token.refreshToken;

      let hasExpired = false;
      if (!accessToken || !refreshToken) {
        hasExpired = true;
      } else {
        const decodedToken = jsonwebtoken.decode(refreshToken, {
          complete: true,
        });

        hasExpired = decodedToken?.payload.exp < Date.now() / 1000;
      }

      if (hasExpired) {
        accessToken = null;
        refreshToken = null;
      }
    }

    for (let i = 0; i < publicTemplates.length; i++) {
      let template = publicTemplates[i];
      let isGated = template.isGated;
      if (!isGated) continue;
      let gatedWith = template.gatedWith;

      for (let j = 0; j < gatedWith.length; j++) {
        let pubId = gatedWith[j];
        if (pubId.length > 20) continue;
        let collected = false;
        if (accessToken) {
          collected = await hasCollected(
            pubId,
            evm_address,
            accessToken,
            refreshToken
          );
        }
        if (collected) {
          template.allowList = [];
          publicTemplates[i] = template;
        } else {
          template.data = {};
          template.allowList = [];
          publicTemplates[i] = template;
        }
      }
    }

    totalPage = Math.ceil(publicTemplatesCount / limit);

    res.status(200).json({
      assets: publicTemplates,
      totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = templateRouter;
