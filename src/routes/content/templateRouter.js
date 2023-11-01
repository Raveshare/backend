const templateRouter = require("express").Router();
const prisma = require("../../prisma");
const cache = require("../../middleware/cache");
const hasCollected = require("../../lens/api").hasCollected;
const jsonwebtoken = require("jsonwebtoken");
const {
  addElementToList,
  checkElementInList,
  getCache,
  setCache,
  deleteCache,
} = require("../../functions/cache/handleCache");
const { set, get } = require("lodash");

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

    let templatesCache = await getCache("templates");
    let templates;
    if (!templatesCache) {
      templates = await prisma.template_view.findMany({
        skip: offset,
      });

      await setCache("templates", JSON.stringify(templates));
    } else {
      templates = JSON.parse(templatesCache);
    }

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
    // TODO : cache
    // TODO: un-cache when /canvas/update is called

    let publicTemplatesCache = await getCache("publicTemplates");
    let publicTemplates;
    if (!publicTemplatesCache) {
      publicTemplates = await prisma.public_canvas_templates.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          updatedAt: "desc",
        },
      });
      await setCache("publicTemplates", JSON.stringify(publicTemplates));
    } else {
      publicTemplates = await JSON.parse(publicTemplatesCache);
    }

    let publicTemplatesCountCache = await getCache("publicTemplatesCount");
    let publicTemplatesCount;

    if (!publicTemplatesCountCache) {
      publicTemplatesCount = await prisma.public_canvas_templates.count({});
      await setCache("publicTemplatesCount", publicTemplatesCount);
    } else {
      publicTemplatesCount = publicTemplatesCountCache;
    }

    // TODO: cache
    // const publicTemplatesCount = await prisma.public_canvas_templates.count({});
    // console.log("FUCK YOU " + publicTemplatesCount);

    // TODO: cache
    let ownersCache = await getCache(`user_${user_id}`);
    let owners;
    if (!ownersCache) {
      owners = await prisma.owners.findUnique({
        where: {
          id: user_id,
        },
      });

      await setCache(`user_${user_id}`, JSON.stringify(owners));
    } else {
      owners = JSON.parse(ownersCache);
    }

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
          // TODO: cache
          let gateCanvasCache = await getCache(`gateCanvasCache_${canvasId}`);
          if (!collectedCache) {
            collected = await hasCollected(
              pubId,
              evm_address,
              accessToken,
              refreshToken
            );

            if (collected)
              await setCache(`collected_${user_id}_${pubId}`, collected);
          } else {
            collected = collectedCache;
          }
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
