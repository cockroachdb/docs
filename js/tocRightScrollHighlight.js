/* setup highlight-on-scroll behavior for right-hand TOC */
$(document).ready(function() {
  var $navigationLinks = $('#toc-right ul > li > a:not(.anchorjs-link)');
  var $sections = $(".clickable-header");
  var sectionIdTonavigationLink = {};

  $sections.each(function() {
      var id = $(this).attr('id');
      sectionIdTonavigationLink[id] = $(`#toc-right ul > li > a:not(.anchorjs-link)[href="#${id}]"`);
  });

  function highlightNavigation() {
    var scrollPosition = $(window).scrollTop();

    $sections.each(function() {
      var currentSection = $(this);
      var sectionTop = currentSection.offset().top - 70;

      if (scrollPosition >= sectionTop) {
        var id = currentSection.attr('id');
        var $currentLink = sectionIdTonavigationLink[id];

        if (!$currentLink.hasClass('active--scroll')) {
          $navigationLinks.removeClass('active--scroll');
          $currentLink.addClass('active--scroll');
        }

        return;
      }
    });
  }

  $(window).scroll(highlightNavigation);
});