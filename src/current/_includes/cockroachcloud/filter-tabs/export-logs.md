{% assign tab_names_html = "CockroachDB Standard;CockroachDB Advanced" %}
{% assign html_page_filenames = "export-logs.html;export-logs-advanced.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder="cockroachcloud" %}
