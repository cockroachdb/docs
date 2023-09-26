$(document).ready(function() {

	var params = new URLSearchParams(new URL(window.location.href).search);

	var organization = params.get('organization');
	var license = params.get('license');

	if (organization){
		$( "span:contains('Acme Company')" ).text(`'${decodeURIComponent(organization)}'`)
	}

	if (license){
		$( "span:contains(xxxxxxxxxxxx)" ).text(`'${decodeURIComponent(license)}'`)
	}
});
