{% assign tab_names_html = "CockroachDB Basic;CockroachDB Standard;CockroachDB Advanced" %}
{% assign html_page_filenames = "basic-cluster-management.html;cluster-management.html;advanced-cluster-management.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder="cockroachcloud" %}
