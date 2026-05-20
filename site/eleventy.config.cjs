const markdownIt = require("markdown-it");
const md = markdownIt({ html: true });

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("markdownify", (str) => str ? md.render(str) : "");
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // Watch CSS for changes
  eleventyConfig.addWatchTarget("src/assets/css/");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
