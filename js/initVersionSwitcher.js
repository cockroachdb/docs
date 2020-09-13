$(document).ready(function() {
  var $versionSwitcher = $('#version-switcher').find('ul.nav');

  var navgocoOptions = {
    caretHtml: '',
    accordion: true,
    openClass: 'active',
    save: false,
    cookie: {
      name: 'navgoco',
      expires: false,
      path: '/'
    },
    slide: {
      duration: 150,
      easing: 'swing'
    }
  };

  // Initialize navgoco with config options
  $versionSwitcher.navgoco($.extend(navgocoOptions, {
    onToggleBefore: function() {
      $('#version-switcher').toggleClass('open');
    }
  }));

  $versionSwitcher.change(function () {
    location.href = $(this).val();
  });

  $versionSwitcher.show();
});
