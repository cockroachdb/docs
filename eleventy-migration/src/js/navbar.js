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
  // Desktop dropdown functionality with improved hover handling
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    if (!dropdownMenu) return;
    
    let hoverTimeout;
    
    // Mouse enter event - show dropdown with slight delay for desktop
    dropdown.addEventListener('mouseenter', function() {
      if (window.innerWidth >= 992) { // Bootstrap lg breakpoint
        clearTimeout(hoverTimeout);
        dropdownMenu.classList.add('dropdown-open');
        dropdownMenu.style.display = 'block';
      }
    });
    
    // Mouse leave event - hide dropdown with delay to prevent flickering
    dropdown.addEventListener('mouseleave', function() {
      if (window.innerWidth >= 992) {
        hoverTimeout = setTimeout(() => {
          dropdownMenu.classList.remove('dropdown-open');
          dropdownMenu.style.display = 'none';
        }, 150);
      }
    });
    
    // Click event for mobile dropdown toggles
    const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
      dropdownToggle.addEventListener('click', function(e) {
        if (window.innerWidth < 992) {
          e.preventDefault();
          const isOpen = dropdownMenu.classList.contains('dropdown-open');
          
          // Close all other dropdowns first
          document.querySelectorAll('.dropdown-menu.dropdown-open').forEach(menu => {
            if (menu !== dropdownMenu) {
              menu.classList.remove('dropdown-open');
              menu.style.display = 'none';
            }
          });
          
          // Toggle current dropdown
          if (isOpen) {
            dropdownMenu.classList.remove('dropdown-open');
            dropdownMenu.style.display = 'none';
          } else {
            dropdownMenu.classList.add('dropdown-open');
            dropdownMenu.style.display = 'block';
          }
        }
      });
    }
  });

  // Mobile navbar toggle functionality - pure JavaScript implementation
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Close menu
        navbarCollapse.classList.remove('show');
        navbarCollapse.classList.add('collapse');
        document.body.classList.remove('mobile-menu-open');
        this.setAttribute('aria-expanded', 'false');
        
        // Close all mobile dropdowns
        document.querySelectorAll('.dropdown-menu.dropdown-open').forEach(menu => {
          menu.classList.remove('dropdown-open');
          menu.style.display = 'none';
        });
      } else {
        // Open menu
        navbarCollapse.classList.add('show');
        navbarCollapse.classList.remove('collapse');
        document.body.classList.add('mobile-menu-open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Mobile accordion functionality for navigation sections
  document.querySelectorAll('[data-toggle="collapse"]').forEach(function(button) {
    const targetSelector = button.getAttribute('data-target');
    const targetElement = document.querySelector(targetSelector);
    
    if (targetElement && button !== navbarToggler) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const parentAccordion = this.closest('#accordionExample');
        
        if (parentAccordion) {
          // Close all other accordion items in the same accordion
          const otherCollapses = parentAccordion.querySelectorAll('.collapse.show');
          otherCollapses.forEach(collapse => {
            if (collapse !== targetElement) {
              collapse.classList.remove('show');
              const otherButton = parentAccordion.querySelector(`[data-target="#${collapse.id}"]`);
              if (otherButton) {
                otherButton.setAttribute('aria-expanded', 'false');
              }
            }
          });
        }
        
        // Toggle current accordion item
        if (isExpanded) {
          targetElement.classList.remove('show');
          this.setAttribute('aria-expanded', 'false');
        } else {
          targetElement.classList.add('show');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (window.innerWidth < 992) {
      const isClickInsideNav = e.target.closest('.navbar');
      if (!isClickInsideNav && navbarCollapse && navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
        navbarCollapse.classList.add('collapse');
        document.body.classList.remove('mobile-menu-open');
        if (navbarToggler) {
          navbarToggler.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });

  // Handle window resize to ensure proper state
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
      // Desktop mode - ensure mobile menu is closed
      if (navbarCollapse) {
        navbarCollapse.classList.remove('show');
        navbarCollapse.classList.add('collapse');
      }
      document.body.classList.remove('mobile-menu-open');
      if (navbarToggler) {
        navbarToggler.setAttribute('aria-expanded', 'false');
      }
      
      // Hide all dropdown menus
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('dropdown-open');
        menu.style.display = '';
      });
    } else {
      // Mobile mode - ensure all desktop dropdowns are closed
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('dropdown-open');
        menu.style.display = 'none';
      });
    }
  });
});