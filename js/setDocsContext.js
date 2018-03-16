$(window).load(function(e) {
  var docsContext = location.href.split('/')[4];

  if (docsContext.indexOf("search") > -1) return;

  setSiteCookie('currentVersion', docsContext);

  return;

  function setSiteCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/docs/';
  }
});
