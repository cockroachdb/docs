module.exports = function(eleventyConfig) {
    // Copy static assets
    eleventyConfig.addPassthroughCopy("src/docs/assets");
  
    return {
      dir: {
        input: "src/docs",      // your Markdown files
        includes: "../layouts", // layouts directory
        output: "public",       // build folder
      },
      markdownTemplateEngine: "njk",
      htmlTemplateEngine:   "njk",
      dataTemplateEngine:   "njk",
    };
  };
  