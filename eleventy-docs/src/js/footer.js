/**
 * Footer functionality for Eleventy site
 * Includes whenAvailable utility and Marketo form integration
 */

// whenAvailable utility function - waits for external libraries to load
function whenAvailable(name, callback, isJqueryFn = false) {
  console.log('whenAvailable called for:', name);
  var interval = 500; // ms
  var evaluation = isJqueryFn ? $()[name] : window[name];
  
  if (evaluation) {
    console.log(name + ' is available, executing callback');
    callback();
  } else {
    console.log(name + ' not available yet, retrying...');
    window.setTimeout(function() {
        whenAvailable(name, callback, isJqueryFn);
    }, interval);
  }
}

// Initialize Marketo footer form
function initializeFooterForm() {
  console.log('Initializing footer form...');
  
  whenAvailable("MktoForms2", function() {
    console.log('MktoForms2 available, loading form 1083...');
    const MktoForms21083 = MktoForms2;
    
    MktoForms21083.loadForm('//go.cockroachlabs.com', '350-QIN-827', 1083, function (form) {
      console.log('Form 1083 loaded successfully');
      const form_mktoForm_1083 = $('#footer-mktoForm_1083');
      form.render(form_mktoForm_1083);
      
      form.onSuccess(function (values, followUpUrl) {
        console.log('Form submitted successfully');
        form.getFormElem().hide();
        document.querySelector('.js-ty-mktoForm_1083').style.display = 'block';
        return false;
      });
      
      // Move button next to input
      MktoForms21083.whenReady(function (form) {
        console.log('Form ready, adjusting layout...');
        $('#footer-mktoForm_1083 input').css('width', '');
        $('#footer-mktoForm_1083 .mktoButtonWrap').css('margin-left', '');
        $('#footer-mktoForm_1083 .mktoButtonRow').css('display', 'flex');
        $('#footer-mktoForm_1083 .mktoButtonRow').insertAfter('#footer-mktoForm_1083 #Email');
      });
    });
  });
}

// Initialize footer functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Footer JavaScript loaded and DOM ready');
  
  // Check if jQuery is loaded
  if (typeof $ !== 'undefined') {
    console.log('jQuery is available');
  } else {
    console.log('jQuery is NOT available');
  }
  
  // Check if MktoForms2 is available
  if (typeof MktoForms2 !== 'undefined') {
    console.log('MktoForms2 is available immediately');
  } else {
    console.log('MktoForms2 is NOT available yet');
  }
  
  // Initialize the form
  initializeFooterForm();
});