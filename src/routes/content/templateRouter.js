const templateRouter = require("express").Router();
const prisma = require("../../prisma");
const cache = require("../../middleware/cache");
const hasCollected = require("../../lens/api-v2").hasCollected;
const jsonwebtoken = require("jsonwebtoken");

const { getCache, setCache } = require("../../functions/cache/handleCache");
const { CostExplorer } = require("aws-sdk");

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
  let evm_address = req.user.evm_address;
  let user_id = req.user.user_id;
  let page = req.query.page;
  page = parseInt(page);

  let limit = req.query.limit || 10;

  if (!page) page = 1;

  offset = limit * (page - 1);

  // let publicTemplates = await getCache(`public_templates_${page}_${limit}`);
  let publicTemplates = await prisma.public_canvas_templates.findMany({
    where: {
      isPublic: true,
    },
    skip: offset,
    take: limit,
  });

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
      // gatedWith.push(publicTemplates[i].gatedWith);
      publicTemplates[i].gatedWith.forEach((gated) => {
        gatedWith.push(gated);
        templateIds.push(publicTemplates[i].id);
      });
      // templateIds.push(publicTemplates[i].id);
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

  if (!owner.lens_auth_token) {
    hasCollectedPost = Array(publicTemplates.length).fill(false);
  } else {
    hasCollectedPost = await hasCollected(
      user_id,
      gatedWith,
      owner.lens_auth_token.accessToken,
      owner.lens_auth_token.refreshToken
    );
  }
  console.log(templateIds);
  console.log(hasCollectedPost);
  console.log(gatedWith);
  console.log(publicTemplates.length);

  for (let i = 0; i < publicTemplates.length; i++) {
    console.log(publicTemplates[i].id);
    if (templateIds.includes(publicTemplates[i].id)) {
      console.log("here");
      for (let j = 0; j < templateIds.length; j++) {
        if (publicTemplates[i].id === templateIds[j]) {
          if (!hasCollectedPost[j]) {
            publicTemplates[i].data = {};
            publicTemplates[i].allowList = [];
            // hasActed = true;
          }
          if(hasCollectedPost) {
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
});

module.exports = templateRouter;
