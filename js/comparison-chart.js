whenAvailable('select2', mainExecute);
function mainExecute() {
  $(function() {
    function updateChart(db, column) {
      $('.comparison-chart__column-'+column+' span.support').each(function() {
        var dbs = $(this).data('dbs');
        $(this).hide();
        if (dbs.indexOf(db) != -1) {
          $(this).fadeIn(500);
        }
      });
  
      if (db === 'DynamoDB') {
        $('.footnote').show();
      } else {
        $('.footnote').hide();
      }
    }
  
    // on load
    $('select').each(function() {
      $(this).select2({
        minimumResultsForSearch: Infinity
      });
      updateChart($(this).val(), $(this).data('column'));
    });
  
    $('select').on('change', function() {
      updateChart($(this).val(), $(this).data('column'));
    });
  
    $('[data-toggle="tooltip"]').tooltip();
  });
}
