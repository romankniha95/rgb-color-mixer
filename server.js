const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Proxy /cloudflare requests to https://api.cloudflare.com
app.use('/cloudflare', createProxyMiddleware({
  target: 'https://api.cloudflare.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: { '^/cloudflare': '' },
  logLevel: 'debug'
}));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
