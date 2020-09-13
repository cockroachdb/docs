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
});
