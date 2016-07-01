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

const cwd = process.env.INIT_CWD || process.cwd();

try {
  config = Object.assign(defaults, require(`${cwd}/lll.config`));
} catch (e) {
  config = defaults;
  console.warn('Not found lll.config.js');
}

export default config;
