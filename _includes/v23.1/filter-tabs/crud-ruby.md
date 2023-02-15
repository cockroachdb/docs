{% assign tab_names_html = "Use <strong>pg</strong>;Use <strong>ActiveRecord</strong>" %}
{% assign html_page_names = "build-a-ruby-app-with-cockroachdb.html;build-a-ruby-app-with-cockroachdb-activerecord.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
