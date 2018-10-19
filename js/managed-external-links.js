// Call this function first
(function () {
  handleLinks()
})()

// If links on a managed cockroachdb docs page are
// to standard cockroachdb docs pags or external pages,
// add target='_blank' to open links in new tabs.
function handleLinks () {
  // Grab and loop over all <a> elements
  var allLinks = document.querySelectorAll('a')
  for (var i = 0; i < allLinks.length; ++i) {
    // If link is not to another managed doc page,
    // open in a new tab.
    if (allLinks[i].href.includes('/docs/managed/') == false) {
      allLinks[i].target = '_blank'
    }
  }
}
