{% if page.cloud != true %}
If you are migrating to a {{ site.data.products.core }} database, you can export the converted schema and execute the statements in [`cockroach sql`](cockroach-sql.html), or use a third-party schema migration tool such as [Alembic](alembic.html), [Flyway](flyway.html), or [Liquibase](liquibase.html).
{% else %}
If you are migrating to a {{ site.data.products.core }} database, you can export the converted schema and execute the statements in [`cockroach sql`](../{{version_prefix}}cockroach-sql.html), or use a third-party schema migration tool such as [Alembic](../{{version_prefix}}alembic.html), [Flyway](../{{version_prefix}}flyway.html), or [Liquibase](../{{version_prefix}}liquibase.html).
{% endif %}
