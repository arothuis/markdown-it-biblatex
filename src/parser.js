function parser(context) {
  const {
    suppressAuthorMark,
    authorOnlyMark,
    compositeMark,
    infixMark,
    bibliographyMark,
    alwaysReloadFiles,
    bibPath,
  } = context.options;

  const marks = [suppressAuthorMark, authorOnlyMark, compositeMark]
    .map((mark) => mark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const validCitation = new RegExp(`(?<=^\\[)((${marks})?@)(.+?)[^](?=])`);

  function reference(state) {
    const { pos, posMax, src } = state;

    if (state.env.bib === undefined) {
      if (bibPath !== null && alwaysReloadFiles === true) {
        const { bibData, citeproc } = context.loadFiles(context.options);
        context.bibData = bibData;
        context.citeproc = citeproc;
      }

      if (bibPath === null) {
        const { bibData, citeproc } = context.loadBibContents(
          state.env.bibContents,
          context.options
        );
        context.bibData = bibData;
        context.citeproc = citeproc;
      }

      state.env.bib = {
        refs: [],
      };
    }

    if (pos + 4 > posMax) {
      return false;
    }

    const match = src.slice(pos).match(validCitation);

    if (match === null) {
      return false;
    }

    if (match[0].slice(0, suppressAuthorMark.length) === suppressAuthorMark) {
      return processReference(state, match[0], 'suppress-author');
    }

    if (match[0].slice(0, authorOnlyMark.length) === authorOnlyMark) {
      return processReference(state, match[0], 'author-only');
    }

    if (match[0].slice(0, compositeMark.length) === compositeMark) {
      return processReference(state, match[0], 'composite');
    }

    return processReference(state, match[0]);
  }

  function processReference(state, ref, mode) {
    let infix = null;

    const citationItems = ref.split(';').map((rawItem) => {
      const item = rawItem.trim();

      const label = item.split('{')[0].split('#')[0].split('@')[1];
      const findLocator = item.match(/(?<=#)(.+?)(?=({|$))/) || [];
      const findAffixes = item.match(/(?<={)(.+?)(?=})/g) || [];

      let prefix = findAffixes[0];
      if (mode === 'composite') {
        if (infix === null) {
          const [foundInfix] = findAffixes.filter((i) => i[0] === infixMark);
          infix = (foundInfix || '').slice(1);
        }

        [prefix] = findAffixes.filter((i) => i[0] !== infixMark[0]);
      }

      return {
        label,
        id: context.bibData.ids[label],
        number: state.env.bib.refs.length,
        prefix,
        locator: findLocator[0],
      };
    });

    const token = state.push('biblatex_reference', '', 0);
    token.meta = {
      ref: `[${ref}]`,
      citation: {
        citationItems,
        properties: {
          noteIndex: 0,
          mode,
          infix,
        },
      },
    };

    state.env.bib.refs.push(token.meta);
    state.pos += ref.length + 2;

    return true;
  }

  function bibliography(state, startLine) {
    const start = state.bMarks[startLine] + state.tShift[startLine];

    const foundMark = state.src.slice(start, start + bibliographyMark.length) === bibliographyMark;

    if (!foundMark) {
      return false;
    }

    state.push('biblatex_bibliography_open', '', 0);
    state.push('biblatex_bibliography_contents', '', 1);
    state.push('biblatex_bibliography_close', '', 0);

    state.line += 1;

    return true;
  }

  function appendBibliography(state) {
    state.tokens.push(new state.Token('biblatex_bibliography_open', '', 0));
    state.tokens.push(new state.Token('biblatex_bibliography_contents', '', 1));
    state.tokens.push(new state.Token('biblatex_bibliography_close', '', 0));

    return true;
  }

  return {
    reference,
    bibliography,
    appendBibliography,
  };
}

module.exports = {
  parser,
};
