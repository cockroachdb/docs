// Render the table of contents (TOC) based on the currently-visible headers.
//
// This function is called automatically on DOM ready, but can be called later
// to regenerate the TOC when the visible headers change. Whether <h3>s are
// included in the TOC is determined by the `toc_not_nested` page variable,
// which is propagated to JavaScript in _includes/head.html.
function renderTOC() {
  $('#toc').toc({
    minimumHeaders: 0,
    listType: 'ul',
    showSpeed: 0,
    headers: pageConfig.tocNotNested ? 'h2:visible' : 'h2:visible,h3:visible'
  });
}

var $versionSwitcher, versionSwitcherBottom = Infinity;

$(function() {
  var _viewport_width = window.innerWidth,
      cachedWidth = window.innerWidth,
      $mobile_menu = $('nav.mobile_expanded'),
      $sidebar = $('#mysidebar'),
      $footer = $('section.footer'),
      footertotop, scrolltop, difference,
      sideNavHeight = ($('.nav--home').length > 0) ? '40px' : '60px';
      $versionSwitcher = $('#version-switcher');

  function collapseSideNav() {
    $('.collapsed-header').fadeIn(250);
    $sidebar.addClass('nav--collapsed');
    $sidebar.css({height: sideNavHeight});
    $('#mysidebar li').hide();
    $('#version-switcher .tier-1 ul').slideUp();
    $versionSwitcher.removeClass('open');
  }

  // Separate function to configure sidenav on window resize
  // We don't want to animate, so collapseSideNav() won't work
  function sidenavOnResize(winWidth) {
    $('body').removeClass('sidenav-open');

    if (winWidth > 992) {
      $('#mysidebar li').show();
      $('.collapsed-header').hide();
      $sidebar.removeClass('nav--collapsed');
      $sidebar.css('height', '');
    } else {
      $('.collapsed-header').show();
      $sidebar.addClass('nav--collapsed');
      $sidebar.css({height: sideNavHeight});
      $('#mysidebar li').hide();
    }
  }

  // Collapse side nav on load depending on window width
  if (_viewport_width <= 992) {
    collapseSideNav();
  }

  if (_viewport_width <= 768) {
    $mobile_menu.css('visibility', 'visible');
  }

  $('header nav.mobile').on('click', '.hamburger', function(e){
    e.preventDefault();
    $('body').toggleClass('menu_open');
  });

  $('.mobile_expanded .hamburger').on('click', function() {
    $('body').removeClass('menu_open');
  });

  $(window).resize(function(e) {
    _viewport_width = window.innerWidth;

    if(_viewport_width > 768) {
      $('body').removeClass('menu_open');
      // make sure all footer menu items are visible
      $('.footer-sub-nav').show();
    } else {
      $mobile_menu.css('visibility', 'visible');
      // collapse footer menu
      $('.footer-sub-nav').hide();
    }

    if (_viewport_width > 992) {
      $versionSwitcher.show();
    } else {
      $versionSwitcher.hide();
    }

    // chrome on android fires a resize event on scroll, this will make sure
    // these only fire on an actual resize event
    if (_viewport_width != cachedWidth) {
      sidenavOnResize(_viewport_width);
      $(window).scroll();
    }

    // cache width to perform check above
    cachedWidth = _viewport_width;
  });

  $(window).on('scroll', function(){
    _viewport_width = window.innerWidth;

    if (_viewport_width > 992) {
      if ($(window).scrollTop() + $(window).height() >= $('.footer').offset().top) {
        $versionSwitcher.css({'position': 'absolute', 'bottom': '70px'});
      } else {
        $versionSwitcher.css({'position': 'fixed', 'bottom': '0'});
      }
    } else { // mobile
      $sidebar.css('padding-top', 10);

      var scrolled = $('.col-sidebar').hasClass('col-sidebar--scrolled');
      if ($sidebar.hasClass('nav--collapsed') && $(window).scrollTop() > 0 && !scrolled) {
        $('.col-sidebar').addClass('col-sidebar--scrolled');
        $('.collapsed-header__pre').slideUp(250);
        sideNavHeight = '40px';
        $sidebar.animate({height: sideNavHeight}, {duration: 250});
      }
    }
  });
  // Fire scroll event on load
  $(window).scroll();

  // Section makes shell terminal prompt markers ($) totally unselectable in syntax-highlighted code samples
  terminalMarkers = document.getElementsByClassName("gp");  // Rogue syntax highlighter styles all terminal markers with class gp

  for(var i = 0; i < terminalMarkers.length; i++){
    terminalMarkers[i].innerText="";    // Remove the existing on-page terminal marker
    terminalMarkers[i].className += " noselect shellterminal"; // Add shellterminal class, which then displays the terminal marker as a ::before element
  }

  // Section makes SQL terminal prompt markers (>) totally unselectable in syntax-highlighted code samples
  sqlMarkers = document.getElementsByClassName("o");
  for(var i = 0; i < sqlMarkers.length; i++){
    if(sqlMarkers[i].innerText===">" && (!sqlMarkers[i].previousSibling || sqlMarkers[i].previousSibling.textContent==="\n"|| sqlMarkers[i].previousSibling.textContent==="\n\n")){
      sqlMarkers[i].innerText="";    // Remove the existing on-page SQL marker
      sqlMarkers[i].nextSibling.textContent="";
      sqlMarkers[i].className += " noselect sqlterminal"; // Add sqlterminal class, which then displays the terminal marker as a ::before element
    }
  }

  // Render the TOC on DOM ready by default.
  renderTOC();

  // Activate a new filter scope by setting the `current` class on only
  // elements with the desired scope and re-rendering the TOC to reflect any
  // changes in visibility.
  function setFilterScope(scope) {
    $('[data-scope].current').removeClass('current');
    $('[data-scope="' + scope + '"]').addClass('current');
    renderTOC();
  }

  // Handle clicks on filter buttons by activating the scope named by that
  // button and updating the URL hash.
  $('.filter-button').on('click', function() {
    var scope = $(this).data('scope');
    var url = window.location.pathname + window.location.search +
        ($(this).is(':first-child') ? '' : '#' + scope);
    setFilterScope(scope);
    history && history.replaceState(null, null, url);
  });

  // On page load, activate the scope named in the URL hash, if any. If the
  // URL doesn't name a scope, activate the first scope discovered on the
  // page.
  setFilterScope(window.location.hash.substring(1));
  if ($('[data-scope].current').length == 0) {
    setFilterScope($('[data-scope]').first().data('scope'));
  }

  // On page load, update last list item style to match siblings
  if (_viewport_width <= 992) {
    $('li.active:last a').css({
      'border-bottom': 'none',
      'margin-bottom': '0',
      'padding-bottom': '0'
    });
  }

  function toggleSideNav() {
    _viewport_width = window.innerWidth;
    // mobile only
    if (_viewport_width <= 992) {
      if ($sidebar.hasClass('nav--collapsed')) {
        $('.collapsed-header').hide();
        $('body').addClass('sidenav-open');
        $sidebar.removeClass('nav--collapsed');
        $sidebar.css('height', '');

        var $active = $('#mysidebar .active');
        if ($active.length > 0) {
          // if active drawer, we want to preserve that on expand
          $('#mysidebar li.search-wrap').slideDown(250);
          $active.slideDown(250);

          $lastActive = $('#mysidebar li.active:last');
          if ($lastActive.hasClass('tier-3')) {
            $lastActive.siblings('li').slideDown(250);
          } else if ($lastActive.hasClass('tier-2')) {
            if ($lastActive.children('ul').length > 0) {
              $lastActive.find('li').slideDown(250);
            } else {
              $lastActive.siblings('li').slideDown(250);
            }
          } else { // tier-1
            $lastActive.find('li').slideDown(250);
          }
        } else {
          // otherwise, this should show top level
          $('#mysidebar li').slideDown(250);
        }
        $versionSwitcher.slideDown();
      } else {
        $('body').removeClass('sidenav-open')
        collapseSideNav();
        $versionSwitcher.slideUp();
      }
    }
  };

  $('.sidenav-arrow').on('click', function(e) {
    e.stopPropagation();
    toggleSideNav();
  });

  $sidebar.on('click', function(e) {
    // we only want this firing when collapsed, otherwise search won't work
    if ($sidebar.hasClass('nav--collapsed')) toggleSideNav();
  });

  $('#mysidebar a').on('click', function() {
    _viewport_width = window.innerWidth;
    // mobile only
    if (_viewport_width <= 992) {
      // hide sibling links
      $(this).closest('li').siblings('li:not(.search-wrap)').slideToggle();
      // ensure child links are open
      $(this).siblings('ul').children().slideDown();
      // remove any children and siblings with active class
      $(this).parent('li').find('li.active').removeClass('active');
      $(this).parent('li').siblings('li.active').removeClass('active');
    }

    // if a top level menu item is clicked, this ensures no active list items
    // avoids third level item staying active, causing no items to appear on collapse/expand
    // this fires on desktop as well, to prevent an empty menu after resize
    if ($(this).parent('li').parent('#mysidebar').length > 0) {
      $('li.active').removeClass('active');
    }
  });

  // copy to clipboard
  var clipboard = new Clipboard('.copy-clipboard', {
    target: function(trigger) {
      // revert any previously copied snippets
      $('.copy-clipboard--copied').removeClass('copy-clipboard--copied')
        .find('.copy-clipboard__text').text('copy');
      return $(trigger).next().find('code')[0];
    },
    text: function(trigger) {
      var text = $(trigger).next().find('code').text();
      text = text.replace(/\\\n(?=.)|(^[\r\n]+|[\r\n]+$)/g, '');
      return text;
    }
  });

  clipboard.on('success', function(e) {
    $(e.trigger).addClass('copy-clipboard--copied');
    $(e.trigger).find('.copy-clipboard__text').text('copied');
  });

  $('[data-tooltip]').tooltip();

  // used in both footer and main menus on mobile
  function flipArrow(parent) {
    var $arrow = $(parent).children('.blue-arrow');

    if ($arrow.hasClass('blue-arrow--up')) {
      $arrow.removeClass('blue-arrow--up').addClass('blue-arrow--down');
    } else {
      $arrow.removeClass('blue-arrow--down').addClass('blue-arrow--up');
    }
  }

  // footer
  $('.footer-nav .header').on('click', function() {
    if (window.innerWidth < 768) {
      $(this).siblings('.footer-sub-nav').slideToggle(200);
      flipArrow($(this));
    }
  });

  // mobile menu
  $('.mobile-menu-dropdown').on('click', function() {
    $(this).find('.mobile-sub-nav').slideToggle(200);
    flipArrow($(this));
  });
});
