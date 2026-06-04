const { httpRequestsTotal, httpRequestDurationSeconds } = require('../utils/metrics');

function getRouteLabel(req) {
  if (req.route && req.route.path) {
    return `${req.baseUrl}${req.route.path}`;
  }

  return req.path;
}

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationSeconds = Number(endTime - startTime) / 1e9;
    const labels = {
      method: req.method,
      route: getRouteLabel(req),
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  return next();
}

module.exports = {
  metricsMiddleware,
};
