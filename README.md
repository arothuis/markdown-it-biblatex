# @arothuis/markdown-it-biblatex

[![Coverage Status](https://coveralls.io/repos/github/arothuis/markdown-it-biblatex/badge.svg?branch=main)](https://coveralls.io/github/arothuis/markdown-it-biblatex?branch=main)

A [markdown-it](https://github.com/markdown-it/markdown-it)
plug-in for rendering citations
and a bibliography inside markdown.

## Installation

Through NPM:

```
npm i -s @arothuis/markdown-it-biblatex
```

## Basic usage

In your project, add this plugin to markdown-it:

```javascript
const markdownIt = require('markdown-it');
const mdBiblatex = require('@arothuis/markdown-it-biblatex');

const md = markdownIt();
md.use(mdBiblatex, {
  bibPath: 'path/to/example.bib',
});
```

Imagine that our `path/to/example.bib` contains the following
references. This is parsed using
[biblatex-csl-converter](https://www.npmjs.com/package/biblatex-csl-converter)

```biblatex
@article{Cohen-1963,
  author   = "P. J. Cohen",
  title    = "The independence of the continuum hypothesis",
  journal  = "Proceedings of the National Academy of Sciences",
  year     = 1963,
  volume   = "50",
  number   = "6",
  pages    = "1143--1148",
}

@book{Susskind-Hrabovsky-2014,
  author    = "Leonard Susskind and George Hrabovsky",
  title     = "Classical mechanics: the theoretical minimum",
  publisher = "Penguin Random House",
  address   = "New York, NY",
  year      = 2014
}

@booklet{Swetla-2015,
  title        = "Canoe tours in {S}weden",
  author       = "Maria Swetla",
  howpublished = "Distributed at the Stockholm Tourist Office",
  month        = jul,
  year         = 2015
}
```

If we render the following markdown:

```md
A bibliography [@Cohen-1963] is only produced for
the items cited [@Susskind-Hrabovsky-2014].

[bibliography]
```

It produces the following HTML thanks to the power of
[citeproc-js](https://github.com/Juris-M/citeproc-js):

```html
<p>
  A bibliography <span id="cite-1-0" class="citation">(Cohen, 1963)</span> is only produced for the
  items cited <span id="cite-1-1" class="citation">(Susskind &#38; Hrabovsky, 2014)</span>.
</p>
<div class="bibliography">
  <h2 class="bibliography-title">Bibliography</h2>
  <div class="bibliography-contents">
    <div id="bib-1-1" class="csl-entry">
      Cohen, P. J. (1963). The independence of the continuum hypothesis.
      <i>Proceedings of the National Academy of Sciences</i>, <i>50</i>(6), 1143–1148.
    </div>
    <div id="bib-1-2" class="csl-entry">
      Susskind, L., &#38; Hrabovsky, G. (2014). <i>Classical mechanics: the theoretical minimum</i>.
      New York, NY: Penguin Random House.
    </div>
  </div>
</div>
```

Note that only actually cited items are included in the printed bibliography.
For more extensive examples, have a look at the [test cases](test/fixtures).

## More features

### Prefix

We can add a prefix to a citation,
by wrapping it in curly braces:

```markdown
[@Cohen-1963{see}]
```

Results in:

```html
<p>
  <span id="cite-1-0" class="citation">(see Cohen, 1963)</span>
</p>
```

### Locator

If you want to specify a specific location within a certain
citation, you can use the locator mark (`#`):

```markdown
[@Cohen-1963#p. 3]

[@Cohen-1963#p. 3{see}]
```

Result:

```html
<p>
  <span id="cite-1-0" class="citation">(Cohen, 1963, p. 3)</span>
</p>
<p>
  <span id="cite-1-0" class="citation">(see Cohen, 1963, p. 3)</span>
</p>
```

### Different citation modes

Through citeproc, we support several
[citation forms](https://citeproc-js.readthedocs.io/en/latest/running.html#special-citation-forms).
In this plugin, we use special marks in front
of the @-sign:

- **author only(`!`):** render only the author of the item or its title if there is none
- **suppress author(`-`):** render the citation omitting the author, or its title if there is none
- **composite(`~`):** a combination of author only and suppress author, typically used for in-line citations

This is illustrated as follows:

```markdown
### Regular

A regular citation: [@Cohen-1963]

### Author only

A citation with the author only: [!@Cohen-1963]

### Suppress author

A citation with the author suppressed: [-@Cohen-1963]

### Composite

A composite citation: [~@Cohen-1963]
```

This produces the following HTML, when processing
citations using an en-US locale and the APA style:

```html
<h3>Regular</h3>
<p>A regular citation: <span id="cite-1-0" class="citation">(Cohen, 1963)</span></p>
<h3>Author only</h3>
<p>A citation with the author only: <span id="cite-1-1" class="citation">Cohen</span></p>
<h3>Suppress author</h3>
<p>A citation with the author suppressed: <span id="cite-1-2" class="citation">(1963)</span></p>
<h3>Composite</h3>
<p>A composite citation: <span id="cite-1-3" class="citation">Cohen (1963)</span></p>
```

### Multiple items in a single citation

It is possible to reference multiple sources in a single
citation, by using a semicolon (`;`):

```markdown
[@Cohen-1963; @Susskind-Hrabovsky-2014].
```

This outputs the following:

```html
<p>
  <span id="cite-1-0" class="citation">(Cohen, 1963; Susskind &#38; Hrabovsky, 2014).</span>
</p>
```

### Anchor tags

To add anchor tags between a citation and a bibliography item,
set the `linkToBibliography` option to true.

This will turn the following:

```md
A bibliography [@Cohen-1963] is only produced for
the items cited [@Susskind-Hrabovsky-2014].

For multiple items in a citation, only the first is linked
[@Holleis-Wagner-Koolwaaij-2010; @Shapiro-2018].

[bibliography]
```

Into this:

```html
<p>
  A bibliography <a href="#bib-1-1"><span id="cite-1-0" class="citation">(Cohen, 1963)</span></a> is
  only produced for the items cited
  <a href="#bib-1-2"><span id="cite-1-1" class="citation">(Susskind &#38; Hrabovsky, 2014)</span></a
  >.
</p>
<p>
  For multiple items in a citation, only the first is linked
  <a href="#bib-1-6"
    ><span id="cite-1-2" class="citation"
      >(Holleis, Wagner, &#38; Koolwaaij, 2010; Shapiro, 2018)</span
    ></a
  >.
</p>
<div class="bibliography">
  <h2 class="bibliography-title">Bibliography</h2>
  <div class="bibliography-contents">
    <div id="bib-1-1" class="csl-entry">
      Cohen, P. J. (1963). The independence of the continuum hypothesis.
      <i>Proceedings of the National Academy of Sciences</i>, <i>50</i>(6), 1143–1148.
    </div>
    <div id="bib-1-6" class="csl-entry">
      Holleis, P., Wagner, M., &#38; Koolwaaij, J. (2010). Studying mobile context-aware social
      services in the wild. <i>Proc. of the 6th Nordic Conf. on Human-Computer Interaction</i>,
      207–216. New York, NY: ACM.
    </div>
    <div id="bib-1-5" class="csl-entry">
      Shapiro, H. M. (2018). Flow Cytometry: The Glass Is Half Full. In T. S. Hawley &#38; R. G.
      Hawley (Eds.), <i>Flow Cytometry Protocols</i> (pp. 1–10). New York, NY: Springer.
    </div>
    <div id="bib-1-2" class="csl-entry">
      Susskind, L., &#38; Hrabovsky, G. (2014). <i>Classical mechanics: the theoretical minimum</i>.
      New York, NY: Penguin Random House.
    </div>
  </div>
</div>
```

## Caveats

### Multiple bibliographies: ordering

Since we support multiple bibliographies, ordering has become relevant:
each bibliography only contains the references that came directly before it.
This means that, currently, a bibliography cannot appear before the references.

### Multiple items in a single citation: citation modes unsupported

Using a citation mode in combination when citing multiple items in a single citation
is currently not supported.

### Multiple items in a single citations: only first item is linked

When using anchor tags to link citation and bibliography item,
and there are multiple items in a single citation,
the first item you name is always used.
This is due to how the underlying library processes and parses citation clusters.
Do note that "the first item you name" is not necessarily the first one that will be rendered
some citation styles change the ordering.

## Configuration options

The following options can be passed to the plug-in (defaults shown).
Only `bibPath` is required.

```javascript
{
    // Where to find the biblatex file (.bib)
    bibPath: null,

    // Change locale for displaying references and bibliography (.xml)
    // See: https://github.com/citation-style-language/locales
    localePath: __dirname + "/csl/locales-en-US.xml",

    // Change citation style for displaying references and bibliography (.csl)
    // See: https://github.com/citation-style-language/styles
    stylePath: __dirname + "/csl/apa-6th-edition.csl",

    // Reload bib, locale and styles on every render
    // This could be a useful option when working with a live updating plugin,
    // at the cost of performance
    alwaysReloadFiles: false,

    // Don't throw errors if references are missing
    allowMissingRefs: false,

    // Which mark to use for suppress-author (don't show author)
    suppressAuthorMark: "-",

    // Which mark to use for author-only (only show author)
    authorOnlyMark: "!",

    //Which mark to use for composite (inline text citation, i.e. without parentheses)
    compositeMark: "~",

    // Which mark to use to signify an infix text for composite citations
    infixMark: "^",

    // Mark for placement of bibliography layout
    // (choose carefully to prevent collissions with other tokens)
    bibliographyMark: "[bibliography]",

    // Replace bibliography title element
    bibliographyTitle: '<h2 class="bibliography-title">Bibliography</h2>',

    // Wrap bibliography in a div
    wrapBibliography: true,

    // Element that wraps bibliography contents
    bibliographyContentsWrapper: "div",

    // Element that wraps bibliography entry
    bibliographyEntryWrapper: "div",

    // Whether or not to add anchor tags from citations to bibliography items
    linkToBibliography: true,
};
```

## Custom rendering

If you want more extensive control over how the output is rendered,
you can overwrite the following renderer rules with your own functions
after adding the plug-in to markdown-it:

```javascript
md.renderer.rules.biblatex_reference = function (tokens, idx, options, env, slf) {};
md.renderer.rules.biblatex_bibliography_open = function (tokens, idx, options, env, slf) {};
md.renderer.rules.biblatex_bibliography_contents = function (tokens, idx, options, env, slf) {};
md.renderer.rules.biblatex_bibliography_close = function (tokens, idx, options, env, slf) {};
```

Have a look at the source code of
[this plug-in](./src/renderer.js)
and the [markdown-it docs](https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer)
for more information.

# Alternative projects

This plug-in works similar yet different to:

- [markdown-it-bibliography](https://github.com/DerDrodt/markdown-it-bibliography)
- [markdown-it-cite](https://github.com/studyathome-internationally/markdown-it-plugins/tree/main/packages/markdown-it-cite)

Their approaches are comparable, but did not fit my needs.
