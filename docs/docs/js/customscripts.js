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

  $('#toc-right').toc({
    minimumHeaders: 0,
    listType: 'ul',
    showSpeed: 0,
    headers: pageConfig.tocNotNested ? 'h2:visible' : 'h2:visible,h3:visible'
  });

  // Set class on top level elements
  if(document.getElementById('toc-right') && (document.getElementById('toc-right').children.length > 0)){
    var list = document.getElementById('toc-right').children[0].childNodes;
    for (let li of list) {
      li.classList.add('toc-li-top');
    }
  }
}

var $versionSwitcher, versionSwitcherBottom = Infinity;

$(function() {
  var _viewport_width = window.innerWidth,
      cachedWidth = window.innerWidth,
      $mobile_menu = $('nav.mobile_expanded'),
      $colSidebar = $('.col-sidebar'),
      $sidebar = $('#sidebar'),
      $footer = $('.footer'),
      $versionSwitcher = $('#version-switcher'),
      $tocColContents = $('.toc-col-contents');

  function collapseSideNav() {
    $('.collapsed-header').fadeIn(250);
    $sidebar.addClass('nav--collapsed');
    $('#sidebar li').hide();
    $('#version-switcher .tier-1 ul').slideUp();
    $versionSwitcher.removeClass('open');
  }

  // Separate function to configure sidenav on window resize
  // We do not want to animate, so collapseSideNav() will not work
  function sidenavOnResize(winWidth) {
    $('body').removeClass('sidenav-open');

    if (winWidth >= 768) {
      $('#sidebar li').show();
      $('.collapsed-header').hide();
      $sidebar.removeClass('nav--collapsed');
    } else {
      $('.collapsed-header').show();
      $sidebar.addClass('nav--collapsed');
      $('#sidebar li').hide();
    }
  }

  if (_viewport_width <= 768) {
    $mobile_menu.css('visibility', 'visible');
    // collapseSideNav();
  }

  $('header nav.mobile').on('click', '.hamburger', function(e){
    e.preventDefault();
    $('body').toggleClass('menu_open');
  });

  $('.mobile_expanded .hamburger').on('click', function() {
    $('body').removeClass('menu_open');
  });

  $('#mobile-toc-toggler').on('click', function() {
    $('#toc').toggleClass('d-none');
  });

  $(window).resize(function(e) {
    _viewport_width = window.innerWidth;

    if(_viewport_width > 992) {
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

      // sidenavOnResize(_viewport_width);
      $(window).scroll();
    }

    // cache width to perform check above
    cachedWidth = _viewport_width;
  });

  var tocHeight = 0; // outer var for TOC height reference maintained outside scroll handler

  $(window).on('scroll', function(e) {
    // If we calculate tocHeight inside of scroll handler, the true TOC height will be
    // miscalculated as too small when a long TOC exceeds the top border of the footer.
    // This will cause a long TOC to flicker when the user scrolls up.
    //
    // To solve this, we need to calculate the TOC height outside the event handler--
    // however, the TOC is rendered *after* the 'ready' event on $(document) is fired, thus we cannot
    // simply calculate the TOC height at the top of the 'ready' handler.  The `if` block below this is a hack
    // to get the 'true' height of the TOC once it has been rendered on the page.
    var tempTocHeight = $tocColContents.height()
    if (tempTocHeight > tocHeight) {
      tocHeight = tempTocHeight;
    }

    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var footerOffset = $footer.offset().top;
    var viewportFooterDiff = (scrollTop + windowHeight) - footerOffset - 1;
    var tocHeightInColumn = tocHeight + parseInt($tocColContents.css('top')),
    _viewport_width = window.innerWidth;

    // handle show/hide behavior & positoning of sidebar and version switcher when scrolling window
    if (_viewport_width > 992) {
      if (scrollTop + windowHeight >= footerOffset) {
        // $versionSwitcher.css({'bottom': viewportFooterDiff + 'px'});
        $colSidebar.css('bottom', viewportFooterDiff + 'px');
      } else {
        // $versionSwitcher.css({'bottom': '-1px'});
        $colSidebar.css('bottom', '0');
      }
    } else { // mobile

      $versionSwitcher.css({'bottom': '0'});
      if ($sidebar.hasClass('nav--collapsed') && scrollTop > 0 && !scrolled) {
        //$sidebar.animate({height: 0}, {duration: 250});
      }
    }

    // handle positoning of right-hand TOC when scrolling window
    if (_viewport_width >= 1072 && scrollTop >= 31) {
      $tocColContents.css({
        position: 'fixed',
        top: 100,
        // width: '260px'
      });

      // if footer in view and TOC overruns top of footer, set bottom property to top of footer
      // otherwise, unset bottom property
      if (scrollTop + tocHeightInColumn >= footerOffset) {
        $tocColContents.css('bottom', viewportFooterDiff + 1 + 'px');
      } else {
        $tocColContents.css('bottom', '');
      }
    } else {
      $tocColContents.css({
        position: 'relative',
        top: '',
        width: ''
      });
    }
  });

  // Fire scroll event on load
  $(window).scroll();


  function isPromptMarker(el, ch) {
    return el.innerText.trim() === ch && (!el.previousSibling || el.previousSibling.textContent.endsWith('\n'));
  }

  // This section makes shell terminal prompt markers ($) totally unselectable
  // in syntax-highlighted code samples. The syntax highlighter styles all
  // terminal markers with this class.
  var terminalMarkers = document.getElementsByClassName("nv");
  for (var i = 0; i < terminalMarkers.length; i++) {
    if (isPromptMarker(terminalMarkers[i], "$")) {
      // Remove the existing on-page terminal marker.
      terminalMarkers[i].innerText = "";
    }
  }

  // This section does the same for SQL terminal prompt markers (>).
  var sqlMarkers = document.getElementsByClassName("o");
  for (var i = 0; i < sqlMarkers.length; i++) {
    if (isPromptMarker(sqlMarkers[i], ">")) {
      // Remove the existing on-page SQL marker.
      sqlMarkers[i].innerText = "";
      sqlMarkers[i].nextSibling.textContent = "";
    }
  }

  // Render the TOC on DOM ready by default.
  renderTOC();

  // Map to store the scopes of the page filters
  let scopes = new Map();
  // Scopes can have child scopes that should be hidden if the parent is hidden.
  // Store the child scopes for each parent scope.
  let childScopes = new Map();

  // Activate a new filter scope by setting the `current` class on only
  // elements with the desired scope and re-rendering the TOC to reflect any
  // changes in visibility.
  function setFilterScope(scope) {
    // check if target scope has a parent scope
    // if (typeof(childScopes.get(scope)) !== 'undefined') {
    //   console.log("target scope has parent scope: " + childScopes.get(scope));
    // }
    // find the filter set with this scope
    $('[data-scope].current').each(function(index) {
      // console.log("data-scope is: " + $(this).attr('data-scope'));
      // if the target scope is in the same group as the current scope for that 
      // group, remove the current class
      
      const sectionScopes = $(this).attr('data-scope').split(" ");
      // multiple scopes can be set, so try each scope, but stop after removing current
      sectionScopes.every(v => {
        if (scopes.get(v) === scopes.get(scope)) {
          console.log("current scope " + v + " is in target scope " + scope + "'s group.");
          $(this).removeClass('current');
          return false;
        } else {
          // console.log("current scope " + scope + " in different group.");
          return true;
        }
      });
    });
    // add current class to any section containing the scope
    $('[data-scope~="' + scope + '"]').addClass('current');
    renderTOC();
  }

  // convenience function to get filter query parameters
  function getFilterParams() {
    var qd = {};
    if (location.search) location.search.substr(1).split("&").forEach(function(item) {
      var s = item.split("="),
          k = s[0],
          v = s[1] && decodeURIComponent(s[1]); //  null-coalescing / short-circuit
      (qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
    })
    return qd["filters"];
  }

  // Handle clicks on filter buttons by activating the scope named by that
  // button and updating the URL hash.
  $('.filters').each(function(index) {
    let parentScope;
    if ($(this).parents('.filter-content').length) {
      $(this).parents('.filter-content').each(function(i){
        parentScope = $(this).data('scope');
        console.log("found parent scope for filters: " + parentScope);
      });
    }
    $(this).find('.filter-button').each(function(i){
      // add the scope and group to the Map if it isn't already there
      var scope = $(this).data('scope');
      console.log("adding scope: " + scope);
      scopes.set(scope, index);
      // if these filters are within a parent scope, set the parent scope
      if (typeof(parentScope) !== 'undefined') {
        console.log("adding " + scope + " to parent " + parentScope + " map.");
        childScopes.set(scope, parentScope);
      }
    });
    // when the user clicks the filter button, add it to the query params and set the scope
    $(this).find('.filter-button').on('click', function() {
      let scope = $(this).data('scope');
      console.log("target is: " + scope);
      let parentScope = childScopes.get(scope);
      let queryParams = "?";
      let filterParams = getFilterParams();
      // if there are current query params, construct the new filters query params
      if (typeof(filterParams) !== 'undefined') {
        getFilterParams().forEach((item, i) => {
          currentScopeParent = childScopes.get(item);
          console.log("filter is: " + item);
          if (typeof(parentScope) !== 'undefined') {
            console.log("target scope's parent: " + parentScope);
          }
          if (typeof(currentScopeParent) !== 'undefined') {
            console.log("current scope's parent: " + currentScopeParent);
          }
          // only keep filter params if they're not in the same group or parent filter
          if (scopes.get(scope) !== scopes.get(item)) {
            if (scopes.get(currentScopeParent) !== scopes.get(scope)) {
              queryParams = queryParams + "filters=" + item + "&";
            }
          }
        });
      }
      var url = window.location.pathname + queryParams +
          ($(this).is(':first-child') ? '' : 'filters=' + scope );
      setFilterScope(scope);
      history && history.replaceState(null, null, url);
    });
  });

  // On page load, activate the scope named in the query params, if any. If the
  // URL doesn't name a scope, activate the first scope discovered in the
  // filter group.
  var filterParams = getFilterParams();
  // set the default filter scopes
  $('.filters').each(function(index) {
    var s = $(this).children().first().data('scope');
    // console.log("setting scope to: " + s);
    setFilterScope(s);
  });
  if (typeof(filterParams) !== 'undefined') {
    // filter query params, override the defaults
    filterParams.forEach((item, i) => {
      console.log("setting the scope to: " + item + " from existing filter query param.");
      setFilterScope(item);
    });
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

        var $active = $('#sidebar .active');
        if ($active.length > 0) {
          // if active drawer, we want to preserve that on expand
          $('#sidebar li.search-wrap').slideDown(250);
          $active.slideDown(250);

          $lastActive = $('#sidebar li.active:last');
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
          $('#sidebar li').slideDown(250);
        }
        $versionSwitcher.slideDown();
      } else {
        $('body').removeClass('sidenav-open')
        collapseSideNav();
        $versionSwitcher.slideUp();
      }
    }
  };

  // $('.sidenav-arrow').on('click', function(e) {
  //   e.stopPropagation();
  //   toggleSideNav();
  // });

  $sidebar.on('click', function(e) {
    // we only want this firing when collapsed, otherwise search will not work
    if ($sidebar.hasClass('nav--collapsed')) toggleSideNav();
  });

  $('#sidebar a').on('click', function() {
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
    if ($(this).parent('li').parent('#sidebar').length > 0) {
      $('li.active').removeClass('active');
    }
  });

  // copy to clipboard
  var clipboard = new Clipboard('.copy-clipboard', {
    target: function(trigger) {
      // revert any previously copied snippets
      $('.copy-clipboard--copied').removeClass('copy-clipboard--copied');
        // .find('.copy-clipboard__text').text('copy');
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
    // $(e.trigger).find('.copy-clipboard__text').text('copied');
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
    $(this).find('.mobile-subnav').slideToggle(200);
    flipArrow($(this));
  });

  //external links
  $("main a, #sidebar a").filter(function() {

    if ( $(this).children().length > 0 ) {
      return
    }

    return this.hostname && this.hostname !== location.hostname;
  }).addClass('external').attr("target","_blank").attr("rel","noopener");
});


// $('.nav-docs-mobile').on('click', function(){
//   $('#sidebarMenu').collapse();
// });
