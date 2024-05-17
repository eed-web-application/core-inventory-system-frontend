const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy middleware for /api/cis
  app.use(
    '/api/cis',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
      pathRewrite: { '^/api/cis': '' },
    })
  );

};