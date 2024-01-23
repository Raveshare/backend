const templateRouter = require("express").Router();
const prisma = require("../../prisma");
const hasCollected = require("../../lens/api-v2").hasCollected;
const checkAccessToken = require("../../lens/api-v2").checkAccessToken;
const { getCache, setCache } = require("../../functions/cache/handleCache");

templateRouter.get("/", async (req, res) => {
  try {
    let page = req.query.page;
    page = parseInt(page);

    let limit = req.query.limit || 20;

    if (!page) page = 1;

    offset = limit * (page - 1);

    let templatesCache = await getCache(`templates_${page}_${limit}`);
    let templates;
    if (!templatesCache) {
      templates = await prisma.template_view.findMany({
        skip: offset,
        take: limit,
      });

      await setCache(`templates_${page}_${limit}`, JSON.stringify(templates));
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
  try {
    let user_id = req.user.user_id;
    let page = req.query.page;
    page = parseInt(page);

    let limit = req.query.limit || 10;

    if (!page) page = 1;

    offset = limit * (page - 1);

    let publicTemplates = await getCache(`public_templates_${page}_${limit}`);
    if (!publicTemplates) {
      publicTemplates = await prisma.public_canvas_templates.findMany({
        where: {
          isPublic: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: offset,
        take: limit,
      });
      await setCache(
        `public_templates_${page}_${limit}`,
        JSON.stringify(publicTemplates)
      );
    } else {
      publicTemplates = JSON.parse(publicTemplates);
    }

    let copy = publicTemplates;

    let totalAssets = await prisma.public_canvas_templates.count({
      where: {
        isPublic: true,
      },
    });

    let totalPage = Math.ceil(totalAssets / limit);

    let nextPage = page + 1 > totalPage ? null : page + 1;

    let gatedWith = [];
    let templateIds = [];
    let canvasIds = [];

    for (let i = 0; i < publicTemplates.length; i++) {
      if (publicTemplates[i].gatedWith) {
        publicTemplates[i].gatedWith.forEach((gated) => {
          if (gated.length < 20) {
            gatedWith.push(gated);
            templateIds.push(publicTemplates[i].id);
          }
        });
      } else {
        gatedWith.push(null);
        templateIds.push(publicTemplates[i].id);
      }
    }

    let owner = await prisma.owners.findUnique({
      where: {
        id: user_id,
      },
    });

    let hasCollectedPost = [];
    let isAccessTokenValid = false;
    if (owner.lens_auth_token) {
      isAccessTokenValid = await checkAccessToken(
        owner.lens_auth_token.accessToken
      );
    }
    if (!owner.lens_auth_token || !isAccessTokenValid) {
      hasCollectedPost = Array(publicTemplates.length).fill(false);
    } else {
      hasCollectedPost = await hasCollected(
        user_id,
        gatedWith,
        owner.lens_auth_token.accessToken,
        owner.lens_auth_token.refreshToken
      );
    }
    for (let i = 0; i < publicTemplates.length; i++) {
      if (templateIds.includes(publicTemplates[i].id)) {
        for (let j = 0; j < templateIds.length; j++) {
          if (publicTemplates[i].id === templateIds[j]) {
            if (!hasCollectedPost[j]) {
              publicTemplates[i].data = {};
              publicTemplates[i].allowList = [];
            }
            if (hasCollectedPost) {
              publicTemplates[i].data = copy[i].data;
              publicTemplates[i].allowList = copy[i].allowList;
              break;
            }
          }
        }
      }
    }

    res.status(200).json({
      assets: publicTemplates,
      totalPage,
      nextPage,
    });
  } catch (error) {
    res.status(500).send({
      message: `Invalid Server Error: ${error.message}`,
    });
  }
});

module.exports = templateRouter;
