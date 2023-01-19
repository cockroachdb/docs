$(function() {
  var pageVersion = (function () {
    var pathComponents = location.pathname
      .replace(sidebar.baseUrl, '')
      .replace(/^\//, '')
      .split('/');
    // The version is the first directory component in the URL,
    // if it exists.
    if (pathComponents.length > 1 && sidebar.isVersionDirectory(pathComponents[0])) {
      return pathComponents[0];
    }
    // Non-versioned pages link to stable docs.
    return "stable";
  })();
  var sidebarData = window.sidebar;
  var mainTiers = $('.tier-1');
  function generateSideBar(sidebarItems, tierElements, tierId) {
    sidebarItems.forEach(function(mainItem, index) {
      if (!mainItem.items || mainItem.items.length === 0) {
        return;
      }
      $(tierElements[index]).find('a').on('click', function(currentElement) {
        if (mainItem.alreadyIterated) {
          return;
        }
        var nextTier = tierId + 1;
        var htmlToAppend = '<ul>';
        mainItem.items.forEach(function(childItem) {
          htmlToAppend += `<li class="tier-${nextTier}">`
          var currentAnchorUrl = '#';
          var subsectionArrow = '<div class="nav-expand"></div>';
          if (childItem.urls) {
            currentAnchorUrl = childItem.urls[0].replace('${VERSION}', pageVersion);
            subsectionArrow = '';
          }
          htmlToAppend += `
            <a href="${currentAnchorUrl}">${childItem.title} ${subsectionArrow}</a>
          `;
          htmlToAppend += `</li>`;
        });
        htmlToAppend += '</ul>';
        mainItem.alreadyIterated = true;
        $(currentElement.currentTarget).parent().append(htmlToAppend);
        var currentTiers = $(currentElement.currentTarget).parent().find('.tier-' + nextTier);
        generateSideBar(mainItem.items, currentTiers, nextTier);
      });
    });
  }
  generateSideBar(sidebarData.items, mainTiers, 1);
});
