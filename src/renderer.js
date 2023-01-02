function renderer(context) {
    const { citeproc } = context;
    const { 
        wrapBibliography, 
        bibliographyTitleClasses, 
        bibliographyTitle 
    } = context.options;

    function reference(tokens, idx, options, env, slf) {
        if (env.bib.currentRefs === undefined) {
          env.bib.currentRefs = [];
        }

        env.bib.currentRefs.push(tokens[idx].meta);

        const citation = citeproc.processCitationCluster(tokens[idx].meta.citation, [], []);
        return citation[1][0][1];
    }

    function bibliographyOpen(tokens, idx, options, env, slf) {
        if (env.bib === undefined || env.bib.currentRefs === undefined) {
            return "";
        }

        let rendered = "";
        if (wrapBibliography === true) {
            rendered += '<div class="bibliography">\n';
        }

        rendered += `<h2 class="${bibliographyTitleClasses}">${bibliographyTitle}</h2>\n`;

        return rendered;
    }

    function bibliographyContents(tokens, idx, options, env, slf) {
        if (env.bib === undefined || env.bib.currentRefs === undefined) {
            return "";
        }

        const seen = [];
        env.bib.currentRefs.forEach(ref => {
            ref.citation.citationItems.forEach(item => {
                seen.push(item.id);
            });
        });
    
        citeproc.updateItems(seen);
        const [_, contents] = citeproc.makeBibliography();

        return '<div class="bibliography-contents">\n' 
            + contents.join("")
            + '</div>\n';
    }

    function bibliographyClose(tokens, idx, options, env, slf) {
        if (env.bib === undefined || env.bib.currentRefs === undefined) {
            return "";
        }

        env.bib.currentRefs = [];

        if (wrapBibliography) {
            return "</div>\n";
        }

        return "";
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