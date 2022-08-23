{% assign tab_names_html = "Use <strong>psycopg2</strong>;Use <strong>SQLAlchemy</strong>;Use <strong>Django</strong>;Use <strong>PonyORM</strong>;Use <strong>peewee</strong>" %}
{% assign html_page_names = "build-a-python-app-with-cockroachdb.html;build-a-python-app-with-cockroachdb-sqlalchemy.html;build-a-python-app-with-cockroachdb-django.html;build-a-python-app-with-cockroachdb-pony.html;build-a-python-app-with-cockroachdb-peewee.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=page.version.version %}
