{% assign tab_names_html = "Secure;Insecure" %}
{% assign html_page_names = "orchestrate-a-local-cluster-with-kubernetes.html;orchestrate-a-local-cluster-with-kubernetes-insecure.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
