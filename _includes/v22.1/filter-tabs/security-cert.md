{% assign tab_names_html = "Use cockroach cert;Use OpenSSL;Use custom CA" %}
{% assign html_page_names = "cockroach-cert.html;create-security-certificates-openssl.html;create-security-certificates-custom-ca.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
