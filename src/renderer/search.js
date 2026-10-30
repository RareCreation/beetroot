let searchBar = null;
let searchInput = null;
let searchResults = null;
let searchPrev = null;
let searchNext = null;
let searchClose = null;
let getTermRef = null;
let getSearchAddonRef = null;
let isOpenState = false;
let currentSearchTerm = '';

function updateResultsDisplay(found, total) {
    if (!searchResults) return;
    if (total === 0 && currentSearchTerm) {
        searchResults.textContent = '0/0';
        searchResults.classList.add('no-results');
    } else if (total > 0) {
        searchResults.textContent = found + '/' + total;
        searchResults.classList.remove('no-results');
    } else {
        searchResults.textContent = '0/0';
        searchResults.classList.remove('no-results');
    }
    const hasResults = total > 0;
    if (searchPrev) searchPrev.disabled = !hasResults;
    if (searchNext) searchNext.disabled = !hasResults;
}

function getDecorations() {
    return {
        matchBackground: '#ff8c90',
        matchBorder: '#ff8c90',
        matchOverviewRuler: '#ff8c90',
        activeMatchBackground: '#ff5f57',
        activeMatchBorder: '#ff5f57',
        activeMatchColorOverviewRuler: '#ff5f57'
    };
}

function doSearch(term, incremental) {
    currentSearchTerm = term;
    const addon = getSearchAddonRef ? getSearchAddonRef() : null;
    if (!addon) {
        console.warn('Search addon is not initialized');
        return;
    }

    if (!term) {
        addon.clearDecorations();
        updateResultsDisplay(0, 0);
        return;
    }

    const options = {
        decorations: getDecorations(),
        incremental: !!incremental
    };

    addon.findNext(term, options);
}

function findNext() {
    if (!currentSearchTerm) return;
    const addon = getSearchAddonRef ? getSearchAddonRef() : null;
    if (!addon) return;
    addon.findNext(currentSearchTerm, { decorations: getDecorations() });
}

function findPrev() {
    if (!currentSearchTerm) return;
    const addon = getSearchAddonRef ? getSearchAddonRef() : null;
    if (!addon) return;
    addon.findPrevious(currentSearchTerm, { decorations: getDecorations() });
}

function open() {
    if (!searchBar) return;
    const term = getTermRef ? getTermRef() : null;
    if (!term) return;
    isOpenState = true;
    searchBar.classList.remove('hidden');
    searchInput.value = '';
    currentSearchTerm = '';
    updateResultsDisplay(0, 0);

    const addon = getSearchAddonRef ? getSearchAddonRef() : null;
    if (addon) {
        addon.clearDecorations();
        if (addon._onDidChangeResults) {
            addon._onDidChangeResults.dispose();
        }
        addon._onDidChangeResults = addon.onDidChangeResults(function(e) {
            updateResultsDisplay(e.resultIndex + 1, e.resultCount);
        });
    }

    setTimeout(function() {
        searchInput.focus();
        searchInput.select();
    }, 50);
}

function close() {
    if (!searchBar) return;
    isOpenState = false;
    searchBar.classList.add('hidden');
    const addon = getSearchAddonRef ? getSearchAddonRef() : null;
    if (addon) {
        if (addon._onDidChangeResults) {
            addon._onDidChangeResults.dispose();
            addon._onDidChangeResults = null;
        }
        addon.clearDecorations();
    }
    currentSearchTerm = '';
    const term = getTermRef ? getTermRef() : null;
    if (term) term.focus();
}

function isOpen() {
    return isOpenState;
}

function init(getTerm, getSearchAddon) {
    getTermRef = getTerm;
    getSearchAddonRef = getSearchAddon;

    searchBar = document.getElementById('search-bar');
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    searchPrev = document.getElementById('search-prev');
    searchNext = document.getElementById('search-next');
    searchClose = document.getElementById('search-close');

    if (!searchBar) return;

    searchInput.addEventListener('input', function() {
        doSearch(searchInput.value, true);
    });

    searchInput.addEventListener('keydown', function(e) {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) findPrev();
            else findNext();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        }
    });

    searchPrev.addEventListener('click', findPrev);
    searchNext.addEventListener('click', findNext);
    searchClose.addEventListener('click', close);

    searchBar.addEventListener('keydown', function(e) {
        e.stopPropagation();
    });

    searchBar.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
}

export { init, open, close, isOpen };