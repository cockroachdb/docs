document.addEventListener('DOMContentLoaded', function() {
  // Fallback: ensure mobile navbar collapse toggles even if Bootstrap JS isn't initialized
  (function(){
    const toggler = document.querySelector('.navbar-toggler');
    const target = document.getElementById('navbarSupportedContent');
    if(toggler && target){
      toggler.addEventListener('click', function(e){
        // Avoid interference with our generic collapse handler
        e.preventDefault();
        e.stopPropagation();
        // If Bootstrap didn't handle it, manually toggle
        const isShown = target.classList.contains('show');
        target.classList.toggle('show', !isShown);
        // Clear any Bootstrap inline height/collapsing classes
        target.classList.remove('collapsing');
        target.style.height='';
        toggler.setAttribute('aria-expanded', String(!isShown));
        // Mirror body lock/unlock like BS events would
        if(!isShown){
          document.body.classList.add('mobile-menu-open');
        } else {
          document.body.classList.remove('mobile-menu-open');
          // Close any open dropdowns when the mobile menu is closed
          document.querySelectorAll('.dropdown.show, .dropdown-menu.dropdown-open').forEach(el=>{
            el.classList.remove('show','dropdown-open');
          });
        }
      });
    }
    // Fallback for inner mobile accordion sections (Product, Solutions, etc.)
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const selector = btn.getAttribute('data-bs-target');
        if(!selector) return;
        const panel = document.querySelector(selector);
        if(!panel) return;
        // Let the dedicated navbar toggler handler deal with the main menu collapse
        if (selector === '#navbarSupportedContent') return;
        // On mobile, manually control accordion to guarantee behavior and keep only one open
        if (window.innerWidth < 993) {
          e.preventDefault();
          e.stopPropagation();
          const accordion = btn.closest('#accordionExample') || document.querySelector('#accordionExample');
          if(accordion){
            accordion.querySelectorAll('.collapse.show').forEach(openPanel=>{
              if(openPanel !== panel){
                openPanel.classList.remove('show');
                openPanel.classList.remove('collapsing');
                openPanel.style.height='';
              }
            });
          }
          const isShown = panel.classList.contains('show');
          panel.classList.toggle('show', !isShown);
          // Clear any Bootstrap inline height/collapsing classes that might block visibility
          panel.classList.remove('collapsing');
          panel.style.height='';
          btn.setAttribute('aria-expanded', String(!isShown));
          return;
        }
        // Desktop: if Bootstrap 5's Collapse is present, let it handle behavior
        if (window.bootstrap && window.bootstrap.Collapse) return;
        // Avoid any default navigation or interference only for our manual fallback path
        e.preventDefault();
        e.stopPropagation();
        // Manual accordion behavior: close siblings within the same accordion
        const accordion = btn.closest('#accordionExample') || document.querySelector('#accordionExample');
        if(accordion){
          accordion.querySelectorAll('.collapse.show').forEach(openPanel=>{
            if(openPanel !== panel){ openPanel.classList.remove('show'); }
          });
        }
        const isShown = panel.classList.contains('show');
        panel.classList.toggle('show', !isShown);
        btn.setAttribute('aria-expanded', String(!isShown));
      });
    });
  })();

  function adjustBodyPadding(){
    const nav=document.querySelector('.navbar.fixed-top, .main-nav .navbar');
    if(nav){ document.body.style.paddingTop=(nav.offsetHeight||0)+'px'; }
  }
  adjustBodyPadding();
  window.addEventListener('resize', adjustBodyPadding);

  // Position fixed mega menus directly under the navbar
  function positionDropdowns(){
    const nav=document.querySelector('.navbar.fixed-top, .main-nav .navbar');
    const top = nav ? (nav.offsetHeight||0) : 84;
    if(window.innerWidth>=993){
      document.querySelectorAll('.main-nav .navbar .dropdown-menu').forEach(menu=>{
        menu.style.top = top + 'px';
        menu.style.left = '0px';
        menu.style.right = '0px';
      });
    } else {
      document.querySelectorAll('.main-nav .navbar .dropdown-menu').forEach(menu=>{
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
      });
    }
  }
  positionDropdowns();
  window.addEventListener('resize', positionDropdowns);

  function setDropdownShown(dropdownEl, shown){
    const menu=dropdownEl.querySelector('.dropdown-menu');
    if(!menu) return;
    dropdownEl.classList.toggle('show', shown);
    menu.classList.toggle('show', shown);
    positionDropdowns();
  }

  const dropdowns=document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown=>{
    const menu=dropdown.querySelector('.dropdown-menu');
    // Desktop behavior: open on hover; ensure only one open at a time
    dropdown.addEventListener('mouseenter', ()=>{
      if(window.innerWidth>=993){
        // close all others first
        document.querySelectorAll('.dropdown.show').forEach(d=>{ if(d!==dropdown) setDropdownShown(d,false); });
        setDropdownShown(dropdown,true);
      }
    });
    // Close when leaving both the toggle area and the fixed menu
    dropdown.addEventListener('mouseleave', ()=>{
      if(window.innerWidth>=993){
        // delay to allow pointer to enter the fixed menu
        setTimeout(()=>{
          const overMenu = menu && menu.matches(':hover');
          const overAnyDropdown = dropdown.matches(':hover');
          if(!overMenu && !overAnyDropdown){ setDropdownShown(dropdown,false); }
        }, 50);
      }
    });
    if(menu){
      menu.addEventListener('mouseleave', ()=>{
        if(window.innerWidth>=993) setDropdownShown(dropdown,false);
      });
      menu.addEventListener('mouseenter', ()=>{
        if(window.innerWidth>=993) setDropdownShown(dropdown,true);
      });
    }
    const toggle=dropdown.querySelector('.dropdown-toggle');
    if(toggle){
      toggle.addEventListener('click', e=>{
        if(window.innerWidth<993){ e.preventDefault(); menu.classList.toggle('dropdown-open'); setDropdownShown(dropdown, !dropdown.classList.contains('show')); }
      });
    }
  });

  function normalizeDropdownHeights(){
    document.querySelectorAll('.navbar .dropdown .dropdown-menu .row').forEach(row=>{
      let max=0; const cols=row.querySelectorAll('[class*="col-"]');
      cols.forEach(col=>{ col.style.minHeight='auto'; max=Math.max(max,col.offsetHeight); });
      cols.forEach(col=>{ col.style.minHeight=max+'px'; });
    });
  }
  normalizeDropdownHeights();
  window.addEventListener('resize', normalizeDropdownHeights);
  document.addEventListener('shown.bs.dropdown', normalizeDropdownHeights);
  document.addEventListener('hidden.bs.dropdown', normalizeDropdownHeights);

  // Mobile menu body scroll lock mirroring Jekyll behavior
  const collapseEl = document.getElementById('navbarSupportedContent');
  if(collapseEl){
    collapseEl.addEventListener('show.bs.collapse', ()=>{
      document.body.classList.add('mobile-menu-open');
    });
    collapseEl.addEventListener('hide.bs.collapse', ()=>{
      document.body.classList.remove('mobile-menu-open');
      // Close any open dropdowns when the mobile menu is closed
      document.querySelectorAll('.dropdown.show, .dropdown-menu.dropdown-open').forEach(el=>{
        el.classList.remove('show','dropdown-open');
      });
    });
  }

  // Reset dropdown state crossing breakpoints
  let lastIsDesktop = window.innerWidth>=993;
  window.addEventListener('resize', ()=>{
    const isDesktop = window.innerWidth>=993;
    if(isDesktop!==lastIsDesktop){
      // Clear all open classes so hover/click states don't get stuck
      document.querySelectorAll('.dropdown.show, .dropdown-menu.dropdown-open').forEach(el=>{
        el.classList.remove('show','dropdown-open');
      });
      positionDropdowns();
      lastIsDesktop = isDesktop;
    }
  });
});
