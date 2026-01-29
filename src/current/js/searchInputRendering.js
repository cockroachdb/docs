$(document).ready(function() {
  if (window.innerWidth >= 992) {
    // this will make search appear instead of header in collapsed docs menu
    $('.collapsed-header').hide();
    $('.search-wrap').show();
  }

  // this will remove the class with custom styling for search page,
  // so when we close the menu it reverts to normal styling
  // needs to happen if any of these elements are clicked
  $('.sidenav-arrow, #search-input, .clear-search').on('click', function() {
    if ($('#sidebar').hasClass('nav--search')) {
      $('#sidebar').removeClass('nav--search').addClass('nav--home');
    }
  });

  // on load, show close button if search input
	if ($('#search-input').val() != '') $('.clear-search').show();

  $('.clear-search').on('click', function() {
    $('#search-input').val('');
    $(this).hide();
  });

  $('#search-input').on('input', function() {
    if ($(this).val() != '') {
      $('.clear-search').show();
    } else {
      $('.clear-search').hide();
    }
  });

  // Handle search inputs (topnav and sidebar)
  // Check if Kapa search mode is handling the input
  const kapaScript = document.querySelector('script[data-modal-override-open-selector-search]');
  if (kapaScript) {
    // Kapa is configured - intercept clicks to open Kapa modal
    $('#search-input, #sidebar-search-input').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).blur();
      if (window.Kapa && window.Kapa.open) {
        window.Kapa.open({ mode: 'search' });
      }
    });
    // Prevent sidebar search form submission
    $('#sidebar-search-form').on('submit', function(e) {
      e.preventDefault();
      if (window.Kapa && window.Kapa.open) {
        window.Kapa.open({ mode: 'search' });
      }
    });
  } else {
    // No Kapa - use Algolia search page redirect on Enter
    $('#search-input').on('keypress', function(e) {
      if (e.which === 13) { // Enter key
        e.preventDefault();
        const query = $(this).val().trim();
        if (query) {
          const searchPath = getSearchPath();
          window.location.href = searchPath + '?query=' + encodeURIComponent(query);
        }
      }
    });
  }

  // Disable old suggestions - now handled by kapaLiveSuggestions.js
  // which provides real-time search results from Kapa API

  // Old suggestions removed - now handled by kapaLiveSuggestions.js

  function getSearchPath() {
    // Based on your error URL pattern: http://127.0.0.1:3000/docs/search?query=db
    // We need to return '/docs/search' for docs-based URLs
    
    const currentPath = window.location.pathname;
    const currentOrigin = window.location.origin;
    
    // Check if we're in the docs section
    if (currentPath.includes('/docs/') || currentPath === '/docs' || currentPath.startsWith('/docs/')) {
      return '/docs/search';
    }
    // For non-docs URLs (like development/testing), default to /search
    else {
      return '/search';
    }
  }
});
