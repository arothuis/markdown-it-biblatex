const { existsSync, readFileSync } = require("fs");
const { BibLatexParser, CSLExporter } = require("biblatex-csl-converter");
const CSL = require("citeproc");

const { parser } = require("./parser");
const { renderer } = require("./renderer");

const DEFAULT_OPTIONS = {
    // Where to find the biblatex file (.bib)
    bibPath: null,

    // Change locale for displaying references and bibliography (.xml)
    // See: https://github.com/citation-style-language/locales
    localePath: __dirname + "/csl/locales-en-US.xml",

    // Change citation style for displaying references and bibliography (.csl)
    // See: https://github.com/citation-style-language/styles
    stylePath: __dirname + "/csl/apa-6th-edition.csl",

    // Which mark to use for suppress-author (don't show author)
    suppressAuthorMark: "-",

    // Which mark to use for author-only (only show author)
    authorOnlyMark: "!",

    //Which mark to use for composite (inline text citation, i.e. without parentheses)
    compositeMark: "~",

    // Mark for placement of bibliography layout 
    // (choose carefully to prevent collissions with other tokens)
    bibliographyMark: "[bibliography]",

    // Replace bibliography title (h2)
    bibliographyTitle: "Bibliography",

    // Replace bibliography title (h2) classes
    bibliographyTitleClasses: "bibliography-title",

    // Wrap bibliography in a div
    wrapBibliography: true,
};

function mdBibLatexPlugin(md, _options) {
    const options = Object.assign({}, DEFAULT_OPTIONS, _options);

    const bibData = importBibLatex(options);
    const citeproc = new CSL.Engine(bibData.sys, bibData.style);
    const context = { options, bibData, citeproc };

    const parse = parser(context);
    const render = renderer(context);

    // Parsing / tokenization
    md.inline.ruler.after("image", "biblatex_reference", parse.reference);
    md.block.ruler.after("reference", "biblatex_bibliography", parse.bibliography, { alt: [ "paragraph", "reference" ] });
    
    // Rendering
    md.renderer.rules.biblatex_reference = render.reference;
    md.renderer.rules.biblatex_bibliography_open = render.bibliographyOpen;
    md.renderer.rules.biblatex_bibliography_contents = render.bibliographyContents;
    md.renderer.rules.biblatex_bibliography_close = render.bibliographyClose;
}

function importBibLatex(options) {
    const { bibPath, stylePath, localePath } = options;

    if (bibPath === null) {
        throw new Error(
            "Could not import biblatex bibliography:"
            + " please supply 'bibPath' in the markdown-it-biblatex plugin's options" 
            + " with the (relative) path to the .bib file to use."
        );
    }

    if (!existsSync(bibPath)) {
        throw new Error(`Could not import biblatex file: "${bibPath}" not found`);
    }

    const contents = readFileSync(bibPath, "utf-8");
    const bibResult = new BibLatexParser(contents).parse();

    if (bibResult.errors.length > 0) {
        throw new Error(
            "Could not parse bibtex file, because of the following errors: \n"
            + JSON.stringify(bibResult.errors)
        );
    }

    const cslResult = new CSLExporter(bibResult.entries).parse();
    const ids = {};
    Object.keys(bibResult.entries).forEach(id => {
        ids[bibResult.entries[id].entry_key] = id;
    });

    const style = readFileSync(stylePath, "utf-8");
    const locale = readFileSync(localePath, "utf-8");

    return { 
        ids,
        cslResult,
        style,
        locale,
        sys: {
            retrieveLocale: _ => locale,
            retrieveItem: id => cslResult[id],
        }
    };
}

module.exports = mdBibLatexPlugin;