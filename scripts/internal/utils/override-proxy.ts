export function overrideProxy() {
  // Override current environment proxy settings with npm configuration, if any.
  const NPM_HTTPS_PROXY = process.env['npm_config_https_proxy'] || process.env['npm_config_proxy'];
  const NPM_HTTP_PROXY = process.env['npm_config_http_proxy'] || process.env['npm_config_proxy'];
  const NPM_NO_PROXY = process.env['npm_config_no_proxy'];

  if (NPM_HTTPS_PROXY) {
    process.env['HTTPS_PROXY'] = NPM_HTTPS_PROXY;
  }
  if (NPM_HTTP_PROXY) {
    process.env['HTTP_PROXY'] = NPM_HTTP_PROXY;
  }
  if (NPM_NO_PROXY) {
    process.env['NO_PROXY'] = NPM_NO_PROXY;
  }
}
