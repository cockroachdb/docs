/* Exact JavaScript copied from Jekyll's main-menu-serverless.html */

document.addEventListener('DOMContentLoaded', function() {
  // Navbar toggler functionality
  function toggleDropdown(element, isOpen) {
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
});