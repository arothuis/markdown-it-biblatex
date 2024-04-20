function renderer(context) {
  const {
    wrapBibliography,
    bibliographyTitle,
    bibliographyContentsWrapper,
    bibliographyEntryWrapper,
    linkToBibliography,
    allowMissingRefs,
  } = context.options;

  function reference(tokens, idx, options, env) {
    // Sanity check for when a different parser is being used
    if (env.bib === undefined) {
      env.bib = {};
    }

    if (env.bib.currentRefs === undefined) {
      env.bib.currentRefs = [];
    }

    if (env.bib.counter === undefined) {
      env.bib.counter = 1;
    }

    let citationCluster;
    try {
      citationCluster = context.citeproc.processCitationCluster(tokens[idx].meta.citation, [], []);
    } catch (err) {
      if (allowMissingRefs === true) {
        return tokens[idx].meta.ref;
      }

      throw new Error(`Reference not found '${tokens[idx].meta.ref}': ${err}`);
    }

    env.bib.currentRefs.push(tokens[idx].meta);

    const citeId = `cite-${env.bib.counter}-${tokens[idx].meta.citation.citationItems[0].number}`;
    const bibRef = `${env.bib.counter}-${tokens[idx].meta.citation.citationItems[0].id}`;

    let citation = `<span id="${citeId}" class="citation">${citationCluster[1][0][1]}</span>`;
    if (linkToBibliography === true) {
      citation = `<a href="#bib-${bibRef}">${citation}</a>`;
    }

    return citation;
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

    const bibIds = context.citeproc.updateItems(seen);
    const contents = context.citeproc.makeBibliography()[1].map((entry, i) => {
      entry = entry.replace('<div', `<div id="bib-${env.bib.counter}-${bibIds[i]}"`);

      if (bibliographyEntryWrapper !== 'div') {
        entry = entry.replace('<div', `<${bibliographyEntryWrapper}`);
        entry = entry.replace('</div', `</${bibliographyEntryWrapper}`);
      }

      return entry;
    });

    return `<${bibliographyContentsWrapper} class="bibliography-contents">\n${contents.join(
      ''
    )}</${bibliographyContentsWrapper}>\n`;
  }

  function bibliographyClose(tokens, idx, options, env) {
    if (env.bib === undefined || env.bib.currentRefs === undefined) {
      return '';
    }

    env.bib.currentRefs = [];
    env.bib.counter += 1;

    if (wrapBibliography === true) {
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
