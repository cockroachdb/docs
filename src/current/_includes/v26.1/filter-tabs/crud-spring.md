{% assign tab_names_html = "Use <strong>JDBC</strong>;Use <strong>JPA</strong>" %}
{% assign html_page_filenames = "build-a-spring-app-with-cockroachdb-jdbc.html;build-a-spring-app-with-cockroachdb-jpa.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
