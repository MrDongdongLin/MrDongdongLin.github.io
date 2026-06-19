document.addEventListener('DOMContentLoaded', () => {
    const textLeft = document.getElementById('text-left');
    const textRight = document.getElementById('text-right');
    const browseButton = document.getElementById('browse-button');
    const fileInput = document.getElementById('file-input');
    const tidyButton = document.getElementById('tidy-button');
    const saveButton = document.getElementById('save-button');
    const exitButton = document.getElementById('exit-button');
    const applyAbbreviation = document.getElementById('abbreviate-checkbox');
    const renameCitationIds = document.getElementById('rename-id-checkbox');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const outputMessage = document.getElementById('output-message');

    let originalFileName = '';

    console.log('Loaded journal abbreviations:', journalAbbreviations);

    // Set initial content
    const initialInputContent = `@inproceedings{ WOS:000766209400010,
Author = {Li, Yue and Abady, Lydia and Wang, Hongxia and Barni, Mauro},
Editor = {Zhao, X and Piva, A and ComesanaAlfaro, P},
Title = {A Feature-Map-Based Large-Payload DNN Watermarking Algorithm},
Booktitle = {DIGITAL FORENSICS AND WATERMARKING, IWDW 2021},
Series = {Lecture Notes in Computer Science},
Year = {2022},
Volume = {13180},
Pages = {135-148},
Note = {20th International Workshop on Digital-Forensics and Watermarking
   (IWDW), Beijing, PEOPLES R CHINA, NOV 20-22, 2021},
Organization = {Chinese Acad Sci, Inst Informat Engn, State Key Lab Informat Secur; New
   Jersey Institute of Technology; Springer},
DOI = {10.1007/978-3-030-95398-0\\_10},
ISSN = {0302-9743},
EISSN = {1611-3349},
ISBN = {978-3-030-95398-0; 978-3-030-95397-3},
Unique-ID = {WOS:000766209400010},
}`;
    const initialOutputContent = `@inproceedings{WOS:000766209400010,
  author =       {Li, Yue and Abady, Lydia and Wang, Hongxia and Barni, Mauro},
  title =        {{A feature-map-based large-payload DNN watermarking algorithm}},
  booktitle =    {Digital Forensics and Watermarking, Iwdw 2021},
  year =         {2022},
  editor =       {Zhao, X and Piva, A and ComesanaAlfaro, P},
  volume =       {13180},
  series =       {Lecture Notes in Computer Science},
  pages =        {135-148},
  doi =          {10.1007/978-3-030-95398-0\\_10},
}`;

    textLeft.value = initialInputContent;
    textRight.value = initialOutputContent;
    applyHighlighting(); // Apply initial highlighting

    browseButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            originalFileName = file.name.split('.')[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                textLeft.value = e.target.result;
                applyHighlighting(); // Apply highlighting
                outputMessage.value = `Loaded file: ${file.name}\n`;
            };
            reader.readAsText(file);
        }
    });

    tidyButton.addEventListener('click', () => {
        try {
            const content = textLeft.value;
            console.log("Original Content:", content);
            const tidyResult = simplifyBib(content, applyAbbreviation.checked, renameCitationIds.checked);
            textRight.value = tidyResult.content;
            applyHighlighting(); // Apply highlighting
            outputMessage.value += formatTidyStatus(tidyResult.stats) + '\n';
        } catch (e) {
            console.error(`Failed to tidy content: ${e.message}`);
            outputMessage.value += `Failed to tidy content: ${e.message}\n`;
        }
    });

    saveButton.addEventListener('click', () => {
        const blob = new Blob([textRight.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tidy-${originalFileName}.bib`;
        a.click();
        URL.revokeObjectURL(url);
        outputMessage.value += 'Saved file.\n';
    });

    exitButton.addEventListener('click', () => {
        window.close();
    });

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
    });

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetTextArea = document.getElementById(targetId);
            if (targetTextArea) {
                navigator.clipboard.writeText(targetTextArea.value).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000); // 2 seconds later, reset the button text
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    });

    function simplifyBib(content, applyAbbreviation, shouldRenameCitationIds) {
        const stats = createTidyStats();
        const formattedContent = transformBibtexEntries(content, rawEntry => {
            try {
                const bibDatabase = bibtexParse.toJSON(rawEntry.macroContext + rawEntry.text);
                const entry = bibDatabase[bibDatabase.length - 1];
                if (!entry || !entry.entryTags) {
                    return rawEntry.text;
                }
                recordTidiedEntry(stats, entry.entryType);
                return formatBibEntry(entry, applyAbbreviation, shouldRenameCitationIds);
            } catch (error) {
                console.error("Error parsing BibTeX entry:", error, rawEntry.text);
                throw new Error("Failed to parse BibTeX content");
            }
        });

        return {
            content: formattedContent,
            stats
        };
    }

    function createTidyStats() {
        return {
            totalItems: 0,
            itemTypes: {}
        };
    }

    function recordTidiedEntry(stats, entryType) {
        const normalizedType = (entryType || 'unknown').toLowerCase();
        stats.totalItems++;
        stats.itemTypes[normalizedType] = (stats.itemTypes[normalizedType] || 0) + 1;
    }

    function formatTidyStatus(stats) {
        const typeSummary = Object.entries(stats.itemTypes)
            .sort(([typeA, countA], [typeB, countB]) => countB - countA || typeA.localeCompare(typeB))
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ');

        if (!stats.totalItems) {
            return 'Tidied 0 bib items.';
        }

        return `Tidied ${stats.totalItems} bib item${stats.totalItems === 1 ? '' : 's'}${typeSummary ? ` (${typeSummary})` : ''}.`;
    }

    function transformBibtexEntries(content, transformEntry) {
        let output = '';
        let position = 0;
        let macroContext = '';

        while (position < content.length) {
            const blockStart = content.indexOf('@', position);
            if (blockStart === -1) {
                output += content.slice(position);
                break;
            }

            output += content.slice(position, blockStart);

            const block = readBibtexBlock(content, blockStart);
            if (!block) {
                output += content.slice(blockStart);
                break;
            }

            if (block.type === 'string') {
                macroContext += block.text + '\n';
                output += block.text;
            } else if (isBibliographyEntryType(block.type)) {
                output += transformEntry({ text: block.text, macroContext });
            } else {
                output += block.text;
            }

            position = block.end;
        }

        return output;
    }

    function readBibtexBlock(content, atIndex) {
        const directiveMatch = content.slice(atIndex).match(/^@([A-Za-z]+)\s*/);
        if (!directiveMatch) return null;

        const type = directiveMatch[1].toLowerCase();
        const openIndex = atIndex + directiveMatch[0].length;
        const opener = content[openIndex];
        const closer = opener === '{' ? '}' : opener === '(' ? ')' : null;
        if (!closer) return null;

        let depth = 0;
        let escaped = false;
        let inQuote = false;

        for (let index = openIndex; index < content.length; index++) {
            const char = content[index];

            if (char === '"' && !escaped) {
                inQuote = !inQuote;
            }

            if (!inQuote) {
                if (char === opener) {
                    depth++;
                } else if (char === closer) {
                    depth--;
                    if (depth === 0) {
                        return {
                            type,
                            text: content.slice(atIndex, index + 1),
                            end: index + 1
                        };
                    }
                }
            }

            escaped = char === '\\' && !escaped;
            if (char !== '\\') {
                escaped = false;
            }
        }

        return null;
    }

    function isBibliographyEntryType(type) {
        return !['string', 'comment', 'preamble'].includes(type);
    }

    function formatBibEntry(entry, applyAbbreviation, shouldRenameCitationIds) {
        const fieldOrder = ['author', 'title', 'journal', 'year', 'volume', 'number', 'pages', 'month', 'note', 'keywords', 'source', 'doi'];
        let formattedBib = '';

        const entryTags = {};
        for (const [key, value] of Object.entries(entry.entryTags || {})) {
            entryTags[key.toLowerCase()] = value;
        }
        entry.entryTags = entryTags;

        if (entry.entryTags.journal) {
            entry.entryTags.journal = capitalizeTitle(entry.entryTags.journal);
            if (applyAbbreviation) {
                entry.entryTags.journal = abbreviateJournal(entry.entryTags.journal);
            }
        }

        if (entry.entryTags.title) {
            entry.entryTags.title = protectTitleCapitalization(normalizeTitleCapitalization(entry.entryTags.title));
        }

        if (shouldRenameCitationIds) {
            let authorPart = '';
            if (entry.entryTags.author) {
                const authorNames = entry.entryTags.author.split(',');
                authorPart = authorNames[0].trim().split(' ')[0];
            }
            const yearPart = entry.entryTags.year ? entry.entryTags.year.trim() : 'noyear';
            const titlePart = entry.entryTags.title ? getTitlePart(entry.entryTags.title) : 'notitle';

            entry.citationKey = `${authorPart}:${yearPart}:${titlePart}`;
        }

        formattedBib += `@${entry.entryType}{${entry.citationKey},\n`;
        fieldOrder.forEach(field => {
            if (entry.entryTags[field]) {
                formattedBib += `  ${field.padEnd(12)} = {${entry.entryTags[field]}},\n`;
            }
        });
        return formattedBib.trim().replace(/,$/, '') + '\n}';
    }

    function getTitlePart(title) {
        if (!title) return 'notitle';
        const words = title.replace(/[{}]/g, '').split(' ');
        const initials = words.slice(0, 5).map(word => {
            let initial = word[0];
            if (initial === '{' && word.length > 1) {
                initial = word[1];
            }
            return initial ? initial.toUpperCase() : '';
        });
        return initials.join('');
    }

    function protectTitleCapitalization(title) {
        if (!title) return '';
        const trimmedTitle = title.trim();
        if (trimmedTitle.startsWith('{') && trimmedTitle.endsWith('}')) {
            return trimmedTitle;
        }
        return `{${trimmedTitle}}`;
    }

    function normalizeTitleCapitalization(title) {
        if (!title) return '';

        const acronymWords = new Set([
            'ACM', 'AI', 'API', 'CNN', 'CPU', 'DCT', 'DNA', 'DNN', 'FFT', 'GAN',
            'GPU', 'HTTP', 'HTTPS', 'IEEE', 'IOT', 'LSTM', 'ML', 'NLP', 'PDE',
            'RGB', 'RNA', 'RNN', 'SQL', 'SVD', 'SVM', 'URL', 'XML'
        ]);
        let seenFirstWord = false;

        return splitProtectedBibtexText(title).map(part => {
            if (part.protected) {
                if (/[A-Za-z]/.test(part.text)) {
                    seenFirstWord = true;
                }
                return part.text;
            }
            return part.text.replace(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g, word => {
                const normalizedWord = normalizeTitleWord(word, !seenFirstWord, acronymWords);
                seenFirstWord = true;
                return normalizedWord;
            });
        }).join('');
    }

    function splitProtectedBibtexText(text) {
        const parts = [];
        let buffer = '';
        let depth = 0;
        let protectedPart = false;

        for (const char of text) {
            const nextProtectedPart = depth > 0 || char === '{';
            if (buffer && nextProtectedPart !== protectedPart) {
                parts.push({ text: buffer, protected: protectedPart });
                buffer = '';
            }

            buffer += char;
            protectedPart = nextProtectedPart;

            if (char === '{') depth++;
            if (char === '}') depth = Math.max(0, depth - 1);
        }

        if (buffer) {
            parts.push({ text: buffer, protected: protectedPart });
        }
        return parts;
    }

    function normalizeTitleWord(word, isFirstWord, acronymWords) {
        return word.split('-').map((part, index) => {
            if (shouldKeepTitleWordPart(part, acronymWords)) return part;

            const lowerPart = part.toLowerCase();
            if (isFirstWord && index === 0) {
                return lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1);
            }
            return lowerPart;
        }).join('-');
    }

    function shouldKeepTitleWordPart(wordPart, acronymWords) {
        if (/[a-z][A-Z]/.test(wordPart)) return true;

        const normalizedWord = wordPart.replace(/[^A-Za-z]/g, '').toUpperCase();
        if (acronymWords.has(normalizedWord)) return true;

        return /[A-Z]/.test(wordPart) && /\d/.test(wordPart);
    }

    function capitalizeTitle(title) {
        if (!title) return '';
        const prepositions = new Set(['of', 'the', 'and', 'in', 'on', 'for', 'with', 'a', 'an', 'by', 'at', 'to']);
        const specialWords = new Set(['IEEE', 'ACM', 'IEEE/ACM']);
        const capitalizedTitle = title.split(' ').map(word => {
            if (word.startsWith('{') && word.endsWith('}')) return word;
            if (specialWords.has(word)) return word;
            if (prepositions.has(word.toLowerCase())) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
        return capitalizedTitle;
    }

    function abbreviateJournal(journal) {
        const abbreviation = journalAbbreviations[journal];
        return abbreviation || journal;
    }

    function applyHighlighting() {
        const textAreas = document.querySelectorAll('.highlight-bibtex');
        textAreas.forEach(textArea => {
            const content = textArea.value;
            const highlightedContent = highlightBibtex(content);
            const highlightedDiv = textArea.nextElementSibling;
            if (highlightedDiv) {
                highlightedDiv.innerHTML = highlightedContent;
            }
        });
    }

    // Add event listeners for real-time highlighting
    textLeft.addEventListener('input', applyHighlighting);
    textRight.addEventListener('input', applyHighlighting);
});
