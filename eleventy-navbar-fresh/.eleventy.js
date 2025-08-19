module.exports = function(eleventyConfig) {
  // Passthrough assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");

  // Default layout so navbar renders on all pages
  eleventyConfig.addGlobalData("layout", "base.njk");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
