{% assign tab_names_html = "CockroachDB Basic;CockroachDB Standard;CockroachDB Advanced" %}
{% assign html_page_filenames = "plan-your-cluster-basic.html;plan-your-cluster.html;plan-your-cluster-advanced.html" %}

{% include "filter-tabs.md", tab_names: tab_names_html, page_filenames: html_page_filenames, page_folder: "cockroachcloud" %}
