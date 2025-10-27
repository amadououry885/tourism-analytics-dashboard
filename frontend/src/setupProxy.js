const { createProxyMiddleware } = require("http-proxy-middleware");

const TARGET =
  "http://tourism-analytics-env.eba-usvnptsq.ap-southeast-1.elasticbeanstalk.com";

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: TARGET,
      changeOrigin: true,
      xfwd: true,
      secure: false, // allow self-signed EB certs
      logLevel: "silent",
    })
  );

  app.use(
    "/healthz",
    createProxyMiddleware({
      target: TARGET,
      changeOrigin: true,
      xfwd: true,
      secure: false,
      logLevel: "silent",
    })
  );
};
