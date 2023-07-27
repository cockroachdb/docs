{% if page.cloud != true %}
If you are migrating to a {{ site.data.products.core }} database, you can [export the converted schema](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page#export-the-schema) and execute the statements in [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}), or use a third-party schema migration tool such as [Alembic]({% link {{ page.version.version }}/alembic.md %}), [Flyway]({% link {{ page.version.version }}/flyway.md %}), or [Liquibase]({% link {{ page.version.version}}/liquibase.md %}).
{% else %}
To migrate to a {{ site.data.products.core }} database, you can execute the statements in [`cockroach sql`](../{{version_prefix}}cockroach-sql.html), or use a third-party schema migration tool such as [Alembic](../{{version_prefix}}alembic.html), [Flyway](../{{version_prefix}}flyway.html), or [Liquibase](../{{version_prefix}}liquibase.html).
{% endif %}
