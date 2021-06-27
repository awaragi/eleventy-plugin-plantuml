const request = require("sync-request");
const plantumlEncode = require("./plantumlEncode");

const defaultOptions = {
  protocol: "http",
  hostname: "www.plantuml.com",
  port: "80",
  prefix: "/plantuml",
  outputType: "png",
  imgClass: "plantuml",
};

function generatePlantumlUrl(encoded, options) {
  return `${options.protocol}://${options.hostname}${
    options.port === 80 ? "" : options.port === 443 ? "" : ":" + options.port
  }${options.prefix}/${options.outputType}/${encoded}`;
}

const generateImageAsBase64String = (url, options) => {
  // request url
  const response = request("GET", url);
  // convert from Uint8Array to buffer to base64 string
  return Buffer.from(response.getBody()).toString("base64");
};

const generateImgTag = (imageBase64, options) => {
  return `<img class="${options.imgClass}" src="data:image/png;base64,${imageBase64}" alt="Plantuml Diagram" />`;
};

const highlight = (diagram, options) => {
  // compute compressed version of str
  const encoded = plantumlEncode(diagram);
  // URL to send to plantuml for conversion
  const url = generatePlantumlUrl(encoded, options);
  // Call plantuml server to generate image
  const imageBase64 = generateImageAsBase64String(url, options);
  // Finally convert image to dataurl
  return generateImgTag(imageBase64, options);
};

const plugin = (eleventyConfig, pluginOptions = {}) => {
  // default options
  const options = Object.assign({}, defaultOptions, pluginOptions);

  // preserve chain of highlighter
  const highlighter = eleventyConfig.markdownHighlighter;

  // add highlighter
  eleventyConfig.addMarkdownHighlighter((diagram, language) => {
    if (language === "plantuml") {
      return highlight(diagram, options);
    }
    // just in case highlighter is not enabled in which case I am not sure why we are doing
    if (highlighter) {
      return highlighter(diagram, language);
    }
    // default highlighter just in case
    return `<pre class="${language}">${diagram}</a>`;
  });
  return {};
};

module.exports = {
  defaultOptions,
  plugin,
  highlight,

  generatePlantumlUrl,
  generateImageAsBase64String,
  generateImgTag,
};
