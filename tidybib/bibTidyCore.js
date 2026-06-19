(function(root, factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = factory(root);
    } else {
        root.bibTidyCore = factory(root);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(root) {
    const ENTRY_DIRECTIVES = new Set(['string', 'comment', 'preamble']);
    const DEFAULT_TEMPLATE = 'author-year-title-colon';

    const FIELD_PRESETS = {
        clean: [
            'author', 'title', 'journal', 'booktitle', 'year', 'editor', 'volume',
            'number', 'series', 'pages', 'month', 'note', 'keywords', 'source',
            'doi', 'url'
        ],
        minimal: [
            'author', 'title', 'journal', 'booktitle', 'year', 'volume', 'number',
            'pages', 'doi'
        ],
        complete: [
            'author', 'title', 'journal', 'booktitle', 'year', 'editor', 'volume',
            'number', 'series', 'pages', 'month', 'note', 'keywords', 'source',
            'doi', 'url', 'publisher', 'organization', 'school', 'institution',
            'address', 'abstract', 'isbn', 'issn', 'eissn', 'unique-id', 'pmid',
            'pmcid', 'archiveprefix', 'eprint', 'primaryclass'
        ]
    };

    const REQUIRED_FIELDS = {
        article: ['author', 'title', 'journal', 'year'],
        inproceedings: ['author', 'title', 'booktitle', 'year'],
        conference: ['author', 'title', 'booktitle', 'year'],
        book: ['title', 'year'],
        incollection: ['author', 'title', 'booktitle', 'year'],
        phdthesis: ['author', 'title', 'school', 'year'],
        mastersthesis: ['author', 'title', 'school', 'year'],
        techreport: ['author', 'title', 'institution', 'year']
    };

    function tidyBibtex(content, options) {
        const normalizedOptions = normalizeOptions(options);
        const result = createResult();
        const seenKeys = new Map();

        result.content = transformBibtexEntries(content, (rawEntry, index) => {
            const parsed = parseEntryBlock(rawEntry, result);
            if (!parsed) return rawEntry.text;

            const formatted = formatBibEntry(parsed, normalizedOptions);
            recordEntry(result.stats, parsed.entryType);
            recordEntryDiagnostics(parsed, formatted.entry, result, seenKeys, index);
            result.changes.push(formatted.change);
            return formatted.text;
        }, result);

        return result;
    }

    function validateBibtex(content, options) {
        const normalizedOptions = normalizeOptions(options);
        const result = createResult();
        const seenKeys = new Map();

        transformBibtexEntries(content, (rawEntry, index) => {
            const parsed = parseEntryBlock(rawEntry, result);
            if (!parsed) return rawEntry.text;

            const formatted = formatBibEntry(parsed, normalizedOptions);
            recordEntry(result.stats, parsed.entryType);
            recordEntryDiagnostics(parsed, formatted.entry, result, seenKeys, index);
            result.changes.push(formatted.change);
            return rawEntry.text;
        }, result);

        return result;
    }

    function formatReport(result) {
        const lines = [];
        lines.push(formatTidyStatus(result.stats));

        if (result.changes.length) {
            const renamed = result.changes.filter(change => change.citationKeyChanged);
            const modified = result.changes.reduce((count, change) => count + change.modifiedFields.length, 0);
            const removed = result.changes.reduce((count, change) => count + change.removedFields.length, 0);
            lines.push(`Renamed citation keys: ${renamed.length}`);
            lines.push(`Modified fields: ${modified}`);
            lines.push(`Removed fields: ${removed}`);

            renamed.slice(0, 12).forEach(change => {
                lines.push(`- key: ${change.originalCitationKey || '(blank)'} -> ${change.citationKey}`);
            });
            result.changes
                .filter(change => change.removedFields.length)
                .slice(0, 8)
                .forEach(change => {
                    lines.push(`- removed from ${change.citationKey}: ${change.removedFields.join(', ')}`);
                });
        }

        if (result.warnings.length) {
            lines.push('');
            lines.push(`Warnings (${result.warnings.length})`);
            result.warnings.slice(0, 20).forEach(warning => lines.push(`- ${warning.message}`));
        }

        if (result.errors.length) {
            lines.push('');
            lines.push(`Errors (${result.errors.length})`);
            result.errors.slice(0, 20).forEach(error => lines.push(`- ${error.message}`));
        }

        return lines.join('\n');
    }

    function parseBibtexLibrary(content) {
        const result = createResult();
        const entries = [];
        const preservedBlocks = [];
        const sourceBlocks = [];
        const seenKeys = new Map();
        let position = 0;
        let macroContext = '';
        let sourceEntryIndex = 0;

        while (position < content.length) {
            const blockStart = content.indexOf('@', position);
            if (blockStart === -1) break;

            sourceBlocks.push({ type: 'text', text: content.slice(position, blockStart) });
            const block = readBibtexBlock(content, blockStart);
            if (!block) {
                result.errors.push({
                    type: 'parse',
                    position: blockStart,
                    message: `Could not find the end of the BibTeX block starting at character ${blockStart}.`
                });
                break;
            }

            if (block.type === 'string') {
                macroContext += normalizeBlockDelimiters(block.text) + '\n';
                preservedBlocks.push(block.text);
                sourceBlocks.push({ type: 'preserved', text: block.text });
            } else if (isBibliographyEntryType(block.type)) {
                const parsed = parseEntryBlock({ text: block.text, macroContext }, result);
                if (parsed) {
                    parsed.sourceId = `source-entry-${sourceEntryIndex}`;
                    sourceEntryIndex++;
                    parsed.entryTags = Object.assign({}, parsed.entryTags);
                    entries.push(parsed);
                    sourceBlocks.push({ type: 'entry', sourceId: parsed.sourceId });
                    recordEntry(result.stats, parsed.entryType);
                    recordEntryDiagnostics(parsed, parsed, result, seenKeys, entries.length - 1);
                } else {
                    sourceBlocks.push({ type: 'preserved', text: block.text });
                }
            } else {
                preservedBlocks.push(block.text);
                sourceBlocks.push({ type: 'preserved', text: block.text });
            }

            position = block.end;
        }

        sourceBlocks.push({ type: 'text', text: content.slice(position) });

        return {
            entries,
            preservedBlocks,
            sourceBlocks,
            stats: result.stats,
            warnings: result.warnings,
            errors: result.errors
        };
    }

    function serializeBibtexLibrary(library, options) {
        const entries = Array.isArray(library) ? library : (library && library.entries) || [];
        const preservedBlocks = Array.isArray(library && library.preservedBlocks)
            ? library.preservedBlocks.filter(Boolean)
            : [];
        const normalizedOptions = normalizeOptions(options || { preset: 'complete', citationKeyTemplate: 'original' });
        if (Array.isArray(library && library.sourceBlocks) && library.sourceBlocks.length) {
            return serializeLibraryFromSourceBlocks(library.sourceBlocks, entries, normalizedOptions);
        }

        const entryTexts = entries.map(entry => formatLibraryEntry(entry, normalizedOptions));
        return preservedBlocks.concat(entryTexts).join('\n\n').trim();
    }

    function serializeLibraryFromSourceBlocks(sourceBlocks, entries, options) {
        const entriesBySourceId = new Map();
        entries.forEach(entry => {
            if (entry.sourceId) entriesBySourceId.set(entry.sourceId, entry);
        });

        const emittedEntries = new Set();
        let content = '';
        sourceBlocks.forEach(block => {
            if (!block) return;
            if (block.type === 'entry') {
                const entry = entriesBySourceId.get(block.sourceId);
                if (!entry) return;
                content += formatLibraryEntry(entry, options);
                emittedEntries.add(entry);
                return;
            }
            content += block.text || '';
        });

        const newEntries = entries.filter(entry => !emittedEntries.has(entry));
        if (newEntries.length) {
            const separator = content.trim() ? '\n\n' : '';
            content += separator + newEntries.map(entry => formatLibraryEntry(entry, options)).join('\n\n');
        }

        return content.trim();
    }

    function normalizeOptions(options) {
        const safeOptions = options || {};
        const preset = FIELD_PRESETS[safeOptions.preset] ? safeOptions.preset : 'clean';
        const citationKeyTemplate = safeOptions.citationKeyTemplate || DEFAULT_TEMPLATE;

        return {
            preset,
            fieldOrder: FIELD_PRESETS[preset],
            abbreviateJournals: Boolean(safeOptions.abbreviateJournals),
            renameCitationIds: safeOptions.renameCitationIds !== false && citationKeyTemplate !== 'original',
            citationKeyTemplate,
            journalAbbreviations: safeOptions.journalAbbreviations || getDefaultJournalAbbreviations()
        };
    }

    function createResult() {
        return {
            content: '',
            stats: {
                totalItems: 0,
                itemTypes: {}
            },
            changes: [],
            warnings: [],
            errors: []
        };
    }

    function recordEntry(stats, entryType) {
        const normalizedType = (entryType || 'unknown').toLowerCase();
        stats.totalItems++;
        stats.itemTypes[normalizedType] = (stats.itemTypes[normalizedType] || 0) + 1;
    }

    function formatTidyStatus(stats) {
        const typeSummary = Object.entries(stats.itemTypes)
            .sort(([typeA, countA], [typeB, countB]) => countB - countA || typeA.localeCompare(typeB))
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ');

        if (!stats.totalItems) return 'Processed 0 BibTeX entries.';
        return `Processed ${stats.totalItems} BibTeX entr${stats.totalItems === 1 ? 'y' : 'ies'}${typeSummary ? ` (${typeSummary})` : ''}.`;
    }

    function transformBibtexEntries(content, transformEntry, result) {
        let output = '';
        let position = 0;
        let macroContext = '';
        let entryIndex = 0;

        while (position < content.length) {
            const blockStart = content.indexOf('@', position);
            if (blockStart === -1) {
                output += content.slice(position);
                break;
            }

            output += content.slice(position, blockStart);

            const block = readBibtexBlock(content, blockStart);
            if (!block) {
                result.errors.push({
                    type: 'parse',
                    position: blockStart,
                    message: `Could not find the end of the BibTeX block starting at character ${blockStart}.`
                });
                output += content.slice(blockStart);
                break;
            }

            if (block.type === 'string') {
                macroContext += normalizeBlockDelimiters(block.text) + '\n';
                output += block.text;
            } else if (isBibliographyEntryType(block.type)) {
                output += transformEntry({ text: block.text, macroContext }, entryIndex);
                entryIndex++;
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

            if (char === '"' && !escaped) inQuote = !inQuote;

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
            if (char !== '\\') escaped = false;
        }

        return null;
    }

    function isBibliographyEntryType(type) {
        return !ENTRY_DIRECTIVES.has(type);
    }

    function parseEntryBlock(rawEntry, result) {
        const parser = getBibtexParser();
        try {
            const bibDatabase = parseWithMacroFallback(parser, rawEntry);
            const entry = bibDatabase[bibDatabase.length - 1];
            if (!entry || !entry.entryTags) {
                result.warnings.push({
                    type: 'empty-entry',
                    message: 'Skipped a BibTeX block because it did not contain entry fields.'
                });
                return null;
            }

            return {
                citationKey: entry.citationKey || '',
                entryType: (entry.entryType || 'misc').toLowerCase(),
                entryTags: normalizeEntryTags(entry.entryTags)
            };
        } catch (error) {
            result.errors.push({
                type: 'parse',
                message: `Failed to parse BibTeX entry: ${error.message || error}`
            });
            return null;
        }
    }

    function parseWithMacroFallback(parser, rawEntry) {
        const normalizedText = normalizeBlockDelimiters(rawEntry.text);
        try {
            return parser.toJSON(rawEntry.macroContext + normalizedText);
        } catch (error) {
            if (!rawEntry.macroContext) throw error;
            return parser.toJSON(normalizedText);
        }
    }

    function normalizeBlockDelimiters(text) {
        const directiveMatch = text.match(/^(@[A-Za-z]+\s*)\(/);
        if (!directiveMatch || !text.endsWith(')')) return text;

        return `${directiveMatch[1]}{${text.slice(directiveMatch[0].length, -1)}}`;
    }

    function normalizeEntryTags(entryTags) {
        const normalized = {};
        Object.entries(entryTags || {}).forEach(([key, value]) => {
            normalized[key.toLowerCase().trim()] = String(value).trim();
        });
        return normalized;
    }

    function formatBibEntry(entry, options) {
        const originalTags = Object.assign({}, entry.entryTags);
        const transformedTags = Object.assign({}, entry.entryTags);
        const fieldOrder = options.fieldOrder;

        if (transformedTags.journal) {
            transformedTags.journal = capitalizeTitle(transformedTags.journal);
            if (options.abbreviateJournals) {
                transformedTags.journal = abbreviateJournal(transformedTags.journal, options.journalAbbreviations);
            }
        }

        if (transformedTags.booktitle) {
            transformedTags.booktitle = capitalizeTitle(transformedTags.booktitle);
        }

        if (transformedTags.title) {
            transformedTags.title = protectTitleCapitalization(normalizeTitleCapitalization(transformedTags.title));
        }

        if (transformedTags.doi) {
            transformedTags.doi = normalizeDoi(transformedTags.doi);
        }

        const citationKey = options.renameCitationIds
            ? buildCitationKey(entry, transformedTags, options.citationKeyTemplate)
            : entry.citationKey;

        const keptFields = fieldOrder.filter(field => transformedTags[field]);
        const removedFields = Object.keys(originalTags)
            .filter(field => !fieldOrder.includes(field))
            .sort();
        const modifiedFields = keptFields
            .filter(field => originalTags[field] !== transformedTags[field])
            .map(field => ({
                field,
                before: originalTags[field],
                after: transformedTags[field]
            }));

        let formattedBib = `@${entry.entryType}{${citationKey},\n`;
        const valueColumn = getValueColumn(keptFields);
        keptFields.forEach(field => {
            formattedBib += formatFieldLine(field, transformedTags[field], valueColumn);
        });

        return {
            entry: {
                citationKey,
                entryType: entry.entryType,
                entryTags: transformedTags
            },
            text: formattedBib.trim().replace(/,$/, '') + '\n}',
            change: {
                entryType: entry.entryType,
                originalCitationKey: entry.citationKey,
                citationKey,
                citationKeyChanged: entry.citationKey !== citationKey,
                removedFields,
                modifiedFields
            }
        };
    }

    function formatLibraryEntry(entry, options) {
        const entryType = (entry.entryType || 'misc').toLowerCase().trim() || 'misc';
        const citationKey = String(entry.citationKey || '').trim() || buildCitationKey(entry, entry.entryTags || {}, 'author-year-title-colon');
        const tags = Object.assign({}, entry.entryTags || {});
        const orderedFields = getLibraryFieldOrder(tags, options.fieldOrder);
        const writableFields = orderedFields.filter(field => {
            const value = tags[field];
            return value !== undefined && value !== null && String(value).trim() !== '';
        });
        const valueColumn = getValueColumn(writableFields);
        let formattedBib = `@${entryType}{${citationKey},\n`;

        writableFields.forEach(field => {
            const value = tags[field];
            formattedBib += formatFieldLine(field, String(value).trim(), valueColumn);
        });

        return formattedBib.trim().replace(/,$/, '') + '\n}';
    }

    function getValueColumn(fields) {
        if (!fields.length) return 0;
        return Math.max(...fields.map(field => `  ${field} =`.length)) + 1;
    }

    function formatFieldLine(field, value, valueColumn) {
        const prefix = `  ${field} =`;
        const padding = ' '.repeat(Math.max(1, valueColumn - prefix.length));
        return `${prefix}${padding}{${value}},\n`;
    }

    function getLibraryFieldOrder(tags, preferredFields) {
        const preferred = (preferredFields || FIELD_PRESETS.complete).filter(field => tags[field]);
        const remaining = Object.keys(tags)
            .filter(field => !preferred.includes(field))
            .sort((fieldA, fieldB) => fieldA.localeCompare(fieldB));
        return preferred.concat(remaining);
    }

    function recordEntryDiagnostics(originalEntry, formattedEntry, result, seenKeys, entryIndex) {
        const key = formattedEntry.citationKey || originalEntry.citationKey || `(entry ${entryIndex + 1})`;
        if (seenKeys.has(key)) {
            result.warnings.push({
                type: 'duplicate-key',
                citationKey: key,
                message: `Duplicate citation key "${key}" also appears in entry ${seenKeys.get(key) + 1}.`
            });
        } else {
            seenKeys.set(key, entryIndex);
        }

        const requiredFields = REQUIRED_FIELDS[originalEntry.entryType] || ['author', 'title', 'year'];
        requiredFields.forEach(field => {
            if (!originalEntry.entryTags[field]) {
                result.warnings.push({
                    type: 'missing-field',
                    citationKey: key,
                    field,
                    message: `${key} is missing required field "${field}".`
                });
            }
        });

        if (originalEntry.entryTags.doi && !isPlausibleDoi(normalizeDoi(originalEntry.entryTags.doi))) {
            result.warnings.push({
                type: 'doi',
                citationKey: key,
                message: `${key} has a DOI that does not look valid.`
            });
        }
    }

    function buildCitationKey(entry, tags, template) {
        if (template === 'original') return entry.citationKey;

        const authorPart = getFirstAuthorPart(tags.author);
        const yearPart = tags.year ? sanitizeKeyPart(tags.year) : 'noyear';
        const titlePart = getTitlePart(tags.title);

        if (template === 'author-year-title-camel') {
            return `${authorPart}${yearPart}${titlePart}`;
        }

        return `${authorPart}:${yearPart}:${titlePart}`;
    }

    function getFirstAuthorPart(author) {
        if (!author) return 'noauthor';
        const firstAuthor = author.split(/\s+and\s+/i)[0].trim();
        const surname = firstAuthor.includes(',')
            ? firstAuthor.split(',')[0].trim()
            : firstAuthor.split(/\s+/).slice(-1)[0];
        return sanitizeKeyPart(surname) || 'noauthor';
    }

    function getTitlePart(title) {
        if (!title) return 'notitle';
        const words = stripOuterBraces(title)
            .replace(/[{}]/g, '')
            .split(/[^A-Za-z0-9]+/)
            .filter(Boolean);
        const initials = words.slice(0, 5).map(word => word[0].toUpperCase());
        return initials.join('') || 'notitle';
    }

    function sanitizeKeyPart(text) {
        return String(text || '').replace(/[^A-Za-z0-9_-]/g, '');
    }

    function protectTitleCapitalization(title) {
        if (!title) return '';
        const trimmedTitle = title.trim();
        if (trimmedTitle.startsWith('{') && trimmedTitle.endsWith('}')) return trimmedTitle;
        return `{${trimmedTitle}}`;
    }

    function normalizeTitleCapitalization(title) {
        if (!title) return '';

        const acronymWords = new Set([
            'ACM', 'AI', 'API', 'CNN', 'CPU', 'DCT', 'DNA', 'DNN', 'FFT', 'GAN',
            'GPU', 'HTTP', 'HTTPS', 'IEEE', 'IOT', 'LSTM', 'ML', 'NLP', 'PDE',
            'RGB', 'RNA', 'RNN', 'SQL', 'SVD', 'SVM', 'URL', 'XML'
        ]);
        const preservedTitleTerms = new Map([
            ['abelian', 'Abelian'], ['bayesian', 'Bayesian'], ['bernoulli', 'Bernoulli'],
            ['boolean', 'Boolean'], ['carlo', 'Carlo'], ['cartesian', 'Cartesian'],
            ['cauchy', 'Cauchy'], ['chebyshev', 'Chebyshev'], ['dirichlet', 'Dirichlet'],
            ['euclidean', 'Euclidean'], ['euler', 'Euler'], ['fermat', 'Fermat'],
            ['fourier', 'Fourier'], ['galois', 'Galois'], ['gaussian', 'Gaussian'],
            ['green', 'Green'], ['hamiltonian', 'Hamiltonian'], ['hermite', 'Hermite'],
            ['hilbert', 'Hilbert'], ['jacobian', 'Jacobian'], ['lagrange', 'Lagrange'],
            ['laplacian', 'Laplacian'], ['laurent', 'Laurent'], ['legendre', 'Legendre'],
            ['markov', 'Markov'], ['monte', 'Monte'], ['newton', 'Newton'],
            ['noetherian', 'Noetherian'], ['poisson', 'Poisson'], ['riemann', 'Riemann'],
            ['schrodinger', 'Schrodinger'], ['taylor', 'Taylor'],
            ['vandermerwe', 'VanDerMerwe'], ['wiener', 'Wiener'], ['zariski', 'Zariski']
        ]);
        let seenFirstWord = false;

        return splitProtectedBibtexText(title).map(part => {
            if (part.protected) {
                if (/[A-Za-z]/.test(part.text)) seenFirstWord = true;
                return part.text;
            }

            return part.text.replace(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g, word => {
                const normalizedWord = normalizeTitleWord(word, !seenFirstWord, acronymWords, preservedTitleTerms);
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

        if (buffer) parts.push({ text: buffer, protected: protectedPart });
        return parts;
    }

    function normalizeTitleWord(word, isFirstWord, acronymWords, preservedTitleTerms) {
        return word.split('-').map((part, index) => {
            if (shouldKeepTitleWordPart(part, acronymWords)) return part;

            const preservedTerm = getPreservedTitleTerm(part, preservedTitleTerms);
            if (preservedTerm) return preservedTerm;

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

    function getPreservedTitleTerm(wordPart, preservedTitleTerms) {
        if (!/^[A-Z]/.test(wordPart)) return null;
        return preservedTitleTerms.get(wordPart.toLowerCase()) || null;
    }

    function capitalizeTitle(title) {
        if (!title) return '';
        const prepositions = new Set(['of', 'the', 'and', 'in', 'on', 'for', 'with', 'a', 'an', 'by', 'at', 'to']);
        const specialWords = new Set(['IEEE', 'ACM', 'IEEE/ACM']);
        return title.split(' ').map(word => {
            if (word.startsWith('{') && word.endsWith('}')) return word;
            if (specialWords.has(word)) return word;
            if (prepositions.has(word.toLowerCase())) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    function abbreviateJournal(journal, abbreviations) {
        return abbreviations[journal] || journal;
    }

    function normalizeDoi(doi) {
        return String(doi || '')
            .trim()
            .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
            .replace(/^doi:\s*/i, '');
    }

    function isPlausibleDoi(doi) {
        return /^10\.\d{4,9}\/\S+$/i.test(doi);
    }

    function stripOuterBraces(text) {
        const trimmed = String(text || '').trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            return trimmed.slice(1, -1);
        }
        return trimmed;
    }

    function getDefaultJournalAbbreviations() {
        if (typeof journalAbbreviations !== 'undefined') return journalAbbreviations;
        return root.journalAbbreviations || {};
    }

    function getBibtexParser() {
        if (typeof bibtexParse !== 'undefined') return bibtexParse;
        if (root.bibtexParse) return root.bibtexParse;
        throw new Error('bibtexParse is not loaded.');
    }

    return {
        tidyBibtex,
        validateBibtex,
        parseBibtexLibrary,
        serializeBibtexLibrary,
        formatReport,
        formatTidyStatus,
        _private: {
            buildCitationKey,
            formatLibraryEntry,
            normalizeTitleCapitalization,
            readBibtexBlock
        }
    };
});
