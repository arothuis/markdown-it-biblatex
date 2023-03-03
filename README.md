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
  A bibliography (Cohen, 1963) is only produced for the items cited (Susskind &#38; Hrabovsky,
  2014).
</p>
<div class="bibliography">
  <h2 class="bibliography-title">Bibliography</h2>
  <div class="bibliography-contents">
    <div class="csl-entry">
      Cohen, P. J. (1963). The independence of the continuum hypothesis.
      <i>Proceedings of the National Academy of Sciences</i>, <i>50</i>(6), 1143–1148.
    </div>
    <div class="csl-entry">
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
<p>(see Cohen, 1963)</p>
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
<p>(Cohen, 1963, p. 3)</p>
<p>(see Cohen, 1963, p. 3)</p>
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
<p>A regular citation: (Cohen, 1963)</p>
<h3>Author only</h3>
<p>A citation with the author only: Cohen</p>
<h3>Suppress author</h3>
<p>A citation with the author suppressed: (1963)</p>
<h3>Composite</h3>
<p>A composite citation: Cohen (1963)</p>
```

### Multiple items in a single citation

It is possible to reference multiple sources in a single
citation, by using a semicolon (`;`):

```markdown
[@Cohen-1963; @Susskind-Hrabovsky-2014].
```

This outputs the following:

```html
<p>(Cohen, 1963; Susskind &#38; Hrabovsky, 2014).</p>
```

## Caveats

Since we support multiple bibliographies, ordering has become relevant:
each bibliography only contains the references that came directly before it.
This means that, currently, a bibliography cannot appear before the references.

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
    bibliographyEntryWrapper: "div"
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
