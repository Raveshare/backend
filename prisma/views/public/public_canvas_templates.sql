SELECT
  canvases.id,
  canvases.data,
  canvases.params,
  canvases."isPublic",
  canvases."ipfsLink",
  canvases."imageLink",
  canvases."createdAt",
  canvases."updatedAt",
  canvases."ownerAddress",
  canvases."referredFrom",
  canvases."isGated",
  canvases."allowList",
  canvases."gatedWith",
  canvases."tags",
  canvases."assetsRecipientElementData"
  canvases."ownerId"
FROM
  canvases
WHERE
  (canvases."isPublic" = TRUE)
ORDER BY
  canvases."createdAt" DESC;
