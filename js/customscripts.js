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

$(function() {

    var _viewport_width = $(window).width(),
        $mobile_menu = $('nav.mobile_expanded'),
        $sidebar = $('#mysidebar'),
        $footer = $('section.footer'),
        footertotop, scrolltop, difference;

    if(_viewport_width <= 768) {
        $mobile_menu.css('visibility', 'visible');
    }

    $('header nav.mobile').on('click', '.hamburger', function(e){
        e.preventDefault();
        if($('body').hasClass('menu_open')){
            $('body').removeClass('menu_open');
        }
        else {
            $('body').addClass('menu_open');
        }
    });

    $(window).resize(function(e){
        _viewport_width = $(window).width();

        if(_viewport_width > 768) {
            $('body').removeClass('menu_open');
        }
        else {
            $mobile_menu.css('visibility', 'visible');
        }

        $(window).scroll();
    });

    $(window).on('scroll', function(){
        _viewport_width = $(window).width();

        if(_viewport_width >= 992) {
            //prevent sidebar from overlapping footer
            footertotop = $footer.position().top;
            scrolltop = $(document).scrollTop() + $sidebar.outerHeight() + 170;
            difference = scrolltop-footertotop;

            if (scrolltop > footertotop) {
                $sidebar.css('padding-top',  65-difference);
            }
            else  {
                $sidebar.css('padding-top', 65);
            }
        }else{
            // $sidebar.css('padding-top', 10);
        }
    });

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

  // collapse sidebar navigation
  $('.sidenav-arrow').on('click', function() {
    $('#mysidebar li').slideToggle(400);
    $('.collapsed-header').slideToggle(400);

    if ($sidebar.hasClass('nav--collapsed')) {
      $sidebar.removeClass('nav--collapsed');
      $sidebar.removeAttr('style');
    } else {
      $sidebar.addClass('nav--collapsed');
      $sidebar.animate({height: '40px'}, {duration: 400});
    }
  });

  $('#mysidebar a').on('click', function() {
    $(this).closest('li').siblings('li:not(.search-wrap)').slideToggle();
  });
});
