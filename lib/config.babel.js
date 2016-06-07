let config;

const defaults = {
  siteName: null,
  description: null,
  keywords: null,
  another: null,
  token: {
    header: '<!-- more -->',
    breaker: '<!-- break -->'
  },
  cwd: process.cwd()
};

try {
  config = Object.assign(defaults, require(`${process.cwd()}/lll.config`));
} catch (e) {
  config = Object.assign(defaults, {});
  console.warn('Not found lll.config.js');
}

export default config;
