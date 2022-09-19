{% assign tab_names_html = "Local;Local (Multi-Region);Small;Medium;Large" %}
{% assign html_page_names = "performance-benchmarking-with-tpcc-local.html;performance-benchmarking-with-tpcc-local-multiregion.html;performance-benchmarking-with-tpcc-small.html;performance-benchmarking-with-tpcc-medium.html;performance-benchmarking-with-tpcc-large.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
