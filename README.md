# eleventy-plugin-plantuml

[![NPM Version](https://img.shields.io/npm/v/eleventy-plugin-plantuml)](https://www.npmjs.com/package/eleventy-plugin-plantuml)
[![NPM Downloads](https://img.shields.io/npm/dt/eleventy-plugin-plantuml)](https://www.npmjs.com/package/eleventy-plugin-plantuml)

[Eleventy](https://www.11ty.dev/) - [Plantuml](https://plantuml.com/) - [Plugin](https://www.11ty.dev/docs/plugins/). Uses sync request to connect to a plantuml server to convert markdown code block of type plantuml to an inline dataurl png `<img>`, or to svg code.

## Dependencies

- [eleventy](https://www.npmjs.com/package/@11ty/eleventy) A simpler static site generator for which this plugin is make.
- [sync-request](https://www.npmjs.com/package/sync-request) (for making blocking synchronous http request - not to be used in production)
- [jest](https://www.npmjs.com/package/jest) (for executing unit tests)
- [prettier](https://www.npmjs.com/package/prettier) (for keeping things clean and tidy)

## Installation

> This plugin requires markdown syntax highlighter plugin to work.

Ensure that the Eleventy syntaxhighlight plugin is added to .eleventy.js configuration

```javascript
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
// ...
eleventyConfig.addPlugin(syntaxHighlight);
```

Add plantuml plugin to configuration and optionally provide the configuration for private Plantuml server, imgClass, and output type.

```javascript
const plantuml = require('eleventy-plugin-plantuml');
eleventyConfig.addPlugin(plantuml.plugin, {
  protocol: "http",
  hostname: "localhost",
  port: 8888,
  prefix: "",
  outputType: "svg",
  imgClass: "plantuml", 
  requestTimeout: undefined, // undefined or millisecondes
  requestSocketTimeout: undefined, // undefined or millisecondes
});
```

If the server options are omitted, the plugin defaults to <http://plantuml.com/plantuml> server for conversion, and to PNG for output type.

By default the generated img tag will have class **plantuml** assigned to it. This can be overridden using options.imgClass value.

Timeout options are passed directly to the underlying request object. See https://www.npmjs.com/package/sync-request. They default to sync-request

## Using in templates

Simply create a markdown code block of type plantuml. It will be replaced by an img with inline png src (dataurl), or with svg code, depending on the value of the option `outputType`.

````
```plantuml
@startuml
!include https://raw.githubusercontent.com/bschwarz/puml-themes/master/themes/bluegray/puml-theme-bluegray.puml
participant "Makrdown Highlighter" as MDH
participant "eleventy-plugin-plantumt" as plugin
participant "Plantuml Server" as plantuml

MDH -> plugin : highlight
plugin -> plugin: compress url
plugin -> plantuml: GET /png/{url}
plantuml -> plugin: image/png
plugin -> plugin: base64
plugin -> MDH: img src="dataurl"
@enduml
```
````

The result is an image inserted (inline) in the generated html site (click to open)

[Sequence diagram](https://github.com/awaragi/eleventy-plugin-plantuml/blob/master/diagram.png)

## Contribute

- create a fork of this repo
- make your changes
- run prettier for code format consistency
- test your code by running `yarn test` or `npm test`
- create a Pull Request
- Send me an email in case I miss the PR notification

## Testing

Execute `yarn test` or `npm test` to execute integration tests against <plantuml.com/plantuml> live server

Test script will create an HTML file for visual inspection of generated content. The file is in a constant and by default
is /tmp/eleventy-plugin-plantuml-test.html. Simply open the file in your favorite browser and ensure that four diagrams 
are present and look okay.
