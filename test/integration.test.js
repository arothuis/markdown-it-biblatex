const { expect } = require('chai');

const markdownIt = require('markdown-it');
const { readFileSync } = require('fs');
const mdBiblatex = require('../src');

const md = markdownIt();

const fixture = (name) => readFileSync(`${__dirname}/fixtures/${name}`, 'utf-8');

// Very broad tests, primarily for guarding against regressions
// and illustrating expected outcomes
//
// Finicky to maintain, but illustrative for desired outputs
//  @TODO: Replace with snapshot testing when API stabilizes
describe('markdown-it plug-in', () => {
  context('default configuration', () => {
    md.use(mdBiblatex, { bibPath: `${__dirname}/fixtures/bibliography.bib` });

    const examples = [
      ['a comprehensive example', 'comprehensive'],
      ['bibliography only contains cited items', 'select-bibliography'],
      ['bibliography does not get printed if no mark', 'no-bibliography'],
      ['no cited items, no bibliography, despite mark', 'no-items'],
      ['infix for composite citations', 'infix-composite'],
      ['each bibliography contains only references directly before it', 'multiple-bibliographies'],
    ];

    examples.forEach(([specification, fixtureName]) => {
      specify(specification, () => {
        const input = fixture(`${fixtureName}.md`);
        const output = md.render(input);

        const expected = fixture(`${fixtureName}.html`);
        expect(output).to.equal(expected);
      });
    });
  });

  context('custom configuration', () => {
    specify('custom citation style (via: github.com/citation-style-language/styles)', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        stylePath: `${__dirname}/fixtures/csl/chicago-author-date-16th-edition.csl`,
      });

      const input = fixture('comprehensive.md');
      const output = md.render(input);

      const expected = fixture('comprehensive-chicago.html');
      expect(output).to.equal(expected);
    });

    specify('custom locale (via: github.com/citation-style-language/locales)', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        locale: `${__dirname}/fixtures/csl/locales-nl-NL.xml`,
      });

      const input = fixture('comprehensive.md');
      const output = md.render(input);

      const expected = fixture('comprehensive-nl-nl.html');
      expect(output).to.equal(expected);
    });

    specify('custom marks for modes: composite, suppress-author, author-only', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        compositeMark: 'composite',
        suppressAuthorMark: 'suppress',
        authorOnlyMark: 'author-only',
      });

      const input = fixture('custom-ref-marks.md');
      const output = md.render(input);

      const expected = fixture('custom-ref-marks.html');
      expect(output).to.equal(expected);
    });

    specify('custom mark for placing bibliography', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        bibliographyMark: '<bib-here>',
      });

      const input = fixture('custom-bibliography-mark.md');
      const output = md.render(input);

      const expected = fixture('custom-bibliography-mark.html');
      expect(output).to.equal(expected);
    });

    specify('custom bibliography title element', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        bibliographyTitle: '<h1>References</h1>',
      });

      const input = fixture('select-bibliography.md');
      const output = md.render(input);

      const expected = fixture('select-bibliography-custom-title.html');
      expect(output).to.equal(expected);
    });

    specify('no wrapping div for bibliography', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        wrapBibliography: false,
      });

      const input = fixture('select-bibliography.md');
      const output = md.render(input);

      const expected = fixture('select-bibliography-no-wrap.html');
      expect(output).to.equal(expected);
    });

    specify('Custom wrapper for bibliography contents', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        bibliographyContentsWrapper: 'section',
      });

      const input = fixture('select-bibliography.md');
      const output = md.render(input);

      const expected = fixture('select-bibliography-custom-contents-wrapper.html');
      expect(output).to.equal(expected);
    });

    specify('Custom wrapper for bibliography entry', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        bibliographyEntryWrapper: 'li',
      });

      const input = fixture('select-bibliography.md');
      const output = md.render(input);

      const expected = fixture('select-bibliography-custom-entry-wrapper.html');
      expect(output).to.equal(expected);
    });
  });

  context('configuration errors', () => {
    specify('biblatex path not given', () => {
      expect(() => md.use(mdBiblatex, { bibPath: null })).to.throw('bibPath');
    });

    specify('biblatex file not found', () => {
      expect(() => md.use(mdBiblatex, { bibPath: 'not-found.bib' })).to.throw('not found');
    });

    specify('biblatex file cannot be parsed', () => {
      expect(() => md.use(mdBiblatex, { bibPath: `${__dirname}/fixtures/corrupt.bib` })).to.throw(
        'Could not parse'
      );
    });
  });
});
