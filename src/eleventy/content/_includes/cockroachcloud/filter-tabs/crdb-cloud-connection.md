{% assign tab_names_html = "CockroachDB Basic;CockroachDB Standard;CockroachDB Advanced" %}
{% assign html_page_filenames = "connect-to-a-basic-cluster.html;connect-to-your-cluster.html;connect-to-an-advanced-cluster.html" %}

{% include "filter-tabs.md", tab_names: tab_names_html, page_filenames: html_page_filenames, page_folder: "cockroachcloud" %}
