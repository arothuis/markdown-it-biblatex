function parser(context) {
    const { 
        suppressAuthorMark, 
        authorOnlyMark, 
        compositeMark,
        bibliographyMark,
    } = context.options;

    const marks = [suppressAuthorMark, authorOnlyMark, compositeMark]
        .map(mark => mark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join("|");
    const validCitation = new RegExp(`(?<=^\\\[)((${marks})?@)(.+?)[^\](?=\])`);

    function reference(state, silent) {
        const { pos, posMax, src } = state;
        
        if (state.env.bib === undefined) { 
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
            return processReference(state, match[0], "suppress-author");            
        }
    
        if (match[0].slice(0, authorOnlyMark.length) === authorOnlyMark) {
            return processReference(state, match[0], "author-only");
        }
    
        if (match[0].slice(0, compositeMark.length) === compositeMark) {
            return processReference(state, match[0], "composite");
        }

        return processReference(state, match[0]);
    }
    
    
    function processReference(state, ref, mode) {
        const citationItems = ref
            .split(";")
            .map(rawItem => {
                const item = rawItem.trim();
                
                const label = item.split("{")[0].split("#")[0].split("@")[1];
                const findLocator = item.match(/(?<=#)(.+?)(?=({|$))/) || [];
                const findPrefix = item.match(/(?<={)(.+?)(?=})/) || [];
    
                return {
                    label, 
                    id: context.bibData.ids[label], 
                    number: state.env.bib.refs.length, 
                    prefix: findPrefix[0], 
                    locator: findLocator[0],
                };
            });
    
        const token = state.push("biblatex_reference", "", 0);
        token.meta = {
            citation: {
                citationItems,
                properties: {
                    noteIndex: 0,
                    mode,
                },
            }
        };
    
        state.env.bib.refs.push(token.meta);
        state.pos += ref.length + 2;
    
        return true;
    }
    
    function bibliography(state, startLine, endLine, silent) {
        const start = state.bMarks[startLine] + state.tShift[startLine];
    
        if (state.src[start] !== "[") {
            return false;
        }
    
        if (state.src.slice(start, start + bibliographyMark.length) !== bibliographyMark) {
            return false;
        }
    
        state.push("biblatex_bibliography_open", "", 0);
        state.push("biblatex_bibliography_contents", "", 1);
        state.push("biblatex_bibliography_close", 0);
    
        state.line++;
    
        return true;
    }

    return {
        reference,
        bibliography,
    };
}

module.exports = {
    parser,
};