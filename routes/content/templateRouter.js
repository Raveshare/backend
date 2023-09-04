const templateRouter = require("express").Router();
const templateSchema = require("../../schema/templateSchema");
const canvasSchema = require("../../schema/canvasSchema");
const cache = require("../../middleware/cache");
const uploadImageToS3 = require("../../functions/uploadImageToS3");

templateRouter.get("/", cache('5 hours') , async (req, res) => {
  try {

    let page = req.query.page;
    page = parseInt(page)

    let limit = req.query.limit || 20;

    if(!page) page = 1

    offset = limit * (page - 1)

    const templates = await templateSchema.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    let totalAssets = await templateSchema.count();

    let totalPage = Math.ceil(totalAssets / limit)

    let nextPage = page + 1 > totalPage ? null : page + 1;

    res.status(200).json({
      assets : templates,
      totalPage,
      nextPage
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

templateRouter.get("/user", cache('5 minutes') , async (req, res) => {
  let address = req.user.address;
  let page = req.query.page;
  page = parseInt(page)

  let limit = req.query.limit || 10;

  if(!page) page = 1;
  
  offset = limit * (page - 1);


  try {
    let publicTemplates = await canvasSchema.findAll({
      where: {
        isPublic: true,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    let publicTemplatesCount = await canvasSchema.count({
      where : {
        isPublic : true
      }
    })

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

    totalPage = Math.ceil(publicTemplatesCount / limit)

    console.log(page, totalPage)


    res.status(200).json({
      assets : publicTemplates,
      totalPage,
      nextPage: page + 1 > totalPage ? null : page + 1,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

templateRouter.post("/",  async (req, res) => {
  let data, name;
  try {
    data = req.body.data;
    name = req.body.name;
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Invalid request body",
    });
  }

  try {
    let json = JSON.stringify(data);
    // let imageBuffer = await getImageBuffer(json);
    // TODO : integrate with S3
    let imageBuffer = null;
    let random = Math.floor(Math.random() * 1000000000);
    let filepath = `templates/${name} - ${random}.png`;
    let image = await uploadImageToS3(imageBuffer, filepath);

    let template = await templateSchema.create({
      name: name,
      data: data,
      image: image,
    });

    res.status(200).json({
      status: "success",
      message: "Template created successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = templateRouter;
