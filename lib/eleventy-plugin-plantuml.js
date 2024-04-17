const request = require("sync-request");
const plantumlEncode = require("./plantumlEncode");

const defaultOptions = {
  protocol: "http",
  hostname: "www.plantuml.com",
  port: "80",
  prefix: "/plantuml",
  outputType: "png",
  imgClass: "plantuml",
  request: undefined,
};

function generatePlantumlUrl(encoded, options) {
  return `${options.protocol}://${options.hostname}${
    options.port === 80 ? "" : options.port === 443 ? "" : ":" + options.port
  }${options.prefix}/${options.outputType}/${encoded}`;
}

const fetchImage = (url, options) => {
  // request url
  const response = request("GET", url, options.request);
  // convert from Uint8Array to buffer
  return Buffer.from(response.getBody());
};

const generateImgTag = (imageBase64, options) => {
  return `<img class="${options.imgClass}" src="data:image/png;base64,${imageBase64}" alt="Plantuml Diagram" />`;
};

const outputTypes = {
  // For PNG, convert raw image to base 64, generate img tag, and embed into HTML
  png: function (imageFromServer, options) {
    return generateImgTag(imageFromServer.toString("base64"), options);
  },

  // For SVG, embed raw image directly into HTML
  svg: function (imageFromServer, options) {
    return imageFromServer.toString();
  },
};

const highlight = (diagram, options) => {
  if (!outputTypes.hasOwnProperty(options.outputType)) {
    // in this default case, the PlantUML code will remain unchanged; and this avoids errors e.g. when fetching image from server
    return "";
  }

  // compute compressed version of str
  const encoded = plantumlEncode(diagram);
  // URL to send to plantuml for conversion
  const url = generatePlantumlUrl(encoded, options);
  // Call plantuml server to generate image
  const imageFromServer = fetchImage(url, options);
  // Final processing of image depending on output type
  return outputTypes[options.outputType](imageFromServer, options);
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
    return `<pre class="${language}">${diagram}</pre>`;
  });
  return {};
};

module.exports = {
  defaultOptions,
  plugin,
  highlight,

  generatePlantumlUrl,
  fetchImage,
  generateImgTag,
};
