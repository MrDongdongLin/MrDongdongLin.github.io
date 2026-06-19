document.addEventListener('DOMContentLoaded', () => {
    const textLeft = document.getElementById('text-left');
    const textRight = document.getElementById('text-right');
    const browseButton = document.getElementById('browse-button');
    const fileInput = document.getElementById('file-input');
    const newEntryButton = document.getElementById('new-entry-button');
    const deleteEntryButton = document.getElementById('delete-entry-button');
    const tidyButton = document.getElementById('tidy-button');
    const validateButton = document.getElementById('validate-button');
    const saveButton = document.getElementById('save-button');
    const exitButton = document.getElementById('exit-button');
    const loadSourceButton = document.getElementById('load-source-button');
    const applyAbbreviation = document.getElementById('abbreviate-checkbox');
    const renameCitationIds = document.getElementById('rename-id-checkbox');
    const presetSelect = document.getElementById('preset-select');
    const citationTemplateSelect = document.getElementById('citation-template-select');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const outputMessage = document.getElementById('output-message');
    const librarySearch = document.getElementById('library-search');
    const libraryCount = document.getElementById('library-count');
    const libraryTypeSummary = document.getElementById('library-type-summary');
    const entryList = document.getElementById('entry-list');
    const entryDetailForm = document.getElementById('entry-detail-form');
    const emptyDetail = document.getElementById('empty-detail');
    const detailEntryType = document.getElementById('detail-entry-type');
    const detailCitationKey = document.getElementById('detail-citation-key');
    const detailFields = document.getElementById('detail-fields');
    const addFieldButton = document.getElementById('add-field-button');
    const viewTabs = Array.from(document.querySelectorAll('.view-tab'));
    const pageViews = Array.from(document.querySelectorAll('.page-view'));
    const viewActions = Array.from(document.querySelectorAll('[data-view-action]'));

    const pinnedFields = [
        'author', 'title', 'journal', 'booktitle', 'year', 'publisher',
        'school', 'institution', 'volume', 'number', 'pages', 'doi',
        'url', 'keywords', 'abstract', 'note'
    ];
    const multilineFields = new Set(['author', 'title', 'abstract', 'note', 'keywords']);
    const listSummaryFields = new Set([
        'author', 'title', 'journal', 'booktitle', 'year',
        'publisher', 'school', 'institution'
    ]);

    let originalFileName = 'bibliography';
    let libraryEntries = [];
    let preservedBlocks = [];
    let sourceBlocks = [];
    let selectedEntryId = null;
    let nextEntryId = 1;
    let sourceNeedsLibrarySync = false;
    let formattedOutputIsCurrent = false;
    let pendingLibraryRenderTimer = 0;
    let pendingHighlightTimer = 0;

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

    textLeft.value = initialInputContent;
    loadLibraryFromText(initialInputContent, 'Loaded sample bibliography.');
    runTidy();
    setActiveView('library');

    browseButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;

        originalFileName = file.name.replace(/\.[^.]+$/, '') || 'bibliography';
        const reader = new FileReader();
        reader.onload = readEvent => {
            const content = readEvent.target.result;
            textLeft.value = content;
            textRight.value = '';
            formattedOutputIsCurrent = false;
            loadLibraryFromText(content, `Loaded file: ${file.name}`);
        };
        reader.readAsText(file);
    });

    newEntryButton.addEventListener('click', () => {
        const entry = createNewEntry();
        libraryEntries.unshift(entry);
        selectedEntryId = entry.id;
        markLibraryChanged();
        renderLibrary();
        renderDetail();
        outputMessage.value = `Added ${entry.citationKey}.`;
    });

    deleteEntryButton.addEventListener('click', () => {
        const selectedEntry = getSelectedEntry();
        if (!selectedEntry) return;
        libraryEntries = libraryEntries.filter(entry => entry.id !== selectedEntry.id);
        selectedEntryId = libraryEntries[0] ? libraryEntries[0].id : null;
        markLibraryChanged();
        renderLibrary();
        renderDetail();
        outputMessage.value = `Deleted ${selectedEntry.citationKey || 'selected item'}.`;
    });

    tidyButton.addEventListener('click', runTidy);
    validateButton.addEventListener('click', runValidate);

    saveButton.addEventListener('click', () => {
        syncPendingLibraryChanges();
        const content = formattedOutputIsCurrent && textRight.value ? textRight.value : textLeft.value;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tidy-${originalFileName}.bib`;
        a.click();
        URL.revokeObjectURL(url);
        appendReportLine('Saved file.');
    });

    exitButton.addEventListener('click', () => {
        window.close();
    });

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
    });

    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveView(tab.dataset.view);
        });
    });

    loadSourceButton.addEventListener('click', () => {
        loadLibraryFromText(textLeft.value, 'Loaded source into manager.');
    });

    librarySearch.addEventListener('input', () => {
        scheduleLibraryRender();
    });

    entryList.addEventListener('click', event => {
        const row = event.target.closest('.entry-row');
        if (!row) return;
        selectedEntryId = row.dataset.entryId;
        updateSelectedEntryRow();
        renderDetail();
    });

    detailEntryType.addEventListener('change', () => {
        const selectedEntry = getSelectedEntry();
        if (!selectedEntry) return;
        selectedEntry.entryType = detailEntryType.value;
        markLibraryChanged();
        scheduleLibraryRender();
    });

    detailCitationKey.addEventListener('input', () => {
        const selectedEntry = getSelectedEntry();
        if (!selectedEntry) return;
        selectedEntry.citationKey = detailCitationKey.value.trim();
        markLibraryChanged();
        scheduleLibraryRender();
    });

    detailFields.addEventListener('input', event => {
        const field = event.target.dataset.field;
        if (!field) return;
        const selectedEntry = getSelectedEntry();
        if (!selectedEntry) return;
        selectedEntry.entryTags[field] = event.target.value;
        markLibraryChanged();
        if (listSummaryFields.has(field)) {
            scheduleLibraryRender();
        }
    });

    detailFields.addEventListener('click', event => {
        const removeButton = event.target.closest('.remove-field-button');
        if (!removeButton) return;
        const selectedEntry = getSelectedEntry();
        if (!selectedEntry) return;
        delete selectedEntry.entryTags[removeButton.dataset.field];
        markLibraryChanged();
        renderLibrary();
        renderDetail();
    });

    addFieldButton.addEventListener('click', () => {
        const selectedEntry = getSelectedEntry();
        if (!selectedEntry) return;
        const fieldName = normalizeFieldName(prompt('Field name'));
        if (!fieldName) return;
        if (Object.prototype.hasOwnProperty.call(selectedEntry.entryTags, fieldName)) {
            outputMessage.value = `${fieldName} already exists on this item.`;
            return;
        }
        selectedEntry.entryTags[fieldName] = '';
        markLibraryChanged();
        renderDetail();
    });

    citationTemplateSelect.addEventListener('change', () => {
        const useOriginalKeys = citationTemplateSelect.value === 'original';
        renameCitationIds.checked = !useOriginalKeys;
    });

    renameCitationIds.addEventListener('change', () => {
        if (!renameCitationIds.checked && citationTemplateSelect.value !== 'original') {
            citationTemplateSelect.value = 'original';
        } else if (renameCitationIds.checked && citationTemplateSelect.value === 'original') {
            citationTemplateSelect.value = 'author-year-title-colon';
        }
    });

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (!targetId) return;
            const targetTextArea = document.getElementById(targetId);
            if (!targetTextArea) return;

            copyText(targetTextArea).then(() => {
                const originalLabel = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalLabel;
                }, 1600);
            }).catch(error => {
                appendReportLine(`Copy failed: ${error.message}`);
            });
        });
    });

    textLeft.addEventListener('input', () => {
        sourceNeedsLibrarySync = false;
        formattedOutputIsCurrent = false;
        scheduleHighlighting();
    });
    textRight.addEventListener('input', scheduleHighlighting);

    function loadLibraryFromText(content, message) {
        const result = bibTidyCore.parseBibtexLibrary(content);
        preservedBlocks = result.preservedBlocks || [];
        sourceBlocks = result.sourceBlocks || [];
        libraryEntries = result.entries.map(entry => ({
            id: createEntryId(),
            sourceId: entry.sourceId,
            citationKey: entry.citationKey,
            entryType: entry.entryType,
            entryTags: Object.assign({}, entry.entryTags)
        }));
        selectedEntryId = libraryEntries[0] ? libraryEntries[0].id : null;
        sourceNeedsLibrarySync = false;
        formattedOutputIsCurrent = false;
        renderLibrary();
        renderDetail();
        scheduleHighlighting();
        outputMessage.value = formatLibraryReport(result, message);
    }

    function runTidy() {
        syncPendingLibraryChanges();
        const result = bibTidyCore.tidyBibtex(textLeft.value, getTidyOptions());
        textRight.value = result.content;
        formattedOutputIsCurrent = true;
        outputMessage.value = bibTidyCore.formatReport(result);
        scheduleHighlighting();
    }

    function runValidate() {
        syncPendingLibraryChanges();
        const result = bibTidyCore.validateBibtex(textLeft.value, getTidyOptions());
        outputMessage.value = bibTidyCore.formatReport(result);
        scheduleHighlighting();
    }

    function getTidyOptions() {
        const citationKeyTemplate = renameCitationIds.checked
            ? citationTemplateSelect.value
            : 'original';

        return {
            preset: presetSelect.value,
            abbreviateJournals: applyAbbreviation.checked,
            renameCitationIds: renameCitationIds.checked,
            citationKeyTemplate
        };
    }

    function renderLibrary() {
        pendingLibraryRenderTimer = 0;
        const filteredEntries = getFilteredEntries();
        libraryCount.textContent = `${libraryEntries.length} item${libraryEntries.length === 1 ? '' : 's'}`;
        renderTypeSummary();
        entryList.replaceChildren();

        if (!filteredEntries.length) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'empty-state compact-empty';
            emptyRow.textContent = libraryEntries.length ? 'No matches.' : 'No BibTeX items.';
            entryList.appendChild(emptyRow);
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredEntries.forEach(entry => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = entry.id === selectedEntryId ? 'entry-row selected' : 'entry-row';
            row.dataset.entryId = entry.id;
            row.setAttribute('role', 'option');
            row.setAttribute('aria-selected', entry.id === selectedEntryId ? 'true' : 'false');

            const title = document.createElement('span');
            title.className = 'entry-title';
            title.textContent = cleanDisplayText(entry.entryTags.title) || '(untitled)';

            const meta = document.createElement('span');
            meta.className = 'entry-meta';
            meta.textContent = [
                cleanDisplayText(entry.entryTags.author),
                getVenue(entry),
                entry.entryTags.year
            ].filter(Boolean).join(' - ');

            const keyLine = document.createElement('span');
            keyLine.className = 'entry-key';
            keyLine.textContent = `${entry.entryType || 'misc'} - ${entry.citationKey || '(no key)'}`;

            row.append(title, meta, keyLine);
            fragment.appendChild(row);
        });
        entryList.appendChild(fragment);
    }

    function scheduleLibraryRender() {
        if (pendingLibraryRenderTimer) {
            clearTimeout(pendingLibraryRenderTimer);
        }
        pendingLibraryRenderTimer = setTimeout(renderLibrary, 80);
    }

    function updateSelectedEntryRow() {
        entryList.querySelectorAll('.entry-row').forEach(row => {
            const isSelected = row.dataset.entryId === selectedEntryId;
            row.classList.toggle('selected', isSelected);
            row.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
    }

    function renderTypeSummary() {
        const counts = libraryEntries.reduce((map, entry) => {
            const type = entry.entryType || 'misc';
            map[type] = (map[type] || 0) + 1;
            return map;
        }, {});
        const summary = Object.entries(counts)
            .sort(([typeA, countA], [typeB, countB]) => countB - countA || typeA.localeCompare(typeB))
            .slice(0, 5)
            .map(([type, count]) => `${type} ${count}`);
        libraryTypeSummary.textContent = summary.join(' | ');
    }

    function renderDetail() {
        const selectedEntry = getSelectedEntry();
        entryDetailForm.classList.toggle('is-hidden', !selectedEntry);
        emptyDetail.classList.toggle('is-hidden', Boolean(selectedEntry));
        deleteEntryButton.disabled = !selectedEntry;
        addFieldButton.disabled = !selectedEntry;
        if (!selectedEntry) {
            detailFields.replaceChildren();
            return;
        }

        detailEntryType.value = selectedEntry.entryType || 'misc';
        detailCitationKey.value = selectedEntry.citationKey || '';
        detailFields.replaceChildren();

        getVisibleFields(selectedEntry).forEach(field => {
            detailFields.appendChild(createFieldControl(field, selectedEntry.entryTags[field] || ''));
        });
    }

    function createFieldControl(field, value) {
        const wrapper = document.createElement('label');
        wrapper.className = 'field-control';

        const labelRow = document.createElement('span');
        labelRow.className = 'field-label-row';

        const labelText = document.createElement('span');
        labelText.textContent = field;
        labelRow.appendChild(labelText);

        if (!pinnedFields.includes(field)) {
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'remove-field-button';
            removeButton.dataset.field = field;
            removeButton.textContent = 'Remove';
            labelRow.appendChild(removeButton);
        }

        const input = multilineFields.has(field) ? document.createElement('textarea') : document.createElement('input');
        input.dataset.field = field;
        input.value = value;
        if (input.tagName === 'INPUT') input.type = 'text';
        if (field === 'url') input.inputMode = 'url';

        wrapper.append(labelRow, input);
        return wrapper;
    }

    function getVisibleFields(entry) {
        const existingFields = Object.keys(entry.entryTags || {});
        const remaining = existingFields
            .filter(field => !pinnedFields.includes(field))
            .sort((fieldA, fieldB) => fieldA.localeCompare(fieldB));
        return pinnedFields.concat(remaining);
    }

    function getFilteredEntries() {
        const query = librarySearch.value.trim().toLowerCase();
        if (!query) return libraryEntries;
        return libraryEntries.filter(entry => {
            const haystack = [
                entry.citationKey,
                entry.entryType,
                entry.entryTags.title,
                entry.entryTags.author,
                getVenue(entry),
                entry.entryTags.year,
                entry.entryTags.doi,
                entry.entryTags.keywords
            ].join(' ').toLowerCase();
            return haystack.includes(query);
        });
    }

    function createNewEntry() {
        const year = new Date().getFullYear();
        const count = libraryEntries.length + 1;
        return {
            id: createEntryId(),
            entryType: 'article',
            citationKey: `newitem${count}`,
            entryTags: {
                author: '',
                title: 'Untitled',
                journal: '',
                year: String(year),
                doi: ''
            }
        };
    }

    function syncAndRenderList() {
        markLibraryChanged();
        scheduleLibraryRender();
    }

    function markLibraryChanged() {
        sourceNeedsLibrarySync = true;
        formattedOutputIsCurrent = false;
    }

    function syncPendingLibraryChanges() {
        if (sourceNeedsLibrarySync) {
            syncSourceFromLibrary();
        }
    }

    function syncSourceFromLibrary() {
        textLeft.value = bibTidyCore.serializeBibtexLibrary({
            preservedBlocks,
            sourceBlocks,
            entries: libraryEntries
        }, { preset: 'complete', citationKeyTemplate: 'original', renameCitationIds: false });
        sourceNeedsLibrarySync = false;
        formattedOutputIsCurrent = false;
        scheduleHighlighting();
    }

    function setActiveView(viewName) {
        const nextView = viewName === 'tidy' ? 'tidy' : 'library';
        if (nextView === 'tidy') {
            syncPendingLibraryChanges();
        }
        document.body.dataset.view = nextView;

        viewTabs.forEach(tab => {
            const isActive = tab.dataset.view === nextView;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        pageViews.forEach(page => {
            page.classList.toggle('active', page.dataset.page === nextView);
        });

        viewActions.forEach(action => {
            const actionView = action.dataset.viewAction;
            const isVisible = actionView === 'all' || actionView === nextView;
            action.classList.toggle('is-hidden', !isVisible);
        });
    }

    function getSelectedEntry() {
        return libraryEntries.find(entry => entry.id === selectedEntryId) || null;
    }

    function getVenue(entry) {
        return cleanDisplayText(
            entry.entryTags.journal ||
            entry.entryTags.booktitle ||
            entry.entryTags.publisher ||
            entry.entryTags.school ||
            entry.entryTags.institution ||
            ''
        );
    }

    function cleanDisplayText(text) {
        return String(text || '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
    }

    function normalizeFieldName(fieldName) {
        return String(fieldName || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    }

    function createEntryId() {
        if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
        const id = `entry-${nextEntryId}`;
        nextEntryId++;
        return id;
    }

    function formatLibraryReport(result, message) {
        const lines = [message, bibTidyCore.formatTidyStatus(result.stats)];
        if (result.warnings.length) {
            lines.push('');
            lines.push(`Warnings (${result.warnings.length})`);
            result.warnings.slice(0, 12).forEach(warning => lines.push(`- ${warning.message}`));
        }
        if (result.errors.length) {
            lines.push('');
            lines.push(`Errors (${result.errors.length})`);
            result.errors.slice(0, 12).forEach(error => lines.push(`- ${error.message}`));
        }
        return lines.join('\n');
    }

    function appendReportLine(line) {
        outputMessage.value = outputMessage.value
            ? `${outputMessage.value}\n${line}`
            : line;
    }

    function copyText(textArea) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(textArea.value);
        }

        textArea.focus();
        textArea.select();
        const copied = document.execCommand('copy');
        textArea.setSelectionRange(textArea.value.length, textArea.value.length);

        if (copied) return Promise.resolve();
        return Promise.reject(new Error('Clipboard copy is not available in this browser'));
    }

    function scheduleHighlighting() {
        if (pendingHighlightTimer) {
            clearTimeout(pendingHighlightTimer);
        }
        pendingHighlightTimer = setTimeout(applyHighlighting, 120);
    }

    function applyHighlighting() {
        pendingHighlightTimer = 0;
        document.querySelectorAll('.highlight-bibtex').forEach(textArea => {
            const highlightedDiv = textArea.nextElementSibling;
            if (!highlightedDiv) return;

            const highlightIsHidden = window.getComputedStyle(highlightedDiv).display === 'none';
            if (highlightIsHidden) {
                highlightedDiv.textContent = '';
                return;
            }

            highlightedDiv.innerHTML = highlightBibtex(textArea.value);
        });
    }
});
