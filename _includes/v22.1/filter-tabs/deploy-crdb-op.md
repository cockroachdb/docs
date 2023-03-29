{% assign tab_names_html = "Secure;Insecure" %}
{% assign html_page_filenames = "deploy-cockroachdb-on-premises.html;deploy-cockroachdb-on-premises-insecure.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
