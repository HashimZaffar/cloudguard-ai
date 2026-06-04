const client = require('prom-client');

const registry = new client.Registry();

client.collectDefaultMetrics({
  register: registry,
});

const httpRequestsTotal = new client.Counter({
  name: 'cloudguard_auth_http_requests_total',
  help: 'Total number of HTTP requests handled by auth-service',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'cloudguard_auth_http_request_duration_seconds',
  help: 'HTTP request duration in seconds for auth-service',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
});

const loginAttemptsTotal = new client.Counter({
  name: 'cloudguard_auth_login_attempts_total',
  help: 'Total number of login attempts by outcome',
  labelNames: ['status'],
  registers: [registry],
});

const userRegistrationsTotal = new client.Counter({
  name: 'cloudguard_auth_user_registrations_total',
  help: 'Total number of user registration attempts by outcome',
  labelNames: ['status'],
  registers: [registry],
});

module.exports = {
  registry,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  loginAttemptsTotal,
  userRegistrationsTotal,
};
