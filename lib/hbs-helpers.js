module.exports = [
  {
    name: 'ifEqual',
    fn: function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  },
  {
    name: 'metaForPage',
    fn: function (pageId, metaProp) {
      return this[pageId].meta[metaProp];
    }
  },
  {
    name: 'encodeURLParam',
    fn: function (param) {
      return encodeURIComponent(param);
    }
  },
  {
    name: 'encodeWorkPage',
    fn: function (slug) {
      return encodeURIComponent('http://blameyourbrother.github.io/work/' + slug + '.html');
    }
  }
];
