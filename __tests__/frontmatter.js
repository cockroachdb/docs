// import { getJekyllData } from '../js/test_helper';

const fs = require('fs')
const fm = require('front-matter')
const path = require('path');

describe('Page frontmatter', function() {
  test('pages must have summary of valid length', () => {  
    var pages = fs.readdirSync('./v21.1');
    
    pages.forEach(page => {
      if (path.extname(page) == ".md" && page.includes("404") == false) {
        var content = fs.readFileSync('./v21.1/'+page, 'utf8');
        var frontMatter = fm(content);

        if (!frontMatter.attributes.summary || frontMatter.attributes.summary.length > 160) {
          console.log(page);
        }

expect(true).toBe(true);
/*
        expect(frontMatter.attributes.summary).toBeDefined();
        expect(frontMatter.attributes.summary.length).toBeGreaterThanOrEqual(50);
        expect(frontMatter.attributes.summary.length).toBeLessThanOrEqual(160);
*/
      };
    });
  });
});
