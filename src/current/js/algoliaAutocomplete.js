// Algolia Autocomplete with Kapa Integration
// Following: https://docs.kapa.ai/integrations/website-widget/examples/algolia-integration
(function() {
  // Wait for DOM and dependencies
  function initializeAutocomplete() {
    if (typeof algoliasearch === 'undefined' || !document.getElementById('search-input')) {
      setTimeout(initializeAutocomplete, 100);
      return;
    }

    // Algolia configuration from Jekyll
    const ALGOLIA_APP_ID = '7RXZLDVR5F';
    const ALGOLIA_SEARCH_KEY = '372a10456f4ed7042c531ff3a658771b';
    const ALGOLIA_INDEX_NAME = 'stage_cockroach_docs';
    
    // Initialize Algolia client
    const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
    const index = searchClient.initIndex(ALGOLIA_INDEX_NAME);
    
    let searchTimeout;
    let currentRequest;
    
    // Search Algolia
    async function searchAlgolia(query) {
      // Cancel previous request if pending
      if (currentRequest && currentRequest.cancel) {
        currentRequest.cancel();
      }
      
      try {
        currentRequest = index.search(query, {
          hitsPerPage: 6,
          attributesToRetrieve: ['title', 'url', 'doc_type', 'content', 'version'],
          attributesToHighlight: ['title', 'content'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>'
        });
        
        const results = await currentRequest;
        currentRequest = null;
        return results;
      } catch (error) {
        currentRequest = null;
        if (error.name === 'AbortError') {
          return null;
        }
        console.error('Algolia search error:', error);
        return null;
      }
    }
    
    // Display autocomplete suggestions
    function displaySuggestions(results, query, inputElement) {
      // Remove existing suggestions
      const existingSuggestions = document.getElementById('algolia-autocomplete');
      if (existingSuggestions) {
        existingSuggestions.remove();
      }
      
      if (!query || query.length < 2) {
        return;
      }
      
      // Create suggestions container
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.id = 'algolia-autocomplete';
      suggestionsContainer.className = 'algolia-autocomplete-dropdown';
      suggestionsContainer.innerHTML = '';
      
      // Add "Ask AI" button first (following Kapa integration guide)
      const askAIItem = document.createElement('button');
      askAIItem.className = 'aa-item ask-ai-item';
      askAIItem.innerHTML = `
        <div class="ask-ai-content">
          <i class="fas fa-robot"></i>
          <span class="ask-ai-text">Ask AI about "${escapeHtml(query)}"</span>
        </div>
      `;
      askAIItem.onclick = function(e) {
        e.preventDefault();
        // Following Kapa integration guide - pass query and submit: true
        if (window.Kapa && window.Kapa.open) {
          window.Kapa.open({ 
            query: query,
            submit: true  // Auto-submit the query
          });
          hideAutocomplete();
          inputElement.value = '';
        } else {
          console.warn('Kapa widget not available');
        }
      };
      suggestionsContainer.appendChild(askAIItem);
      
      // Add divider
      const divider = document.createElement('div');
      divider.className = 'aa-divider';
      suggestionsContainer.appendChild(divider);
      
      // Add search results
      if (results && results.hits && results.hits.length > 0) {
        results.hits.forEach((hit, index) => {
          const item = document.createElement('a');
          item.className = 'aa-item search-result-item';
          item.href = hit.url || '#';
          
          const title = hit._highlightResult?.title?.value || hit.title || 'Untitled';
          const content = hit._highlightResult?.content?.value || hit.content || '';
          const docType = hit.doc_type || '';
          const version = hit.version || '';
          
          // Truncate content
          const truncatedContent = content.length > 150 
            ? content.substring(0, 150) + '...' 
            : content;
          
          item.innerHTML = `
            <div class="result-content">
              <div class="result-title">${title}</div>
              ${truncatedContent ? `<div class="result-snippet">${truncatedContent}</div>` : ''}
              <div class="result-meta">
                ${docType ? `<span class="doc-type">${docType}</span>` : ''}
                ${version ? `<span class="version">${version}</span>` : ''}
              </div>
            </div>
          `;
          
          item.onclick = function(e) {
            e.preventDefault();
            window.location.href = hit.url || '#';
            hideAutocomplete();
          };
          
          suggestionsContainer.appendChild(item);
        });
        
        // Add "View all results" link
        const viewAllItem = document.createElement('button');
        viewAllItem.className = 'aa-item view-all-item';
        viewAllItem.innerHTML = `
          <span>View all results for "${escapeHtml(query)}" →</span>
        `;
        viewAllItem.onclick = function() {
          const searchPath = getSearchPath();
          window.location.href = searchPath + '?query=' + encodeURIComponent(query);
        };
        suggestionsContainer.appendChild(viewAllItem);
      } else if (results && results.hits && results.hits.length === 0) {
        // No results found
        const noResultsItem = document.createElement('div');
        noResultsItem.className = 'aa-item no-results';
        noResultsItem.innerHTML = '<span>No results found. Try the AI Assistant above.</span>';
        suggestionsContainer.appendChild(noResultsItem);
      }
      
      // Position relative to input
      const parent = inputElement.parentElement;
      parent.style.position = 'relative';
      parent.appendChild(suggestionsContainer);
      
      // Add active class for animation
      setTimeout(() => {
        suggestionsContainer.classList.add('active');
      }, 10);
    }
    
    // Hide autocomplete
    function hideAutocomplete() {
      const suggestions = document.getElementById('algolia-autocomplete');
      if (suggestions) {
        suggestions.classList.remove('active');
        setTimeout(() => {
          suggestions.remove();
        }, 200);
      }
    }
    
    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Get search path
    function getSearchPath() {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/docs/') || currentPath === '/docs' || currentPath.startsWith('/docs/')) {
        return '/docs/search';
      }
      return '/search';
    }
    
    // Initialize autocomplete on search input
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    // Handle input changes
    searchInput.addEventListener('input', async function(e) {
      const query = e.target.value.trim();
      
      // Clear timeout from previous input
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Hide suggestions if query is too short
      if (query.length < 2) {
        hideAutocomplete();
        return;
      }
      
      // Debounce search (wait 250ms after user stops typing)
      searchTimeout = setTimeout(async () => {
        // Show loading state
        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'algolia-autocomplete';
        loadingContainer.className = 'algolia-autocomplete-dropdown loading';
        loadingContainer.innerHTML = `
          <div class="aa-item loading-item">
            <i class="fas fa-spinner fa-spin"></i> Searching...
          </div>
        `;
        
        // Remove existing and add loading
        const existing = document.getElementById('algolia-autocomplete');
        if (existing) existing.remove();
        
        const parent = searchInput.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(loadingContainer);
        
        // Search Algolia
        const results = await searchAlgolia(query);
        if (results !== null) {
          displaySuggestions(results, query, searchInput);
        } else {
          hideAutocomplete();
        }
      }, 250);
    });
    
    // Handle focus
    searchInput.addEventListener('focus', function(e) {
      if (e.target.value.trim().length >= 2) {
        e.target.dispatchEvent(new Event('input'));
      }
    });
    
    // Hide suggestions on click outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#search-input') && !e.target.closest('#algolia-autocomplete')) {
        hideAutocomplete();
      }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
      const suggestions = document.getElementById('algolia-autocomplete');
      if (!suggestions) return;
      
      const items = suggestions.querySelectorAll('.aa-item:not(.no-results)');
      if (items.length === 0) return;
      
      const currentActive = suggestions.querySelector('.aa-item.active');
      let currentIndex = Array.from(items).indexOf(currentActive);
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentActive) currentActive.classList.remove('active');
          currentIndex = (currentIndex + 1) % items.length;
          items[currentIndex].classList.add('active');
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (currentActive) currentActive.classList.remove('active');
          currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          items[currentIndex].classList.add('active');
          break;
          
        case 'Enter':
          if (currentActive && !e.defaultPrevented) {
            e.preventDefault();
            currentActive.click();
          }
          break;
          
        case 'Escape':
          hideAutocomplete();
          e.target.blur();
          break;
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutocomplete);
  } else {
    initializeAutocomplete();
  }
})();

