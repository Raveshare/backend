SELECT
  templates.id,
  templates.data,
  templates.name,
  templates.image,
  templates."createdAt",
  templates."updatedAt",
  templates.tags
FROM
  templates
ORDER BY
  templates."createdAt" DESC
LIMIT
  20;