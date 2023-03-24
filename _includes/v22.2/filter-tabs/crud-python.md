{% assign tab_names_html = "Use <strong>psycopg3</strong>;Use <strong>psycopg2</strong>;Use <strong>SQLAlchemy</strong>;Use <strong>Django</strong>;Use <strong>PonyORM</strong>;Use <strong>peewee</strong>" %}
{% assign html_page_filenames = "build-a-python-app-with-cockroachdb-psycopg3.html;build-a-python-app-with-cockroachdb.html;build-a-python-app-with-cockroachdb-sqlalchemy.html;build-a-python-app-with-cockroachdb-django.html;build-a-python-app-with-cockroachdb-pony.html;https://docs.peewee-orm.com/en/latest/peewee/playhouse.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
