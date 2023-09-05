-- CREATES A VIEW OF ALL PUBLIC CANVASES
CREATE OR REPLACE VIEW public_canvas_templates AS
SELECT *
FROM canvases
WHERE "isPublic" = true
ORDER BY "createdAt" DESC;

CREATE OR REPLACE VIEW template_view AS
SELECT *
FROM templates
ORDER BY "createdAt" DESC
LIMIT 20;