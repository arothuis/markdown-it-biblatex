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
        md.use(mdBiblatex, { bibPath: `${__dirname}/fixtures/bibliography.bib` });

        const examples = [
          ["a comprehensive example", "comprehensive"],
          ["bibliography only contains cited items", "select-bibliography"],
          ["bibliography does not get printed if no mark", "no-bibliography"],
          ["no cited items, no bibliography, despite mark", "no-items"],
          ["infix for composite citations", "infix-composite"],
        ];

        examples.forEach(([specification, fixtureName]) => {
          specify(specification, function () {
            const input = fixture(`${fixtureName}.md`);
            const output = md.render(input);

            const expected = fixture(`${fixtureName}.html`);
            expect(output).to.equal(expected);
          });
        });
    });

    context("custom configuration", function () {
        specify("custom citation style (via: github.com/citation-style-language/styles)", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/bibliography.bib",
                stylePath: __dirname + "/fixtures/csl/chicago-author-date-16th-edition.csl",
            });

            const input = fixture("comprehensive.md");
            const output = md.render(input);
            
            const expected = fixture("comprehensive-chicago.html");
            expect(output).to.equal(expected);
        });

        specify("custom locale (via: github.com/citation-style-language/locales)", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/bibliography.bib",
                locale: __dirname + "/fixtures/csl/locales-nl-NL.xml",
            });

            const input = fixture("comprehensive.md");
            const output = md.render(input);
            
            const expected = fixture("comprehensive-nl-nl.html");
            expect(output).to.equal(expected);
        });
        
        specify("custom marks for modes: composite, suppress-author, author-only", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/bibliography.bib",
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
                bibPath: __dirname + "/fixtures/bibliography.bib",
                bibliographyMark: "[bib-here]",
            });

            const input = fixture("custom-bibliography-mark.md");
            const output = md.render(input);
            
            const expected = fixture("custom-bibliography-mark.html");
            expect(output).to.equal(expected);
        });

        specify("custom classes for bibliography title", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/bibliography.bib",
                bibliographyTitleClasses: "sources",
            });

            const input = fixture("select-bibliography.md");
            const output = md.render(input);
            
            const expected = fixture("select-bibliography-custom-classes.html");
            expect(output).to.equal(expected);
        });

        specify("custom bibliography title", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/bibliography.bib",
                bibliographyTitle: "Sources",
            });

            const input = fixture("select-bibliography.md");
            const output = md.render(input);
            
            const expected = fixture("select-bibliography-custom-title.html");
            expect(output).to.equal(expected);
        });

        specify("no wrapping div for bibliography", function () {
            md.use(mdBiblatex, { 
                bibPath: __dirname + "/fixtures/bibliography.bib",
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
