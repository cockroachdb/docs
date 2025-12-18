$(window).on('load', function(e) {
  var docsContext = location.href.split('/')[4];

  // Guard against undefined docsContext (e.g., on home page or short URLs)
  if (!docsContext) {
    return;
  }

  if (docsContext.indexOf('cockroachcloud') > -1) {
    return;
  }

  if (docsContext.indexOf('search') > -1) {
    return;
  }

  setSiteCookie('currentVersion', docsContext);

  return;
});
