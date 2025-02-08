document.addEventListener("DOMContentLoaded", function() {
    console.log('JavaScript loaded');
    const accordionToggles = document.querySelectorAll('.accordion-toggle');
    console.log('Accordion toggles found:', accordionToggles.length);
    accordionToggles.forEach(function(accordionToggle) {
        accordionToggle.addEventListener('click', function() {
            console.log('Accordion clicked');
            const targetId = accordionToggle.getAttribute('data-target');
            console.log('Target ID:', targetId);
            const tbody = document.getElementById(targetId);
            if (tbody) {
                if (tbody.style.display === 'none' || tbody.style.display === '') {
                    tbody.style.display = 'table-row-group'; // Show <tbody>
                    console.log('Showing tbody');
                } else {
                    tbody.style.display = 'none'; // Hide <tbody>
                    console.log('Hiding tbody');
                }
            } else {
                console.log('No tbody found with ID:', targetId);
            }
        });
    });
});
