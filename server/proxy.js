const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 3001;

const target = process.env.API_PROXY_TARGET;

app.use('/api', createProxyMiddleware({
  target,
  changeOrigin: true,
  cookieDomainRewrite: { [target]: 'localhost' },
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.body) {
        proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        proxyReq.write(req.body);
        proxyReq.end();
      }
    },
  },
}));

app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
});
