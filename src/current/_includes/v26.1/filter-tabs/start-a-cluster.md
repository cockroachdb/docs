{% assign tab_names_html = "Secure;Insecure" %}
{% assign html_page_filenames = "secure-a-cluster.html;start-a-local-cluster.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
