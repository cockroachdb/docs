function setSiteCookie(key, value) {
  var expires = new Date();
  expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/docs/';
}

function setCookie(key, value) {
  var expires = new Date();
  expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}
