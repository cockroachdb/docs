const yaml = require("js-yaml");
const sass = require("sass");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Handle YAML data files
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));

  // Static assets
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  // Custom URL filter to replace Jekyll's relative_url
  eleventyConfig.addFilter("url", function(url) {
    if (!url) return "";
    if (url.startsWith('http')) return url;

    // Ensure leading slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `/docs${cleanUrl}`;
  });

  eleventyConfig.addFilter("safe", function(value) {
    return value; // LiquidJS does not escape by default
  });

  eleventyConfig.addFilter("sass", function(code) {
    return sass.renderSync({ data: code }).css.toString();
  });

  // Version URL filter for handling stable/dev version replacements
  eleventyConfig.addFilter("versionUrl", function(url) {
    const versions = this.ctx.versions || {};
    if (!url) return "";
    
    return url
      .replace('/stable/', `${versions.stable}`)
      .replace('/dev/', `${versions.dev}`);
  });

  // Convert date to ISO format
  eleventyConfig.addFilter("isoDate", function(date) {
    return date ? new Date(date).toISOString() : '';
  });

  // Liquid options
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: true
  });

  // Watch targets
  eleventyConfig.addWatchTarget("./css/");
  eleventyConfig.addWatchTarget("./js/");

  // SCSS Compilation
  eleventyConfig.addTemplateFormats("scss");

  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: async function(inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }
      
      let result = sass.compileString(inputContent, {
        loadPaths: [
          parsed.dir || ".",
          this.config.dir.includes,
          "src/eleventy/src/css", // Add your base SCSS path
          "src"                   // Add src directory
        ],
        sourceMap: true
      });
      
      return async () => result.css;
    }
  });

  // Base Configuration
  return {
    dir: {
      input: ".",         
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    pathPrefix: "/docs/",
    templateFormats: ["md", "html", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
};
