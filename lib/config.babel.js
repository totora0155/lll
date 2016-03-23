let config;

const defaults = {
  siteName: null,
  description: null,
  keywords: null,
  another: null,
  groups: [
    'categories',
    'tags',
  ],
  token: {
    header: '<!-- more -->',
    breaker: '<!-- break -->',
  }
};

try {
  config = Object.assign(defaults, require(`${process.cwd()}/lll.config`));
} catch (e) {
  config = Object.assign(defaults, {});
  console.warn('Not found lll.config.js');
}

export default config;
