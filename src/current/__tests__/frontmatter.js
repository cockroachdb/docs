const fm = require('front-matter')
const fs = require('fs')
const helper = require('./../js/test_helper')

describe('Page frontmatter', function() {
  test('should have summaries of 50-160 characters', () => {
    var pages = helper.iterateVersions();

    pages.forEach(page => {
      var content = fs.readFileSync('./'+page, 'utf8');
      var frontMatter = fm(content);

      printOnFail(page, () => {
        expect(frontMatter.attributes.summary).toBeDefined();
        expect(frontMatter.attributes.summary.length).toBeGreaterThanOrEqual(50);
        expect(frontMatter.attributes.summary.length).toBeLessThanOrEqual(160);
      });
    });
  });
});

const printOnFail = (message, fn) => {
  try {
    fn();
  } catch (e) {
    e.message = `${message}\n\n${e.message}`;
    throw e;
  }
};
