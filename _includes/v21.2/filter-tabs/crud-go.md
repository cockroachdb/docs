{% assign tab_names_html = "Use <strong>pgx</strong>;Use <strong>GORM</strong>;Use <strong>lib/pq</strong>;Use <strong>upper/db</strong>" %}
{% assign html_page_names = "build-a-go-app-with-cockroachdb.html;build-a-go-app-with-cockroachdb-gorm.html;build-a-go-app-with-cockroachdb-pq.html;build-a-go-app-with-cockroachdb-upperdb.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
