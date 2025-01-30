module.exports = function (eleventyConfig) {
    // Add a custom filter to handle SCSS (scssify)
    eleventyConfig.addFilter("scssify", function (value) {
      // Implement SCSS processing logic if necessary, for now, returning the value as is
      return value;
    });
  
    return {
      dir: {
        input: ".",
        includes: "_includes",
        layouts: "_layouts",
        output: "_site",
      },
      markdownTemplateEngine: "liquid", // Using Liquid for markdown files
      htmlTemplateEngine: "liquid", // Using Liquid for HTML files
    };
  };
  