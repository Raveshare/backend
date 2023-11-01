const winston = require("winston");
const { format } = require("winston");

const log = winston.createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

function logger(req, res, next) {
  log.info({
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    // headers: req.headers,
  });

  res.on("finish", () => {
    log.info({
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      message: res.message,
      body: res.body,
      headers: res.headers,
    });
  });
  next();
}

module.exports = logger;
