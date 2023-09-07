const templateRouter = require("express").Router();
const prisma = require("../../prisma")
const cache = require("../../middleware/cache");

templateRouter.get("/", cache("5 hours"), async (req, res) => {
  try {
    let page = req.query.page;
    page = parseInt(page);

    let limit = req.query.limit || 20;

    if (!page) page = 1;

    offset = limit * (page - 1);

    const templates = await prisma.template_view.findMany({
      skip: offset
    })

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
  let address = req.user.address;
  let page = req.query.page;
  page = parseInt(page);

  let limit = req.query.limit || 10;

  if (!page) page = 1;

  offset = limit * (page - 1);

  try {
    let publicTemplates = await prisma.public_canvas_templates.findMany({
      take: limit,
      skip: offset,
    });

    let publicTemplatesCount = await prisma.public_canvas_templates.count({});

    publicTemplates = publicTemplates.map((template) => {
      if (template.isGated) {
        if (template.allowList.includes(address)) {
          template.allowList = [];
          return template;
        } else {
          template.data = {};
          template.allowList = [];
          return template;
        }
      } else {
        template.allowList = [];
        return template;
      }
    });

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

// templateRouter.post("/", async (req, res) => {
//   let data, name;
//   try {
//     data = req.body.data;
//     name = req.body.name;
//   } catch (error) {
//     res.status(400).json({
//       status: "error",
//       message: "Invalid request body",
//     });
//   }

//   try {
//     let json = JSON.stringify(data);
//     // let imageBuffer = await getImageBuffer(json);
//     // TODO : integrate with S3
//     let imageBuffer = null;
//     let random = Math.floor(Math.random() * 1000000000);
//     let filepath = `templates/${name} - ${random}.png`;
//     let image = await uploadImageToS3(imageBuffer, filepath);

//     let template = await templateSchema.create({
//       name: name,
//       data: data,
//       image: image,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Template created successfully",
//     });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

module.exports = templateRouter;
