{% assign tab_names_html = "Secure;Insecure" %}
{% assign html_page_names = "secure-a-cluster.html;start-a-local-cluster.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
