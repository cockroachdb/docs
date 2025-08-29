{% assign tab_names_html = "Use cockroach cert;Use OpenSSL;Use custom CA" %}
{% assign html_page_filenames = "cockroach-cert.html;create-security-certificates-openssl.html;create-security-certificates-custom-ca.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