// CSS Styles for Algolia Autocomplete
const style = document.createElement('style');
style.textContent = `
  /* Algolia Autocomplete Dropdown */
  .algolia-autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.2s, transform 0.2s;
  }
  
  .algolia-autocomplete-dropdown.active {
    opacity: 1;
    transform: translateY(0);
  }
  
  .algolia-autocomplete-dropdown.loading {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Items */
  .aa-item {
    display: block;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;
    text-decoration: none;
    color: inherit;
    border: none;
    width: 100%;
    text-align: left;
    background: transparent;
    font-size: 14px;
  }
  
  .aa-item:hover,
  .aa-item.active {
    background: #f5f5f5;
  }
  
  /* Ask AI Item (Kapa Integration) */
  .ask-ai-item {
    background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
    border-bottom: 1px solid #e0d6ff;
  }
  
  .ask-ai-item:hover {
    background: linear-gradient(135deg, #ebe8ff 0%, #f8f7ff 100%);
  }
  
  .ask-ai-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    color: #6933FF;
  }
  
  .ask-ai-content i {
    font-size: 18px;
  }
  
  /* Divider */
  .aa-divider {
    height: 1px;
    background: #e0e0e0;
    margin: 0;
  }
  
  /* Search Result Items */
  .search-result-item {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .search-result-item:last-child {
    border-bottom: none;
  }
  
  .result-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .result-title {
    font-weight: 500;
    color: #333;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .result-title mark {
    background: #ffeb3b;
    padding: 0 2px;
    border-radius: 2px;
  }
  
  .result-snippet {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
  
  .result-snippet mark {
    background: #ffeb3b;
    padding: 0 2px;
    border-radius: 2px;
  }
  
  .result-meta {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: #999;
    margin-top: 2px;
  }
  
  .doc-type {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
  }
  
  .version {
    background: #e8f4f8;
    padding: 2px 6px;
    border-radius: 3px;
    color: #0074a2;
  }
  
  /* View All Results */
  .view-all-item {
    text-align: center;
    color: #6933FF;
    font-weight: 500;
    border-top: 1px solid #f0f0f0;
  }
  
  .view-all-item:hover {
    background: #f5f3ff;
  }
  
  /* No Results */
  .no-results {
    text-align: center;
    color: #999;
    pointer-events: none;
  }
  
  /* Loading */
  .loading-item {
    text-align: center;
    color: #666;
  }
  
  .loading-item i {
    margin-right: 8px;
  }
`;
document.head.appendChild(style);