$(document).ready(function() {

	var pagePath = window.location.pathname;
	var stubs = pagePath.split(/\//);
	var targetSearch = stubs[stubs.length-1];
	targetSearch = targetSearch.replace(/\..+/,"");
	targetSearch = targetSearch.replace(/[-\s]/,"+");
	$('#redirect-link').attr('href','/docs/search.html?q='+targetSearch);
	window.location.href = '/docs/search.html?q='+targetSearch;

});