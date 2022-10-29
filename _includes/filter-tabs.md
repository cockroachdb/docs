{% comment %}

The filter-tabs.md file is used to create a filter bar at the top of the page to navigate to different but related URLs/.md files. This is useful in scenarios such as toggling between different Ruby tutorials in different URLs.

To generate the filter bar in a specific location within a document, create a new Markdown file in the _includes/<version>/filter-tabs folder.

List each tab name in the tab_names_html variable, separated by a semicolon. HTML is supported here.

List each file name with the HTML extension in the html_page_names variable, separated by a semicolon.

Then, include the filter-tabs.md file. For any pages in docs/cockroachcloud, set page_folder to "cockroachcloud". Otherwise, use page.version.version.

Example 1:

{% assign tab_names_html = "CockroachDB Serverless;CockroachDB Dedicated" %}
{% assign html_page_names = "serverless-faqs.html;frequently-asked-questions.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder="cockroachcloud" %}

Example 2:

{% assign tab_names_html = "Use <strong>JDBC</strong>;Use <strong>Hibernate</strong>;Use <strong>jOOQ</strong>;Use <strong>MyBatis-Spring</strong>" %}
{% assign html_page_names = "build-a-java-app-with-cockroachdb.html;build-a-java-app-with-cockroachdb-hibernate.html;build-a-java-app-with-cockroachdb-jooq.html;build-a-spring-app-with-cockroachdb-mybatis.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}

{% endcomment %}

{% assign tab_names = include.tab_names | split: ";" %}
{% assign page_names = include.page_names | split: ";" %}

{% assign ns = tab_names.size %}
{% assign ps = page_names.size %}

{% if ns == ps %}
{% assign ul = ns | minus: 1 %}
<div class="filters clearfix">
    {% for x in (0..ul) %}
    {% assign url = "/" | append: include.page_folder | append: "/" | append: page_names[x] %}
    <a href="/docs{{ url }}"><button class="filter-button{% if url == page.url %} current{% endif %}">{{ tab_names[x] }}</button></a>
    {% endfor %}
</div>
{% endif %}
