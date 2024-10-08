{% assign tab_names_html = "Secure;Insecure" %}
{% assign html_page_filenames = "deploy-cockroachdb-on-google-cloud-platform.html;deploy-cockroachdb-on-google-cloud-platform-insecure.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
