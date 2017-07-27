$(function() {
  function updateChart(db, column) {
    $('.comparison-chart__column-'+column+' span.support').each(function() {
      var dbs = $(this).data('dbs');
      if (dbs.indexOf(db) != -1) {
        $(this).show().siblings('.support').hide();
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
