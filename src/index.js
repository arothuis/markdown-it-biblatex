const { existsSync, readFileSync } = require('fs');
const { BibLatexParser, CSLExporter } = require('biblatex-csl-converter');
const CSL = require('citeproc');

const { parser } = require('./parser');
const { renderer } = require('./renderer');

const DEFAULT_OPTIONS = {
  // Where to find the biblatex file (.bib)
  bibPath: null,

  // Change locale for displaying references and bibliography (.xml)
  // See: https://github.com/citation-style-language/locales
  localePath: `${__dirname}/csl/locales-en-US.xml`,

  // Change citation style for displaying references and bibliography (.csl)
  // See: https://github.com/citation-style-language/styles
  stylePath: `${__dirname}/csl/apa-6th-edition.csl`,

  // Reload bib, locale and styles on every render
  // This could be a useful option when working with a live updating plugin,
  // at the cost of performance
  alwaysReloadFiles: false,

  // Don't throw errors if references are missing
  allowMissingRefs: false,

  // Which mark to use for suppress-author (don't show author)
  suppressAuthorMark: '-',

  // Which mark to use for author-only (only show author)
  authorOnlyMark: '!',

  // Which mark to use for composite (inline text citation, i.e. without parentheses)
  compositeMark: '~',

  // Which mark to use to signify an infix text for composite citations
  infixMark: '^',

  // Mark for placement of bibliography layout
  // (choose carefully to prevent collissions with other tokens)
  bibliographyMark: '[bibliography]',

  // Replace bibliography title element
  bibliographyTitle: '<h2 class="bibliography-title">Bibliography</h2>',

  // Wrap bibliography in a div
  wrapBibliography: true,

  // Element that wraps bibliography contents
  bibliographyContentsWrapper: 'div',

  // Element that wraps bibliography entry
  bibliographyEntryWrapper: 'div',

  // Whether or not to add anchor tags from citations to bibliography items
  linkToBibliography: false,

  // Whether or not to always append a bibliography at the end of a file
  // Note: the order in which you add this plugin in relation to others may matter!
  appendBibliography: false,
};

function mdBibLatexPlugin(md, _options) {
  const options = { ...DEFAULT_OPTIONS, ..._options };

  const { bibData, citeproc } = loadFiles(options);
  const context = { options, bibData, citeproc, loadFiles };

  const parse = parser(context);
  const render = renderer(context);

  // Parsing / tokenization
  md.inline.ruler.after('image', 'biblatex_reference', parse.reference);
  md.block.ruler.after('reference', 'biblatex_bibliography', parse.bibliography, {
    alt: ['paragraph', 'reference'],
  });

  if (options.appendBibliography) {
    md.core.ruler.push('biblatex_append_bibliography', parse.appendBibliography);
  }

  // Rendering
  md.renderer.rules.biblatex_reference = render.reference;
  md.renderer.rules.biblatex_bibliography_open = render.bibliographyOpen;
  md.renderer.rules.biblatex_bibliography_contents = render.bibliographyContents;
  md.renderer.rules.biblatex_bibliography_close = render.bibliographyClose;
}

function loadFiles(options) {
  const { bibPath, stylePath, localePath } = options;

  if (bibPath === null) {
    throw new Error(
      'Could not import biblatex bibliography:' +
        " please supply 'bibPath' in the markdown-it-biblatex plugin's options" +
        ' with the (relative) path to the .bib file to use.'
    );
  }

  if (!existsSync(bibPath)) {
    throw new Error(`Could not import biblatex file: "${bibPath}" not found`);
  }

  const contents = readFileSync(bibPath, 'utf-8');
  const bibResult = new BibLatexParser(contents).parse();

  if (bibResult.errors.length > 0) {
    throw new Error(
      `Could not parse bibtex file, because of the following errors: \n${JSON.stringify(
        bibResult.errors
      )}`
    );
  }

  const cslResult = new CSLExporter(bibResult.entries).parse();
  const ids = {};
  Object.keys(bibResult.entries).forEach((id) => {
    ids[bibResult.entries[id].entry_key] = id;
  });

  const style = readFileSync(stylePath, 'utf-8');
  const locale = readFileSync(localePath, 'utf-8');
  const sys = {
    retrieveLocale: () => locale,
    retrieveItem: (id) => cslResult[id],
  };
  const citeproc = new CSL.Engine(sys, style);

  return {
    bibData: {
      ids,
      cslResult,
      style,
      locale,
      sys,
    },
    citeproc,
  };
}

module.exports = mdBibLatexPlugin;
