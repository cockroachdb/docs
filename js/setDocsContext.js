$(window).on('load', function(e) {
  var docsContext = location.href.split('/')[4];

  if (docsContext.indexOf('cockroachcloud') > -1) {
    return;
  }

  if (docsContext.indexOf('search') > -1) {
    return;
  }

  setSiteCookie('currentVersion', docsContext);

  return;
});
