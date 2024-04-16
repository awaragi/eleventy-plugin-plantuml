const fs = require("fs");

const eleventyPluginPlantuml = require("../lib/eleventy-plugin-plantuml");

const previewFile = "/tmp/eleventy-plugin-plantuml-test.html";

appendContent = (title, content) => {
    // append content to the end of the file /tmp/eleventy-plugin-plantuml-test.html
    fs.appendFileSync(
        previewFile,
        `<h1>${title}</h1><p>${content}</p>`,
        (err) => {
            if (err) throw err;
        }
    );
}

describe("Eleventy PlantUML Test Suite", () => {
    beforeAll(() => {
        // create the file /tmp/eleventy-plugin-plantuml-test.html
        fs.writeFileSync(previewFile, "<html lang='en'><body>");
    });

    test("Testing a e2e basic PNG conversion", () => {
        const img = eleventyPluginPlantuml.highlight(
            `@startuml
Bob -> Alice : hello
@enduml`,
            eleventyPluginPlantuml.defaultOptions
        );
        appendContent("basic PNG conversion", img);
        expect(img.startsWith('<img class="plantuml" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA')).toBeTruthy();
    });

    it("Testing a e2e large PNG conversion", () => {
        const img = eleventyPluginPlantuml.highlight(
            `@startuml
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
@enduml`,
            eleventyPluginPlantuml.defaultOptions
        );
        appendContent("large PNG conversion", img);
        expect(img.startsWith('<img class="plantuml" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA')).toBeTruthy();
    });

    it("Testing a e2e basic SVG conversion", () => {
        const img = eleventyPluginPlantuml.highlight(
            `@startuml
Bob -> Alice : hello
@enduml`,
            Object.assign({}, eleventyPluginPlantuml.defaultOptions, {
                outputType: "svg",
            })
        );
        appendContent("basic SVG conversion", img);
        expect(img.startsWith('<?xml version="1.0" encoding="us-ascii" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" contentStyleType="text/css" ')).toBeTruthy();
    });

    it("Testing a e2e large SVG conversion", () => {
        const img = eleventyPluginPlantuml.highlight(
            `@startuml
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
@enduml`,
            Object.assign({}, eleventyPluginPlantuml.defaultOptions, {
                outputType: "svg",
            })
        );
        appendContent("large SVG conversion", img);
        expect(img.startsWith('<?xml version="1.0" encoding="us-ascii" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" contentStyleType="text/css" ')).toBeTruthy();
    });

    it("Testing e2e conversion w/txt output type", () => {
        const img = eleventyPluginPlantuml.highlight(
            `@startuml
Bob -> Alice : hello
@enduml`,
            Object.assign({}, eleventyPluginPlantuml.defaultOptions, {
                outputType: "txt",
            })
        );
        expect(img).toBe("");
    });

    it("Testing e2e conversion w/invalid output type", () => {
        const img = eleventyPluginPlantuml.highlight(
            `@startuml
Bob -> Alice : hello
@enduml`,
            Object.assign({}, eleventyPluginPlantuml.defaultOptions, {
                outputType: "asdf",
            })
        );
        expect(img).toBe("");
    });

    it("Testing url generation", () => {
        const url = eleventyPluginPlantuml.generatePlantumlUrl("ABC", {
            protocol: "https",
            hostname: "localhost",
            port: "8080",
            prefix: "/path",
            outputType: "png",
        });
        expect(url).toBe("https://localhost:8080/path/png/ABC");
    });

    it("Testing img tag generation", () => {
        const tag = eleventyPluginPlantuml.generateImgTag("ABC", {
            imgClass: "plantuml",
        });
        expect(tag).toBe(
            '<img class="plantuml" src="data:image/png;base64,ABC" alt="Plantuml Diagram" />'
        );
    });

    it("Test request timeout", () => {
        try {
            eleventyPluginPlantuml.highlight(
                `@startuml @enduml`,
                Object.assign({}, eleventyPluginPlantuml.defaultOptions, {
                    requestTimeout: 1,
                })
            );
            // should not get here
            expect(false).beTruthy();
        } catch (e) {
            // test passed
            expect(e).toBeInstanceOf(Error);        }
    });

    it("Test request socket timeout", () => {
        try {
            eleventyPluginPlantuml.highlight(
                `@startuml @enduml`,
                Object.assign({}, eleventyPluginPlantuml.defaultOptions, {
                    requestSocketTimeout: 1,
                })
            );
            // should not get here
            expect(false).beTruthy();
        } catch (e) {
            // test passed
            expect(e).toBeInstanceOf(Error);
        }
    });
});
