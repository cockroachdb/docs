// Global toggleDropdown function for inline event handlers
window.toggleDropdown = function(element, isOpen) {
  const dropdownMenu = element.querySelector('.dropdown-menu');
  if (dropdownMenu) {
    if (isOpen) {
      element.classList.add('dropdown-open');
      dropdownMenu.classList.add('dropdown-open');
    } else {
      element.classList.remove('dropdown-open');
      dropdownMenu.classList.remove('dropdown-open');
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Navbar toggler functionality  
  function toggleDropdownLocal(element, isOpen) {
    const dropdownMenu = element.querySelector('.dropdown-menu');
    if (isOpen) {
      element.classList.add('dropdown-open');
      dropdownMenu.classList.add('dropdown-open');
    } else {
      element.classList.remove('dropdown-open');
      dropdownMenu.classList.remove('dropdown-open');
    }
  }

  // Desktop dropdown functionality
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    
    // Mouse enter event
    dropdown.addEventListener('mouseenter', function() {
      if (window.innerWidth >= 993) { // Only for desktop
        dropdownMenu.classList.add('dropdown-open');
      }
    });
    
    // Mouse leave event
    dropdown.addEventListener('mouseleave', function() {
      if (window.innerWidth >= 993) { // Only for desktop
        dropdownMenu.classList.remove('dropdown-open');
      }
    });
    
    // Click event for mobile
    const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
      dropdownToggle.addEventListener('click', function(e) {
        if (window.innerWidth < 993) { // Only for mobile
          e.preventDefault();
          dropdownMenu.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Mobile navbar toggle functionality - let Bootstrap handle it but add body class
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  if (navbarToggler && navbarCollapse) {
    // Listen for Bootstrap collapse events
    navbarCollapse.addEventListener('show.bs.collapse', function() {
      document.body.classList.add('mobile-menu-open');
      navbarToggler.setAttribute('aria-expanded', 'true');
    });
    
    navbarCollapse.addEventListener('hide.bs.collapse', function() {
      document.body.classList.remove('mobile-menu-open');
      navbarToggler.setAttribute('aria-expanded', 'false');
    });
    
    // Also handle direct clicks for backup (in case Bootstrap isn't handling it)
    navbarToggler.addEventListener('click', function() {
      setTimeout(() => {
        const isOpen = navbarCollapse.classList.contains('show');
        if (isOpen) {
          document.body.classList.add('mobile-menu-open');
          this.setAttribute('aria-expanded', 'true');
        } else {
          document.body.classList.remove('mobile-menu-open');
          this.setAttribute('aria-expanded', 'false');
        }
      }, 10);
    });
  }

  // Let Bootstrap handle the accordion functionality, but add some enhancements
  // Ensure mobile menu body scroll lock works properly
  document.querySelectorAll('[data-toggle="collapse"]').forEach(function(button) {
    button.addEventListener('click', function() {
      // This will let Bootstrap handle the collapse, we just manage any additional behavior
      setTimeout(() => {
        // Ensure aria-expanded is properly set after Bootstrap handles the click
        const targetSelector = this.getAttribute('data-target');
        const target = document.querySelector(targetSelector);
        if (target) {
          const isExpanded = target.classList.contains('show');
          this.setAttribute('aria-expanded', isExpanded);
        }
      }, 10);
    });
  });
});