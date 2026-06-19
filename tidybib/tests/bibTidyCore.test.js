const assert = require('assert');

global.bibtexParse = require('../bibtexParse.js');
global.journalAbbreviations = {
    'Journal of Machine Learning Research': 'J. Mach. Learn. Res.'
};

const bibTidyCore = require('../bibTidyCore.js');
const { highlightBibtex } = require('../highlightBibtex.js');

function test(name, fn) {
    try {
        fn();
        console.log(`ok - ${name}`);
    } catch (error) {
        console.error(`not ok - ${name}`);
        throw error;
    }
}

test('formats a single article with clean defaults', () => {
    const input = `@article{Smith2024,
  author = {Smith, Jane and Doe, John},
  title = {AN IEEE METHOD for FAST AI},
  journal = {journal of machine learning research},
  year = {2024},
  abstract = {Long abstract},
  doi = {https://doi.org/10.1000/example}
}`;

    const result = bibTidyCore.tidyBibtex(input, {
        preset: 'clean',
        abbreviateJournals: true,
        renameCitationIds: true,
        citationKeyTemplate: 'author-year-title-colon'
    });

    assert.strictEqual(result.errors.length, 0);
    assert.match(result.content, /@article\{Smith:2024:AIMFF/);
    assert.match(result.content, /journal =\s+\{J\. Mach\. Learn\. Res\.\}/);
    assert.match(result.content, /title =\s+\{\{An IEEE method for fast AI\}\}/);
    assert.match(result.content, /doi =\s+\{10\.1000\/example\}/);
    assert.doesNotMatch(result.content, /abstract/);
});

test('preserves string macros and resolves macro values when parser supports them', () => {
    const input = `@string{jmlr = {Journal of Machine Learning Research}}

@article{smith2024,
  author = {Smith, Jane},
  title = {A SIMPLE TEST},
  journal = jmlr,
  year = {2024}
}`;

    const result = bibTidyCore.tidyBibtex(input, {
        preset: 'clean',
        abbreviateJournals: true
    });

    assert.match(result.content, /^@string\{jmlr/m);
    assert.match(result.content, /journal =\s+\{J\. Mach\. Learn\. Res\.\}/);
});

test('tidy preserves comments and adjacent string macro spacing', () => {
    const input = `% shared macros
@string{jmlr = {Journal of Machine Learning Research}}
@string{conf = {Example Conference}}

% main entry
@article{smith2024,
  author = {Smith, Jane},
  title = {A SIMPLE TEST},
  journal = jmlr,
  year = {2024}
}`;

    const result = bibTidyCore.tidyBibtex(input, {
        preset: 'clean',
        abbreviateJournals: true,
        renameCitationIds: false
    });

    assert.match(result.content, /^% shared macros/);
    assert.match(result.content, /% main entry/);
    assert.match(result.content, /@string\{jmlr = \{Journal of Machine Learning Research\}\}\n@string\{conf = \{Example Conference\}\}/);
});

test('library serialization preserves comments and original string macro spacing', () => {
    const input = `% shared macros
@string{jmlr = {Journal of Machine Learning Research}}
@string{conf = {Example Conference}}

% main entry
@article{smith2024,
  author = {Smith, Jane},
  title = {A SIMPLE TEST},
  journal = jmlr,
  year = {2024}
}`;

    const library = bibTidyCore.parseBibtexLibrary(input);
    library.entries[0].entryTags.year = '2025';
    const serialized = bibTidyCore.serializeBibtexLibrary(library, {
        preset: 'complete',
        renameCitationIds: false,
        citationKeyTemplate: 'original'
    });

    assert.match(serialized, /^% shared macros/);
    assert.match(serialized, /% main entry/);
    assert.match(serialized, /@string\{jmlr = \{Journal of Machine Learning Research\}\}\n@string\{conf = \{Example Conference\}\}/);
    assert.match(serialized, /year =\s+\{2025\}/);
});

test('parses entries and string macros that use parentheses', () => {
    const input = `@string(jmlr = {Journal of Machine Learning Research})

@article(smith2024,
  author = {Smith, Jane},
  title = {A SIMPLE TEST},
  journal = jmlr,
  year = {2024}
)`;

    const result = bibTidyCore.tidyBibtex(input, {
        preset: 'clean',
        abbreviateJournals: true,
        renameCitationIds: false
    });

    assert.strictEqual(result.errors.length, 0);
    assert.match(result.content, /^@string\(jmlr/m);
    assert.match(result.content, /journal =\s+\{J\. Mach\. Learn\. Res\.\}/);
});

test('supports minimal and complete presets', () => {
    const input = `@inproceedings{key,
  author = {Li, Yue},
  title = {A TEST PAPER},
  booktitle = {BIG CONFERENCE},
  year = {2025},
  organization = {Example Org},
  isbn = {123}
}`;

    const minimal = bibTidyCore.tidyBibtex(input, { preset: 'minimal' });
    const complete = bibTidyCore.tidyBibtex(input, { preset: 'complete' });

    assert.doesNotMatch(minimal.content, /organization/);
    assert.doesNotMatch(minimal.content, /isbn/);
    assert.match(complete.content, /organization =\s+\{Example Org\}/);
    assert.match(complete.content, /isbn =\s+\{123\}/);
});

test('places equals after field names while keeping values aligned', () => {
    const input = `@article{align,
  author = {Doe, Jane},
  title = {ALIGNMENT TEST},
  journal = {Example Journal},
  year = {2026}
}`;

    const result = bibTidyCore.tidyBibtex(input, {
        preset: 'clean',
        renameCitationIds: false
    });
    const lines = result.content.split('\n').filter(line => /^\s+\w+ =/.test(line));
    const valueColumns = lines.map(line => line.indexOf('{'));

    assert(lines.some(line => /^\s+author =\s+\{/.test(line)));
    assert(lines.some(line => /^\s+title =\s+\{/.test(line)));
    assert.strictEqual(new Set(valueColumns).size, 1);
});

test('supports citation key templates and original keys', () => {
    const input = `@article{oldKey,
  author = {Curie, Marie},
  title = {RADIUM STUDIES},
  journal = {Example Journal},
  year = {1911}
}`;

    const camel = bibTidyCore.tidyBibtex(input, {
        citationKeyTemplate: 'author-year-title-camel'
    });
    const original = bibTidyCore.tidyBibtex(input, {
        renameCitationIds: false,
        citationKeyTemplate: 'original'
    });

    assert.match(camel.content, /@article\{Curie1911RS/);
    assert.match(original.content, /@article\{oldKey/);
});

test('parses and serializes manageable library entries', () => {
    const input = `@string{example = {Example Journal}}

@article{key,
  author = {Doe, Jane},
  title = {A LIBRARY TEST},
  journal = example,
  year = {2026},
  custom = {keep me}
}`;

    const library = bibTidyCore.parseBibtexLibrary(input);
    const serialized = bibTidyCore.serializeBibtexLibrary(library, {
        preset: 'complete',
        renameCitationIds: false,
        citationKeyTemplate: 'original'
    });

    assert.strictEqual(library.entries.length, 1);
    assert.strictEqual(library.preservedBlocks.length, 1);
    assert.strictEqual(library.entries[0].entryTags.custom, 'keep me');
    assert.match(serialized, /@string\{example/);
    assert.match(serialized, /custom =\s+\{keep me\}/);
});

test('reports duplicate keys and missing required fields', () => {
    const input = `@article{same,
  title = {No author},
  year = {2024}
}

@article{same,
  author = {Doe, John},
  title = {No journal},
  year = {2024}
}`;

    const result = bibTidyCore.validateBibtex(input, {
        renameCitationIds: false,
        citationKeyTemplate: 'original'
    });

    assert(result.warnings.some(warning => warning.type === 'duplicate-key'));
    assert(result.warnings.some(warning => warning.type === 'missing-field' && warning.field === 'author'));
    assert(result.warnings.some(warning => warning.type === 'missing-field' && warning.field === 'journal'));
});

test('reports malformed BibTeX without throwing', () => {
    const result = bibTidyCore.tidyBibtex('@article{broken, title = {Missing end}', {});
    assert.strictEqual(result.errors.length, 1);
    assert.match(result.errors[0].message, /Could not find the end/);
});

test('escapes HTML before highlighting', () => {
    const highlighted = highlightBibtex('@misc{x, title = {<script>alert(1)</script>}, year = {2024}}');
    assert.doesNotMatch(highlighted, /<script>/);
    assert.match(highlighted, /&lt;script&gt;/);
});
