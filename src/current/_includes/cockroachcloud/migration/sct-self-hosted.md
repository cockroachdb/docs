{% if page.cloud != true %}
If you are migrating to a CockroachDB {{ site.data.products.core }} database, you can [export the converted schema](migrations-page.md#export-the-schema) from the Schema Conversion Tool and execute the statements in [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md), or use a third-party schema migration tool such as [Alembic]({{ page.version.version }}/alembic.md), [Flyway]({{ page.version.version }}/flyway.md), or [Liquibase]({{ page.version.version }}/liquibase.md).
{% else %}
To migrate to a CockroachDB {{ site.data.products.core }} database, you can execute the statements in [`cockroach sql`]({{version_prefix}}cockroach-sql.md), or use a third-party schema migration tool such as [Alembic]({{version_prefix}}alembic.md), [Flyway]({{site.current_cloud_version}}/flyway.md), or [Liquibase]({{site.current_cloud_version}}/liquibase.md).
{% endif %}
