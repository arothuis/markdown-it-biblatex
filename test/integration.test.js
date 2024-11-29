const { expect } = require('chai');

const markdownIt = require('markdown-it');
const { readFileSync, writeFileSync, unlinkSync } = require('fs');
const mdBiblatex = require('../src');
const mdBibLatexPlugin = require('../src');

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

    specify('passing bib contents directly', () => {
      const bibContents = fixture('bibliography.bib');
      md.use(mdBiblatex);
      
      const input = fixture('comprehensive.md');
      const output = md.render(input, { bibContents });

      const expected = fixture('comprehensive.html');
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

    specify('linked bibliography items', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        linkToBibliography: true,
      });

      const input = fixture('linked-bibliography.md');
      const output = md.render(input);

      const expected = fixture('linked-bibliography.html');
      expect(output).to.equal(expected);
    });

    specify('custom wrapper for bibliography contents', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        bibliographyContentsWrapper: 'section',
      });

      const input = fixture('select-bibliography.md');
      const output = md.render(input);

      const expected = fixture('select-bibliography-custom-contents-wrapper.html');
      expect(output).to.equal(expected);
    });

    specify('custom wrapper for bibliography entry', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        bibliographyEntryWrapper: 'li',
      });

      const input = fixture('select-bibliography.md');
      const output = md.render(input);

      const expected = fixture('select-bibliography-custom-entry-wrapper.html');
      expect(output).to.equal(expected);
    });

    specify('error when a reference is missing', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/empty.bib`,
      });
      const input = fixture('select-bibliography.md');

      expect(() => md.render(input)).to.throw('Reference not found');
    });

    specify('suppress errors when a reference is missing if so configured', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/empty.bib`,
        allowMissingRefs: true,
      });

      const input = fixture('select-bibliography.md');
      const expected = fixture('select-bibliography-missing-refs.html');
      const output = md.render(input);

      expect(output).to.equal(expected);
    });

    specify('always reload files when rerunning the render function', () => {
      const sources = readFileSync(`${__dirname}/fixtures/bibliography.bib`, 'utf8').split('\n\n');
      writeFileSync(`${__dirname}/fixtures/temp.bib`, sources.slice(0, 2).join('\n\n'));

      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/temp.bib`,
        alwaysReloadFiles: true,
        allowMissingRefs: true,
      });
      const input = fixture('select-bibliography.md');
      const expectedEventually = fixture('select-bibliography.html');

      const outputWithMissingRefs = md.render(input);
      expect(outputWithMissingRefs).to.not.equal(expectedEventually);

      writeFileSync(`${__dirname}/fixtures/temp.bib`, sources.slice(0, 3).join('\n\n'));

      const outputWithAllRefs = md.render(input);
      expect(outputWithAllRefs).to.equal(expectedEventually);

      unlinkSync(`${__dirname}/fixtures/temp.bib`);
    });

    specify('append bibliography at the end of content if so configured', () => {
      md.use(mdBiblatex, {
        bibPath: `${__dirname}/fixtures/bibliography.bib`,
        appendBibliography: true,
      });

      const input = fixture('append-bibliography.md');
      const output = md.render(input);

      const expected = fixture('append-bibliography.html');
      expect(output).to.equal(expected);
    });
  });

  context('configuration errors', () => {
    specify('biblatex path not given and no biblatex contents are given during render', () => {
      // This used to throw an error
      expect(() => md.use(mdBiblatex, { bibPath: null })).to.not.throw('bibPath');

      const input = fixture('comprehensive.md');
      expect(() => md.render(input)).to.throw('bibtex contents');
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

context('decouple parsing and rendering', () => {
  specify('guard against parsers that do not set env.bib', () => {
    const customizedMd = markdownIt();
    customizedMd.use(mdBiblatex, { bibPath: `${__dirname}/fixtures/bibliography.bib` });

    // Wrap our renderer in a custom render function with undefined bib
    const renderer = customizedMd.renderer.rules.biblatex_reference;
    customizedMd.renderer.rules.biblatex_reference = (tokens, idx, options, env, slf) =>
      renderer(tokens, idx, options, { ...env, bib: undefined }, slf);

    const input = fixture('no-bibliography.md');
    const output = customizedMd.render(input);

    const expected = fixture('no-bibliography.html');
    expect(output).to.equal(expected);
  });
});
