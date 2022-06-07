function renderer(context) {
    const { citeproc } = context;
    const { 
        wrapBibliography, 
        bibliographyTitleClasses, 
        bibliographyTitle 
    } = context.options;

    function reference(tokens, idx, options, env, slf) {
        const citation = citeproc.processCitationCluster(tokens[idx].meta.citation, [], []);
        return citation[1][0][1];
    }

    function bibliographyOpen(tokens, idx, options, env, slf) {
        if (env.bib === undefined || env.bib.refs === undefined) {
            return "";
        }

        let rendered = "";
        if (wrapBibliography) {
            rendered += '<div class="bibliography">\n';
        }

        rendered += `<h2 class="${bibliographyTitleClasses}">${bibliographyTitle}</h2>\n`;

        return rendered;
    }

    function bibliographyContents(tokens, idx, options, env, slf) {
        if (env.bib === undefined || env.bib.refs === undefined) {
            return "";
        }

        const seen = [];
        env.bib.refs.forEach(ref => {
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
        if (env.bib === undefined || env.bib.refs === undefined) {
            return "";
        }

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