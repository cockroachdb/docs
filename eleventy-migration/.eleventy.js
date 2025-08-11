const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItToc = require('markdown-it-table-of-contents');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Copy static assets (CSS as compiled files, no SCSS compilation)
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");

  // Configure Markdown
  const markdownLib = markdownIt({
    html: true,
    linkify: true,
    typographer: true
  })
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    permalinkClass: 'anchor-link',
    permalinkSymbol: '#'
  })
  .use(markdownItToc, {
    includeLevel: [2, 3, 4],
    containerClass: 'toc',
    markerPattern: /^\[\[toc\]\]/im
  });

  eleventyConfig.setLibrary('md', markdownLib);

  // Global data for site configuration
  eleventyConfig.addGlobalData("site", {
    title: "CockroachDB Docs",
    description: "CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.",
    url: "https://www.cockroachlabs.com",
    baseurl: "/docs",
    main_url: "https://www.cockroachlabs.com",
    current_version: "v25.2",
    versions: {
      stable: "v25.2",
      dev: "v25.3"
    }
  });

  // Filters
  eleventyConfig.addFilter("relative_url", function(url) {
    return url.startsWith('/') ? `/docs${url}` : url;
  });

  eleventyConfig.addFilter("strip_html", function(text) {
    return text ? text.replace(/<[^>]*>/g, '') : '';
  });

  eleventyConfig.addFilter("strip_newlines", function(text) {
    return text ? text.replace(/\n/g, ' ') : '';
  });

  eleventyConfig.addFilter("truncate", function(text, length = 160) {
    if (!text) return '';
    return text.length > length ? text.slice(0, length) + '...' : text;
  });

  // Collections for navigation
  eleventyConfig.addCollection("navigation", function(collection) {
    return collection.getFilteredByTag("nav").sort(function(a, b) {
      return a.data.order - b.data.order;
    });
  });

  // Collection for versioned pages
  eleventyConfig.addCollection("versionedPages", function(collection) {
    return collection.getFilteredByGlob("src/v*/*.md");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};