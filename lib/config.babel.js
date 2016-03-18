let config;

const defaults = {
  siteName: null,
  description: null,
  keywords: null,
  another: null,
  token: {
    header: '<!-- head -->',
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
