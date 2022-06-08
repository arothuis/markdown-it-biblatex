const { expect } = require("chai");

const markdownIt = require("markdown-it");
const mdBiblatex = require("../src");
const { readFileSync } = require("fs");

const md = markdownIt();

const fixture = name => readFileSync(`${__dirname}/fixtures/${name}`, "utf-8");

// Very broad tests, primarily for guarding against regressions
// and illustrating expected outcomes
//
// Finicky to maintain, but illustrative for desired outputs
//  @TODO: Replace with snapshot testing when API stabilizes
describe("markdown-it plug-in", function () {
    context("default configuration", function () {
        md.use(mdBiblatex, { bibPath: `${__dirname}/fixtures/full-example.bib` });

        specify("extensive example (flaky)", function () {
            const input = fixture("full-example.md");
            const output = md.render(input);

            const expected = fixture("full-example.html");
            expect(output).to.equal(expected);
        });

        specify("bibliography only contains cited items", function () {
            const input = fixture("select-bibliography.md");
            const output = md.render(input);

            const expected = fixture("select-bibliography.html");
            expect(output).to.equal(expected);
        });

        specify("bibliography does not get printed if not marked", function () {
            const input = fixture("no-bibliography.md");
            const output = md.render(input);

            const expected = fixture("no-bibliography.html");
            expect(output).to.equal(expected);
        });

        specify("no cited items, no bibliography, despite mark", function () {
            const input = fixture("no-items.md");
            const output = md.render(input);

            const expected = fixture("no-items.html");
            expect(output).to.equal(expected);
        });

        specify("infix for composite citations", function () {
            const input = fixture("infix-composite.md");
            const output = md.render(input);

            const expected = fixture("infix-composite.html");
            expect(output).to.equal(expected);
        });
    });

    context("custom configuration", function () {
        specify("custom citation style (via: github.com/citation-style-language/styles)", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                stylePath: __dirname + "/fixtures/csl/chicago-author-date-16th-edition.csl",
            });

            const input = fixture("full-example.md");
            const output = md.render(input);
            
            const expected = fixture("full-example-chicago.html");
            expect(output).to.equal(expected);
        });

        specify("custom locale (via: github.com/citation-style-language/locales)", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                locale: __dirname + "/fixtures/csl/locales-nl-NL.xml",
            });

            const input = fixture("full-example.md");
            const output = md.render(input);
            
            const expected = fixture("full-example-nl-nl.html");
            expect(output).to.equal(expected);
        });
        
        specify("custom marks for modes: composite, suppress-author, author-only", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                compositeMark: "composite",
                suppressAuthorMark: "suppress",
                authorOnlyMark: "author-only",
            });

            const input = fixture("custom-ref-marks.md");
            const output = md.render(input);
            
            const expected = fixture("custom-ref-marks.html");
            expect(output).to.equal(expected);
        });

        specify("custom mark for placing bibliography", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                bibliographyMark: "[bib-here]",
            });

            const input = fixture("custom-bibliography-mark.md");
            const output = md.render(input);
            
            const expected = fixture("custom-bibliography-mark.html");
            expect(output).to.equal(expected);
        });

        specify("custom classes for bibliography title", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                bibliographyTitleClasses: "sources",
            });

            const input = fixture("select-bibliography.md");
            const output = md.render(input);
            
            const expected = fixture("select-bibliography-custom-classes.html");
            expect(output).to.equal(expected);
        });

        specify("custom bibliography title", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                bibliographyTitle: "Sources",
            });

            const input = fixture("select-bibliography.md");
            const output = md.render(input);
            
            const expected = fixture("select-bibliography-custom-title.html");
            expect(output).to.equal(expected);
        });

        specify("no wrapping div for bibliography", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/full-example.bib",
                wrapBibliography: false,
            });

            const input = fixture("select-bibliography.md");
            const output = md.render(input);

            const expected = fixture("select-bibliography-no-wrap.html");
            expect(output).to.equal(expected);
        });
    });

    context("configuration errors", function () {
        specify("biblatex path not given", function () {
            expect(() => md.use(mdBiblatex, { bibPath: null }))
                .to.throw("bibPath");
        });
        
        specify("biblatex file not found", function () {
            expect(() => md.use(mdBiblatex, { bibPath: "not-found.bib" }))
                .to.throw("not found");
        });

        specify("biblatex file cannot be parsed", function () {
            expect(() => md.use(mdBiblatex, { bibPath: __dirname + "/fixtures/corrupt.bib" }))
                .to.throw("Could not parse");
        });
    });
});
