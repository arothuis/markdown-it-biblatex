function renderer(context) {
  const { citeproc } = context;
  const {
    wrapBibliography,
    bibliographyTitle,
    bibliographyContentsWrapper,
    bibliographyEntryWrapper,
  } = context.options;

  function reference(tokens, idx, options, env) {
    if (env.bib.currentRefs === undefined) {
      env.bib.currentRefs = [];
    }

    env.bib.currentRefs.push(tokens[idx].meta);

    const citation = citeproc.processCitationCluster(tokens[idx].meta.citation, [], []);
    return citation[1][0][1];
  }

  function bibliographyOpen(tokens, idx, options, env) {
    if (env.bib === undefined || env.bib.currentRefs === undefined) {
      return '';
    }

    let rendered = '';
    if (wrapBibliography === true) {
      rendered += '<div class="bibliography">\n';
    }

    rendered += `${bibliographyTitle}\n`;

    return rendered;
  }

  function bibliographyContents(tokens, idx, options, env) {
    if (env.bib === undefined || env.bib.currentRefs === undefined) {
      return '';
    }

    const seen = [];
    env.bib.currentRefs.forEach((ref) => {
      ref.citation.citationItems.forEach((item) => {
        seen.push(item.id);
      });
    });

    citeproc.updateItems(seen);
    const contents = citeproc.makeBibliography()[1];

    if (bibliographyEntryWrapper !== 'div') {
      contents.forEach((content, index) => {
        contents[index] = content
          .replace('<div', `<${bibliographyEntryWrapper}`)
          .replace('</div', `</${bibliographyEntryWrapper}`);
      });
    }

    return `<${bibliographyContentsWrapper} class="bibliography-contents">\n${contents.join(
      ''
    )}</${bibliographyContentsWrapper}>\n`;
  }

  function bibliographyClose(tokens, idx, options, env) {
    if (env.bib === undefined || env.bib.currentRefs === undefined) {
      return '';
    }

    env.bib.currentRefs = [];

    if (wrapBibliography) {
      return '</div>\n';
    }

    return '';
  }

  return {
    reference,
    bibliographyOpen,
    bibliographyContents,
    bibliographyClose,
  };
}

module.exports = {
  renderer,
};
