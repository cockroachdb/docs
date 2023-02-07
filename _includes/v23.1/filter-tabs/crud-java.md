{% assign tab_names_html = "Use <strong>JDBC</strong>;Use <strong>Hibernate</strong>;Use <strong>jOOQ</strong>;Use <strong>MyBatis-Spring</strong>" %}
{% assign html_page_names = "build-a-java-app-with-cockroachdb.html;build-a-java-app-with-cockroachdb-hibernate.html;build-a-java-app-with-cockroachdb-jooq.html;build-a-spring-app-with-cockroachdb-mybatis.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
