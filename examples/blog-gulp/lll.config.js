module.exports = {
  siteName: 'Blog Gulp',
  description: 'blog glob',
  keywords: [],
  another: 'nju33',

  clouds: {
    categories: {
      data: {
        parent: 'cloud',
        dirname: 'src/categories/',
        base: 'src',
        title: '{{title}}カテゴリーが付いた記事',
        titleIndex: 'カテゴリー一覧'
      },
      opts: {}
    },
    tags: {
      data: {
        parent: 'cloud',
        dirname: 'src/tags/',
        base: 'src',
        title: '{{title}}タグが付いた記事',
        titleIndex: 'タグ一覧'
      },
      opts: {}
    }
  },

  separator: '|',
  token: {
    header: '<!-- more -->',
    breaker: '<!-- break -->'
  }
};
