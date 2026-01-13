Convert the source table definitions into CockroachDB-compatible equivalents. CockroachDB supports the PostgreSQL wire protocol and is largely [compatible with PostgreSQL syntax]({% link {{ site.current_cloud_version }}/postgresql-compatibility.md %}#features-that-differ-from-postgresql).

- The source and target table definitions must **match**. Review [Type mapping]({% link molt/molt-fetch.md %}#type-mapping) to understand which source types can be mapped to CockroachDB types.

	<section class="filter-content" markdown="1" data-scope="postgres">
	For example, a PostgreSQL source table defined as `CREATE TABLE migration_schema.tbl (pk INT PRIMARY KEY);` must have a corresponding schema and table in CockroachDB:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE SCHEMA migration_schema;
	CREATE TABLE migration_schema.tbl (pk INT PRIMARY KEY);
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	MySQL tables belong directly to the database specified in the connection string. A MySQL source table defined as `CREATE TABLE tbl (id INT PRIMARY KEY);` should map to CockroachDB's default `public` schema:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE tbl (id INT PRIMARY KEY);
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	For example, an Oracle source table defined as `CREATE TABLE migration_schema.tbl (pk INT PRIMARY KEY);` must have a corresponding schema and table in CockroachDB:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE SCHEMA migration_schema;
	CREATE TABLE migration_schema.tbl (pk INT PRIMARY KEY);
	~~~
	</section>

	- MOLT Fetch can automatically define matching CockroachDB tables using the {% if page.name != "migration-strategy.md" %}[`drop-on-target-and-recreate`](#table-handling-mode){% else %}[`drop-on-target-and-recreate`]({% link molt/molt-fetch.md %}#target-table-handling){% endif %} option.

	- If you define the target tables manually, review how MOLT Fetch handles [type mismatches]({% link molt/molt-fetch.md %}#mismatch-handling). You can use the {% if page.name != "migration-strategy.md" %}[MOLT Schema Conversion Tool](#schema-conversion-tool){% else %}[MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}){% endif %} to create matching table definitions.

	<section class="filter-content" markdown="1" data-scope="oracle">
	- By default, table and column names are case-insensitive in MOLT Fetch. If using the [`--case-sensitive`]({% link molt/molt-fetch.md %}#global-flags) flag, schema, table, and column names must match Oracle's default uppercase identifiers. Use quoted names on the target to preserve case. For example, the following CockroachDB SQL statement will error:

		~~~ sql
		CREATE TABLE co.stores (... store_id ...);
		~~~

		It should be written as:

		~~~ sql
		CREATE TABLE "CO"."STORES" (... "STORE_ID" ...);
		~~~

		When using `--case-sensitive`, quote all identifiers and match the case exactly (for example, use `"CO"."STORES"` and `"STORE_ID"`).
	</section>

- Every table **must** have an explicit primary key. For more information, refer to [Primary key best practices]({% link {{ site.current_cloud_version }}/schema-design-table.md %}#primary-key-best-practices).

	{{site.data.alerts.callout_danger}}
	Avoid using sequential keys. To learn more about the performance issues that can result from their use, refer to the [guidance on indexing with sequential keys]({% link {{site.current_cloud_version}}/sql-faqs.md %}#how-do-i-generate-unique-slowly-increasing-sequential-numbers-in-cockroachdb). If a sequential key is necessary in your CockroachDB table, you must create it manually, after using [MOLT Fetch]({% link molt/molt-fetch.md %}) to load and replicate the data.
	{{site.data.alerts.end}}

- Review [Transformations]({% link molt/molt-fetch.md %}#transformations) to understand how computed columns and partitioned tables can be mapped to the target, and how target tables can be renamed.

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. PostgreSQL and MySQL default to 32-bit integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For more information, refer to [Considerations for 64-bit signed integers]({% link {{ site.current_cloud_version }}/int.md %}#considerations-for-64-bit-signed-integers).