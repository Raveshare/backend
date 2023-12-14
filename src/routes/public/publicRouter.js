const router = require("express").Router();
const prisma = require("../../prisma");

router.get("/templates", async (req, res) => {
  let page = req.query.page;
  let limit = req.query.limit || 20;

  page = page ? parseInt(page) : 1;
  let offset = (page - 1) * limit;

  console.log("page", page);
  console.log("limit", limit);

  let templates = await prisma.public_canvas_templates.findMany({
    select: {
      id: true,
      imageLink: true,
      owner: {
        select: {
            evm_address: true,
            username: true,
        }
      }

    },
    skip: offset,
    take: limit,
    orderBy: {
        createdAt: "desc"
    }
  });

  let template_count = await prisma.public_canvas_templates.count();
  let template_count_pages = Math.ceil(template_count / limit);

  res.send({
    message: templates,
    nextPage: page + 1 > template_count_pages ? null : page + 1,
  });
});

module.exports = router;
